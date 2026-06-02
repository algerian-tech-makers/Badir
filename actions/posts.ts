"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { InitiativeService } from "@/services/initiatives";
import { InitiativePostsService } from "@/services/posts";
import { StorageHelpers } from "@/services/supabase-storage";
import { PostType, PostStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { extractImageSrcsFromHtml } from "@/lib/utils";
import { ALLOWED_INITIATIVE_IMAGES } from "@/types/Statics";
import { PostEmailQueueService } from "@/services/post-email-queue";
import { postCreationRateLimiter } from "@/lib/rate-limit";

/**
 * Create a new post
 * @param initiativeId Initiative ID
 * @param content Post content (HTML)
 * @param title Post title (optional)
 * @param postType Post type (announcement, update, event)
 * @param status Post status (published, draft, archived)
 * @returns Success/error response with post data
 */
export async function createPostAction(
  initiativeId: string,
  content: string,
  title?: string | null,
  postType: PostType = "announcement",
  status: PostStatus = "published",
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "يجب تسجيل الدخول" };

  // Completed initiatives are read-only: no new posts allowed
  const initiativeStatus = await InitiativeService.getStatus(initiativeId);
  if (initiativeStatus === "completed") {
    return {
      success: false,
      error: "لا يمكن النشر في مبادرة منتهية",
    };
  }

  // Rate limit post creation (only if publishing)
  if (status === "published") {
    const { success: rateLimitSuccess } = await postCreationRateLimiter.limit(
      session.user.id,
    );
    if (!rateLimitSuccess) {
      return {
        success: false,
        error: "تجاوزت الحد المسموح من المنشورات. حاول مرة أخرى لاحقاً",
      };
    }
  }

  const imageSrcs = extractImageSrcsFromHtml(content)
    .map((s) => s.trim())
    .filter((s): s is string => !!s);

  if (imageSrcs.length > ALLOWED_INITIATIVE_IMAGES) {
    return {
      success: false,
      error: `تجاوزت الحد المسموح لعدد الصور في المنشور (${ALLOWED_INITIATIVE_IMAGES})`,
    };
  }
  const post = await InitiativePostsService.create({
    initiativeId,
    authorId: session.user.id,
    content,
    title: title ?? null,
    postType,
    status,
  });
  const uploadResults = await Promise.allSettled(
    imageSrcs.map((src) => InitiativePostsService.addAttachment(post.id, src)),
  );

  const failed = uploadResults
    .map((res, i) => ({ res, src: imageSrcs[i] }))
    .filter(({ res }) => res.status === "rejected");

  if (failed.length) {
    console.error(
      "Failed to add some attachments:",
      failed.map((f) => ({
        src: f.src,
        reason: (f.res as PromiseRejectedResult).reason,
      })),
    );
  }

  // Enqueue emails if post is published
  if (status === "published") {
    try {
      await PostEmailQueueService.enqueuePostEmails({
        postId: post.id,
        initiativeId,
      });
    } catch (error) {
      console.error("Failed to enqueue post emails:", error);
      // Don't fail the post creation if email queueing fails
    }
  }

  revalidatePath(`/initiatives/${initiativeId}`);
  revalidateTag(`initiative-${initiativeId}-posts`);
  return { success: true, message: "تم نشر المنشور" };
}

/**
 * Delete a post attachment (image attachment) from DB
 * @param imageUrl Image URL
 */
export async function deletePostAttachments(imageUrl: string) {
  await InitiativePostsService.removeAttachment(imageUrl);
}

/**
 * Update a post
 * @param postId Post ID
 * @param initiativeId Initiative ID
 * @param content New content
 * @param title New title
 * @param postType New post type
 * @param status New status
 * @returns Success/error response
 */
export async function updatePostAction(
  postId: string,
  initiativeId: string,
  content: string,
  title?: string | null,
  postType?: PostType,
  status?: PostStatus,
  removedImageUrls?: string[],
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "يجب تسجيل الدخول" };

  // Completed initiatives are read-only: no edits allowed
  const initiativeStatus = await InitiativeService.getStatus(initiativeId);
  if (initiativeStatus === "completed") {
    return {
      success: false,
      error: "لا يمكن تعديل منشورات مبادرة منتهية",
    };
  }

  // Get current post status to check if we're transitioning to published
  const existingPost = await InitiativePostsService.getById(postId);
  const wasNotPublished = existingPost?.status !== "published";

  const updateData: any = {
    content,
    title: title ?? null,
  };

  if (postType) updateData.postType = postType;
  if (status) updateData.status = status;

  const newImageUrls = extractImageSrcsFromHtml(content)
    .map((s) => s.trim())
    .filter((s): s is string => !!s);
  const initiativeAttachments =
    await InitiativePostsService.checkInitiativeAttachmentsLimit(initiativeId);

  if (newImageUrls.length + initiativeAttachments > ALLOWED_INITIATIVE_IMAGES) {
    return {
      success: false,
      error: `تجاوزت الحد المسموح لعدد الصور في المبادرة (${ALLOWED_INITIATIVE_IMAGES})`,
    };
  }
  await InitiativePostsService.update(postId, session.user.id, updateData);

  const uploadResults = await Promise.allSettled(
    newImageUrls.map((src) =>
      InitiativePostsService.addAttachment(postId, src),
    ),
  );

  const failed = uploadResults
    .map((res, i) => ({ res, src: newImageUrls[i] }))
    .filter(({ res }) => res.status === "rejected");
  if (failed.length) {
    console.error(
      "Failed to add some attachments:",
      failed.map((f) => ({
        src: f.src,
        reason: (f.res as PromiseRejectedResult).reason,
      })),
    );
  }

  if (removedImageUrls && removedImageUrls.length) {
    const storage = new StorageHelpers();
    for (const imageUrl of removedImageUrls) {
      try {
        await InitiativePostsService.removeAttachment(imageUrl);

        const idx = imageUrl.indexOf("/post-images/");
        if (idx !== -1) {
          const path = imageUrl.substring(idx + "/post-images/".length);
          try {
            await storage.deleteFile("post-images", path);
          } catch (e) {
            console.warn("Failed to delete file from storage:", path, e);
          }
        } else {
          // fallback: try to parse pathname (may include bucket in path)
          try {
            const u = new URL(imageUrl);
            const parts = u.pathname.split("/post-images/");
            console.log("Derived storage path parts:", parts);
            if (parts[1]) {
              await storage.deleteFile("post-images", parts[1]);
            }
          } catch {
            console.warn("Could not derive storage path for:", imageUrl);
          }
        }
      } catch (err) {
        console.error(
          "Failed to remove attachment or storage file for",
          imageUrl,
          err,
        );
      }
    }
  }

  // Enqueue emails if post is being published for the first time
  if (status === "published" && wasNotPublished) {
    try {
      await PostEmailQueueService.enqueuePostEmails({
        postId,
        initiativeId,
      });
    } catch (error) {
      console.error("Failed to enqueue post emails:", error);
    }
  }

  revalidatePath(`/initiatives/${initiativeId}`);
  revalidateTag(`initiative-${initiativeId}-posts`);
  return { success: true, message: "تم تحديث المنشور" };
}

/**
 * Delete a post
 * @param postId  Post ID
 * @param initiativeId Initiative ID
 * @returns Success/error response
 */
export async function deletePostAction(postId: string, initiativeId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "يجب تسجيل الدخول" };

  const initiative = await InitiativeService.getById(
    initiativeId,
    session.user.id,
  );
  const isManager =
    initiative?.organizerUserId === session.user.id ||
    initiative?.organizerOrg?.userId === session.user.id;

  await InitiativePostsService.delete(postId, session.user.id, !!isManager);
  revalidatePath(`/initiatives/${initiativeId}`);
  revalidateTag(`initiative-${initiativeId}-posts`);
  return { success: true, message: "تم حذف المنشور" };
}

/** * Pin or unpin a post
 * @param postId Post ID
 * @param initiativeId Initiative ID
 * @param pin Whether to pin or unpin
 * @returns Success/error response
 */
export async function pinPostAction(
  postId: string,
  initiativeId: string,
  pin: boolean,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "يجب تسجيل الدخول" };

  const initiative = await InitiativeService.getById(
    initiativeId,
    session.user.id,
  );
  const isManager =
    initiative?.organizerUserId === session.user.id ||
    initiative?.organizerOrg?.userId === session.user.id;

  if (!isManager) return { success: false, error: "غير مسموح" };

  await InitiativePostsService.pin(postId, pin);
  revalidatePath(`/initiatives/${initiativeId}`);
  revalidateTag(`initiative-${initiativeId}-posts`);
  return { success: true, message: pin ? "تم التثبيت" : "تم إلغاء التثبيت" };
}

/**
 * Upload a post image
 * @param initiativeId Initiative ID
 * @param base64 Base64 encoded image
 * @param name Image name
 * @param type Image type
 * @returns public URL or error
 */
export async function uploadPostImageAction(
  initiativeId: string,
  base64: string,
  name: string,
  type: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "يجب تسجيل الدخول" };

  const initiativeAttachments =
    await InitiativePostsService.checkInitiativeAttachmentsLimit(initiativeId);
  if (initiativeAttachments + 1 > ALLOWED_INITIATIVE_IMAGES) {
    return {
      success: false,
      error: `تجاوزت الحد المسموح لعدد الصور في المبادرة (${ALLOWED_INITIATIVE_IMAGES})`,
    };
  }

  try {
    const storage = new StorageHelpers();
    const buffer = Buffer.from(base64, "base64");
    const fileName = `${uuidv4()}-${name.replace(/\s+/g, "-")}`;
    const path = `${initiativeId}/${session.user.id}/${fileName}`;

    const res = await storage.uploadFile("post-images", path, buffer, type);
    const publicUrl = await storage.getPublicUrl("post-images", res.path);
    return { success: true, url: publicUrl };
  } catch {
    return { success: false, error: "فشل رفع الصورة" };
  }
}

export async function deletePostImageAction(imageUrl: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "يجب تسجيل الدخول" };
  try {
    const storage = new StorageHelpers();
    await storage.deleteFile("post-images", imageUrl);
    return { success: true };
  } catch {
    return { success: false, error: "فشل حذف الصورة" };
  }
}

/**
 * List posts (supports onlyUserId for "your posts" tab)
 * @param initiativeId Initiative ID
 * @param onlyUserId Only user ID
 * @param status Filter by status (optional)
 * @param postType Filter by post type (optional)
 * @returns List of posts
 */
export async function listPostsAction(
  initiativeId: string,
  onlyUserId?: string,
  status?: PostStatus,
) {
  const getCachedPosts = unstable_cache(
    async (initId: string, userId?: string, postStatus?: PostStatus) => {
      const posts = await InitiativePostsService.list(initId, {
        onlyUserId: userId,
        status: postStatus,
      });

      return posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        postType: p.postType,
        status: p.status,
        isPinned: p.isPinned,
        author: p.author,
        createdAt: p.createdAt.toISOString(), // Serialize dates
        attachments: p.attachments,
      }));
    },
    [`initiative-${initiativeId}-posts`, onlyUserId || "all", status || "all"],
    {
      revalidate: 60,
      tags: [`initiative-${initiativeId}-posts`],
    },
  );

  const posts = await getCachedPosts(initiativeId, onlyUserId, status);

  return {
    success: true,
    posts,
  };
}

/**
 * Get single post by ID
 * @param postId Post ID
 * @returns Post data
 */
export async function getPostAction(postId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "يجب تسجيل الدخول" };

  try {
    const post = await InitiativePostsService.getById(postId);
    if (!post) return { success: false, error: "المنشور غير موجود" };

    return {
      success: true,
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        postType: post.postType,
        status: post.status,
        isPinned: post.isPinned,
        author: post.author,
        createdAt: post.createdAt,
      },
    };
  } catch {
    return { success: false, error: "فشل في جلب المنشور" };
  }
}

/**
 * Update post status (publish, draft, archive)
 * @param postId Post ID
 * @param initiativeId Initiative ID
 * @param status New status
 * @returns Success/error response
 */
export async function updatePostStatusAction(
  postId: string,
  initiativeId: string,
  status: PostStatus,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "يجب تسجيل الدخول" };

  const initiative = await InitiativeService.getById(
    initiativeId,
    session.user.id,
  );
  const isManager =
    initiative?.organizerUserId === session.user.id ||
    initiative?.organizerOrg?.userId === session.user.id;

  await InitiativePostsService.update(
    postId,
    session.user.id,
    { status },
    !!isManager,
  );
  revalidatePath(`/initiatives/${initiativeId}`);
  revalidateTag(`initiative-${initiativeId}-posts`);

  const statusLabels = {
    published: "منشور",
    draft: "مسودة",
    archived: "مؤرشف",
  };

  return {
    success: true,
    message: `تم تغيير حالة المنشور إلى ${statusLabels[status]}`,
  };
}
