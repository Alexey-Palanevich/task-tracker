import { StorageAdapter, StorageConfig } from '../types';
import { FilesystemAdapter } from './filesystem.adapter';
import { S3Adapter } from './s3.adapter';

export function createStorageAdapter(config: StorageConfig): StorageAdapter {
  switch (config.provider) {
    case 'filesystem':
      return new FilesystemAdapter(config.basePath || './uploads');
    case 's3':
      if (!config.s3) {
        throw new Error('S3 configuration is required when provider is s3');
      }
      return new S3Adapter(
        config.s3.endpoint,
        config.s3.accessKey,
        config.s3.secretKey,
        config.s3.bucket,
      );
    default:
      throw new Error(`Unknown storage provider: ${config.provider}`);
  }
}

export { FilesystemAdapter } from './filesystem.adapter';
export { S3Adapter } from './s3.adapter';
