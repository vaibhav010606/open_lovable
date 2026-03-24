"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

export function AuthForm({ view }: { view: "login" | "register" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (view === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      
      if (data?.session) {
        toast.success("Registration successful! Welcome to Open Lovable.");
        router.push("/dashboard");
      } else {
        // If there's no session but no error, email confirmation is ON
        toast.success("Registration successful! Please check your email to confirm your account.", { duration: 8000 });
        // Optional: redirect to login so they don't sit on the register form endlessly
        router.push("/login");
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-transparent bg-clip-text bg-gradient-primary">
          {view === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {view === "login"
            ? "Enter your credentials to access your workspace."
            : "Sign up to start building awesome apps."}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-surface border-border text-text-primary h-11"
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-surface border-border text-text-primary h-11"
            minLength={6}
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-button hover:shadow-glow-button text-white h-11 font-semibold transition-all duration-300 active:scale-95"
        >
          {loading ? "Please wait..." : view === "login" ? "Sign In" : "Sign Up"}
        </Button>
      </form>

      <div className="text-center text-sm text-text-secondary">
        {view === "login" ? (
          <p>
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
