"use client";

import { useState } from "react";
import { apiPatch } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import { FormField, TextInput } from "@/components/form-field";

export function SettingsForm({ initial }: { initial: { name: string; settingsJson: string } }) {
  const [name, setName] = useState(initial.name);
  const [settings, setSettings] = useState(initial.settingsJson);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setError(null);
    setInfo(null);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(settings) as Record<string, unknown>;
    } catch {
      setError("Settings must be valid JSON.");
      return;
    }
    setPending(true);
    const res = await apiPatch("/api/tenant/settings", { name, settings: parsed });
    setPending(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setInfo("Saved.");
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Tenant name" htmlFor="name">
        <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <FormField label="Settings JSON" htmlFor="settings">
        <textarea
          id="settings"
          rows={10}
          value={settings}
          onChange={(e) => setSettings(e.target.value)}
          className="rounded border border-stone-300 bg-white px-3 py-2 font-mono text-xs"
        />
      </FormField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {info ? <p className="text-sm text-green-700">{info}</p> : null}
      <div>
        <Button onClick={submit} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
      </div>
    </div>
  );
}
