import { describe, it, expect } from 'vitest';
import type { User, UserPublic } from '@task-tracker/types';
import { UsersService } from './users.service';

function createUser(overrides: Partial<User> = {}): User {
  const base: User = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    email_verified_at: null,
    avatar_url: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
  return { ...base, ...overrides };
}

function userToPublic(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
  };
}

describe('UsersService - getCurrentUser (FR-9.4, FR-9.6)', () => {
  it('returns a public profile for an existing user', async () => {
    const existingUser = createUser();
    let requestedId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('users');
        return {
          selectAll() {
            return this;
          },
          where(column: string, op: string, value: string) {
            expect(column).toBe('id');
            expect(op).toBe('=');
            requestedId = value;
            return this;
          },
          async executeTakeFirst() {
            return existingUser;
          },
        };
      },
    } as any;

    const fakeAuthService = {} as any;

    const service = new UsersService(fakeDb, fakeAuthService);

    const result = await service.getCurrentUser('user-1');

    expect(requestedId).toBe('user-1');
    expect(result).toEqual(userToPublic(existingUser));
  });

  it('returns null when the user does not exist', async () => {
    const fakeDb = {
      selectFrom() {
        return {
          selectAll() {
            return this;
          },
          where() {
            return this;
          },
          async executeTakeFirst() {
            return undefined;
          },
        };
      },
    } as any;

    const fakeAuthService = {} as any;

    const service = new UsersService(fakeDb, fakeAuthService);

    const result = await service.getCurrentUser('missing-user');

    expect(result).toBeNull();
  });
});

