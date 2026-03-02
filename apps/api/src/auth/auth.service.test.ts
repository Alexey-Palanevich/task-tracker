import { describe, it, expect } from 'vitest';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService password helpers (FR-9.1)', () => {
  const service = new AuthService();

  it('hashes passwords using bcrypt with a salt', async () => {
    const plain = 's3cret-password';

    const hash = await service.hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash).toMatch(/^\$2[aby]\$/);
    const ok = await bcrypt.compare(plain, hash);
    expect(ok).toBe(true);
  });

  it('verifies matching and non-matching passwords', async () => {
    const plain = 'another-password';
    const hash = await service.hashPassword(plain);

    await expect(service.verifyPassword(plain, hash)).resolves.toBe(true);
    await expect(service.verifyPassword('wrong', hash)).resolves.toBe(false);
  });
});

