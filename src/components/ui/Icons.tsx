'use client';

import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

// 1. Gantt Timeline: Architectural multi-phase rollout track
export const IconGantt: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <rect x="2" y="3" width="7" height="2.5" rx="0.75" />
    <rect x="5.5" y="7" width="8.5" height="2.5" rx="0.75" />
    <rect x="3.5" y="11" width="6.5" height="2.5" rx="0.75" />
    <line x1="2" y1="1.5" x2="2" y2="14.5" strokeDasharray="1 1.5" strokeOpacity="0.4" />
  </svg>
);

// 2. Executive Dashboard: Precision telemetry gauges & metrics
export const IconDashboard: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <rect x="2" y="2" width="5" height="5" rx="1" />
    <rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" />
    <rect x="9" y="9" width="5" height="5" rx="1" />
    <circle cx="4.5" cy="4.5" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="11.5" cy="4.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

// 3. Milestone Matrix: 21-checkpoint matrix grid
export const IconMatrix: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
    <line x1="2" y1="6" x2="14" y2="6" />
    <line x1="2" y1="9.5" x2="14" y2="9.5" />
    <line x1="6" y1="2.5" x2="6" y2="13.5" />
    <line x1="10.5" y1="2.5" x2="10.5" y2="13.5" />
  </svg>
);

// 4. Bottleneck Radar: Engineering crosshair & escalation beacon
export const IconRadar: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <circle cx="8" cy="8" r="6" />
    <circle cx="8" cy="8" r="3" strokeDasharray="1.5 1.5" />
    <line x1="8" y1="1" x2="8" y2="4" />
    <line x1="8" y1="12" x2="8" y2="15" />
    <line x1="1" y1="8" x2="4" y2="8" />
    <line x1="12" y1="8" x2="15" y2="8" />
    <circle cx="8" cy="8" r="1.25" fill="currentColor" stroke="none" />
  </svg>
);

// 5. Technical Checkmark
export const IconCheck: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
  </svg>
);

// 6. Technical Close / Cross
export const IconClose: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <line x1="4" y1="4" x2="12" y2="12" />
    <line x1="12" y1="4" x2="4" y2="12" />
  </svg>
);

// 7. Plus / Initialize Crosshair
export const IconPlus: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
);

// 8. Precision Optical Loupe (Search)
export const IconSearch: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <circle cx="7" cy="7" r="4.5" />
    <line x1="10.5" y1="10.5" x2="14" y2="14" />
  </svg>
);

// 9. Data Download / Excel Export
export const IconDownload: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.45"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M8 2.5v7.5M5.5 7.5L8 10l2.5-2.5" />
    <path d="M3 11.5v1.25c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V11.5" />
  </svg>
);

// 10. Master Dataset Sync / Reset
export const IconSync: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M2.5 8a5.5 5.5 0 0 1 9.39-3.89L13.5 5.5" />
    <polyline points="13.5 2 13.5 5.5 10 5.5" />
    <path d="M13.5 8a5.5 5.5 0 0 1-9.39 3.89L2.5 10.5" />
    <polyline points="2.5 14 2.5 10.5 6 10.5" />
  </svg>
);

// 11. Architectural Facility / Building
export const IconFacility: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <rect x="2.5" y="3" width="11" height="11" rx="1" />
    <line x1="2.5" y1="7" x2="13.5" y2="7" />
    <rect x="5" y="9.5" width="2" height="4.5" />
    <rect x="9" y="9.5" width="2" height="4.5" />
  </svg>
);

// 12. Geographic Location Pin
export const IconLocation: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.38 4.5 8.5 4.5 8.5s4.5-5.12 4.5-8.5c0-2.49-2.01-4.5-4.5-4.5z" />
    <circle cx="8" cy="6" r="1.5" />
  </svg>
);

// 13. Executive Shield / Access Role
export const IconRoleShield: React.FC<IconProps> = ({ className = 'w-3 h-3', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M8 1.5l5 2.25v4.25c0 3.5-2.25 6.25-5 7-2.75-.75-5-3.5-5-7V3.75L8 1.5z" />
    <circle cx="8" cy="7.5" r="1.5" />
  </svg>
);

// 14. User Profile Pip
export const IconRoleUser: React.FC<IconProps> = ({ className = 'w-3 h-3', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <circle cx="8" cy="5" r="2.5" />
    <path d="M3.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
  </svg>
);

// 15. Engineering Escalation Diamond
export const IconEscalation: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M8 1.5l6 6.5-6 6.5-6-6.5L8 1.5z" />
    <line x1="8" y1="5.5" x2="8" y2="8.5" />
    <circle cx="8" cy="10.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

// 16. Technical Trash Can
export const IconTrash: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M2.5 4h11" />
    <path d="M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4" />
    <path d="M4 4l.8 9.5a1.5 1.5 0 0 0 1.5 1.4h3.4a1.5 1.5 0 0 0 1.5-1.4L12 4" />
    <line x1="6.5" y1="7" x2="6.5" y2="11.5" />
    <line x1="9.5" y1="7" x2="9.5" y2="11.5" />
  </svg>
);

// 17. Technical Save Disk
export const IconSave: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M12.5 14H3.5A1.5 1.5 0 0 1 2 12.5V3.5A1.5 1.5 0 0 1 3.5 2H11l3 3v7.5a1.5 1.5 0 0 1-1.5 1.5z" />
    <path d="M11 14V9H5v5" />
    <path d="M5 2v3h4" />
  </svg>
);

// 18. Technical External Link Arrow
export const IconExternal: React.FC<IconProps> = ({ className = 'w-3 h-3', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M10 2.5h3.5v3.5" />
    <line x1="6.5" y1="9.5" x2="13.5" y2="2.5" />
    <path d="M13.5 8.5v4a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h4" />
  </svg>
);

// 19. Chevron Left Arrow
export const IconChevronLeft: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M10 12l-4-4 4-4" />
  </svg>
);

// 20. Chevron Right Arrow
export const IconChevronRight: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M6 4l4 4-4 4" />
  </svg>
);

// 21. User Icon
export const IconUser: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <circle cx="8" cy="5" r="3" />
    <path d="M2.5 14a5.5 5.5 0 0 1 11 0" />
  </svg>
);

// 22. Lock Icon
export const IconLock: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <rect x="3" y="7" width="10" height="7" rx="1.5" />
    <path d="M5.5 7V4.5a2.5 2.5 0 0 1 5 0V7" />
  </svg>
);

// 23. Logout Icon
export const IconLogout: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" />
    <path d="M10.5 11.5L14 8l-3.5-3.5" />
    <path d="M14 8H6" />
  </svg>
);

// 24. Alert Circle Icon
export const IconAlertCircle: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <circle cx="8" cy="8" r="6" />
    <line x1="8" y1="5" x2="8" y2="8.5" />
    <circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

// 25. Chevron Down Icon
export const IconChevronDown: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <polyline points="4 6 8 10 12 6" />
  </svg>
);



