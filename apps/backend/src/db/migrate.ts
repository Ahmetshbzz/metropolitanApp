import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from './connection';

const execAsync = promisify(exec);

async function runMigrations(): Promise<void> {
  console.log('🔄 Running Prisma database migrations...');

  try {
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    await execAsync('bun prisma generate');
    
    // Deploy migrations
    console.log('🚀 Deploying migrations...');
    await execAsync('bun prisma migrate deploy');
    
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run migrations if this file is executed directly
if (import.meta.main) {
  void runMigrations();
}
