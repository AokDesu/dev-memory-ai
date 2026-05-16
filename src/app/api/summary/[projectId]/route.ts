import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';

// Map dep name -> display label. Listed roughly in order of priority within
// a category — the dedup at the end keeps the first occurrence.
const NPM_DEP_LABELS: Array<[RegExp, string]> = [
  [/^next$/, 'Next.js'],
  [/^react$/, 'React'],
  [/^vue$/, 'Vue'],
  [/^svelte$/, 'Svelte'],
  [/^@angular\//, 'Angular'],
  [/^nuxt$/, 'Nuxt'],
  [/^astro$/, 'Astro'],
  [/^remix$/, 'Remix'],
  [/^solid-js$/, 'Solid'],
  [/^typescript$/, 'TypeScript'],
  [/^tailwindcss$/, 'Tailwind CSS'],
  [/^prisma$|^@prisma\/client$/, 'Prisma'],
  [/^drizzle-orm$/, 'Drizzle'],
  [/^sequelize$/, 'Sequelize'],
  [/^typeorm$/, 'TypeORM'],
  [/^mongoose$/, 'Mongoose'],
  [/^express$/, 'Express'],
  [/^fastify$/, 'Fastify'],
  [/^@nestjs\/core$/, 'NestJS'],
  [/^koa$/, 'Koa'],
  [/^hono$/, 'Hono'],
  [/^vite$/, 'Vite'],
  [/^webpack$/, 'Webpack'],
  [/^rollup$/, 'Rollup'],
  [/^esbuild$/, 'esbuild'],
  [/^turbo$/, 'Turborepo'],
  [/^jest$/, 'Jest'],
  [/^vitest$/, 'Vitest'],
  [/^@playwright\/test$/, 'Playwright'],
  [/^cypress$/, 'Cypress'],
  [/^@langchain\//, 'LangChain'],
  [/^@google\/generative-ai$|^@google-ai\//, 'Google Gemini'],
  [/^openai$/, 'OpenAI'],
  [/^@anthropic-ai\/sdk$/, 'Anthropic'],
  [/^socket\.io$|^ws$/, 'WebSockets'],
  [/^graphql$/, 'GraphQL'],
  [/^@trpc\//, 'tRPC'],
  [/^zod$/, 'Zod'],
  [/^redux$|^@reduxjs\/toolkit$/, 'Redux'],
  [/^zustand$/, 'Zustand'],
  [/^@tanstack\/react-query$|^react-query$/, 'React Query'],
];

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJsonSafe(p: string): Promise<any | null> {
  try {
    const raw = await fs.readFile(p, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function readTextSafe(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, 'utf-8');
  } catch {
    return null;
  }
}

async function detectTechStack(repoPath: string): Promise<string[]> {
  const stack: string[] = [];
  const add = (label: string) => {
    if (!stack.includes(label)) stack.push(label);
  };

  // Node / JS / TS ecosystem
  const pkg = await readJsonSafe(path.join(repoPath, 'package.json'));
  if (pkg) {
    add('Node.js');
    const allDeps: Record<string, string> = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
      ...(pkg.peerDependencies ?? {}),
    };
    const depNames = Object.keys(allDeps);
    for (const [pattern, label] of NPM_DEP_LABELS) {
      if (depNames.some((d) => pattern.test(d))) {
        add(label);
      }
    }
    // engines.node hint
    if (pkg.engines?.node) add('Node.js');
  }

  // pnpm / yarn / bun lockfiles -> package manager (optional)
  if (await fileExists(path.join(repoPath, 'pnpm-lock.yaml'))) add('pnpm');
  if (await fileExists(path.join(repoPath, 'bun.lockb'))) add('Bun');

  // Flutter / Dart
  const pubspec = await readTextSafe(path.join(repoPath, 'pubspec.yaml'));
  if (pubspec) {
    if (/flutter:/i.test(pubspec)) add('Flutter');
    else add('Dart');
  }

  // Android
  if (
    (await fileExists(path.join(repoPath, 'android', 'build.gradle'))) ||
    (await fileExists(path.join(repoPath, 'build.gradle'))) ||
    (await fileExists(path.join(repoPath, 'build.gradle.kts')))
  ) {
    add('Gradle');
    add('Android');
  }

  // iOS
  if (
    (await fileExists(path.join(repoPath, 'ios', 'Podfile'))) ||
    (await fileExists(path.join(repoPath, 'Podfile')))
  ) {
    add('iOS');
    add('CocoaPods');
  }

  // Python
  if (
    (await fileExists(path.join(repoPath, 'requirements.txt'))) ||
    (await fileExists(path.join(repoPath, 'pyproject.toml'))) ||
    (await fileExists(path.join(repoPath, 'setup.py')))
  ) {
    add('Python');
    const pyproj = await readTextSafe(path.join(repoPath, 'pyproject.toml'));
    if (pyproj && /django/i.test(pyproj)) add('Django');
    if (pyproj && /fastapi/i.test(pyproj)) add('FastAPI');
    if (pyproj && /flask/i.test(pyproj)) add('Flask');
  }

  // Go
  if (await fileExists(path.join(repoPath, 'go.mod'))) add('Go');

  // Rust
  if (await fileExists(path.join(repoPath, 'Cargo.toml'))) add('Rust');

  // Java / Kotlin standalone
  if (await fileExists(path.join(repoPath, 'pom.xml'))) {
    add('Java');
    add('Maven');
  }

  // Ruby
  if (await fileExists(path.join(repoPath, 'Gemfile'))) {
    add('Ruby');
    const gemfile = await readTextSafe(path.join(repoPath, 'Gemfile'));
    if (gemfile && /rails/i.test(gemfile)) add('Rails');
  }

  // PHP
  if (await fileExists(path.join(repoPath, 'composer.json'))) {
    add('PHP');
    const composer = await readJsonSafe(path.join(repoPath, 'composer.json'));
    if (composer?.require?.['laravel/framework']) add('Laravel');
    if (composer?.require?.['symfony/framework-bundle']) add('Symfony');
  }

  // Docker
  if (
    (await fileExists(path.join(repoPath, 'Dockerfile'))) ||
    (await fileExists(path.join(repoPath, 'docker-compose.yml'))) ||
    (await fileExists(path.join(repoPath, 'docker-compose.yaml')))
  ) {
    add('Docker');
  }

  // GitHub Actions
  if (await fileExists(path.join(repoPath, '.github', 'workflows'))) {
    add('GitHub Actions');
  }

  // Prisma schema explicitly (in case @prisma/client wasn't in deps)
  if (await fileExists(path.join(repoPath, 'prisma', 'schema.prisma'))) {
    add('Prisma');
  }

  return stack;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Get repository info
    const repository = await prisma.repository.findUnique({
      where: { id: projectId },
    });

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Aggregate file stats (language distribution + LOC) without loading every file row
    const filesAgg = await prisma.file.findMany({
      where: { repositoryId: projectId },
      select: { language: true, linesOfCode: true },
    });

    const totalFiles = filesAgg.length;
    const totalLinesOfCode = filesAgg.reduce(
      (sum, f) => sum + (f.linesOfCode || 0),
      0
    );

    // Aggregate by language: file count + total lines of code per language.
    // Rank by LoC (matches GitHub's "Languages" bar) so config/doc formats
    // with many tiny files don't dominate the distribution.
    const langCount: Record<string, number> = {};
    const langLoc: Record<string, number> = {};
    filesAgg.forEach((file) => {
      if (!file.language) return;
      langCount[file.language] = (langCount[file.language] || 0) + 1;
      langLoc[file.language] = (langLoc[file.language] || 0) + (file.linesOfCode || 0);
    });

    const totalLocForRanking = Object.values(langLoc).reduce((s, n) => s + n, 0);

    const languages = Object.entries(langLoc)
      .sort((a, b) => b[1] - a[1])
      .map(([language, loc]) => ({
        language,
        count: langCount[language] || 0,
        linesOfCode: loc,
        percentage:
          totalLocForRanking > 0
            ? ((loc / totalLocForRanking) * 100).toFixed(1)
            : '0.0',
      }));

    // Commit totals + contributors via aggregation (not via take:10)
    const totalCommits = await prisma.commit.count({
      where: { repositoryId: projectId },
    });

    const contributorGroups = await prisma.commit.groupBy({
      by: ['author'],
      where: { repositoryId: projectId },
      _count: { author: true },
    });

    const topContributors = contributorGroups
      .map((g) => ({ author: g.author, commits: g._count.author }))
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 5);

    const totalContributors = contributorGroups.length;

    // Recent commits (separate query, ordered)
    const recentCommitsRaw = await prisma.commit.findMany({
      where: { repositoryId: projectId },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });

    const recentCommits = recentCommitsRaw.map((commit) => ({
      hash: commit.hash,
      author: commit.author,
      message: commit.message,
      timestamp: commit.timestamp.toISOString(),
      filesChanged: JSON.parse(commit.filesChanged),
    }));

    // Detect tech stack from manifest files (package.json, pubspec.yaml, etc.)
    let detectedStack: string[] = [];
    try {
      detectedStack = await detectTechStack(repository.path);
    } catch (error) {
      console.error('Error detecting tech stack:', error);
    }

    // Get key files (files with most lines of code) - fetch with all fields needed
    const keyFilesRaw = await prisma.file.findMany({
      where: {
        repositoryId: projectId,
        linesOfCode: { gt: 0 },
      },
      orderBy: { linesOfCode: 'desc' },
      take: 10,
      select: {
        path: true,
        language: true,
        linesOfCode: true,
        lastAuthor: true,
        lastModified: true,
      },
    });

    const keyFiles = keyFilesRaw.map((file) => ({
      path: file.path,
      language: file.language,
      linesOfCode: file.linesOfCode,
      lastAuthor: file.lastAuthor,
      lastModified: file.lastModified?.toISOString() ?? null,
    }));

    return NextResponse.json({
      repository: {
        id: repository.id,
        name: repository.name,
        path: repository.path,
        status: repository.status,
        lastIndexed: repository.lastIndexed?.toISOString() ?? null,
      },
      statistics: {
        totalFiles,
        totalLinesOfCode,
        totalCommits,
        totalContributors,
      },
      languages,
      techStack:
        detectedStack.length > 0
          ? detectedStack
          : languages.slice(0, 5).map((l) => l.language),
      keyFiles,
      recentCommits,
      topContributors,
    });
  } catch (error) {
    console.error('Summary API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Made with Bob
