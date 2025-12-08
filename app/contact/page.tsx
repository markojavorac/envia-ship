"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("contact");
  const tFooter = useTranslations("footer");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl lg:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/80">{t("subtitle")}</p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <Card className="border-primary/30 border-2 bg-white">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-secondary mb-1 text-lg font-bold">{tFooter("email")}</h3>
                      <a
                        href="mailto:info@enviaguatemala.com"
                        className="text-primary hover:text-primary/80 font-semibold"
                      >
                        info@enviaguatemala.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-secondary mb-1 text-lg font-bold">{tFooter("phone")}</h3>
                      <a
                        href="tel:+50212345678"
                        className="text-primary hover:text-primary/80 font-semibold"
                      >
                        +502 1234-5678
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-secondary mb-1 text-lg font-bold">
                        {tFooter("address")}
                      </h3>
                      <p className="text-gray-700">{t("address")}</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-secondary mb-1 text-lg font-bold">
                        {t("businessHours")}
                      </h3>
                      <p className="text-gray-700">
                        {t("mondayFriday")}: {t("hours")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
