import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    await execAsync('npx tsx prisma/seed.ts');
    return NextResponse.json({ success: true, message: 'Database reset to Incheon Mobility master dataset.' });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset database' }, { status: 500 });
  }
}
