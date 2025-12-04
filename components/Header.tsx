"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZoneSelector } from "./marketplace/ZoneSelector";
import { UIStyleSwitcher } from "./marketplace/UIStyleSwitcher";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isMarketplace = pathname?.startsWith("/marketplace");

  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/calculator", label: "Calculator" },
    { href: "/marketplace", label: "Marketplace" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-md bg-secondary">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/envia-logo.png"
            alt="ENVÍA"
            width={120}
            height={40}
            className="h-auto w-[120px]"
            priority
          />
        </Link>

        {/* Desktop Navigation - Simple text links */}
        <nav className="hidden md:flex items-center gap-8">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white hover:text-primary transition-colors font-bold text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Marketplace Controls - Desktop Only */}
        {isMarketplace && (
          <div className="hidden md:flex items-center gap-3">
            <ZoneSelector />
            <UIStyleSwitcher />
          </div>
        )}

        {/* Call to Action Button - Desktop */}
        <div className="hidden md:flex">
          <Button asChild className="bg-primary text-white hover:bg-primary/90 font-semibold">
            <Link href="/calculator">Get Quote</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white hover:text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-secondary">
          <nav className="container mx-auto flex flex-col px-4 py-4 gap-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:text-primary transition-colors font-bold py-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <Button
              asChild
              className="mt-4 bg-primary text-white hover:bg-primary/90 font-semibold w-full"
            >
              <Link href="/calculator" onClick={() => setMobileMenuOpen(false)}>
                Get Quote
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
