import { randomUUID } from "crypto";

export type UploadInput = {
  fileName: string;
  mimeType: string;
  data: Buffer;
};

export interface StorageProvider {
  upload(input: UploadInput): Promise<{ storageKey: string }>;
  getSignedUrl(storageKey: string, ttlSeconds: number): Promise<{ url: string; expiresAt: Date }>;
}

class LocalDevStorage implements StorageProvider {
  async upload(input: UploadInput): Promise<{ storageKey: string }> {
    const safeName = input.fileName.replace(/[^\w.-]/g, "_").slice(0, 80);
    return { storageKey: `local/${Date.now()}-${randomUUID()}-${safeName}` };
  }

  async getSignedUrl(storageKey: string, ttlSeconds: number): Promise<{ url: string; expiresAt: Date }> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    return {
      url: `/api/storage/signed/${encodeURIComponent(storageKey)}?expires=${expiresAt.toISOString()}`,
      expiresAt,
    };
  }
}

export function getStorageProvider(): StorageProvider {
  const provider = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();
  switch (provider) {
    case "s3":
    case "r2":
      // Placeholder for production adapter
      return new LocalDevStorage();
    default:
      return new LocalDevStorage();
  }
}

export const storageProvider = getStorageProvider();
