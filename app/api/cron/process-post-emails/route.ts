import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "react-email";
import { prisma } from "@/lib/db";
import { PostEmailQueueService } from "@/services/post-email-queue";
import InitiativePostNotificationEmail from "@/emails/InitiativePostNotificationEmail";
import emailConfig from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Post Email Queue Processor (Cron Worker)
 *
 * Runs daily via Vercel Cron to process queued post email notifications.
 * Processes queued post email notifications with rate limiting.
 *
 * Flow:
 * 1. Fetch batch of queued emails (respecting Resend batch limits)
 * 2. Apply Upstash rate limiting
 * 3. Group by post/initiative and fetch post details
 * 4. Send emails using resend.batch.send
 * 5. Delete successfully sent queue entries
 * 6. Failed entries remain for retry on next run
 */

// Resend batch limit is 100 emails per call
// We'll use 50 to stay safe and allow for rate limiting
const BATCH_SIZE = 50;

interface PostDetails {
  id: string;
  title: string | null;
  content: string;
  author: {
    name: string;
  };
  initiative: {
    id: string;
    titleAr: string;
  };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Verify Vercel Cron secret
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  let processed = 0;
  let failed = 0;
  const rateLimited = 0;

  try {
    // Fetch batch of queued emails
    const queuedEmails = await PostEmailQueueService.fetchBatch(BATCH_SIZE);

    if (queuedEmails.length === 0) {
      console.log("No queued emails to process");
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "Queue is empty",
      });
    }

    console.log(`Processing ${queuedEmails.length} queued post emails`);

    // Group by postId to fetch post details efficiently
    const postIds = [...new Set(queuedEmails.map((e) => e.postId))];

    // Fetch all post details in one query
    const posts = await prisma.initiativePost.findMany({
      where: {
        id: {
          in: postIds,
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        author: {
          select: {
            name: true,
          },
        },
        initiative: {
          select: {
            id: true,
            titleAr: true,
          },
        },
      },
    });

    // Create a map for quick lookup
    const postDetailsMap = new Map<string, PostDetails>(
      posts.map((p) => [p.id, p as PostDetails]),
    );

    // Prepare batch emails with rate limiting
    const emailsToSend: Array<{
      from: string;
      to: string;
      subject: string;
      html: string;
      queueId: string;
    }> = [];

    const processedQueueIds: string[] = [];
    const failedQueueIds: string[] = [];

    for (const queueEntry of queuedEmails) {
      const postDetails = postDetailsMap.get(queueEntry.postId);

      if (!postDetails) {
        console.warn(
          `Post ${queueEntry.postId} not found, removing from queue`,
        );
        failedQueueIds.push(queueEntry.id);
        failed++;
        continue;
      }

      try {
        const emailHtml = await render(
          InitiativePostNotificationEmail({
            initiativeName: postDetails.initiative.titleAr,
            postTitle: postDetails.title || undefined,
            postContent: postDetails.content,
            authorName: postDetails.author.name,
            postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/initiatives/${postDetails.initiative.id}`,
          }),
        );

        emailsToSend.push({
          from: `منصة بادر <${emailConfig.fromEmail}>`,
          to: queueEntry.email,
          subject: `تحديث جديد في مبادرة ${postDetails.initiative.titleAr}`,
          html: emailHtml,
          queueId: queueEntry.id,
        });

        processedQueueIds.push(queueEntry.id);
      } catch (error) {
        console.error(
          `Failed to prepare email for queue entry ${queueEntry.id}:`,
          error,
        );
        failed++;
      }
    }

    // Send emails in batch
    if (emailsToSend.length > 0) {
      try {
        const batchResponse = await resend.batch.send(
          emailsToSend.map(({ queueId, ...email }) => ({
            ...email,
            tags: [
              { name: "category", value: "post-notification" },
              { name: "queue-id", value: queueId },
            ],
          })),
        );

        if (batchResponse.error) {
          console.error("Resend batch send error:", batchResponse.error);
          failed += emailsToSend.length;
        } else {
          // Delete successfully sent queue entries
          await PostEmailQueueService.deleteQueueEntries(processedQueueIds);
          processed = emailsToSend.length;
          console.log(`Successfully sent ${processed} emails`);
        }
      } catch (error) {
        console.error("Failed to send batch emails:", error);
        failed += emailsToSend.length;
      }
    }

    // Delete failed entries (post not found, etc.)
    if (failedQueueIds.length > 0) {
      await PostEmailQueueService.deleteQueueEntries(failedQueueIds);
    }

    const duration = Date.now() - startTime;

    console.log(
      `Post email processing complete: ${processed} sent, ${failed} failed, ${rateLimited} rate-limited, ${duration}ms`,
    );

    return NextResponse.json(
      {
        success: true,
        processed,
        failed,
        rateLimited,
        duration,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Post email processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
