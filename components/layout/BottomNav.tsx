"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, BriefcaseBusiness, MessageCircle, User } from "lucide-react";
import { useChatUnread } from "@/features/chat/hooks";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home",       label: "Home",     icon: Home,       also: ["/notifications"] },
  { href: "/attendance", label: "Check in", icon: MapPin,     also: [] },
  { href: "/tasks",      label: "Work",     icon: BriefcaseBusiness, also: ["/reports"] },
  { href: "/chat",       label: "Chat",     icon: MessageCircle, also: [] },
  { href: "/profile",    label: "Me",       icon: User,       also: ["/timeline", "/evaluations", "/notes"] },
];

export function BottomNav() {
  const pathname = usePathname();
  const unread = useChatUnread().data ?? 0;

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
                <span className="relative">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                  {href === "/chat" && unread > 0 && (
                    <span className="absolute -right-2 -top-1.5 min-w-[18px] rounded-full bg-primary px-1 text-center text-[10px] font-semibold leading-[18px] text-primary-foreground" aria-label={`${unread} unread`}>
                      {unread}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
