"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/contexts/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();
  const t = useTranslations("footer");
  const tNav = useTranslations("navigation");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Company Info */}
          <div className="space-y-3">
            <Image
              src="/envia-logo.png"
              alt="ENVÍA"
              width={100}
              height={33}
              className="h-auto w-[100px]"
            />
            <p className="text-sm text-white/80">{theme.tagline}</p>
            <p className="text-xs text-white/60">
              © {currentYear} {theme.companyName}. {t("allRightsReserved")}.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-primary text-sm text-white/80 transition-colors"
                >
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/calculator"
                  className="hover:text-primary text-sm text-white/80 transition-colors"
                >
                  {tNav("calculator")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">{t("contactUs")}</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-white/80">
                <Phone className="h-4 w-4" />
                <a href={`tel:${theme.phone}`} className="hover:text-primary transition-colors">
                  {theme.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/80">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${theme.email}`} className="hover:text-primary transition-colors">
                  {theme.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/80">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>Guatemala City, Guatemala</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
