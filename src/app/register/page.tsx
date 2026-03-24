import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Register | Open Lovable",
  description: "Create your Open Lovable account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthForm view="register" />
    </div>
  );
}
