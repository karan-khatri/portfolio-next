import { AuthShell } from "@/components/admin/auth-shell";
import { AcceptInviteForm } from "@/components/admin/accept-invite-form";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <AuthShell title="Accept invite" description="Set a password to activate your account.">
      <AcceptInviteForm token={token} />
    </AuthShell>
  );
}
