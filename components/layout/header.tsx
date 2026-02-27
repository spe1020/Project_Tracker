"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Trials", href: "/trials" },
  { name: "Analytics", href: "/analytics" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <FlaskConical className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              Manufacturing Trials
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.name}
              </Link>
            );
          })}
          <Link href="/projects/new" className="ml-2">
            <Button size="sm" variant="outline">New Project</Button>
          </Link>
          <Link href="/trials/new">
            <Button size="sm">New Trial</Button>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="flex flex-col p-4 space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/projects/new"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button size="sm" variant="outline" className="w-full">
                  New Project
                </Button>
              </Link>
              <Link
                href="/trials/new"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button size="sm" className="w-full">
                  New Trial
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
