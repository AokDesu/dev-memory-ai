import { NextRequest, NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';
import { getEmbeddingCache, getSearchCache } from '@/lib/cache';

/**
 * Metrics endpoint for monitoring
 * Returns performance metrics and cache statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Require ADMIN_API_KEY — never serve unauthenticated metrics.
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get performance metrics
    const performanceMetrics = metrics.getSummary();

    // Get cache statistics
    const cacheStats = {
      embeddings: getEmbeddingCache().getStats(),
      search: getSearchCache().getStats(),
    };
    
    // Get system info
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptime,
        formatted: formatUptime(uptime),
      },
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        formatted: {
          rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
          heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        },
      },
      performance: performanceMetrics,
      cache: cacheStats,
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}
