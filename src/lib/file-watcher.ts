import chokidar, { FSWatcher } from 'chokidar';
import { prisma } from '@/lib/db';
import { shouldIgnore } from '@/lib/filesystem';

/**
 * File watcher for monitoring repository changes
 */

interface WatcherOptions {
  repositoryId: string;
  repositoryPath: string;
  onFileChange?: (event: FileChangeEvent) => void;
}

export interface FileChangeEvent {
  type: 'added' | 'modified' | 'deleted';
  path: string;
  repositoryId: string;
}

class RepositoryWatcher {
  private watcher: FSWatcher | null = null;
  private repositoryId: string;
  private repositoryPath: string;
  private onFileChange?: (event: FileChangeEvent) => void;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEBOUNCE_MS = 1000; // 1 second debounce

  constructor(options: WatcherOptions) {
    this.repositoryId = options.repositoryId;
    this.repositoryPath = options.repositoryPath;
    this.onFileChange = options.onFileChange;
  }

  /**
   * Start watching the repository
   */
  start(): void {
    if (this.watcher) {
      console.warn('Watcher already started for repository:', this.repositoryId);
      return;
    }

    this.watcher = chokidar.watch(this.repositoryPath, {
      ignored: (path: string) => {
        // Ignore patterns from filesystem.ts
        return shouldIgnore(path);
      },
      persistent: true,
      ignoreInitial: true, // Don't trigger events for existing files
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100,
      },
    });

    // File added
    this.watcher.on('add', (path: string) => {
      this.handleFileChange('added', path);
    });

    // File modified
    this.watcher.on('change', (path: string) => {
      this.handleFileChange('modified', path);
    });

    // File deleted
    this.watcher.on('unlink', (path: string) => {
      this.handleFileChange('deleted', path);
    });

    // Error handling
    this.watcher.on('error', (error: Error) => {
      console.error('File watcher error:', error);
    });

    console.log('File watcher started for repository:', this.repositoryId);
  }

  /**
   * Stop watching the repository
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      
      // Clear all debounce timers
      this.debounceTimers.forEach(timer => clearTimeout(timer));
      this.debounceTimers.clear();
      
      console.log('File watcher stopped for repository:', this.repositoryId);
    }
  }

  /**
   * Handle file change with debouncing
   */
  private handleFileChange(type: 'added' | 'modified' | 'deleted', filePath: string): void {
    // Clear existing timer for this file
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(async () => {
      try {
        await this.processFileChange(type, filePath);
      } catch (error) {
        console.error('processFileChange failed:', error);
      } finally {
        this.debounceTimers.delete(filePath);
      }
    }, this.DEBOUNCE_MS);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Process file change after debounce
   */
  private async processFileChange(
    type: 'added' | 'modified' | 'deleted',
    filePath: string
  ): Promise<void> {
    const event: FileChangeEvent = {
      type,
      path: filePath,
      repositoryId: this.repositoryId,
    };

    console.log('File change detected:', event);

    // Trigger callback if provided
    if (this.onFileChange) {
      this.onFileChange(event);
    }

    // Update database based on change type
    try {
      if (type === 'deleted') {
        // Delete file and its chunks from database
        await prisma.file.deleteMany({
          where: {
            repositoryId: this.repositoryId,
            path: filePath,
          },
        });
      } else {
        // For added/modified, mark repository for re-indexing
        // The actual re-indexing will be handled by the indexer
        await prisma.repository.update({
          where: { id: this.repositoryId },
          data: { status: 'pending' },
        });
      }
    } catch (error) {
      console.error('Error updating database after file change:', error);
    }
  }
}

/**
 * Global watcher registry
 */
class WatcherRegistry {
  private watchers: Map<string, RepositoryWatcher> = new Map();

  /**
   * Start watching a repository
   */
  startWatching(options: WatcherOptions): void {
    const { repositoryId } = options;

    // Stop existing watcher if any
    this.stopWatching(repositoryId);

    // Create and start new watcher
    const watcher = new RepositoryWatcher(options);
    watcher.start();
    this.watchers.set(repositoryId, watcher);
  }

  /**
   * Stop watching a repository
   */
  async stopWatching(repositoryId: string): Promise<void> {
    const watcher = this.watchers.get(repositoryId);
    if (watcher) {
      await watcher.stop();
      this.watchers.delete(repositoryId);
    }
  }

  /**
   * Stop all watchers
   */
  async stopAll(): Promise<void> {
    const promises = Array.from(this.watchers.values()).map(w => w.stop());
    await Promise.all(promises);
    this.watchers.clear();
  }

  /**
   * Get active watcher count
   */
  getActiveCount(): number {
    return this.watchers.size;
  }

  /**
   * Check if repository is being watched
   */
  isWatching(repositoryId: string): boolean {
    return this.watchers.has(repositoryId);
  }
}

// Export singleton instance
export const watcherRegistry = new WatcherRegistry();

// Cleanup on process exit
process.on('SIGINT', async () => {
  console.log('Stopping all file watchers...');
  await watcherRegistry.stopAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Stopping all file watchers...');
  await watcherRegistry.stopAll();
  process.exit(0);
});
