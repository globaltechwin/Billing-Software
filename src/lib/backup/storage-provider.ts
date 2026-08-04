import type { Readable } from "stream";

export interface StorageProvider {
  name: string;
  upload(key: string, filePath: string): Promise<{ url: string; size: number }>;
  download(key: string, destPath: string): Promise<string>;
  delete(key: string): Promise<void>;
  getUsage(): Promise<{ used: number; total: number }>;
  list(prefix?: string): Promise<{ key: string; size: number; lastModified: Date }[]>;
}

class MockStorageProvider implements StorageProvider {
  name = "mock";

  async upload(): Promise<{ url: string; size: number }> {
    throw new Error("Storage provider not configured. Set B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, and B2_ENDPOINT environment variables.");
  }

  async download(): Promise<string> {
    throw new Error("Storage provider not configured. Set B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, and B2_ENDPOINT environment variables.");
  }

  async delete(): Promise<void> {
    throw new Error("Storage provider not configured. Set B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, and B2_ENDPOINT environment variables.");
  }

  async getUsage(): Promise<{ used: number; total: number }> {
    throw new Error("Storage provider not configured. Set B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, and B2_ENDPOINT environment variables.");
  }

  async list(): Promise<{ key: string; size: number; lastModified: Date }[]> {
    throw new Error("Storage provider not configured. Set B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, and B2_ENDPOINT environment variables.");
  }
}

const B2_DEFAULT_TOTAL = 250 * 1024 * 1024 * 1024;

class BackblazeB2StorageProvider implements StorageProvider {
  name = "backblaze-b2";

  private endpoint: string;
  private bucket: string;
  private keyId: string;
  private applicationKey: string;

  constructor(endpoint: string, keyId: string, applicationKey: string, bucket: string) {
    this.endpoint = endpoint.startsWith("http") ? endpoint : `https://${endpoint}`;
    this.keyId = keyId;
    this.applicationKey = applicationKey;
    this.bucket = bucket;
  }

  private async getClient() {
    const { S3Client } = await import("@aws-sdk/client-s3");
    return new S3Client({
      region: "us-east-1",
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.keyId,
        secretAccessKey: this.applicationKey,
      },
      forcePathStyle: true,
    });
  }

  async upload(key: string, filePath: string): Promise<{ url: string; size: number }> {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { createReadStream, statSync } = await import("fs");

    const stats = statSync(filePath);
    const client = await this.getClient();
    const body = createReadStream(filePath);

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentLength: stats.size,
      })
    );

    const url = `${this.endpoint}/${this.bucket}/${key}`;
    return { url, size: stats.size };
  }

  async download(key: string, destPath: string): Promise<string> {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { createWriteStream } = await import("fs");
    const { pipeline } = await import("stream/promises");

    const client = await this.getClient();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );

    const body = response.Body as unknown as Readable;
    const writeStream = createWriteStream(destPath);

    await pipeline(body, writeStream);

    return destPath;
  }

  async delete(key: string): Promise<void> {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.getClient();

    await client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  async getUsage(): Promise<{ used: number; total: number }> {
    try {
      const items = await this.list();
      const used = items.reduce((sum, item) => sum + item.size, 0);
      return { used, total: B2_DEFAULT_TOTAL };
    } catch {
      return { used: 0, total: B2_DEFAULT_TOTAL };
    }
  }

  async list(prefix?: string): Promise<{ key: string; size: number; lastModified: Date }[]> {
    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const client = await this.getClient();

    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      })
    );

    return (response.Contents || []).map((item: { Key?: string; Size?: number; LastModified?: Date }) => ({
      key: item.Key || "",
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));
  }
}

let providerInstance: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (providerInstance) return providerInstance;

  const keyId = process.env.B2_KEY_ID;
  const applicationKey = process.env.B2_APPLICATION_KEY;
  const bucket = process.env.B2_BUCKET_NAME;
  const endpoint = process.env.B2_ENDPOINT;

  if (keyId && applicationKey && bucket && endpoint) {
    providerInstance = new BackblazeB2StorageProvider(endpoint, keyId, applicationKey, bucket);
  } else {
    providerInstance = new MockStorageProvider();
  }

  return providerInstance;
}
