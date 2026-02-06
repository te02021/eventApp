"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Definimos las rutas reales de la app
const navItems = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/calendar", icon: Calendar, label: "Calendario" },
  { href: "/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-background/95 backdrop-blur-sm border-t border-border px-6 py-2">
      <div className="flex items-center justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          // Lógica de activo:
          // 1. Coincidencia exacta (ej: estas en /calendar)
          // 2. O si estamos en Inicio ('/'), que no se active si estamos en otra ruta
          // 3. Opcional: Si entras a un evento (/events/...), podríamos decidir si dejar activo Inicio o no.
          // Por simplicidad, lo haremos coincidencia exacta o startsWith para subrutas si quisieras.

          const isActive =
            pathname === href ||
            (href !== "/" && pathname?.startsWith(href)) ||
            (href === "/" && pathname.startsWith("/events"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={label}
            >
              <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
