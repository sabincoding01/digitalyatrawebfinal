"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FloatingActions } from "@/components/floating-actions";
import { ThemedToaster } from "@/components/themed-toaster";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute = pathname.startsWith("/admin") || pathname.startsWith("/portal");

  return (
    <>
      <Navbar />
      <main className={`flex-1 ${isAppRoute ? "pt-20" : ""}`}>{children}</main>
      {!isAppRoute && <Footer />}
      <FloatingActions />
      <ThemedToaster />
    </>
  );
}
