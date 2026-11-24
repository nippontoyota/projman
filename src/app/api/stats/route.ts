import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        location: true,
        brand: true,
        blockers: { where: { status: { not: 'Resolved' } } },
      },
    });

    const totalTracks = projects.length;
    const commissionedTracks = projects.filter((p) => p.currentStatus === 'Commissioned');
    const openTracks = projects.filter((p) => p.currentStatus !== 'Commissioned');

    // Portfolio Status Breakdown
    const statusCounts: Record<string, { count: number; totalElapsed: number }> = {};
    for (const p of projects) {
      if (!statusCounts[p.currentStatus]) {
        statusCounts[p.currentStatus] = { count: 0, totalElapsed: 0 };
      }
      statusCounts[p.currentStatus].count += 1;
      statusCounts[p.currentStatus].totalElapsed += p.elapsedDays;
    }

    const portfolioBreakdown = Object.entries(statusCounts).map(([status, val]) => ({
      status,
      count: val.count,
      percentage: totalTracks > 0 ? Math.round((val.count / totalTracks) * 100) : 0,
      avgElapsedDays: val.count > 0 ? Math.round(val.totalElapsed / val.count) : 0,
    }));

    // Schedule Health Breakdown
    const healthCounts: Record<string, number> = {
      Completed: 0,
      'On Track': 0,
      Watchlist: 0,
      'Delayed (>30d)': 0,
      'Action Needed': 0,
    };
    for (const p of projects) {
      if (healthCounts[p.scheduleHealth] !== undefined) {
        healthCounts[p.scheduleHealth] += 1;
      }
    }

    // Benchmarks
    const benchmarks = await prisma.benchmark.findMany({
      orderBy: { stageNumber: 'asc' },
    });

    // Active Blockers
    const openBlockers = await prisma.blocker.findMany({
      where: { status: { not: 'Resolved' } },
      include: {
        project: { include: { location: true } },
      },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalTracks,
          commissionedCount: commissionedTracks.length,
          openProjectsCount: openTracks.length,
          fixedTargetDate: '2027-03-31',
          daysToTarget: 131,
          avgPortfolioProgress:
            totalTracks > 0
              ? Math.round(projects.reduce((acc, p) => acc + p.workPercentage, 0) / totalTracks)
              : 0,
        },
        portfolioBreakdown,
        healthCounts,
        benchmarks,
        openBlockers,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
