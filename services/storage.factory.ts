import { StorageService } from "./storage.interface";
import { StorageHelpers as Minio } from "./minio-storage";
import { StorageHelpers as Supabase } from "./supabase-storage";

class StorageFactory {
  public static getStorageService(): StorageService {
    const provider = process.env.STORAGE_PROVIDER;

    if (provider === "minio") {
      return new Minio();
    }

    // Default to production cloud provider
    return new Supabase();
  }
}

export const storageService = StorageFactory.getStorageService();
