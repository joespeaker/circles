"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Calendar, Compass, User } from "lucide-react";

const TABS = [
  { href: "/",         label: "Home",     Icon: Home },
  { href: "/circles",  label: "Circles",  Icon: MessageCircle },
  { href: "/events",   label: "Events",   Icon: Calendar },
  { href: "/discover", label: "Discover", Icon: Compass },
  { href: "/you",      label: "You",      Icon: User },
];

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex md:hidden z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
              isActive ? "text-[#1a9deb]" : "text-gray-400"
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2 : 1.6} />
            <span
              className={`text-[10px] ${
                isActive ? "font-semibold" : "font-medium"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
