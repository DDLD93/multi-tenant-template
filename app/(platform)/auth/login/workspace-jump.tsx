"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, TextInput } from "@/components/form-field";

export function WorkspaceJumpForm() {
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  function jump() {
    const clean = slug.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(clean)) {
      setError("Enter a valid slug.");
      return;
    }
    if (typeof window === "undefined") return;
    const host = window.location.host;
    const protocol = window.location.protocol;
    window.location.assign(`${protocol}//${clean}.${host}/admin/auth/login`);
  }

  return (
    <div className="flex flex-col gap-3">
      <FormField label="Workspace slug" htmlFor="ws-slug" error={error ?? undefined}>
        <TextInput
          id="ws-slug"
          placeholder="acme"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setError(null);
          }}
        />
      </FormField>
      <Button variant="outline" onClick={jump}>
        Go to workspace
      </Button>
    </div>
  );
}
