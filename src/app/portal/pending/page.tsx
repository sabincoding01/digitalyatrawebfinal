"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Clock, AlertTriangle, Loader2 } from "lucide-react";

export default function StudentPendingPage() {
  const { dbUser, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="portal-page flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary-500" />
      </div>
    );
  }

  const isRejected = dbUser?.status === "rejected";

  return (
    <div className="portal-page flex items-center justify-center p-4 sm:p-6 py-8">
      <div className="absolute top-1/4 left-1/4 w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] rounded-full bg-secondary-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md portal-card rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 text-center space-y-6">
        <div className="flex justify-center">
          {isRejected ? (
            <div className="w-16 h-16 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center justify-center animate-pulse">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {isRejected ? "Access Request Denied" : "Awaiting Admin Approval"}
          </h1>
          <p className="text-zinc-500 dark:text-gray-400 text-sm leading-relaxed">
            {isRejected
              ? "Your access request to the Digital Yatra Student Portal was not approved by an administrator."
              : "Thank you for signing up! Your student account is currently pending administrator verification."}
          </p>
        </div>

        {dbUser && (
          <div className="portal-card rounded-xl p-4 text-left space-y-1 text-xs">
            <div className="text-zinc-500 dark:text-gray-500">Registered Account:</div>
            <div className="font-semibold text-zinc-800 dark:text-gray-200">{dbUser.displayName}</div>
            <div className="text-zinc-500 dark:text-gray-400">{dbUser.email}</div>
          </div>
        )}

        <div className="space-y-4 pt-2">
          {!isRejected && (
            <p className="text-[11px] text-zinc-500 dark:text-gray-500">
              Once an administrator approves your account, you will automatically be redirected to your dashboard.
            </p>
          )}

          <button
            onClick={logout}
            className="w-full py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 font-medium rounded-xl flex items-center justify-center gap-2 border border-zinc-200 dark:border-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / Use Another Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
