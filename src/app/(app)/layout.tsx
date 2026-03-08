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
      <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
