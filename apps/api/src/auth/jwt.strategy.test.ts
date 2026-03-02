import { beforeEach, describe, it, expect } from 'vitest';
import { JwtStrategy } from './jwt.strategy';

// FR-9.1: Local authentication (JWT) - strategy maps payload to user context
describe('JwtStrategy', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://user:pass@localhost:5432/test_db';
    process.env.JWT_SECRET = 'test-secret-please-change-in-real-env';
    process.env.JWT_EXPIRES_IN = '7d';
  });

  it('maps JWT payload to a minimal current user context', async () => {
    const strategy = new JwtStrategy();

    const payload = {
      sub: 'user-123',
      email: 'user@example.com',
    };

    const result = await strategy.validate(payload as any);

    expect(result).toEqual({
      id: 'user-123',
      email: 'user@example.com',
    });
  });
});

