import { redirect } from "next/navigation";
import { SIGNUP_CONSENT_VERSION } from "@/lib/signup-consent-config";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import ConsentPageClient from "@/components/pages/consent/ConsentPageClient";
import { UserService } from "@/services/user";
import DeleteAccount from "@/components/pages/profile/DeleteAccount";

export default async function ConsentPage() {
  const session = await getSessionWithCheckProfile();

  if (!session) redirect("/login");

  const user = await UserService.getUser(session.user.id);

  if (
    user &&
    user.consentGiven &&
    user.consentVersion === SIGNUP_CONSENT_VERSION
  ) {
    redirect("/");
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8 p-6"
      dir="rtl"
    >
      <ConsentPageClient />
      <div className="w-full max-w-2xl rounded-lg border border-red-100 bg-red-50 p-4">
        <p className="mb-3 text-sm text-red-600">
          إذا كنت لا توافق على سياسة الخصوصية، يمكنك حذف حسابك نهائياً.
        </p>
        <DeleteAccount />
      </div>
    </div>
  );
}
