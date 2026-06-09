import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { render } from "react-email";
import ConsentRequestEmail from "../emails/ConsentRequestEmail";
import { SIGNUP_CONSENT_VERSION } from "../lib/signup-consent-config";
import emailConfig from "../lib/email";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const CONSENT_PAGE_URL = "https://badir.space/consent";
const BATCH_SIZE = 80; // resend batch limit is 100

async function main() {
  const users = await prisma.user.findMany({
    where: {
      consentGiven: false,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      createdAt: true,
    },
  });

  // audit log
  const grouped = users.reduce<Record<string, number>>((acc, user) => {
    const month = new Date(user.createdAt).toISOString().slice(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  console.log(`Total users pending consent: ${users.length}`);
  console.log("Grouped by creation month:", grouped);

  if (users.length === 0) {
    console.log("Nothing to send. Exiting.");
    return;
  }

  // send in batches
  let sent = 0;
  let failed = 0;
  const numberBatches = Math.ceil(users.length / BATCH_SIZE);

  for (let i = 0; i < numberBatches; i++) {
    const batchUsers = users.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

    const batch = await Promise.all(
      batchUsers.map(async (user) => ({
        from: emailConfig.fromEmail,
        to: user.email,
        subject: "نطلب منك الموافقة على سياسة الخصوصية",
        html: await render(
          ConsentRequestEmail({
            firstName: user.firstName,
            consentPageUrl: CONSENT_PAGE_URL,
            consentVersion: SIGNUP_CONSENT_VERSION,
          }),
        ),
      })),
    );

    const { data, error } = await resend.batch.send(
      batch.map((email) => {
        return {
          ...email,
          tags: [{ name: "category", value: "consent-request" }],
        };
      }),
    );

    if (error) {
      console.error(`Batch ${i + 1} failed entirely:`, error);
      failed += batchUsers.length;
    } else {
      data.data?.forEach((result, index) => {
        if (result.id) {
          sent++;
        } else {
          failed++;
          console.error(`Failed to send to ${batchUsers[index].email}`);
        }
      });
      console.log(`Batch ${i + 1} done.`);
    }

    if (i + 1 < numberBatches) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`Done. Sent: ${sent}, Failed: ${failed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
