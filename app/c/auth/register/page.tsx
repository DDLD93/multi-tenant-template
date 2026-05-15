import Link from "next/link";
import { ClientRegisterForm } from "./client-register-form";

export default function ClientRegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Create an account</h1>
        <p className="mt-1 text-sm text-stone-600">
          Enter your details and password, then confirm your email with a one-time code.
        </p>
        <div className="mt-6">
          <ClientRegisterForm />
        </div>
        <p className="mt-4 text-center text-xs text-stone-500">
          <Link href="/admin/auth/login" className="underline">
            Tenant admin sign-in
          </Link>
        </p>
      </div>
    </main>
  );
}
