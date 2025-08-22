import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { client, db } from './connection';

async function runMigrations(): Promise<void> {
  // console.log('🔄 Running database migrations...');

  try {
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    // console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

void runMigrations();
