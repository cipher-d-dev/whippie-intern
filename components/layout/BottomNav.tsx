"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardCheck,
  FileText,
  Bell,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/attendance", label: "Check in", icon: ClipboardCheck },
  { href: "/tasks", label: "Tasks", icon: FileText },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

/**
 * BottomNav — persistent mobile navigation bar.
 * Follows mobile-first UX with safe-area padding for iOS home indicator.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background safe-bottom"
    >
      <ul className="flex h-16 items-center justify-around px-2" role="list">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-3 py-1 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", isActive && "text-primary")}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
