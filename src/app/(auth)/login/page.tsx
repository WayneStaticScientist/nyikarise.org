"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Phone,
  Lock,
  ArrowRight,
  Globe,
} from "lucide-react";
import { NyikaFormInput } from "@/components/ui/form-input";
import { NyikaCheckBox } from "@/components/ui/check-box";
import { NyikaButton } from "@/components/ui/nyika-button";
import { useAuthStore } from "@/stores/authStore";

/**
 * Modern Phone Login Component
 * Designed with Tailwind CSS for a premium, clean aesthetic.
 * Now using semantic Tailwind classes for consistent theme color management.
 */
export default function LoginPage() {
  const authState = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      router.push("/");
    }
  }, [authState.isAuthenticated, router]);

  const handleLogin = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await authState.login(phoneNumber.trim(), password);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "The phone number or password you entered is incorrect.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground font-sans">
      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

        {/* Branding Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-content1 border border-divider flex items-center justify-center text-primary shadow-xl shadow-primary/5 transition-transform hover:rotate-3 duration-300">
            <ShieldCheck className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">NyikaRise</h1>
            <p className="text-foreground-500 font-medium">Sign in with your phone number</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-content1 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-divider rounded-[2.5rem] overflow-hidden">
          <div className="p-8 sm:p-10 space-y-6">

            {/* Contextual Error Alert */}
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-4 py-3 rounded-2xl flex items-center gap-3 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-danger" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                {/* Phone Input Field */}
                <NyikaFormInput
                  Icon={Phone}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e)}
                  props={{
                    required: true,
                    type: "tel",
                    placeholder: "Phone Number",
                  }}
                />
                {/* Password Input Field */}
                <NyikaFormInput
                  Icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e)}
                  props={{
                    required: true,
                    type: "password",
                    placeholder: "Password",
                  }}
                />

                {/* Custom Styled Checkbox */}
                <NyikaCheckBox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e)}
                  label="Stay signed in"
                  props={{
                    required: true,
                  }}
                />
              </div>
              {/* Action Button */}
              <NyikaButton
                Icon={ArrowRight}
                isLoading={isLoading}
                props={{
                  children: "Continue",
                }} />
            </form>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-6">
          <p className="text-foreground-400 text-sm max-w-[300px] mx-auto leading-relaxed">
            Protecting your account with advanced security. Use <span className="text-primary font-semibold cursor-pointer hover:underline">Guest mode</span> for shared devices.
          </p>

          <div className="flex flex-col space-y-5">
            <div className="flex items-center justify-center gap-6 text-sm font-bold text-foreground-500">
              <button className="hover:text-foreground transition-colors focus:outline-none">Help</button>
              <button className="hover:text-foreground transition-colors focus:outline-none">Privacy</button>
              <button className="hover:text-foreground transition-colors focus:outline-none">Terms</button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-foreground-300 uppercase tracking-[0.2em] pt-2 select-none">
              <Globe className="w-3 h-3" />
              Secure Authentication
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}