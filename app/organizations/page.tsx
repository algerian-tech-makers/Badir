import { OrganizationService } from "@/services/organizations";
import OrganizationsList from "@/components/pages/organizations/OrganizationsList";
import { OrganizationStatus } from "@prisma/client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "المنظمات - بادر",
  description: "المنظمات المسجلة على منصة بادر",
};

export default async function Page() {
  const initialData = await OrganizationService.getMany(
    { status: OrganizationStatus.approved },
    { page: 1, limit: 12 },
  );

  const dataPaginated = { ...initialData, data: initialData.data };
  return <OrganizationsList initialData={dataPaginated} />;
}
