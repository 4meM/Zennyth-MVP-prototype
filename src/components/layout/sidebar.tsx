"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useZenStore } from "@/lib/store";
import { useTheme } from "./theme-provider";
import {
  LayoutDashboard,
  Plus,
  BarChart3,
  Timer,
  Settings,
  Users,
  Flame,
  Sparkles,
  Zap,
  Sun,
  Moon,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/tasks/new", icon: Plus, label: "Nueva Tarea" },
  { href: "/workspaces", icon: Users, label: "Grupos" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/focus", icon: Timer, label: "Focus" },
  { href: "/settings", icon: Settings, label: "Config" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, streak, tier } = useZenStore();
  const { resolved, toggle } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 h-dvh fixed left-0 top-0 bg-surface border-r border-border z-40">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-on-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-1 tracking-tight">
              Zennyth
            </h1>
            <p className="text-[10px] text-text-3 uppercase tracking-[0.2em]">
              Study Flow
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5" role="navigation" aria-label="Navegación principal">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold",
                "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                isActive
                  ? "bg-primary-subtle text-primary"
                  : "text-text-2 hover:text-text-1 hover:bg-bg-subtle"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
              {item.href === "/focus" && (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-bold">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      {tier === "free" && (
        <div className="px-3 mb-2">
          <Link
            href="/pricing"
            className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-gradient-to-r from-primary-subtle to-accent-subtle border border-primary/10 hover:border-primary/20 transition-all duration-200 group"
          >
            <Zap className="w-4 h-4 text-primary group-hover:text-primary-hover transition-colors" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-1">Upgrade a Pro</p>
              <p className="text-[10px] text-text-3">Scheduling + IA</p>
            </div>
          </Link>
        </div>
      )}

      {/* Bottom section */}
      <div className="p-4 space-y-3">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-text-2 hover:bg-bg-subtle transition-colors cursor-pointer"
          aria-label={resolved === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {resolved === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          <span className="text-xs font-medium">
            {resolved === "dark" ? "Modo claro" : "Modo oscuro"}
          </span>
        </button>

        {streak.currentStreak > 0 && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-warning-subtle border border-warning/10">
            <Flame className="w-4 h-4 text-warning" />
            <span className="text-xs font-bold text-warning">
              {streak.currentStreak} días seguidos
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
            {user.name ? user.name[0].toUpperCase() : "Z"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-1 truncate">
              {user.name || "Estudiante"}
            </p>
            <p className="text-[11px] text-text-3 truncate">
              {user.university || "Universidad"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
