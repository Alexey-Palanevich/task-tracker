import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageAdapter } from '../types';

export class FilesystemAdapter implements StorageAdapter {
  constructor(private basePath: string) {}

  async save(key: string, data: Buffer): Promise<string> {
    const fullPath = path.join(this.basePath, key);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, data);
    return fullPath;
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const fullPath = path.join(this.basePath, key);
      return await fs.readFile(fullPath);
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(this.basePath, key);
    await fs.unlink(fullPath);
  }

  async exists(key: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, key);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
