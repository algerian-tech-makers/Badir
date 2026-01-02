import CompleteOrganizationForm from "@/components/pages/signups/CompleteOrganizationForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.profileCompleted) {
    redirect("/");
  }
  return (
    <section className="bg-primary-600 flex min-h-screen w-full items-center justify-center p-4">
      <CompleteOrganizationForm />
    </section>
  );
}
