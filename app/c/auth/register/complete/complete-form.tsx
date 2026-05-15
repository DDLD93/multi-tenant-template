"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { apiPost } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import { FormField, TextInput } from "@/components/form-field";

const Schema = z
  .object({
    displayName: z.string().min(1, "Enter your name."),
    password: z.string().min(12, "At least 12 characters."),
    confirm: z.string().min(12),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match.",
  });

type Values = z.infer<typeof Schema>;

export function ClientRegisterCompleteForm({ token }: { token: string }) {
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(Schema),
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const res = await apiPost<{ redirect: string }>("/api/auth/register/client/complete", {
      token,
      password: values.password,
      displayName: values.displayName,
    });
    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (res.data?.redirect) window.location.assign(res.data.redirect);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label="Display name" htmlFor="dn" error={formState.errors.displayName?.message}>
        <TextInput id="dn" autoComplete="name" {...register("displayName")} />
      </FormField>
      <FormField label="Password" htmlFor="pw" error={formState.errors.password?.message}>
        <TextInput id="pw" type="password" autoComplete="new-password" {...register("password")} />
      </FormField>
      <FormField label="Confirm password" htmlFor="cf" error={formState.errors.confirm?.message}>
        <TextInput id="cf" type="password" autoComplete="new-password" {...register("confirm")} />
      </FormField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-xs text-stone-500">
        <Link href="/auth/login" className="underline">
          Sign in instead
        </Link>
      </p>
    </form>
  );
}
