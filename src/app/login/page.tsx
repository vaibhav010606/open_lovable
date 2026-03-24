import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Login | Open Lovable",
  description: "Sign in to your Open Lovable account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthForm view="login" />
    </div>
  );
}
