import { PageHeader, Card } from "@/components/shell";

export default function PlatformSettingsPage() {
  return (
    <div>
      <PageHeader title="Platform settings" />
      <Card>
        <p className="text-sm text-stone-600">
          Platform-wide settings (feature flags, default tenant template, email templates,
          OTP provider) are managed via environment configuration in this build.
        </p>
      </Card>
    </div>
  );
}
