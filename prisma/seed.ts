import { PrismaClient } from '@prisma/client';
import { MILESTONE_TEMPLATES, BENCHMARKS_DATA, KERALA_LOCATIONS } from './data/templates';
import { RAW_PROJECTS } from './data/projects';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting modular database seed...');

  // Clean old project records (preserve users and brands if needed, but for clean reset:)
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
    { username: 'admin', name: 'Admin', password: 'test', role: 'Admin' },
    { username: 'user1', name: 'User 1', password: 'test', role: 'User' },
    { username: 'user2', name: 'User 2', password: 'test', role: 'User' },
    { username: 'user3', name: 'User 3', password: 'test', role: 'User' },
    { username: 'user4', name: 'User 4', password: 'test', role: 'User' },
  ];

  for (const u of INITIAL_USERS) {
    await prisma.user.create({ data: u });
  }

  // 1. Seed Brands
  await prisma.brand.create({
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
  for (const name of KERALA_LOCATIONS) {
    await prisma.location.create({
      data: { name, state: 'Kerala' },
    });
  }

  console.log('✅ Clean database setup complete (no seeded dummy projects)!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
