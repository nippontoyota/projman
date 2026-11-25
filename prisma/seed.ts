import { PrismaClient } from '@prisma/client';
import { MILESTONE_TEMPLATES, BENCHMARKS_DATA, KERALA_LOCATIONS } from './data/templates';
import { RAW_PROJECTS } from './data/projects';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting modular database seed...');

  // Clean old records
  await prisma.auditLog.deleteMany();
  await prisma.blocker.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.location.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.benchmark.deleteMany();
  await prisma.user.deleteMany();

  // 0. Seed Users for RBAC
  const INITIAL_USERS = [
    { username: 'admin', name: 'Administrator', password: 'test', role: 'Admin' },
    { username: 'user1', name: 'User 1', password: 'test', role: 'User' },
    { username: 'user2', name: 'User 2', password: 'test', role: 'User' },
    { username: 'user3', name: 'User 3', password: 'test', role: 'User' },
  ];

  for (const u of INITIAL_USERS) {
    await prisma.user.create({ data: u });
  }

  // 1. Seed Brands
  const brandRiver = await prisma.brand.create({
    data: {
      name: 'River EV',
      code: 'RIVER',
      color: '#0284C7',
    },
  });

  await prisma.brand.create({
    data: {
      name: 'Nippon Toyota',
      code: 'TOYOTA',
      color: '#DC2626',
    },
  });

  // 2. Seed Benchmarks
  for (const b of BENCHMARKS_DATA) {
    await prisma.benchmark.create({ data: b });
  }

  // 3. Seed Locations
  const locationMap = new Map<string, string>();
  for (const name of KERALA_LOCATIONS) {
    const loc = await prisma.location.create({
      data: { name, state: 'Kerala' },
    });
    locationMap.set(name, loc.id);
  }

  const toDate = (dStr: string | null | undefined): Date | null => {
    if (!dStr) return null;
    return new Date(dStr);
  };

  // 4. Seed 15 Projects
  for (const p of RAW_PROJECTS) {
    const locId = locationMap.get(p.locationName);
    if (!locId) continue;

    const project = await prisma.project.create({
      data: {
        code: p.code,
        brandId: brandRiver.id,
        locationId: locId,
        facilityType: p.facilityType,
        currentStatus: p.currentStatus,
        scheduleHealth: p.scheduleHealth,
        workPercentage: p.workPercentage,
        elapsedDays: p.elapsedDays,
        daysToTarget: p.daysToTarget,
        daysSinceLastMilestone: p.daysSinceLastMilestone,
        startDate: toDate(p.startDate),
        commissionedDate: toDate(p.commissionedDate),
        fixedTargetDate: toDate(p.fixedTargetDate) || new Date('2027-03-31'),
        keyRemarks: p.keyRemarks,
      },
    });

    // Seed Milestones
    for (const t of MILESTONE_TEMPLATES) {
      const actualDateStr = p.milestones[t.stepKey];
      const isCompleted = !!actualDateStr;
      const status = isCompleted
        ? 'Completed'
        : p.currentStatus === 'Commissioned'
        ? 'Completed'
        : 'Pending';

      const milestone = await prisma.milestone.create({
        data: {
          projectId: project.id,
          phaseNumber: t.phaseNumber,
          phaseName: t.phaseName,
          stepKey: t.stepKey,
          title: t.title,
          orderIndex: t.orderIndex,
          benchmarkDays: t.benchmarkDays,
          status,
          actualDate: toDate(actualDateStr),
        },
      });

      // Attach blocker if relevant
      if (p.blocker) {
        if (
          (p.code === 'RIV-CHE-SAL' && t.stepKey === 'gfc_approved') ||
          (p.code.includes('KAY') && t.stepKey === 'po_released') ||
          (p.code === 'RIV-NED-01' && t.stepKey === 'facility_handover') ||
          (p.code === 'RIV-PAL-01' && t.stepKey === 'agreement_signed') ||
          (p.code === 'RIV-PAT-SRV' && t.stepKey === 'viewed_by_river')
        ) {
          await prisma.blocker.create({
            data: {
              projectId: project.id,
              milestoneId: milestone.id,
              category: p.blocker.category,
              severity: p.blocker.severity,
              title: p.blocker.title,
              description: p.blocker.description,
              status: 'Open',
            },
          });
        }
      }
    }

    // Initial audit log
    await prisma.auditLog.create({
      data: {
        projectId: project.id,
        userRole: 'Admin',
        action: 'PROJECT_INITIALIZED',
        details: `Project ${p.code} (${p.locationName} - ${p.facilityType}) initialized.`,
      },
    });
  }

  console.log('✅ Modular seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
