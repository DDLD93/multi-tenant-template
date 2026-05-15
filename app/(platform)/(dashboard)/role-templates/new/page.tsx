import { PageHeader, Card } from "@/components/shell";
import { ALL_PLATFORM_PERMISSION_KEYS } from "@/lib/auth/permissions";
import { RoleEditor } from "../editor";

export default function NewPlatformRolePage() {
  return (
    <div>
      <PageHeader title="New platform role" />
      <Card>
        <RoleEditor permissions={ALL_PLATFORM_PERMISSION_KEYS} scope="platform" />
      </Card>
    </div>
  );
}
