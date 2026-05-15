import { PageHeader, Card } from "@/components/shell";
import { CreateClientForm } from "./create-form";

export default function NewClientPage() {
  return (
    <div>
      <PageHeader title="New client" />
      <Card>
        <CreateClientForm />
      </Card>
    </div>
  );
}
