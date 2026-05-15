/**
 * Advanced Search Features
 * Includes filters, sorting, search history, and suggestions
 */

import { db } from '../db';
import { searchCode, searchCommits } from './vector-search';
import { getSearchCache } from '../cache';

export interface SearchFilters {
  languages?: string[];
  fileTypes?: string[];
  authors?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  minScore?: number;
  excludePaths?: string[];
  includePaths?: string[];
}

export interface SearchOptions {
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'date' | 'author' | 'file';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  type: 'code' | 'commit';
  content: string;
  filePath?: string;
  language?: string;
  author?: string;
  date?: Date;
  score: number;
  highlights?: string[];
  context?: {
    before: string[];
    after: string[];
  };
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  filters?: SearchFilters;
  timestamp: Date;
  resultCount: number;
  userId?: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'file';
  score: number;
}

/**
 * Advanced search with filters and sorting
 */
export async function advancedSearch(
  repositoryId: string,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    filters = {},
    sortBy = 'relevance',
    sortOrder = 'desc',
    limit = 20,
    offset = 0,
  } = options;

  // Check cache first
  const cache = getSearchCache();
  const cacheKey = JSON.stringify({ repositoryId, query, options });
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Perform search
  let results: SearchResult[] = [];

  // Search code chunks
  const codeResults = await searchCode(repositoryId, query, limit * 2);
  results.push(
    ...codeResults.map((r) => ({
      id: r.id,
      type: 'code' as const,
      content: r.content,
      filePath: r.file.path,
      language: r.file.language,
      score: r.score,
    }))
  );

  // Search commits
  const commitResults = await searchCommits(repositoryId, query, limit);
  results.push(
    ...commitResults.map((r) => ({
      id: r.id,
      type: 'commit' as const,
      content: r.message,
      author: r.author,
      date: r.date,
      score: r.score,
    }))
  );

  // Apply filters
  results = applyFilters(results, filters);

  // Sort results
  results = sortResults(results, sortBy, sortOrder);

  // Apply pagination
  results = results.slice(offset, offset + limit);

  // Add highlights and context
  results = await enrichResults(results, query);

  // Cache results
  cache.set(cacheKey, results);

  // Save to search history
  await saveSearchHistory(repositoryId, query, filters, results.length);

  return results;
}

/**
 * Apply filters to search results
 */
function applyFilters(
  results: SearchResult[],
  filters: SearchFilters
): SearchResult[] {
  let filtered = results;

  // Language filter
  if (filters.languages && filters.languages.length > 0) {
    filtered = filtered.filter(
      (r) => r.language && filters.languages!.includes(r.language)
    );
  }

  // File type filter
  if (filters.fileTypes && filters.fileTypes.length > 0) {
    filtered = filtered.filter((r) => {
      if (!r.filePath) return false;
      const ext = r.filePath.split('.').pop()?.toLowerCase();
      return ext && filters.fileTypes!.includes(ext);
    });
  }

  // Author filter
  if (filters.authors && filters.authors.length > 0) {
    filtered = filtered.filter(
      (r) => r.author && filters.authors!.includes(r.author)
    );
  }

  // Date range filter
  if (filters.dateRange) {
    filtered = filtered.filter((r) => {
      if (!r.date) return false;
      return (
        r.date >= filters.dateRange!.from && r.date <= filters.dateRange!.to
      );
    });
  }

  // Minimum score filter
  if (filters.minScore !== undefined) {
    filtered = filtered.filter((r) => r.score >= filters.minScore!);
  }

  // Path filters
  if (filters.excludePaths && filters.excludePaths.length > 0) {
    filtered = filtered.filter((r) => {
      if (!r.filePath) return true;
      return !filters.excludePaths!.some((path) => r.filePath!.includes(path));
    });
  }

  if (filters.includePaths && filters.includePaths.length > 0) {
    filtered = filtered.filter((r) => {
      if (!r.filePath) return false;
      return filters.includePaths!.some((path) => r.filePath!.includes(path));
    });
  }

  return filtered;
}

/**
 * Sort search results
 */
function sortResults(
  results: SearchResult[],
  sortBy: string,
  sortOrder: string
): SearchResult[] {
  const sorted = [...results];
  const order = sortOrder === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'relevance':
        comparison = a.score - b.score;
        break;
      case 'date':
        if (a.date && b.date) {
          comparison = a.date.getTime() - b.date.getTime();
        }
        break;
      case 'author':
        if (a.author && b.author) {
          comparison = a.author.localeCompare(b.author);
        }
        break;
      case 'file':
        if (a.filePath && b.filePath) {
          comparison = a.filePath.localeCompare(b.filePath);
        }
        break;
    }

    return comparison * order;
  });

  return sorted;
}

/**
 * Enrich results with highlights and context
 */
async function enrichResults(
  results: SearchResult[],
  query: string
): Promise<SearchResult[]> {
  const queryTerms = query.toLowerCase().split(/\s+/);

  return results.map((result) => {
    // Add highlights
    const highlights: string[] = [];
    const content = result.content.toLowerCase();

    for (const term of queryTerms) {
      if (content.includes(term)) {
        const index = content.indexOf(term);
        const start = Math.max(0, index - 20);
        const end = Math.min(content.length, index + term.length + 20);
        highlights.push(result.content.substring(start, end));
      }
    }

    return {
      ...result,
      highlights: highlights.length > 0 ? highlights : undefined,
    };
  });
}

/**
 * Save search to history
 */
async function saveSearchHistory(
  repositoryId: string,
  query: string,
  filters: SearchFilters,
  resultCount: number
): Promise<void> {
  try {
    // Note: You would need to add a SearchHistory model to Prisma schema
    // For now, we'll just log it
    console.log('Search history:', {
      repositoryId,
      query,
      filters,
      resultCount,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

/**
 * Get search history
 */
export async function getSearchHistory(
  repositoryId: string,
  limit: number = 10
): Promise<SearchHistoryEntry[]> {
  try {
    // This would query the SearchHistory table
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Failed to get search history:', error);
    return [];
  }
}

/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(
  repositoryId: string,
  query: string,
  limit: number = 5
): Promise<SearchSuggestion[]> {
  const suggestions: SearchSuggestion[] = [];

  try {
    // Get popular queries from history
    const history = await getSearchHistory(repositoryId, 20);
    const popularQueries = history
      .filter((h) => h.query.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map((h) => ({
        text: h.query,
        type: 'query' as const,
        score: h.resultCount,
      }));

    suggestions.push(...popularQueries);

    // Get file suggestions
    const files = await db.file.findMany({
      where: {
        repositoryId,
        path: {
          contains: query,
        },
      },
      take: 3,
      select: {
        path: true,
      },
    });

    suggestions.push(
      ...files.map((f) => ({
        text: f.path,
        type: 'file' as const,
        score: 1,
      }))
    );

    // Get language suggestions
    if (query.length >= 2) {
      const languages = ['javascript', 'typescript', 'python', 'java', 'go'];
      const matchingLanguages = languages.filter((lang) =>
        lang.toLowerCase().includes(query.toLowerCase())
      );

      suggestions.push(
        ...matchingLanguages.map((lang) => ({
          text: `language:${lang}`,
          type: 'filter' as const,
          score: 1,
        }))
      );
    }

    // Sort by score and limit
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get search suggestions:', error);
    return [];
  }
}

/**
 * Parse search query with filters
 * Example: "function auth language:typescript author:john"
 */
export function parseSearchQuery(query: string): {
  query: string;
  filters: SearchFilters;
} {
  const filters: SearchFilters = {};
  let cleanQuery = query;

  // Extract language filter
  const langMatch = query.match(/language:(\w+)/gi);
  if (langMatch) {
    filters.languages = langMatch.map((m) => m.split(':')[1].toLowerCase());
    cleanQuery = cleanQuery.replace(/language:\w+/gi, '').trim();
  }

  // Extract author filter
  const authorMatch = query.match(/author:(\w+)/gi);
  if (authorMatch) {
    filters.authors = authorMatch.map((m) => m.split(':')[1]);
    cleanQuery = cleanQuery.replace(/author:\w+/gi, '').trim();
  }

  // Extract file type filter
  const fileMatch = query.match(/filetype:(\w+)/gi);
  if (fileMatch) {
    filters.fileTypes = fileMatch.map((m) => m.split(':')[1].toLowerCase());
    cleanQuery = cleanQuery.replace(/filetype:\w+/gi, '').trim();
  }

  // Extract path filter
  const pathMatch = query.match(/path:([^\s]+)/gi);
  if (pathMatch) {
    filters.includePaths = pathMatch.map((m) => m.split(':')[1]);
    cleanQuery = cleanQuery.replace(/path:[^\s]+/gi, '').trim();
  }

  return {
    query: cleanQuery,
    filters,
  };
}

/**
 * Get faceted search results (aggregations)
 */
export async function getFacets(
  repositoryId: string,
  query: string
): Promise<{
  languages: Map<string, number>;
  authors: Map<string, number>;
  fileTypes: Map<string, number>;
}> {
  const results = await advancedSearch(repositoryId, query, { limit: 100 });

  const languages = new Map<string, number>();
  const authors = new Map<string, number>();
  const fileTypes = new Map<string, number>();

  for (const result of results) {
    // Count languages
    if (result.language) {
      languages.set(result.language, (languages.get(result.language) || 0) + 1);
    }

    // Count authors
    if (result.author) {
      authors.set(result.author, (authors.get(result.author) || 0) + 1);
    }

    // Count file types
    if (result.filePath) {
      const ext = result.filePath.split('.').pop()?.toLowerCase();
      if (ext) {
        fileTypes.set(ext, (fileTypes.get(ext) || 0) + 1);
      }
    }
  }

  return { languages, authors, fileTypes };
}

/**
 * Search with autocomplete
 */
export async function autocompleteSearch(
  repositoryId: string,
  query: string,
  limit: number = 5
): Promise<string[]> {
  try {
    // Get recent searches
    const history = await getSearchHistory(repositoryId, 50);
    const matches = history
      .filter((h) => h.query.toLowerCase().startsWith(query.toLowerCase()))
      .map((h) => h.query)
      .slice(0, limit);

    return matches;
  } catch (error) {
    console.error('Failed to get autocomplete suggestions:', error);
    return [];
  }
}

/**
 * Similar code search
 */
export async function findSimilarCode(
  repositoryId: string,
  codeChunkId: string,
  limit: number = 10
): Promise<SearchResult[]> {
  try {
    // Get the original chunk
    const chunk = await db.codeChunk.findUnique({
      where: { id: codeChunkId },
      include: { file: true },
    });

    if (!chunk) {
      return [];
    }

    // Search for similar code
    return await advancedSearch(repositoryId, chunk.content, { limit });
  } catch (error) {
    console.error('Failed to find similar code:', error);
    return [];
  }
}

/**
 * Export search results
 */
export async function exportSearchResults(
  results: SearchResult[],
  format: 'json' | 'csv' | 'markdown'
): Promise<string> {
  switch (format) {
    case 'json':
      return JSON.stringify(results, null, 2);

    case 'csv':
      const headers = 'Type,Content,File,Language,Author,Date,Score\n';
      const rows = results
        .map(
          (r) =>
            `${r.type},"${r.content}","${r.filePath || ''}","${r.language || ''}","${r.author || ''}","${r.date || ''}",${r.score}`
        )
        .join('\n');
      return headers + rows;

    case 'markdown':
      let md = '# Search Results\n\n';
      for (const result of results) {
        md += `## ${result.type}: ${result.filePath || result.author || 'Unknown'}\n\n`;
        md += `**Score:** ${result.score.toFixed(2)}\n\n`;
        md += `\`\`\`\n${result.content}\n\`\`\`\n\n`;
        if (result.highlights) {
          md += `**Highlights:**\n${result.highlights.map((h) => `- ${h}`).join('\n')}\n\n`;
        }
        md += '---\n\n';
      }
      return md;

    default:
      return JSON.stringify(results);
  }
}

// Made with Bob
