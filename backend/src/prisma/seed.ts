import { PrismaService } from './prisma.service';

async function main() {
	const prisma = new PrismaService();

	try {
		await prisma.seed();
	} catch (error) {
		console.error('Failed to seed database:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
