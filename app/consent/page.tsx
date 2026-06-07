import { redirect } from "next/navigation";
import { SIGNUP_CONSENT_VERSION } from "@/lib/signup-consent-config";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import ConsentPageClient from "@/components/pages/consent/ConsentPageClient";
import { UserService } from "@/services/user";

export default async function ConsentPage() {
  const session = await getSessionWithCheckProfile();

  if (!session) {
    redirect("/login");
  }

  const user = await UserService.getUser(session.user.id);

  if (
    user &&
    user.consentGiven &&
    user.consentVersion === SIGNUP_CONSENT_VERSION
  ) {
    redirect("/");
  }

  return <ConsentPageClient />;
}
