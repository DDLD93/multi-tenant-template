import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function PlatformForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Forgot password</h1>
        <p className="mt-1 text-sm text-stone-600">We&apos;ll email you a link to choose a new password.</p>
        <div className="mt-6">
          <ForgotPasswordForm surface="platform" backHref="/auth/login" backLabel="Back to sign in" />
        </div>
        <p className="mt-4 text-center text-xs text-stone-500">
          <Link href="/auth/register" className="underline">
            Register a workspace
          </Link>
        </p>
      </div>
    </main>
  );
}
