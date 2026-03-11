import { getOnboardingStatus } from "@/actions/dashboard";
import { Nav } from "@/components/nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const onboardingStatus = await getOnboardingStatus();

  return (
    <div className="flex min-h-screen flex-col md:flex-row md:h-screen">
      <Nav onboardingStatus={onboardingStatus} />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <footer className="py-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Clockwork. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
