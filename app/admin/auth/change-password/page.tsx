import { AdminChangePasswordForm } from "./form";

export default function AdminChangePasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Set a new password</h1>
        <div className="mt-6">
          <AdminChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
