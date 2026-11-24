import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, description, severity, userRole = 'User' } = body;

    const existing = await prisma.blocker.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Blocker not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status === 'Resolved') {
        updateData.resolvedAt = new Date();
      }
    }
    if (description !== undefined) updateData.description = description;
    if (severity) updateData.severity = severity;

    const updated = await prisma.blocker.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        projectId: existing.projectId,
        userRole,
        action: 'BLOCKER_UPDATED',
        details: `${userRole} updated blocker "${existing.title}" status to ${status || existing.status}`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating blocker:', error);
    return NextResponse.json({ success: false, error: 'Failed to update blocker' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.blocker.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Blocker deleted' });
  } catch (error) {
    console.error('Error deleting blocker:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete blocker' }, { status: 500 });
  }
}
