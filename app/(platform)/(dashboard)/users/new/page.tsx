import { prisma } from "@/lib/db/client";
import { bindPlatformPageContext } from "@/lib/db/page-context";
import { PageHeader, Card } from "@/components/shell";
import { InviteUserForm } from "./invite-form";

export default async function NewPlatformUserPage() {
  bindPlatformPageContext();
  const roles = await prisma.roleTemplate.findMany({
    where: { scope: "PLATFORM" },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
  return (
    <div>
      <PageHeader title="Invite platform user" />
      <Card>
        <InviteUserForm roles={roles} />
      </Card>
    </div>
  );
}
