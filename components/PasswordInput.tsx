"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  isRequired?: boolean;
  maxLength?: number;
  hint?: string;
  showIcon?: boolean;
}

export default function PasswordInput({
  label = "Password",
  error = false,
  errorMessage,
  isRequired = false,
  maxLength = 50,
  hint,
  showIcon = true,
  className = "",
  value,
  onChange,
  name = "password",
  placeholder = "Masukkan password",
  disabled,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block w-full">
      {label && (
        <span className="mb-2 block text-sm font-semibold text-color5">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </span>
      )}
      <div className="relative">
        {showIcon && (
          <LockKeyhole
            size={19}
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              error ? "text-red-500" : "text-color5/45"
            }`}
          />
        )}
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          disabled={disabled}
          placeholder={placeholder}
          required={isRequired}
          className={`h-12 w-full rounded-xl border bg-color3 pr-12 outline-none transition ${
            showIcon ? "pl-11" : "pl-4"
          } ${
            error
              ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-500/15"
              : "border-color4 focus:border-color1 focus:ring-2 focus:ring-color1/15"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`}
          {...props}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-color5/50 transition hover:bg-color4/70 hover:text-color1 disabled:opacity-40"
        >
          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
      {error && errorMessage ? (
        <span className="mt-1.5 block text-xs font-semibold text-red-600 leading-tight">
          {errorMessage}
        </span>
      ) : hint ? (
        <span className="mt-2 block text-xs text-color5/55">{hint}</span>
      ) : null}
    </label>
  );
}
