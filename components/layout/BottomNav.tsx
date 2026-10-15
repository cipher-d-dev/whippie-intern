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
  { href: "/home",         label: "Home",     icon: Home },
  { href: "/attendance",   label: "Check in", icon: ClipboardCheck },
  { href: "/tasks",        label: "Tasks",    icon: FileText },
  { href: "/notifications",label: "Alerts",   icon: Bell },
  { href: "/profile",      label: "Profile",  icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 safe-bottom",
        "border-t border-border/60",
        "bg-background/80 backdrop-blur-xl",
      )}
    >
      <ul
        className="flex h-16 items-center justify-around px-1"
        role="list"
      >
        {navItems.map(({ href, label, icon: Icon }, i) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex flex-col items-center gap-0.5 py-1.5",
                  "rounded-xl mx-0.5 transition-colors duration-200",
                  "text-xs font-medium",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Active pill indicator */}
                {isActive && (
                  <span
                    className={cn(
                      "absolute -top-px left-1/2 -translate-x-1/2",
                      "h-0.5 w-8 rounded-full bg-primary",
                      "animate-scale-in",
                    )}
                  />
                )}

                {/* Icon */}
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-xl",
                    "transition-all duration-200",
                    isActive && "bg-primary/10 animate-icon-pop",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px]",
                      isActive ? "text-primary" : "text-current",
                    )}
                    aria-hidden="true"
                  />
                </span>

                <span
                  className={cn(
                    "leading-none",
                    isActive ? "font-semibold" : "font-normal",
                  )}
                >
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
