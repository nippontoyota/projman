import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const {
      status,
      actualDate,
      plannedDate,
      remarks,
      userRole = 'User',
    } = body;

    const existing = await prisma.milestone.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Milestone not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const auditDetails: string[] = [];

    if (status !== undefined) {
      updateData.status = status;
      auditDetails.push(`Status: ${existing.status} → ${status}`);
      if (status === 'Completed' && !actualDate && !existing.actualDate) {
        updateData.actualDate = new Date();
      }
    }

    if (actualDate !== undefined) {
      updateData.actualDate = actualDate ? new Date(actualDate) : null;
      auditDetails.push(`Date set to ${actualDate || 'cleared'}`);
    }

    if (plannedDate !== undefined) {
      updateData.plannedDate = plannedDate ? new Date(plannedDate) : null;
    }

    if (remarks !== undefined) {
      updateData.remarks = remarks;
    }

    const updated = await prisma.milestone.update({
      where: { id },
      data: updateData,
    });

    // Check progress of all milestones for this project and update workPercentage
    const allMilestones = await prisma.milestone.findMany({
      where: { projectId: existing.projectId },
    });
    const completedCount = allMilestones.filter((m) => m.status === 'Completed').length;
    const progress = Math.round((completedCount / allMilestones.length) * 100);

    await prisma.project.update({
      where: { id: existing.projectId },
      data: {
        workPercentage: existing.project.currentStatus === 'Commissioned' ? 100 : progress,
        daysSinceLastMilestone: 0,
      },
    });

    // Log audit
    const currentUser = await getCurrentUser();
    const auditAuthor = currentUser ? `${currentUser.name} (${currentUser.role})` : userRole;

    if (auditDetails.length > 0) {
      await prisma.auditLog.create({
        data: {
          projectId: existing.projectId,
          userRole: auditAuthor,
          action: 'MILESTONE_UPDATED',
          details: `${auditAuthor} updated "${existing.title}": ${auditDetails.join('; ')}`,
        },
      });
    }

    return NextResponse.json({ success: true, data: updated, projectProgress: progress });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json({ success: false, error: 'Failed to update milestone' }, { status: 500 });
  }
}
