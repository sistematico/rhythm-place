"use client";

import { Music4 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [{ href: "/pedidos", label: "Pedidos", icon: Music4 }];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/8 bg-black/30">
      {/* Logo */}
      <span className="text-sm font-semibold tracking-widest text-white/50 uppercase select-none">
        Rhythm Place
      </span>

      {/* Links */}
      <ul className="flex items-center gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white/15 text-white shadow-[0_0_20px_rgba(148,163,184,0.15)]"
                    : "text-white/55 hover:bg-white/8 hover:text-white/90",
                ].join(" ")}
              >
                <Icon size={15} strokeWidth={2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
