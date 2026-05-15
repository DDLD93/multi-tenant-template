"use client";

import { useState } from "react";
import { z } from "zod";
import { apiPost } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import { FormField, TextInput } from "@/components/form-field";

const EmailSchema = z.email();
const CodeSchema = z.string().regex(/^\d{6}$/, "6-digit code");

export function ClientOtpForm() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function requestCode() {
    setError(null);
    setInfo(null);
    const parsed = EmailSchema.safeParse(email);
    if (!parsed.success) {
      setError("Enter a valid email.");
      return;
    }
    setPending(true);
    const res = await apiPost("/api/auth/otp/request", { email });
    setPending(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setStep("code");
    setInfo("Code sent. Check your inbox.");
  }

  async function verify() {
    setError(null);
    setInfo(null);
    const parsed = CodeSchema.safeParse(code);
    if (!parsed.success) {
      setError("Enter the 6-digit code.");
      return;
    }
    setPending(true);
    const res = await apiPost<{ redirect: string }>("/api/auth/otp/verify", { email, code });
    setPending(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (res.data?.redirect) window.location.assign(res.data.redirect);
  }

  return (
    <div className="flex flex-col gap-4">
      {step === "email" ? (
        <>
          <FormField label="Email" htmlFor="email">
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button onClick={requestCode} disabled={pending}>
            {pending ? "Sending…" : "Send code"}
          </Button>
        </>
      ) : (
        <>
          <FormField label="Verification code" htmlFor="code">
            <TextInput
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FormField>
          {info ? <p className="text-sm text-green-700">{info}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button onClick={verify} disabled={pending}>
            {pending ? "Verifying…" : "Verify"}
          </Button>
          <button
            type="button"
            className="text-xs text-stone-500 underline"
            onClick={() => setStep("email")}
          >
            Use a different email
          </button>
        </>
      )}
    </div>
  );
}
