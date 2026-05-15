import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validatePath, isDirectory, isGitRepository, getRepositoryName } from '@/lib/filesystem';
import { indexRepository } from '@/lib/indexer/file-indexer';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import AdmZip from 'adm-zip';

const selectProjectSchema = z.object({
  path: z.string().min(1, 'Path is required'),
});

// Matches GitHub's 100 MB per-file ceiling.
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_TOTAL_BYTES = 1024 * 1024 * 1024; // 1 GB

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  '.next',
  'coverage',
  '.vscode',
  '.idea',
  '__pycache__',
  'venv',
  'env',
]);

function shouldSkipUploadPath(relPath: string): boolean {
  const segments = relPath.split(/[\\/]/).filter(Boolean);
  for (const seg of segments) {
    if (SKIP_DIRS.has(seg)) return true;
    if (/^\.env(\..+)?$/.test(seg)) return true;
  }
  return false;
}

function getUploadsRoot(): string {
  return path.resolve(process.cwd(), 'uploads');
}

async function safeJoin(root: string, relPath: string): Promise<string> {
  // Normalize and reject any segment that escapes the root
  const normalized = path.normalize(relPath).replace(/^[\\/]+/, '');
  const target = path.resolve(root, normalized);
  if (!target.startsWith(path.resolve(root) + path.sep) && target !== path.resolve(root)) {
    throw new Error(`Unsafe path: ${relPath}`);
  }
  return target;
}

async function handleJsonSelect(request: NextRequest) {
  const body = await request.json();
  const { path: projectPath } = selectProjectSchema.parse(body);

  let validatedPath: string;
  try {
    validatedPath = validatePath(projectPath);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 400 }
    );
  }

  if (!isDirectory(validatedPath)) {
    return NextResponse.json(
      { error: 'Path must be a directory', code: 'NOT_A_DIRECTORY' },
      { status: 400 }
    );
  }

  const isGit = await isGitRepository(validatedPath);
  if (!isGit) {
    return NextResponse.json(
      { error: 'Path must be a Git repository', code: 'NOT_A_GIT_REPO' },
      { status: 400 }
    );
  }

  const repoName = getRepositoryName(validatedPath);

  let repository = await prisma.repository.findUnique({
    where: { path: validatedPath },
  });

  if (repository) {
    return NextResponse.json({
      projectId: repository.id,
      name: repository.name,
      status: repository.status,
      progress: 0,
      message: 'Repository already indexed',
    });
  }

  repository = await prisma.repository.create({
    data: {
      path: validatedPath,
      name: repoName,
      status: 'pending',
    },
  });

  indexRepository(repository.id, repository.path).catch((error) => {
    console.error('Background indexing error:', error);
  });

  return NextResponse.json(
    {
      projectId: repository.id,
      name: repository.name,
      status: 'indexing',
      progress: 0,
      message: 'Repository added successfully. Indexing started.',
    },
    { status: 201 }
  );
}

async function handleMultipartSelect(request: NextRequest) {
  const form = await request.formData();
  const mode = String(form.get('mode') || '').toLowerCase();
  const projectName = String(form.get('name') || '').trim();

  if (mode !== 'zip') {
    return NextResponse.json(
      { error: 'mode must be "zip"', code: 'INVALID_MODE' },
      { status: 400 }
    );
  }

  if (!projectName) {
    return NextResponse.json(
      { error: 'name is required', code: 'NAME_REQUIRED' },
      { status: 400 }
    );
  }

  const uploadId = randomUUID();
  const uploadsRoot = getUploadsRoot();
  const repoRoot = path.join(uploadsRoot, uploadId);
  await fs.mkdir(repoRoot, { recursive: true });

  let totalBytes = 0;

  try {
    const zipFile = form.get('zip') as File | null;
    if (!zipFile) {
      await fs.rm(repoRoot, { recursive: true, force: true });
      return NextResponse.json(
        { error: 'No zip file in upload', code: 'NO_ZIP' },
        { status: 400 }
      );
    }

    if (zipFile.size > MAX_TOTAL_BYTES) {
      await fs.rm(repoRoot, { recursive: true, force: true });
      return NextResponse.json(
        {
          error: `Zip exceeds ${MAX_TOTAL_BYTES / 1024 / 1024} MB limit`,
          code: 'TOTAL_TOO_LARGE',
        },
        { status: 413 }
      );
    }

    const zipBuf = Buffer.from(await zipFile.arrayBuffer());
    const zip = new AdmZip(zipBuf);
    const entries = zip.getEntries();

    // Detect a single root directory wrapper (common: my-repo.zip → my-repo/...)
    const topSegments = new Set<string>();
    for (const e of entries) {
      const seg = e.entryName.split(/[\\/]/)[0];
      if (seg) topSegments.add(seg);
    }
    const stripRoot = topSegments.size === 1 ? [...topSegments][0] + '/' : null;

    for (const entry of entries) {
      if (entry.isDirectory) continue;

      let entryName = entry.entryName.replace(/\\/g, '/');
      if (stripRoot && entryName.startsWith(stripRoot)) {
        entryName = entryName.slice(stripRoot.length);
      }
      if (!entryName) continue;
      if (shouldSkipUploadPath(entryName)) continue;

      const data = entry.getData();
      if (data.length > MAX_FILE_BYTES) {
        await fs.rm(repoRoot, { recursive: true, force: true });
        return NextResponse.json(
          {
            error: `File in zip exceeds ${MAX_FILE_BYTES / 1024 / 1024} MB limit: ${entryName}`,
            code: 'FILE_TOO_LARGE',
          },
          { status: 413 }
        );
      }

      totalBytes += data.length;
      if (totalBytes > MAX_TOTAL_BYTES) {
        await fs.rm(repoRoot, { recursive: true, force: true });
        return NextResponse.json(
          {
            error: `Extracted size exceeds ${MAX_TOTAL_BYTES / 1024 / 1024} MB limit`,
            code: 'TOTAL_TOO_LARGE',
          },
          { status: 413 }
        );
      }

      const target = await safeJoin(repoRoot, entryName);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, data);
    }
  } catch (err: any) {
    await fs.rm(repoRoot, { recursive: true, force: true }).catch(() => {});
    return NextResponse.json(
      {
        error: err?.message || 'Failed to process upload',
        code: 'UPLOAD_FAILED',
      },
      { status: 400 }
    );
  }

  // Repository row
  const repository = await prisma.repository.create({
    data: {
      path: repoRoot,
      name: projectName,
      status: 'pending',
    },
  });

  indexRepository(repository.id, repository.path).catch((error) => {
    console.error('Background indexing error:', error);
  });

  return NextResponse.json(
    {
      projectId: repository.id,
      name: repository.name,
      status: 'indexing',
      progress: 0,
      message: 'Repository uploaded successfully. Indexing started.',
    },
    { status: 201 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      return await handleMultipartSelect(request);
    }
    return await handleJsonSelect(request);
  } catch (error) {
    console.error('Error selecting project:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
