import { PageHeader, Card } from "@/components/shell";
import { CreateTenantForm } from "../create-form";

export default function NewTenantPage() {
  return (
    <div>
      <PageHeader title="New tenant" />
      <Card>
        <CreateTenantForm />
      </Card>
    </div>
  );
}
