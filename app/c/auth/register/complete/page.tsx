import Link from "next/link";
import { ClientRegisterCompleteForm } from "./complete-form";

export default async function ClientRegisterCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-600 shadow-sm">
          <p>Missing registration token. Request a new link from the registration page.</p>
          <p className="mt-4">
            <Link href="/auth/register" className="underline">
              Register
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Finish registration</h1>
        <p className="mt-1 text-sm text-stone-600">Choose a password and how we should address you.</p>
        <div className="mt-6">
          <ClientRegisterCompleteForm token={token} />
        </div>
      </div>
    </main>
  );
}
