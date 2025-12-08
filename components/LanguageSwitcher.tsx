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

export default function LanguageSwitcher() {
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
        <Button variant="ghost" size="sm" className="gap-2 text-white hover:text-white">
          <Globe className="h-4 w-4 text-white" />
          <span className="font-semibold text-white">{currentLang?.shortCode}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-2 border-gray-200 bg-white">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              "cursor-pointer text-base",
              locale === lang.code
                ? "bg-primary/10 font-bold text-[#1E3A5F]"
                : "font-medium text-[#1E3A5F] hover:bg-gray-100"
            )}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
