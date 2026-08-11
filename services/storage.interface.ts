import { BUCKETS } from "@/types/Statics";

export interface StorageService {
  uploadFile(
    bucket: BUCKETS,
    path: string,
    file: Buffer,
    type?: string,
  ): Promise<{
    id?: string;
    path: string;
    fullKey?: string;
    fullPath?: string;
  }>;

  getPublicUrl(bucket: BUCKETS, path: string): Promise<string>;

  getPresignedUrl(
    bucket: BUCKETS,
    path: string,
    expiresIn: number,
  ): Promise<string>;

  deleteFile(bucket: BUCKETS, path: string): Promise<void>;
  downloadFile(bucket: BUCKETS, path: string): Promise<Buffer | Blob>;
  listFiles(
    bucket: BUCKETS,
    folder: string,
  ): Promise<{
    data: {
      name: string;
      key: string | undefined;
      size: number | undefined;
      lastModified: Date | undefined;
    }[];
  }>;
}
