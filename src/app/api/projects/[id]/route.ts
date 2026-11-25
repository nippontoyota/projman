import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        brand: true,
        location: true,
        milestones: { orderBy: { orderIndex: 'asc' } },
        blockers: { orderBy: { createdAt: 'desc' } },
        auditLogs: { orderBy: { timestamp: 'desc' } },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const {
      currentStatus,
      scheduleHealth,
      workPercentage,
      fixedTargetDate,
      keyRemarks,
      commissionedDate,
      userRole = 'User',
    } = body;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const auditChanges: string[] = [];

    if (currentStatus !== undefined) {
      updateData.currentStatus = currentStatus;
      auditChanges.push(`Status: ${existing.currentStatus} → ${currentStatus}`);
      if (currentStatus === 'Commissioned' && !existing.commissionedDate) {
        updateData.commissionedDate = new Date();
        updateData.workPercentage = 100;
        updateData.scheduleHealth = 'Completed';
      }
    }

    if (scheduleHealth !== undefined) {
      updateData.scheduleHealth = scheduleHealth;
      auditChanges.push(`Health: ${existing.scheduleHealth} → ${scheduleHealth}`);
    }

    if (workPercentage !== undefined) {
      const pct = Math.max(0, Math.min(100, Number(workPercentage)));
      updateData.workPercentage = pct;
      auditChanges.push(`Progress: ${existing.workPercentage}% → ${pct}%`);
    }

    if (fixedTargetDate) {
      updateData.fixedTargetDate = new Date(fixedTargetDate);
      auditChanges.push(`Target Date updated to ${fixedTargetDate}`);
    }

    if (keyRemarks !== undefined) {
      updateData.keyRemarks = keyRemarks;
      auditChanges.push(`Remarks updated`);
    }

    if (commissionedDate) {
      updateData.commissionedDate = new Date(commissionedDate);
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        brand: true,
        location: true,
        milestones: { orderBy: { orderIndex: 'asc' } },
        blockers: true,
      },
    });

    const currentUser = await getCurrentUser();
    const auditAuthor = currentUser ? `${currentUser.name} (${currentUser.role})` : userRole;

    if (auditChanges.length > 0) {
      await prisma.auditLog.create({
        data: {
          projectId: id,
          userRole: auditAuthor,
          action: 'PROJECT_UPDATED',
          details: `${auditAuthor} updated: ${auditChanges.join('; ')}`,
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ success: false, error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.role !== 'Admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Admins can delete projects' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 500 });
  }
}
