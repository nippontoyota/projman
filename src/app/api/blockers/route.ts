import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (status && status !== 'ALL') where.status = status;

    const blockers = await prisma.blocker.findMany({
      where,
      include: {
        project: {
          include: { location: true },
        },
        milestone: true,
      },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, count: blockers.length, data: blockers });
  } catch (error) {
    console.error('Error fetching blockers:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch blockers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      milestoneId,
      category,
      severity,
      title,
      description,
      userRole = 'User',
    } = body;

    if (!projectId || !title || !category) {
      return NextResponse.json(
        { success: false, error: 'Project, title, and category are required' },
        { status: 400 }
      );
    }

    const blocker = await prisma.blocker.create({
      data: {
        projectId,
        milestoneId: milestoneId || null,
        category,
        severity: severity || 'Major',
        title,
        description: description || '',
        status: 'Open',
      },
      include: {
        project: { include: { location: true } },
      },
    });

    // Also update project schedule health if critical
    if (severity === 'Critical') {
      await prisma.project.update({
        where: { id: projectId },
        data: { scheduleHealth: 'Action Needed' },
      });
    }

    await prisma.auditLog.create({
      data: {
        projectId,
        userRole,
        action: 'BLOCKER_LOGGED',
        details: `${userRole} logged [${severity}] blocker: ${title}`,
      },
    });

    return NextResponse.json({ success: true, data: blocker }, { status: 201 });
  } catch (error) {
    console.error('Error creating blocker:', error);
    return NextResponse.json({ success: false, error: 'Failed to create blocker' }, { status: 500 });
  }
}
