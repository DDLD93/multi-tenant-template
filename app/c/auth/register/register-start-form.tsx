"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { apiPost } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import { FormField, TextInput } from "@/components/form-field";

const Schema = z.object({ email: z.email() });
type Values = z.infer<typeof Schema>;

export function ClientRegisterStartForm() {
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(Schema),
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const res = await apiPost("/api/auth/register/client/start", { email: values.email });
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setDone(true);
  });

  if (done) {
    return (
      <p className="text-sm text-stone-600">
        If that email is eligible for a new account, we sent a registration link. Check your inbox (and spam).
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label="Email" htmlFor="email" error={formState.errors.email?.message}>
        <TextInput id="email" type="email" autoComplete="email" {...register("email")} />
      </FormField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Sending…" : "Send registration link"}
      </Button>
      <p className="text-center text-xs text-stone-500">
        <Link href="/auth/login" className="underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
