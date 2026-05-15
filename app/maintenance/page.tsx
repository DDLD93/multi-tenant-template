export default function MaintenancePage() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Service unavailable</h1>
        <p className="mt-2 text-sm text-stone-600">
          This workspace is temporarily unavailable. Please contact your administrator.
        </p>
      </div>
    </main>
  );
}
