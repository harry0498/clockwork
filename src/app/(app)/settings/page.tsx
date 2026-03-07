import { getProfile } from "@/actions/settings";
import { ChangePasswordForm } from "@/components/change-password-form";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <div className="space-y-8 max-w-md">
      <h1 className="text-2xl font-bold">Settings</h1>

      <SettingsForm profile={profile} />

      <div className="border-t border-border pt-8">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
