import { Global, Module } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { getEnv } from '../env';
import type { Database } from './database';

export const KYSELY = Symbol('KYSELY');

@Global()
@Module({
  providers: [
    {
      provide: KYSELY,
      useFactory(): Kysely<Database> {
        const env = getEnv();

        const pool = new Pool({
          connectionString: env.DATABASE_URL,
          max: 10,
          idleTimeoutMillis: 30000,
        });

        const dialect = new PostgresDialect({
          pool,
        });

        return new Kysely<Database>({
          dialect,
        });
      },
    },
  ],
  exports: [KYSELY],
})
export class DbModule {}
