import { PrismaService } from './prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

async function main() {
  const eventEmitter = new EventEmitter2();
  const prisma = new PrismaService(eventEmitter);

  try {
    console.log('🌱 Running basic database seed (without Elasticsearch)...');
    await prisma.seed();
    console.log('✅ Basic seeding completed!');
    console.log('💡 To seed with Elasticsearch sync, use: npm run seed:full');
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
