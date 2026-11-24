import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_MILESTONES = [
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'property_identified', title: 'Property Identified', orderIndex: 1, benchmarkDays: 7 },
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'details_shared', title: 'Property Details Shared with River', orderIndex: 2, benchmarkDays: 3 },
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'viewed_by_river', title: 'Property Viewed by River', orderIndex: 3, benchmarkDays: 5 },
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'approved_by_river', title: 'Property Approved by River', orderIndex: 4, benchmarkDays: 3 },
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'approved_by_mgmt', title: 'Property Approved by Management', orderIndex: 5, benchmarkDays: 3 },
  { phaseNumber: 1, phaseName: 'Property & Agreement', stepKey: 'agreement_signed', title: 'Agreement Signed by Parties', orderIndex: 6, benchmarkDays: 30 },

  { phaseNumber: 2, phaseName: 'Design & GFC Approval', stepKey: 'drawing_prepared', title: 'Drawing Prepared by Project Team', orderIndex: 7, benchmarkDays: 10 },
  { phaseNumber: 2, phaseName: 'Design & GFC Approval', stepKey: 'drawing_shared', title: 'Drawing Shared to River', orderIndex: 8, benchmarkDays: 2 },
  { phaseNumber: 2, phaseName: 'Design & GFC Approval', stepKey: 'base_layout', title: 'Base Layout from River', orderIndex: 9, benchmarkDays: 14 },
  { phaseNumber: 2, phaseName: 'Design & GFC Approval', stepKey: 'consent_gfc', title: 'Consent given for GFC', orderIndex: 10, benchmarkDays: 5 },
  { phaseNumber: 2, phaseName: 'Design & GFC Approval', stepKey: 'gfc_approved', title: 'GFC - Drawing Approved by River', orderIndex: 11, benchmarkDays: 14 },

  { phaseNumber: 3, phaseName: 'BOQ & PO Release', stepKey: 'boq_prepared', title: 'BOQ Prepared by Project Team', orderIndex: 12, benchmarkDays: 7 },
  { phaseNumber: 3, phaseName: 'BOQ & PO Release', stepKey: 'boq_submitted', title: 'BOQ submitted for Approval', orderIndex: 13, benchmarkDays: 3 },
  { phaseNumber: 3, phaseName: 'BOQ & PO Release', stepKey: 'boq_approved', title: 'BOQ Approved by Mgmt', orderIndex: 14, benchmarkDays: 5 },
  { phaseNumber: 3, phaseName: 'BOQ & PO Release', stepKey: 'po_released', title: 'PO/WO Released', orderIndex: 15, benchmarkDays: 7 },
  { phaseNumber: 3, phaseName: 'BOQ & PO Release', stepKey: 'advance_released', title: 'Payment/Advance released', orderIndex: 16, benchmarkDays: 5 },

  { phaseNumber: 4, phaseName: 'Site Execution & Handover', stepKey: 'work_started', title: 'Work Started Date', orderIndex: 17, benchmarkDays: 7 },
  { phaseNumber: 4, phaseName: 'Site Execution & Handover', stepKey: 'documentation_done', title: 'Documentation Completion Done', orderIndex: 18, benchmarkDays: 90 },
  { phaseNumber: 4, phaseName: 'Site Execution & Handover', stepKey: 'tc_received', title: 'TC Received Date', orderIndex: 19, benchmarkDays: 14 },
  { phaseNumber: 4, phaseName: 'Site Execution & Handover', stepKey: 'facility_handover', title: 'Facility Handover Date', orderIndex: 20, benchmarkDays: 7 },
  { phaseNumber: 4, phaseName: 'Site Execution & Handover', stepKey: 'operations_commenced', title: 'Operations Commenced', orderIndex: 21, benchmarkDays: 7 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityType = searchParams.get('facilityType');
    const locationName = searchParams.get('location');
    const status = searchParams.get('status');
    const health = searchParams.get('health');
    const search = searchParams.get('search');

    const whereClause: Record<string, unknown> = {};

    if (facilityType && facilityType !== 'ALL') {
      whereClause.facilityType = facilityType;
    }

    if (status && status !== 'ALL') {
      whereClause.currentStatus = status;
    }

    if (health && health !== 'ALL') {
      whereClause.scheduleHealth = health;
    }

    if (locationName && locationName !== 'ALL') {
      whereClause.location = { name: locationName };
    }

    if (search) {
      whereClause.OR = [
        { code: { contains: search } },
        { location: { name: { contains: search } } },
        { keyRemarks: { contains: search } },
      ];
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        brand: true,
        location: true,
        milestones: {
          orderBy: { orderIndex: 'asc' },
        },
        blockers: {
          orderBy: { createdAt: 'desc' },
        },
        auditLogs: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { currentStatus: 'asc' },
        { location: { name: 'asc' } },
      ],
    });

    return NextResponse.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brandName = 'River EV',
      locationName,
      facilityType,
      targetDate = '2027-03-31',
      userRole = 'Admin',
      initialRemarks,
    } = body;

    if (!locationName || !facilityType) {
      return NextResponse.json(
        { success: false, error: 'Location and Facility Type are required' },
        { status: 400 }
      );
    }

    // Find or create Brand
    let brand = await prisma.brand.findFirst({
      where: { name: brandName },
    });
    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: brandName,
          code: brandName.toUpperCase().replace(/\s+/g, '').slice(0, 5),
          color: '#0284C7',
        },
      });
    }

    // Find or create Location
    let location = await prisma.location.findFirst({
      where: { name: locationName.trim() },
    });
    if (!location) {
      location = await prisma.location.create({
        data: {
          name: locationName.trim(),
          state: 'Kerala',
        },
      });
    }

    // Auto-generate project code
    const shortLoc = location.name.slice(0, 3).toUpperCase();
    const shortFac = facilityType.slice(0, 3).toUpperCase();
    const count = await prisma.project.count({
      where: { locationId: location.id },
    });
    const code = `${brand.code.slice(0, 3)}-${shortLoc}-${shortFac}-${String(count + 1).padStart(2, '0')}`;

    // Target date calculations
    const target = new Date(targetDate);
    const now = new Date();
    const daysToTarget = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Create project
    const project = await prisma.project.create({
      data: {
        code,
        brandId: brand.id,
        locationId: location.id,
        facilityType,
        currentStatus: 'Commercial Negotiation',
        scheduleHealth: 'On Track',
        workPercentage: 0,
        elapsedDays: 0,
        daysToTarget,
        startDate: now,
        fixedTargetDate: target,
        keyRemarks: initialRemarks || 'New project initiated. Commercial negotiation underway.',
      },
    });

    // Create all 21 milestone tasks
    for (const t of DEFAULT_MILESTONES) {
      await prisma.milestone.create({
        data: {
          projectId: project.id,
          phaseNumber: t.phaseNumber,
          phaseName: t.phaseName,
          stepKey: t.stepKey,
          title: t.title,
          orderIndex: t.orderIndex,
          benchmarkDays: t.benchmarkDays,
          status: t.orderIndex === 1 ? 'In Progress' : 'Pending',
          plannedDate: t.orderIndex === 1 ? now : undefined,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: project.id,
        userRole,
        action: 'PROJECT_CREATED',
        details: `Project ${code} created by ${userRole} for ${location.name} (${facilityType})`,
      },
    });

    const fullProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        brand: true,
        location: true,
        milestones: { orderBy: { orderIndex: 'asc' } },
        blockers: true,
      },
    });

    return NextResponse.json({ success: true, data: fullProject }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 });
  }
}
