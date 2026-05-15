import { PageHeader, Card } from "@/components/shell";
import { ALL_TENANT_PERMISSION_KEYS } from "@/lib/auth/permissions";
import { RoleEditor } from "@/app/(platform)/(dashboard)/role-templates/editor";

export default function NewTenantRolePage() {
  return (
    <div>
      <PageHeader title="New role" />
      <Card>
        <RoleEditor permissions={ALL_TENANT_PERMISSION_KEYS} scope="tenant" />
      </Card>
    </div>
  );
}
