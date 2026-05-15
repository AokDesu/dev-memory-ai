/**
 * Parallel Indexing System
 * Process multiple files concurrently for faster indexing
 */

import { Worker } from 'worker_threads';
import * as os from 'os';
import * as path from 'path';
import { db } from '../db';
import { getCodeParser } from '../parser/code-parser';
import { calculateFileHash } from './incremental-indexer';
import { generateEmbedding } from '../llm';

export interface ParallelIndexConfig {
  maxWorkers?: number;
  batchSize?: number;
  timeout?: number;
}

export interface IndexTask {
  filePath: string;
  repositoryId: string;
  priority: number;
}

export interface IndexResult {
  filePath: string;
  success: boolean;
  error?: string;
  chunksCreated: number;
  processingTime: number;
}

export interface ParallelIndexStats {
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  totalChunks: number;
  averageTimePerFile: number;
  throughput: number; // files per second
}

/**
 * Task Queue for managing indexing tasks
 */
class TaskQueue {
  private queue: IndexTask[] = [];
  private processing = new Set<string>();

  /**
   * Add task to queue
   */
  add(task: IndexTask): void {
    this.queue.push(task);
    // Sort by priority (higher first)
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Add multiple tasks
   */
  addBatch(tasks: IndexTask[]): void {
    this.queue.push(...tasks);
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get next task
   */
  next(): IndexTask | null {
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      if (!this.processing.has(task.filePath)) {
        this.processing.add(task.filePath);
        return task;
      }
    }
    return null;
  }

  /**
   * Mark task as complete
   */
  complete(filePath: string): void {
    this.processing.delete(filePath);
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0 && this.processing.size === 0;
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
    this.processing.clear();
  }
}

/**
 * Worker Pool for parallel processing
 */
class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private maxWorkers: number;

  constructor(maxWorkers?: number) {
    this.maxWorkers = maxWorkers || Math.max(1, os.cpus().length - 1);
  }

  /**
   * Initialize worker pool
   */
  async initialize(): Promise<void> {
    // Note: In production, you would create actual worker threads
    // For now, we'll simulate with promises
    console.log(`Initializing worker pool with ${this.maxWorkers} workers`);
  }

  /**
   * Get available worker
   */
  getWorker(): Worker | null {
    return this.availableWorkers.shift() || null;
  }

  /**
   * Return worker to pool
   */
  returnWorker(worker: Worker): void {
    this.availableWorkers.push(worker);
  }

  /**
   * Terminate all workers
   */
  async terminate(): Promise<void> {
    for (const worker of this.workers) {
      await worker.terminate();
    }
    this.workers = [];
    this.availableWorkers = [];
  }

  /**
   * Get pool size
   */
  size(): number {
    return this.maxWorkers;
  }
}

/**
 * Parallel Indexer
 */
export class ParallelIndexer {
  private config: Required<ParallelIndexConfig>;
  private taskQueue: TaskQueue;
  private workerPool: WorkerPool;
  private stats: ParallelIndexStats;
  private startTime: number = 0;

  constructor(config?: ParallelIndexConfig) {
    this.config = {
      maxWorkers: config?.maxWorkers || Math.max(1, os.cpus().length - 1),
      batchSize: config?.batchSize || 10,
      timeout: config?.timeout || 30000, // 30 seconds
    };

    this.taskQueue = new TaskQueue();
    this.workerPool = new WorkerPool(this.config.maxWorkers);
    this.stats = this.initStats();
  }

  /**
   * Initialize statistics
   */
  private initStats(): ParallelIndexStats {
    return {
      totalFiles: 0,
      processedFiles: 0,
      failedFiles: 0,
      totalChunks: 0,
      averageTimePerFile: 0,
      throughput: 0,
    };
  }

  /**
   * Index files in parallel
   */
  async indexFiles(
    repositoryId: string,
    filePaths: string[],
    onProgress?: (current: number, total: number, file: string) => void
  ): Promise<IndexResult[]> {
    this.startTime = Date.now();
    this.stats = this.initStats();
    this.stats.totalFiles = filePaths.length;

    // Create tasks
    const tasks: IndexTask[] = filePaths.map((filePath, index) => ({
      filePath,
      repositoryId,
      priority: this.calculatePriority(filePath, index),
    }));

    this.taskQueue.addBatch(tasks);

    // Initialize worker pool
    await this.workerPool.initialize();

    // Process tasks in batches
    const results: IndexResult[] = [];
    const batchSize = this.config.batchSize;

    while (!this.taskQueue.isEmpty()) {
      const batch: Promise<IndexResult>[] = [];

      // Create batch of concurrent tasks
      for (let i = 0; i < batchSize && !this.taskQueue.isEmpty(); i++) {
        const task = this.taskQueue.next();
        if (task) {
          batch.push(this.processTask(task));
        }
      }

      // Wait for batch to complete
      const batchResults = await Promise.allSettled(batch);

      // Process results
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          this.stats.processedFiles++;
          this.stats.totalChunks += result.value.chunksCreated;

          if (onProgress) {
            onProgress(
              this.stats.processedFiles,
              this.stats.totalFiles,
              result.value.filePath
            );
          }
        } else {
          this.stats.failedFiles++;
        }
      }
    }

    // Calculate final stats
    const totalTime = Date.now() - this.startTime;
    this.stats.averageTimePerFile =
      this.stats.processedFiles > 0 ? totalTime / this.stats.processedFiles : 0;
    this.stats.throughput =
      totalTime > 0 ? (this.stats.processedFiles / totalTime) * 1000 : 0;

    return results;
  }

  /**
   * Process single task
   */
  private async processTask(task: IndexTask): Promise<IndexResult> {
    const startTime = Date.now();

    try {
      // Parse file
      const codeParser = await getCodeParser();
      const parsedFile = await codeParser.parseFile(task.filePath);

      // Calculate file hash
      const hash = calculateFileHash(task.filePath);

      // Create or update file record
      const file = await db.file.upsert({
        where: {
          repositoryId_path: {
            repositoryId: task.repositoryId,
            path: task.filePath,
          },
        },
        create: {
          repositoryId: task.repositoryId,
          path: task.filePath,
          language: parsedFile?.language || 'unknown',
          contentHash: hash,
        },
        update: {
          contentHash: hash,
          language: parsedFile?.language || 'unknown',
          updatedAt: new Date(),
        },
      });

      // Delete existing chunks
      await db.codeChunk.deleteMany({
        where: { fileId: file.id },
      });

      // Create chunks with embeddings
      let chunksCreated = 0;
      if (parsedFile && parsedFile.symbols.length > 0) {
        for (const symbol of parsedFile.symbols) {
          const content = `${symbol.type} ${symbol.name}`;
          const embedding = await generateEmbedding(content);

          await db.codeChunk.create({
            data: {
              fileId: file.id,
              content,
              startLine: symbol.startLine,
              endLine: symbol.endLine,
              embedding: JSON.stringify(embedding),
            },
          });

          chunksCreated++;
        }
      }

      this.taskQueue.complete(task.filePath);

      return {
        filePath: task.filePath,
        success: true,
        chunksCreated,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      this.taskQueue.complete(task.filePath);

      return {
        filePath: task.filePath,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        chunksCreated: 0,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Calculate task priority
   * Higher priority for smaller files and common languages
   */
  private calculatePriority(filePath: string, index: number): number {
    let priority = 100 - index; // Base priority by order

    // Boost priority for important file types
    const ext = path.extname(filePath).toLowerCase();
    const highPriorityExts = ['.ts', '.js', '.py', '.java', '.go'];
    if (highPriorityExts.includes(ext)) {
      priority += 50;
    }

    // Boost priority for smaller files (estimate by path length)
    if (filePath.length < 50) {
      priority += 20;
    }

    return priority;
  }

  /**
   * Get indexing statistics
   */
  getStats(): ParallelIndexStats {
    return { ...this.stats };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.workerPool.terminate();
    this.taskQueue.clear();
  }
}

/**
 * Batch process files with rate limiting
 */
export async function batchIndexWithRateLimit(
  repositoryId: string,
  filePaths: string[],
  rateLimit: number = 10, // files per second
  onProgress?: (current: number, total: number, file: string) => void
): Promise<IndexResult[]> {
  const results: IndexResult[] = [];
  const delayMs = 1000 / rateLimit;

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];

    try {
      const codeParser = await getCodeParser();
      const parsedFile = await codeParser.parseFile(filePath);
      const hash = calculateFileHash(filePath);

      const file = await db.file.upsert({
        where: {
          repositoryId_path: {
            repositoryId,
            path: filePath,
          },
        },
        create: {
          repositoryId,
          path: filePath,
          language: parsedFile?.language || 'unknown',
          contentHash: hash,
        },
        update: {
          contentHash: hash,
          updatedAt: new Date(),
        },
      });

      results.push({
        filePath,
        success: true,
        chunksCreated: parsedFile?.symbols.length || 0,
        processingTime: 0,
      });

      if (onProgress) {
        onProgress(i + 1, filePaths.length, filePath);
      }

      // Rate limiting delay
      if (i < filePaths.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      results.push({
        filePath,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        chunksCreated: 0,
        processingTime: 0,
      });
    }
  }

  return results;
}

/**
 * Estimate optimal worker count based on system resources
 */
export function estimateOptimalWorkers(): number {
  const cpuCount = os.cpus().length;
  const totalMemoryGB = os.totalmem() / (1024 * 1024 * 1024);
  const freeMemoryGB = os.freemem() / (1024 * 1024 * 1024);

  // Use 75% of CPUs, but ensure enough memory (2GB per worker)
  const cpuBasedWorkers = Math.floor(cpuCount * 0.75);
  const memoryBasedWorkers = Math.floor(freeMemoryGB / 2);

  return Math.max(1, Math.min(cpuBasedWorkers, memoryBasedWorkers));
}

// Made with Bob
