import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateRepositorySummary } from '@/lib/rag/rag-chain';
import { createGitParser } from '@/lib/git/parser';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    // Get repository info
    const repository = await prisma.repository.findUnique({
      where: { id: projectId },
      include: {
        files: {
          select: {
            language: true,
            linesOfCode: true,
          },
        },
        commits: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalFiles = repository.files.length;
    const totalLinesOfCode = repository.files.reduce(
      (sum, file) => sum + (file.linesOfCode || 0),
      0
    );

    // Get language distribution
    const languageCount: Record<string, number> = {};
    repository.files.forEach((file) => {
      if (file.language) {
        languageCount[file.language] = (languageCount[file.language] || 0) + 1;
      }
    });

    const languages = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .map(([language, count]) => ({
        language,
        count,
        percentage: ((count / totalFiles) * 100).toFixed(1),
      }));

    // Get Git statistics
    let gitStats = null;
    try {
      const gitParser = createGitParser(repository.path);
      gitStats = await gitParser.getRepositoryStats();
    } catch (error) {
      console.error('Error getting git stats:', error);
    }

    // Get recent commits
    const recentCommits = repository.commits.slice(0, 5).map((commit) => ({
      hash: commit.hash,
      author: commit.author,
      message: commit.message,
      timestamp: commit.timestamp.toISOString(),
      filesChanged: JSON.parse(commit.filesChanged),
    }));

    // Get top contributors
    const contributorCount: Record<string, number> = {};
    repository.commits.forEach((commit) => {
      contributorCount[commit.author] = (contributorCount[commit.author] || 0) + 1;
    });

    const topContributors = Object.entries(contributorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([author, commits]) => ({
        author,
        commits,
      }));

    // Generate AI summary
    let aiSummary = null;
    try {
      aiSummary = await generateRepositorySummary(projectId);
    } catch (error) {
      console.error('Error generating AI summary:', error);
    }

    // Get key files (files with most lines of code)
    const keyFiles = repository.files
      .filter((f) => f.linesOfCode && f.linesOfCode > 0)
      .sort((a, b) => (b.linesOfCode || 0) - (a.linesOfCode || 0))
      .slice(0, 10)
      .map((file) => ({
        path: file.path,
        language: file.language,
        linesOfCode: file.linesOfCode,
        lastAuthor: file.lastAuthor,
        lastModified: file.lastModified?.toISOString(),
      }));

    return NextResponse.json({
      repository: {
        id: repository.id,
        name: repository.name,
        path: repository.path,
        status: repository.status,
        lastIndexed: repository.lastIndexed?.toISOString(),
      },
      statistics: {
        totalFiles,
        totalLinesOfCode,
        totalCommits: repository.commits.length,
        totalContributors: Object.keys(contributorCount).length,
      },
      languages,
      techStack: languages.slice(0, 5).map((l) => l.language),
      keyFiles,
      recentCommits,
      topContributors,
      gitStats,
      aiSummary,
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
