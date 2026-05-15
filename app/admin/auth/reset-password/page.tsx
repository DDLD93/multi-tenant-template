import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-600 shadow-sm">
          <p>Missing reset token.</p>
          <p className="mt-4">
            <Link href="/admin/auth/forgot-password" className="underline">
              Request a new link
            </Link>
          </p>
        </div>
      </main>
    );
  }
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Set a new password</h1>
        <div className="mt-6">
          <ResetPasswordForm token={token} backHref="/admin/auth/login" backLabel="Back to admin sign in" />
        </div>
      </div>
    </main>
  );
}
