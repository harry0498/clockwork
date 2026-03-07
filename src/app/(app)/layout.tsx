import { getOnboardingStatus } from "@/actions/dashboard";
import { Nav } from "@/components/nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const onboardingStatus = await getOnboardingStatus();

  return (
    <div className="flex h-screen">
      <Nav onboardingStatus={onboardingStatus} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
