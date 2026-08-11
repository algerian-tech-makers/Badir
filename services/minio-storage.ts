import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKETS } from "@/types/Statics";
import { StorageService } from "@/services/storage.interface";

/**
 * MinIO S3 Storage Service
 * Uses AWS SDK v3 modular client with forcePathStyle for local MinIO compatibility
 */

interface MinIOConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  region: string;
  useSSL: boolean;
}

const getMinIOConfig = (): MinIOConfig => {
  const endpoint = process.env.MINIO_ENDPOINT || "http://localhost:9000";
  const accessKey = process.env.MINIO_ROOT_USER || "";
  const secretKey = process.env.MINIO_ROOT_PASSWORD || "";
  const region = process.env.MINIO_REGION || "us-east-1";
  const useSSL = process.env.MINIO_USE_SSL === "true";

  if (!accessKey || !secretKey) {
    throw new Error(
      "MinIO credentials not configured. Please set MINIO_ACCESS_KEY and MINIO_SECRET_KEY environment variables.",
    );
  }

  return { endpoint, accessKey, secretKey, region, useSSL };
};

let s3Client: S3Client | null = null;

const getS3Client = (): S3Client => {
  if (!s3Client) {
    const config = getMinIOConfig();
    s3Client = new S3Client({
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      region: config.region,
      forcePathStyle: true, // Required for local MinIO instances
      tls: config.useSSL,
    });
  }
  return s3Client;
};

/**
 * Extract storage path from a public URL
 * @param url The public URL
 * @returns The storage path
 */
export function extractStoragePath(url: string | null): string | null {
  if (!url) return null;
  // Handle MinIO/S3 URL format: http(s)://host/bucket/path
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      // Remove bucket name from path
      return pathParts.slice(1).join("/");
    }
    return urlObj.pathname.substring(1);
  } catch {
    return url;
  }
}

export class StorageHelpers implements StorageService {
  private readonly client: S3Client;

  constructor() {
    this.client = getS3Client();
  }

  /**
   * Upload a file to MinIO
   * @param bucket - The bucket name
   * @param path - The file path within the bucket
   * @param file - The file buffer
   * @param type - The content type (MIME type)
   * @returns The upload result with path
   */
  async uploadFile(bucket: BUCKETS, path: string, file: Buffer, type?: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: file,
        ContentType: type || "application/octet-stream",
      });

      await this.client.send(command);

      return {
        path,
        fullKey: `${bucket}/${path}`,
      };
    } catch (error) {
      console.error("MinIO upload error:", error);
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get a public URL for a file
   * @param bucket - The bucket name
   * @param path - The file path within the bucket
   * @returns The public URL
   */
  async getPublicUrl(bucket: BUCKETS, path: string): Promise<string> {
    const config = getMinIOConfig();
    // For public access, construct the URL directly
    // If using presigned URLs, use getSignedUrl instead
    const baseUrl = config.endpoint.replace(/\/$/, "");
    return `${baseUrl}/${bucket}/${path}`;
  }

  /**
   * Get a presigned URL for temporary access
   * @param bucket - The bucket name
   * @param path - The file path within the bucket
   * @param expiresIn - URL expiration time in seconds (default: 3600)
   * @returns The presigned URL
   */
  async getPresignedUrl(
    bucket: BUCKETS,
    path: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: path,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error("MinIO presigned URL error:", error);
      throw new Error(
        `Failed to generate presigned URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete a file from MinIO
   * @param bucket - The bucket name
   * @param path - The file path within the bucket
   */
  async deleteFile(bucket: BUCKETS, path: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: path,
      });

      await this.client.send(command);
    } catch (error) {
      console.error("MinIO delete error:", error);
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Download a file from MinIO
   * @param bucket - The bucket name
   * @param path - The file path within the bucket
   * @returns The file data as a buffer
   */
  async downloadFile(bucket: BUCKETS, path: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: path,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new Error("Empty response body");
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error("MinIO download error:", error);
      throw new Error(
        `Failed to download file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * List files in a bucket/folder
   * @param bucket - The bucket name
   * @param folder - The folder path (optional)
   * @returns List of objects
   */
  async listFiles(bucket: BUCKETS, folder: string = "") {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: folder,
      });

      const response = await this.client.send(command);

      return {
        data:
          response.Contents?.map((item) => ({
            name: item.Key?.split("/").pop() || "",
            key: item.Key,
            size: item.Size,
            lastModified: item.LastModified,
          })) || [],
      };
    } catch (error) {
      console.error("MinIO list error:", error);
      throw new Error(
        `Failed to list files: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Check if a bucket exists and create it if it doesn't
   * @param bucket - The bucket name
   */
  async ensureBucket(bucket: BUCKETS) {
    try {
      // Note: Bucket creation should typically be done via MinIO console or separate setup
      // This is a placeholder for future implementation if needed
      console.log(`Bucket check for: ${bucket}`);
    } catch (error) {
      console.error("MinIO bucket check error:", error);
    }
  }
}

/**
 * Initialize MinIO buckets on application startup
 * Call this in your application initialization code
 */
export async function initializeMinIOBuckets() {
  const storage = new StorageHelpers();
  const buckets: BUCKETS[] = ["avatars", "documents", "post-images"];

  for (const bucket of buckets) {
    await storage.ensureBucket(bucket);
  }
}
