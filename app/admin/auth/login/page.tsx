import { AdminLoginForm } from "./form";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Tenant admin sign in</h1>
        <p className="mt-1 text-sm text-stone-600">Use the credentials your administrator sent.</p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
        <p className="mt-4 text-xs text-stone-500">
          Forgot your password? Contact your workspace owner — password reset is admin-only.
        </p>
      </div>
    </main>
  );
}
