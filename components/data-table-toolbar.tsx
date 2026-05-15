import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DataTableToolbar({
  title,
  createHref,
  createLabel = "Create",
  description,
}: {
  title: string;
  createHref?: string;
  createLabel?: string;
  description?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-stone-600">{description}</p> : null}
      </div>
      {createHref ? (
        <Link href={createHref}>
          <Button>{createLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
