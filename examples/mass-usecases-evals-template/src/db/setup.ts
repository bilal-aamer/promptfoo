import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import mysql from 'mysql2/promise';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import * as schema from './schema';

const dbType = (process.env.DB_TYPE || 'mysql2') as 'mysql2' | 'postgres' | 'sqlite';

async function createDb() {
  console.log(`\n📦 Setting up ${dbType} database...\n`);

  let db: any;

  if (dbType === 'postgres') {
    const client = postgres(process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/evals_db');
    db = drizzlePg(client);
    console.log('✅ Connected to PostgreSQL');
  } else if (dbType === 'sqlite') {
    const sqlite = new Database(process.env.DATABASE_URL || 'sqlite.db');
    db = drizzleSqlite(sqlite);
    console.log('✅ Connected to SQLite');
  } else {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      port: parseInt(process.env.DB_PORT || '3306', 10),
    });

    // Create database if doesn't exist
    const dbName = process.env.DB_NAME || 'evals_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.end();

    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'evals_db',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    db = drizzle(pool, { schema });
    console.log('✅ Connected to MySQL');
  }

  console.log('📊 Database is ready!\n');
  console.log('Next steps:');
  console.log('  npm run seed:db              # Seed basic data (users, orgs)');
  console.log('  npm run seed:moderation      # Seed moderation examples\n');

  return db;
}

createDb().catch((err) => {
  console.error('❌ Database setup failed:', err);
  process.exit(1);
});
