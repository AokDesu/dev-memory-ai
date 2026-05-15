import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Initialize database tables on first import
async function initDB() {
  try {
    await prisma.$connect();
    
    // Check if tables exist
    const tables = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type='table' AND name='Repository';
    `;
    
    if (tables.length === 0) {
      console.log('Creating database tables...');
      
      // Create all tables
      await prisma.$executeRaw`
        CREATE TABLE "Repository" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "path" TEXT NOT NULL UNIQUE,
          "name" TEXT NOT NULL,
          "lastIndexed" DATETIME,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await prisma.$executeRaw`
        CREATE TABLE "File" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "repositoryId" TEXT NOT NULL,
          "path" TEXT NOT NULL,
          "language" TEXT,
          "linesOfCode" INTEGER,
          "lastAuthor" TEXT,
          "lastModified" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE
        )
      `;

      await prisma.$executeRaw`
        CREATE TABLE "CodeChunk" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "repositoryId" TEXT NOT NULL,
          "fileId" TEXT NOT NULL,
          "chunkType" TEXT NOT NULL,
          "name" TEXT,
          "content" TEXT NOT NULL,
          "startLine" INTEGER NOT NULL,
          "endLine" INTEGER NOT NULL,
          "embedding" TEXT,
          "metadata" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE,
          FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE
        )
      `;

      await prisma.$executeRaw`
        CREATE TABLE "Commit" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "repositoryId" TEXT NOT NULL,
          "hash" TEXT NOT NULL UNIQUE,
          "author" TEXT NOT NULL,
          "email" TEXT,
          "timestamp" DATETIME NOT NULL,
          "message" TEXT NOT NULL,
          "filesChanged" TEXT NOT NULL,
          "embedding" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE
        )
      `;

      await prisma.$executeRaw`
        CREATE TABLE "IndexingJob" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "repositoryId" TEXT NOT NULL,
          "status" TEXT NOT NULL,
          "progress" REAL NOT NULL DEFAULT 0,
          "totalFiles" INTEGER,
          "processedFiles" INTEGER,
          "currentFile" TEXT,
          "error" TEXT,
          "startedAt" DATETIME,
          "completedAt" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE
        )
      `;

      // Create indexes
      await prisma.$executeRaw`CREATE UNIQUE INDEX "File_repositoryId_path_key" ON "File"("repositoryId", "path")`;
      await prisma.$executeRaw`CREATE INDEX "File_repositoryId_idx" ON "File"("repositoryId")`;
      await prisma.$executeRaw`CREATE INDEX "CodeChunk_repositoryId_chunkType_idx" ON "CodeChunk"("repositoryId", "chunkType")`;
      await prisma.$executeRaw`CREATE INDEX "CodeChunk_fileId_idx" ON "CodeChunk"("fileId")`;
      await prisma.$executeRaw`CREATE INDEX "Commit_repositoryId_timestamp_idx" ON "Commit"("repositoryId", "timestamp")`;
      await prisma.$executeRaw`CREATE INDEX "IndexingJob_repositoryId_status_idx" ON "IndexingJob"("repositoryId", "status")`;

      console.log('✅ Database initialized successfully');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Auto-initialize on import
initDB().catch(console.error);