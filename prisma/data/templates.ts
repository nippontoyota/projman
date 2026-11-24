export const MILESTONE_TEMPLATES = [
  // Phase 1: Property & Agreement
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'property_identified', title: 'Property Identified', orderIndex: 1, benchmarkDays: 7 },
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'details_shared', title: 'Property Details Shared with River', orderIndex: 2, benchmarkDays: 3 },
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'viewed_by_river', title: 'Property Viewed by River', orderIndex: 3, benchmarkDays: 5 },
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'approved_by_river', title: 'Property Approved by River', orderIndex: 4, benchmarkDays: 3 },
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'approved_by_mgmt', title: 'Property Approved by Management', orderIndex: 5, benchmarkDays: 3 },
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'agreement_signed', title: 'Agreement Signed by Parties', orderIndex: 6, benchmarkDays: 30 },

  // Phase 2: Design & GFC Approval
  { phaseNumber: 2, phaseName: 'Design & GFC Approval', stepKey: 'drawing_prepared', title: 'Drawing Prepared by Project Team', orderIndex: 7, benchmarkDays: 10 },
  { phaseNumber: 2, phaseName: 'Design & GFC Approval', stepKey: 'drawing_shared', title: 'Drawing Shared to River', orderIndex: 8, benchmarkDays: 2 },
  { phaseNumber: 2, phaseName: 'Design & GFC Approval', stepKey: 'base_layout', title: 'Base Layout from River', orderIndex: 9, benchmarkDays: 14 },
  { phaseNumber: 2, phaseName: 'Design & GFC Approval', stepKey: 'consent_gfc', title: 'Consent given for GFC', orderIndex: 10, benchmarkDays: 5 },
  { phaseNumber: 2, phaseName: 'Design & GFC Approval', stepKey: 'gfc_approved', title: 'GFC - Drawing Approved by River', orderIndex: 11, benchmarkDays: 14 },

  // Phase 3: BOQ & PO Release
  { phaseNumber: 3, phaseName: 'BOQ & PO Release', stepKey: 'boq_prepared', title: 'BOQ Prepared by Project Team', orderIndex: 12, benchmarkDays: 7 },
  { phaseNumber: 3, phaseName: 'BOQ & PO Release', stepKey: 'boq_submitted', title: 'BOQ submitted for Approval', orderIndex: 13, benchmarkDays: 3 },
  { phaseNumber: 3, phaseName: 'BOQ & PO Release', stepKey: 'boq_approved', title: 'BOQ Approved by Mgmt', orderIndex: 14, benchmarkDays: 5 },
  { phaseNumber: 3, phaseName: 'BOQ & PO Release', stepKey: 'po_released', title: 'PO/WO Released', orderIndex: 15, benchmarkDays: 7 },
  { phaseNumber: 3, phaseName: 'BOQ & PO Release', stepKey: 'advance_released', title: 'Payment/Advance released', orderIndex: 16, benchmarkDays: 5 },

  // Phase 4: Site Execution & Handover
  { phaseNumber: 4, phaseName: 'Site Execution & Handover', stepKey: 'work_started', title: 'Work Started Date', orderIndex: 17, benchmarkDays: 7 },
  { phaseNumber: 4, phaseName: 'Site Execution & Handover', stepKey: 'documentation_done', title: 'Documentation Completion Done', orderIndex: 18, benchmarkDays: 90 },
  { phaseNumber: 4, phaseName: 'Site Execution & Handover', stepKey: 'tc_received', title: 'TC Received Date', orderIndex: 19, benchmarkDays: 14 },
  { phaseNumber: 4, phaseName: 'Site Execution & Handover', stepKey: 'facility_handover', title: 'Facility Handover Date', orderIndex: 20, benchmarkDays: 7 },
  { phaseNumber: 4, phaseName: 'Site Execution & Handover', stepKey: 'operations_commenced', title: 'Operations Commenced', orderIndex: 21, benchmarkDays: 7 },
];

export const BENCHMARKS_DATA = [
  { stageNumber: 1, stageName: '1. Property Approval', avgDays: 12.36, minDays: 0, maxDays: 53, tracksCount: 14 },
  { stageNumber: 2, stageName: '2. Agreement Signing', avgDays: 62.09, minDays: 0, maxDays: 422, tracksCount: 11 },
  { stageNumber: 3, stageName: '3. Design & GFC Approval', avgDays: 49.0, minDays: 3, maxDays: 228, tracksCount: 9 },
  { stageNumber: 4, stageName: '4. BOQ & PO Release', avgDays: 121.75, minDays: 7, maxDays: 428, tracksCount: 4 },
  { stageNumber: 5, stageName: '5. Site Execution', avgDays: 175.67, minDays: 102, maxDays: 310, tracksCount: 3 },
];

export const KERALA_LOCATIONS = [
  'Pala',
  'Aluva',
  'Muvattupuzha',
  'Thripunithura - Irumpanam',
  'Alappuzha',
  'Kayamkulam',
  'Cherthala',
  'Nedumangad',
  'Pattom',
];
