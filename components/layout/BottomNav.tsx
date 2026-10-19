"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardCheck, FileText, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home",          label: "Home",    icon: Home },
  { href: "/attendance",    label: "Check in",icon: ClipboardCheck },
  { href: "/tasks",         label: "Tasks",   icon: FileText },
  { href: "/notifications", label: "Alerts",  icon: Bell },
  { href: "/profile",       label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom border-t border-border/50 bg-background/95 backdrop-blur-xl"
    >
      <ul className="flex h-[60px] items-stretch" role="list">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-150"
              >
                {/* Active indicator — sits flush at the top of the nav bar */}
                <span
                  className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-full transition-all duration-300",
                    isActive ? "w-8 bg-primary opacity-100" : "w-0 opacity-0",
                  )}
                />

                {/* Icon container */}
                <span className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-2xl transition-all duration-200",
                  isActive ? "bg-primary/12 scale-110" : "scale-100",
                )}>
                  <Icon
                    className={cn(
                      "h-[19px] w-[19px] transition-colors duration-150",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </span>

                {/* Label */}
                <span className={cn(
                  "text-[10px] leading-none transition-all duration-150",
                  isActive ? "font-bold text-primary" : "font-medium text-muted-foreground",
                )}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
