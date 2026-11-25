export type FacilityType = 'Sales' | 'Service' | 'Stock Yard' | 'Sales & Service';

export type ScheduleHealth =
  | 'Completed'
  | 'On Track'
  | 'Watchlist'
  | 'Delayed (>30d)'
  | 'Action Needed';

export type ProjectStatus =
  | 'Commissioned'
  | 'Ready for Handover'
  | 'BOQ Approved / PO Pending'
  | 'Pre-Construction'
  | 'Commercial Negotiation';

export type MilestoneStatus = 'Pending' | 'In Progress' | 'Completed' | 'Awaiting';

export type UserRole = 'Admin' | 'User';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface Brand {
  id: string;
  name: string;
  code: string;
  color?: string | null;
}

export interface Location {
  id: string;
  name: string;
  district?: string | null;
  state: string;
}

export type BlockerSeverity = 'Critical' | 'Major' | 'Moderate' | 'Minor';

export interface Blocker {
  id: string;
  projectId: string;
  milestoneId?: string | null;
  category: string;
  severity: BlockerSeverity;
  title: string;
  description: string;
  status: 'Open' | 'Under Discussion' | 'Resolved';
  loggedAt: string;
  resolvedAt?: string | null;
  project?: {
    id: string;
    code: string;
    location: Location;
  };
  milestone?: {
    id: string;
    title: string;
  };
}

export interface Milestone {
  id: string;
  projectId: string;
  phaseNumber: number;
  phaseName: string;
  stepKey: string;
  title: string;
  orderIndex: number;
  status: MilestoneStatus;
  plannedDate?: string | null;
  actualDate?: string | null;
  benchmarkDays?: number | null;
  elapsedDays?: number | null;
  remarks?: string | null;
  blockers?: Blocker[];
}

export interface AuditLog {
  id: string;
  projectId: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Project {
  id: string;
  code: string;
  brandId: string;
  brand: Brand;
  locationId: string;
  location: Location;
  facilityType: FacilityType;
  currentStatus: ProjectStatus;
  scheduleHealth: ScheduleHealth;
  workPercentage: number;
  fixedTargetDate: string;
  startDate?: string | null;
  commissionedDate?: string | null;
  elapsedDays: number;
  daysToTarget: number;
  daysSinceLastMilestone: number;
  keyRemarks?: string | null;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
  blockers: Blocker[];
  auditLogs?: AuditLog[];
}

export interface Benchmark {
  id: string;
  stageNumber: number;
  stageName: string;
  avgDays: number;
  minDays: number;
  maxDays: number;
  tracksCount: number;
}

export interface DashboardStats {
  metrics: {
    totalTracks: number;
    commissionedCount: number;
    openProjectsCount: number;
    fixedTargetDate: string;
    daysToTarget: number;
    avgPortfolioProgress: number;
  };
  portfolioBreakdown: {
    status: string;
    count: number;
    percentage: number;
    avgElapsedDays: number;
  }[];
  healthCounts: Record<string, number>;
  benchmarks: Benchmark[];
  openBlockers: Blocker[];
}
