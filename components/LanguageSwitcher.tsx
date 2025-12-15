"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", shortCode: "ENG" },
  { code: "es", label: "Español", shortCode: "ESP" },
];

interface LanguageSwitcherProps {
  variant?: "header" | "sidebar";
  collapsed?: boolean;
}

export default function LanguageSwitcher({
  variant = "header",
  collapsed = false,
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const currentLang = LANGUAGES.find((lang) => lang.code === locale);

  const handleLanguageChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2",
            variant === "sidebar"
              ? "text-foreground hover:text-primary hover:bg-muted w-full justify-start"
              : "text-white hover:text-white"
          )}
        >
          <Globe
            className={cn("h-4 w-4", variant === "sidebar" ? "text-foreground" : "text-white")}
          />
          {!collapsed && (
            <span
              className={cn(
                "font-semibold",
                variant === "sidebar" ? "text-foreground" : "text-white"
              )}
            >
              {currentLang?.shortCode}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === "sidebar" ? "start" : "end"}
        side={variant === "sidebar" ? "right" : "bottom"}
        className="border-border bg-card border-2"
      >
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              "cursor-pointer text-base",
              locale === lang.code
                ? "bg-primary/10 text-foreground font-bold"
                : "text-foreground hover:bg-muted font-medium"
            )}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
