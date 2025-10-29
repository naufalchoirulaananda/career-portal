"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  error,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`pr-10 ${
            error ? "border-red-500 focus-visible:ring-red-500" : ""
          }`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShow(!show)}
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        >
          {show ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
