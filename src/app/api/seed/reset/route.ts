import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function clearSeededData() {
  const deletedBlockers = await prisma.blocker.deleteMany();
  const deletedMilestones = await prisma.milestone.deleteMany();
  const deletedAuditLogs = await prisma.auditLog.deleteMany();
  const deletedProjects = await prisma.project.deleteMany();

  return {
    deletedProjects: deletedProjects.count,
    deletedMilestones: deletedMilestones.count,
    deletedBlockers: deletedBlockers.count,
    deletedAuditLogs: deletedAuditLogs.count,
  };
}

export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.role !== 'Admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Admins can reset the database.' },
        { status: 403 }
      );
    }

    const result = await clearSeededData();
    return NextResponse.json({
      success: true,
      message: 'All seeded projects cleared successfully. Clean database ready.',
      result,
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset database' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await clearSeededData();
    return NextResponse.json({
      success: true,
      message: 'All seeded projects cleared successfully.',
      result,
    });
  } catch (error) {
    console.error('Error resetting database via GET:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset database' }, { status: 500 });
  }
}
