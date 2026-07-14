import { createClient } from "@/lib/supabase/server";
import { BUCKETS } from "@/types/Statics";

export function extractStoragePath(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
  return match ? match[1] : url;
}

export class StorageHelpers {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient();
  }

  async uploadFile(bucket: BUCKETS, path: string, file: Buffer, type?: string) {
    const supabase = await this.supabase;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: type });
    if (error) throw error;
    return data;
  }

  async getPublicUrl(bucket: BUCKETS, path: string) {
    const supabase = await this.supabase;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteFile(bucket: BUCKETS, path: string) {
    const { error } = await (await this.supabase).storage
      .from(bucket)
      .remove([path]);
    if (error) throw error;
  }

  async downloadFile(bucket: BUCKETS, path: string) {
    const { data, error } = await (await this.supabase).storage
      .from(bucket)
      .download(path);
    if (error) throw error;
    return data;
  }

  async listFiles(bucket: BUCKETS, folder: string = "") {
    const { data, error } = await (await this.supabase).storage
      .from(bucket)
      .list(folder);
    if (error) throw error;
    return data;
  }
}
