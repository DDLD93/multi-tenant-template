import Link from "next/link";
import { LoginForm } from "./form";
import { WorkspaceJumpForm } from "./workspace-jump";
import { Button } from "@/components/ui/button";

export default function PlatformLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold">Platform sign in</h1>
          <p className="mt-1 text-sm text-stone-600">For platform staff only.</p>
          <div className="mt-6">
            <LoginForm />
          </div>
          <p className="mt-4 text-xs text-stone-500">
            <Link href="/auth/forgot-password" className="underline">
              Forgot password?
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold">New here?</h2>
            <p className="mt-1 text-sm text-stone-600">
              Spin up your own workspace in under a minute.
            </p>
            <div className="mt-4">
              <Link href="/auth/register">
                <Button className="w-full">Register as a tenant</Button>
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold">Go to your workspace</h2>
            <p className="mt-1 text-sm text-stone-600">
              Already have an account? Enter your workspace slug.
            </p>
            <div className="mt-4">
              <WorkspaceJumpForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
