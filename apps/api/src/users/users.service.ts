import { Inject, Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { UserPublic } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database, UsersTable } from '../db/database';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(KYSELY) private readonly db: Kysely<Database>,
    private readonly authService: AuthService,
  ) {}

  async getCurrentUser(userId: string): Promise<UserPublic | null> {
    const row = await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return this.toPublic(row);
  }

  // Maps a full user row to the public API shape.
  private toPublic(row: UsersTable): UserPublic {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatar_url: row.avatar_url,
    };
  }
}

