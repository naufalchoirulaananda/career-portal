"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { PasswordField } from "./PasswordField";
import { toast } from "sonner";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    password: "",
    confirm: "",
  });

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session && !window.location.hash.includes("access_token")) {
        toast.error("Invalid or expired reset link", {
          duration: 3000,
          style: { background: "#dc2626", color: "#fff" },
        });
        router.replace("/sign-in");
      } else {
        setChecking(false);
      }
    };
    checkSession();
  }, [router]);

  if (checking) {
    return <p className="text-center mt-10">Verifying link...</p>;
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  const validate = () => {
    const newErrors = { password: "", confirm: "" };
    let isValid = true;

    if (!password) {
      newErrors.password = "Password cannot be empty.";
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number, and symbol.";
      isValid = false;
    }

    if (confirm !== password) {
      newErrors.confirm = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Failed to update password", {
        description: error.message,
        duration: 3000,
        style: {
          background: "#dc2626",
          color: "#fff",
          border: "1px solid #b91c1c",
        },
      });
    } else {
      toast.success("Password updated successfully!", {
        description: "You can now sign in with your new password.",
        duration: 3000,
        style: {
          background: "#01959F",
          color: "#fff",
          border: "1px solid #15803d",
        },
      });
      setTimeout(() => router.replace("/sign-in"), 2000);
    }

    setLoading(false);
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>
          <p className="text-lg font-bold">Set a new password</p>
        </CardTitle>
        <CardDescription>Please enter your new password below.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleUpdatePassword}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <PasswordField
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: "" }));
                }}
                error={errors.password}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <FieldDescription>
                Must include uppercase, lowercase, number, and symbol.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm">Confirm Password</FieldLabel>
              <PasswordField
                id="confirm"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (errors.confirm) setErrors((p) => ({ ...p, confirm: "" }));
                }}
                error={errors.confirm}
              />
              {errors.confirm && (
                <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>
              )}
            </Field>

            <Button
              className="bg-[#01959F] hover:bg-[#027a83] w-full mt-2"
              type="submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
