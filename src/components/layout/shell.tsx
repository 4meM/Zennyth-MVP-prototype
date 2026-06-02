"use client";

import { useZenStore } from "@/lib/store";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { usePathname } from "next/navigation";
import { LandingHero } from "@/components/landing/hero";

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const { isOnboarded } = useZenStore();
  const pathname = usePathname();

  // Landing page for non-onboarded visitors (smoke test)
  if (!isOnboarded && pathname === "/") {
    return <LandingHero />;
  }

  // Onboarding flow (no shell)
  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  // Non-onboarded user trying to access app pages → show landing
  if (!isOnboarded) {
    return <LandingHero />;
  }

  // Normal app shell
  return (
    <div className="min-h-dvh bg-bg">
      <Sidebar />
      <main className="md:ml-64 pb-24 md:pb-0 min-h-dvh">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
