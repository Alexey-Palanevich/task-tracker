export interface StorageConfig {
  provider: 'filesystem' | 's3';
  basePath?: string;
  s3?: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
  };
}

export interface StorageAdapter {
  save(key: string, data: Buffer): Promise<string>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
