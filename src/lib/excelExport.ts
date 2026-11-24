import * as XLSX from 'xlsx';
import { Project, DashboardStats } from '@/types';

export function exportProjectsToExcel(projects: Project[], stats?: DashboardStats | null) {
  const wb = XLSX.utils.book_new();

  // 1. Master Tracker Sheet
  const trackerRows = projects.map((p, idx) => {
    const row: Record<string, string | number> = {
      'Sl. No': idx + 1,
      'Project Code': p.code,
      Location: p.location.name,
      Brand: p.brand.name,
      'Facility Type': p.facilityType,
      Status: p.currentStatus,
      'Schedule Health': p.scheduleHealth,
      'Work %': `${p.workPercentage}%`,
      'Elapsed Days': p.elapsedDays,
      'Days to Target': p.daysToTarget,
      'Fixed Target Date': p.fixedTargetDate ? p.fixedTargetDate.split('T')[0] : '2027-03-31',
      Remarks: p.keyRemarks || '',
    };

    // Add milestone actual dates
    p.milestones.forEach((m) => {
      row[m.title] = m.actualDate ? m.actualDate.split('T')[0] : m.status;
    });

    return row;
  });

  const wsTracker = XLSX.utils.json_to_sheet(trackerRows);
  XLSX.utils.book_append_sheet(wb, wsTracker, 'Projects Master Tracker');

  // 2. Executive Summary Sheet
  if (stats) {
    const summaryData = [
      { Metric: 'Report Date', Value: '19 November 2026' },
      { Metric: 'Total Project Tracks', Value: stats.metrics.totalTracks },
      { Metric: 'Commissioned Showrooms', Value: stats.metrics.commissionedCount },
      { Metric: 'Open Projects', Value: stats.metrics.openProjectsCount },
      { Metric: 'Fixed Target Date', Value: stats.metrics.fixedTargetDate },
      { Metric: 'Days to Target', Value: stats.metrics.daysToTarget },
      { Metric: 'Average Portfolio Progress', Value: `${stats.metrics.avgPortfolioProgress}%` },
      {},
      { Metric: 'STAGE-WISE BENCHMARKS', Value: '' },
      ...stats.benchmarks.map((b) => ({
        Metric: b.stageName,
        Value: `Avg: ${b.avgDays}d (Min: ${b.minDays}d, Max: ${b.maxDays}d) [${b.tracksCount} tracks]`,
      })),
      {},
      { Metric: 'ACTIVE BLOCKERS & BOTTLENECKS', Value: '' },
      ...stats.openBlockers.map((blk) => ({
        Metric: `[${blk.severity}] ${blk.project?.location.name || 'Site'} - ${blk.category}`,
        Value: `${blk.title}: ${blk.description}`,
      })),
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Dashboard');
  }

  // Trigger download
  XLSX.writeFile(wb, `Incheon_Mobility_River_Projects_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}
