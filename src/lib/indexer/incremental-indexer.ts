/**
 * Incremental Indexing System
 * Only re-indexes files that have changed since last indexing
 */

import * as fs from 'fs';
import * as crypto from 'crypto';
import { db } from '../db';
import { indexFile } from './file-indexer';
import { getCodeParser } from '../parser/code-parser';

export interface FileHash {
  filePath: string;
  hash: string;
  lastModified: Date;
  size: number;
}

export interface IncrementalIndexResult {
  totalFiles: number;
  changedFiles: number;
  newFiles: number;
  deletedFiles: number;
  unchangedFiles: number;
  indexedFiles: string[];
  errors: Array<{ file: string; error: string }>;
}

/**
 * Calculate SHA-256 hash of file content
 */
export function calculateFileHash(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    throw new Error(`Failed to calculate hash for ${filePath}: ${error}`);
  }
}

/**
 * Get file metadata (hash, size, modified time)
 */
export function getFileMetadata(filePath: string): FileHash {
  const stats = fs.statSync(filePath);
  const hash = calculateFileHash(filePath);

  return {
    filePath,
    hash,
    lastModified: stats.mtime,
    size: stats.size,
  };
}

/**
 * Check if file has changed since last indexing
 */
export async function hasFileChanged(
  repositoryId: string,
  filePath: string,
  currentHash: string
): Promise<boolean> {
  try {
    const existingFile = await db.file.findFirst({
      where: {
        repositoryId,
        path: filePath,
      },
      select: {
        contentHash: true,
      },
    });

    if (!existingFile) {
      return true; // New file
    }

    return existingFile.contentHash !== currentHash;
  } catch (error) {
    console.error(`Error checking file change for ${filePath}:`, error);
    return true; // Assume changed on error
  }
}

/**
 * Get list of files that need re-indexing
 */
export async function getChangedFiles(
  repositoryId: string,
  allFiles: string[]
): Promise<{
  changed: string[];
  new: string[];
  deleted: string[];
  unchanged: string[];
}> {
  const changed: string[] = [];
  const newFiles: string[] = [];
  const unchanged: string[] = [];

  // Get all existing files from database
  const existingFiles = await db.file.findMany({
    where: { repositoryId },
    select: {
      path: true,
      contentHash: true,
    },
  });

  const existingFilesMap = new Map(
    existingFiles.map((f) => [f.path, f.contentHash])
  );

  // Check each file
  for (const filePath of allFiles) {
    try {
      const currentHash = calculateFileHash(filePath);
      const existingHash = existingFilesMap.get(filePath);

      if (!existingHash) {
        newFiles.push(filePath);
      } else if (existingHash !== currentHash) {
        changed.push(filePath);
      } else {
        unchanged.push(filePath);
      }

      // Remove from map to track deletions
      existingFilesMap.delete(filePath);
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }

  // Remaining files in map are deleted
  const deleted = Array.from(existingFilesMap.keys());

  return { changed, new: newFiles, deleted, unchanged };
}

/**
 * Delete file and its chunks from database
 */
export async function deleteFileFromIndex(
  repositoryId: string,
  filePath: string
): Promise<void> {
  try {
    await db.file.deleteMany({
      where: {
        repositoryId,
        path: filePath,
      },
    });
  } catch (error) {
    console.error(`Error deleting file ${filePath} from index:`, error);
    throw error;
  }
}

/**
 * Update file hash in database
 */
export async function updateFileHash(
  repositoryId: string,
  filePath: string,
  hash: string
): Promise<void> {
  try {
    await db.file.updateMany({
      where: {
        repositoryId,
        path: filePath,
      },
      data: {
        contentHash: hash,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`Error updating file hash for ${filePath}:`, error);
  }
}

/**
 * Perform incremental indexing
 */
export async function incrementalIndex(
  repositoryId: string,
  allFiles: string[],
  onProgress?: (current: number, total: number, file: string) => void
): Promise<IncrementalIndexResult> {
  const result: IncrementalIndexResult = {
    totalFiles: allFiles.length,
    changedFiles: 0,
    newFiles: 0,
    deletedFiles: 0,
    unchangedFiles: 0,
    indexedFiles: [],
    errors: [],
  };

  try {
    // Get changed files
    const { changed, new: newFiles, deleted, unchanged } = await getChangedFiles(
      repositoryId,
      allFiles
    );

    result.changedFiles = changed.length;
    result.newFiles = newFiles.length;
    result.deletedFiles = deleted.length;
    result.unchangedFiles = unchanged.length;

    // Delete removed files
    for (const filePath of deleted) {
      try {
        await deleteFileFromIndex(repositoryId, filePath);
      } catch (error) {
        result.errors.push({
          file: filePath,
          error: `Failed to delete: ${error}`,
        });
      }
    }

    // Index new and changed files
    const filesToIndex = [...newFiles, ...changed];
    const codeParser = await getCodeParser();

    for (let i = 0; i < filesToIndex.length; i++) {
      const filePath = filesToIndex[i];

      try {
        if (onProgress) {
          onProgress(i + 1, filesToIndex.length, filePath);
        }

        // Delete existing chunks for changed files
        if (changed.includes(filePath)) {
          await db.codeChunk.deleteMany({
            where: {
              file: {
                repositoryId,
                path: filePath,
              },
            },
          });
        }

        // Parse file structure
        const parsedFile = await codeParser.parseFile(filePath);

        // Index file with new hash
        const hash = calculateFileHash(filePath);
        await indexFile(repositoryId, filePath, hash, parsedFile);

        result.indexedFiles.push(filePath);
      } catch (error) {
        result.errors.push({
          file: filePath,
          error: `Failed to index: ${error}`,
        });
      }
    }

    // Update repository status
    await db.repository.update({
      where: { id: repositoryId },
      data: {
        status: 'ready',
        lastIndexedAt: new Date(),
      },
    });

    return result;
  } catch (error) {
    console.error('Incremental indexing failed:', error);
    throw error;
  }
}

/**
 * Check if incremental indexing is beneficial
 * Returns true if less than 30% of files have changed
 */
export async function shouldUseIncrementalIndexing(
  repositoryId: string,
  allFiles: string[]
): Promise<boolean> {
  try {
    const { changed, new: newFiles } = await getChangedFiles(repositoryId, allFiles);
    const changedCount = changed.length + newFiles.length;
    const changePercentage = (changedCount / allFiles.length) * 100;

    // Use incremental if less than 30% changed
    return changePercentage < 30;
  } catch (error) {
    console.error('Error checking incremental indexing benefit:', error);
    return false;
  }
}

/**
 * Get indexing statistics
 */
export async function getIndexingStats(repositoryId: string): Promise<{
  totalFiles: number;
  totalChunks: number;
  totalSize: number;
  lastIndexed: Date | null;
  averageChunksPerFile: number;
}> {
  try {
    const files = await db.file.findMany({
      where: { repositoryId },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });

    const totalFiles = files.length;
    const totalChunks = files.reduce((sum, f) => sum + f._count.chunks, 0);
    const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
    const lastIndexed = files.length > 0 ? files[0].updatedAt : null;
    const averageChunksPerFile = totalFiles > 0 ? totalChunks / totalFiles : 0;

    return {
      totalFiles,
      totalChunks,
      totalSize,
      lastIndexed,
      averageChunksPerFile,
    };
  } catch (error) {
    console.error('Error getting indexing stats:', error);
    throw error;
  }
}

/**
 * Validate file integrity
 * Check if stored hash matches current file hash
 */
export async function validateFileIntegrity(
  repositoryId: string,
  filePath: string
): Promise<boolean> {
  try {
    const file = await db.file.findFirst({
      where: {
        repositoryId,
        path: filePath,
      },
      select: {
        contentHash: true,
      },
    });

    if (!file) {
      return false;
    }

    const currentHash = calculateFileHash(filePath);
    return file.contentHash === currentHash;
  } catch (error) {
    console.error(`Error validating file integrity for ${filePath}:`, error);
    return false;
  }
}

/**
 * Batch validate multiple files
 */
export async function batchValidateIntegrity(
  repositoryId: string,
  filePaths: string[]
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  for (const filePath of filePaths) {
    const isValid = await validateFileIntegrity(repositoryId, filePath);
    results.set(filePath, isValid);
  }

  return results;
}

// Made with Bob
