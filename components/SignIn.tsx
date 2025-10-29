"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordField } from "./PasswordField";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      toast.error("Invalid email format", {
        description: "Please enter a valid email address.",
        style: { background: "#dc2626", color: "#fff" },
      });
      return;
    }

    if (!password) {
      toast.error("Missing password", {
        description: "Please enter your password.",
        style: { background: "#dc2626", color: "#fff" },
      });
      return;
    }

    setLoading(true);

    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Login failed", {
        description: error.message,
        duration: 3000,
        style: {
          background: "#dc2626",
          color: "#fff",
          border: "1px solid #b91c1c",
        },
      });
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", loginData.user.id)
      .single();

    if (profileError) {
      toast.error("Error fetching user role", {
        description: profileError.message,
        style: { background: "#dc2626", color: "#fff" },
      });
      setLoading(false);
      return;
    }

    toast.success("Welcome back!", {
      description: `Signed in as ${email}`,
      duration: 2000,
      style: {
        background: "#01959F",
        color: "#fff",
        border: "1px solid #15803d",
      },
    });

    setEmail("");
    setPassword("");

    setTimeout(() => {
      if (profile.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/user");
      }
    }, 1000);

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      toast.error("Invalid email", {
        description: "Please enter a valid email to reset password.",
        style: { background: "#dc2626", color: "#fff" },
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error("Failed to send reset link", {
        description: error.message,
        duration: 3000,
        style: {
          background: "#dc2626",
          color: "#fff",
          border: "1px solid #b91c1c",
        },
      });
    } else {
      toast.success("Password reset link sent!", {
        description: "Check your email to reset your password.",
        duration: 3000,
        style: {
          background: "#01959F",
          color: "#fff",
          border: "1px solid #15803d",
        },
      });
      setEmail("");
    }

    setLoading(false);
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>
          <p className="text-lg font-bold">
            {resetMode ? "Reset your password" : "Sign in to your account"}
          </p>
        </CardTitle>
        <CardDescription>
          {resetMode
            ? "Enter your email to receive a password reset link."
            : "Enter your credentials to access your account."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={resetMode ? handleForgotPassword : handleSignIn}
          className={cn("space-y-4")}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </Field>

            {!resetMode && (
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-sm underline underline-offset-4 hover:text-[#01959F]"
                  >
                    Forgot your password?
                  </button>
                </div>
                <PasswordField
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            )}

            <Button
              type="submit"
              className="bg-[#01959F] hover:bg-[#027a83] w-full mt-2"
              disabled={loading}
            >
              {loading
                ? resetMode
                  ? "Sending..."
                  : "Signing in..."
                : resetMode
                ? "Send Reset Link"
                : "Sign In"}
            </Button>

            {resetMode && (
              <Button
                type="button"
                variant="link"
                className="text-sm mx-auto"
                onClick={() => setResetMode(false)}
              >
                Back to Sign In
              </Button>
            )}

            {!resetMode && (
              <FieldDescription className="text-center mt-3">
                Don’t have an account?{" "}
                <Link href="/sign-up" className="underline text-[#01959F]">
                  Sign up
                </Link>
              </FieldDescription>
            )}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
