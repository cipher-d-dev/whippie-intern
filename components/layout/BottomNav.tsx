"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, ListChecks, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home",       label: "Home",     icon: Home,       also: ["/notifications"] },
  { href: "/attendance", label: "Check in", icon: MapPin,     also: [] },
  { href: "/tasks",      label: "Tasks",    icon: ListChecks, also: [] },
  { href: "/reports",    label: "Reports",  icon: FileText,   also: [] },
  { href: "/profile",    label: "Me",       icon: User,       also: ["/timeline", "/evaluations", "/notes"] },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 backdrop-blur-md safe-bottom">
      <ul className="mx-auto flex h-16 max-w-md items-stretch px-2" role="list">
        {navItems.map(({ href, label, icon: Icon, also }) => {
          const isActive = [href, ...also].some((p) => pathname === p || pathname.startsWith(p + "/"));
          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
