"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PasswordField } from "./PasswordField";
import { toast } from "sonner";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  const validate = () => {
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = "Full name cannot be empty.";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password cannot be empty.";
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.";
      isValid = false;
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange =
    (field: keyof typeof errors, setter: (val: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/sign-in`,
        data: { full_name: fullName, role: "user" },
      },
    });

    if (error) {
      toast.error("Sign up failed!", {
        description: error.message,
        duration: 3000,
        style: {
          background: "#dc2626",
          color: "#fff",
          border: "1px solid #b91c1c",
        },
      });
    } else {
      toast.success("Registration successful!", {
        description: "Please check your email for verification.",
        duration: 3000,
        style: {
          background: "#01959F",
          color: "#fff",
          border: "1px solid #15803d",
        },
      });
      setEmail("");
      setFullName("");
      setPassword("");
      setConfirmPassword("");
    }

    setLoading(false);
  };
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>
          <p className="text-lg font-bold">Create an account</p>
        </CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={handleChange("fullName", setFullName)}
                className={cn(
                  errors.fullName && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs">{errors.fullName}</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={handleChange("email", setEmail)}
                className={cn(
                  errors.email && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordField
                id="password"
                value={password}
                onChange={handleChange("password", setPassword)}
                error={errors.password}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <PasswordField
                id="confirm-password"
                value={confirmPassword}
                onChange={handleChange("confirmPassword", setConfirmPassword)}
                error={errors.confirmPassword}
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>

            <Button
              className="bg-[#01959F] hover:bg-[#027a83] w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Create Account"}
            </Button>

            <FieldDescription className="text-center">
              Already have an account?{" "}
              <a href="/sign-in" className="underline text-[#01959F]">
                Sign in
              </a>
            </FieldDescription>

            {message && (
              <p className="text-center text-sm text-gray-700">{message}</p>
            )}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
