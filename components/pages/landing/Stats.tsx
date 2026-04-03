import Stat from "@/components/pages/landing/Stat";
import statistics from "@/data/statistics";
import { InitiativeService } from "@/services/initiatives";
import { OrganizationService } from "@/services/organizations";
import { UserService } from "@/services/user";
import { REVALIDATE_TIME_STATS } from "@/lib/next-configs";

export const revalidate = REVALIDATE_TIME_STATS;

async function getStats(): Promise<{
  initiatives: number;
  organizations: number;
  activeVolunteers: number;
}> {
  const [initiatives, organizations, activeVolunteers] = await Promise.all([
    InitiativeService.getInitiativesCount(),
    OrganizationService.getOrganizationsCount(),
    UserService.getUsersCount(),
  ]);

  // one for Bunian
  return { initiatives, organizations: organizations + 1, activeVolunteers };
}
export default async function Stats() {
  const stats = await getStats();
  return (
    <section className="my-6 grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
      {statistics.map((stat) => (
        <Stat key={stat.id} config={stat} stat={stats} />
      ))}
    </section>
  );
}
