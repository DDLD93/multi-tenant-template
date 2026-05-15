"use client";

import { useState } from "react";
import { apiPost } from "@/lib/client/api";
import { Button } from "@/components/ui/button";

export function LogoutButton({ endpoint }: { endpoint: string }) {
  const [pending, setPending] = useState(false);
  async function onClick() {
    setPending(true);
    await apiPost(endpoint, {});
    window.location.href = "/auth/login";
  }
  return (
    <Button variant="outline" size="sm" disabled={pending} onClick={onClick}>
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
