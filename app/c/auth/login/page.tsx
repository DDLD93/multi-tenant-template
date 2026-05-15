import Link from "next/link";
import { ClientOtpForm } from "./form";

export default function ClientLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-stone-600">We&apos;ll email you a one-time code.</p>
          <div className="mt-6">
            <ClientOtpForm />
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-stone-500">
          Workspace administrator?{" "}
          <Link href="/admin/auth/login" className="underline">
            Sign in here
          </Link>
        </p>
      </div>
    </main>
  );
}
