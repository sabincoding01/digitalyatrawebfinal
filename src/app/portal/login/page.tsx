"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function StudentLoginPage() {
  const { loginWithGoogle, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    try {
      await loginWithGoogle();
      toast.success("Signed in successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Google authentication failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="portal-page flex items-center justify-center p-4 sm:p-6 py-8">
      <div className="absolute top-1/4 left-1/4 w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] rounded-full bg-secondary-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md portal-card rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 text-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-xl p-2 border border-zinc-200 dark:border-white/10 flex items-center justify-center">
            <Image src="/logo.png" alt="Digital Yatra Logo" width={64} height={64} className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Student Portal</h1>
            <p className="text-zinc-500 dark:text-gray-400 text-sm mt-1">Access tasks, live classes, and track your progress</p>
          </div>
        </div>

        <div className="portal-card rounded-xl p-4 text-left space-y-3 text-sm">
          <div className="flex items-center gap-3 text-zinc-600 dark:text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 shrink-0"></span>
            <span>View assigned tasks and deadlines</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-600 dark:text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 shrink-0"></span>
            <span>Submit task completion answers for review</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-600 dark:text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 shrink-0"></span>
            <span>Join live classes and track attendance</span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <button
            onClick={handleGoogleLogin}
            disabled={signingIn || loading}
            className="w-full py-3.5 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:to-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_20px_rgba(247,148,29,0.3)] shadow-lg"
          >
            {signingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" fill="#EA4335"/>
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          <p className="text-[11px] text-zinc-500 dark:text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy. New accounts require administrator approval.
          </p>
        </div>
      </div>
    </div>
  );
}
