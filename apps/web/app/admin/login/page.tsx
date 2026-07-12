import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <AuthShell title="Sign in" description="Enter your credentials to access the admin.">
      <LoginForm />
    </AuthShell>
  );
}
