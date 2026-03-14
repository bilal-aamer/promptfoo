import type { Config } from 'drizzle-kit';

// Choose your database type: 'mysql2', 'postgres', or 'sqlite'
const dbType = (process.env.DB_TYPE || 'mysql2') as 'mysql2' | 'postgres' | 'sqlite';

let config: Config;

if (dbType === 'postgres') {
  config = {
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    driver: 'pg',
    dbCredentials: {
      connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/evals_db',
    },
  };
} else if (dbType === 'sqlite') {
  config = {
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    driver: 'better-sqlite',
    dbCredentials: {
      url: process.env.DATABASE_URL || 'sqlite.db',
    },
  };
} else {
  // MySQL is default
  config = {
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    driver: 'mysql2',
    dbCredentials: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'evals_db',
    },
  };
}

export default config;
