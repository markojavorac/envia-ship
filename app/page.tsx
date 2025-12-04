"use client";

import Image from "next/image";
import Link from "next/link";
import { Truck, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme } = useTheme();

  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description:
        "Express shipping options available for urgent deliveries. Track your package in real-time.",
      iconColor: "#FF8C00",
      bgColor: "#FFF5E6",
      borderColor: "#FF8C00",
    },
    {
      icon: Clock,
      title: "On-Time Guarantee",
      description:
        "We pride ourselves on punctual deliveries. Your package arrives when we say it will.",
      iconColor: "#FF8C00",
      bgColor: "#FFF5E6",
      borderColor: "#FF8C00",
    },
    {
      icon: Shield,
      title: "Insured Shipping",
      description:
        "All packages are fully insured for peace of mind during transit.",
      iconColor: "#1E3A5F",
      bgColor: "#E8EDF3",
      borderColor: "#1E3A5F",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <Image
                src="/envia-logo.png"
                alt="ENVÍA"
                width={200}
                height={66}
                className="h-auto w-[200px] md:w-[250px]"
                priority
              />
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl font-heading text-white">
              {theme.tagline}
            </h1>
            <p className="mb-6 text-base text-white md:text-lg">
              Professional shipping services for all your delivery needs. Fast,
              reliable, and affordable shipping solutions.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 shadow-lg font-bold">
                <Link href="/calculator">Get Quote</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-lg font-bold">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold leading-tight md:text-3xl font-heading text-secondary">
              Why Choose Us
            </h2>
            <p className="text-base text-gray-600">
              We provide the best shipping experience with these key features
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 border-primary/30 bg-white transition-all hover:shadow-lg hover:scale-105"
              >
                <CardHeader className="pb-3">
                  <div
                    className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl shadow-md bg-primary"
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-lg text-primary font-bold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-white relative overflow-hidden bg-primary">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="mb-3 text-2xl font-bold leading-tight md:text-3xl font-heading text-white drop-shadow-md">
            Ready to Ship?
          </h2>
          <p className="mb-6 text-base text-white drop-shadow">
            Get started with our shipping services today. Contact us for a free
            quote.
          </p>
          <Button asChild size="lg" className="bg-white hover:bg-gray-100 text-primary shadow-xl">
            <Link href="/calculator">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
