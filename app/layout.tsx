import type { Metadata } from "next";
import { Inter, DM_Sans, JetBrains_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Envia Ship - Your Trusted Shipping Partner",
  description:
    "Professional shipping services for all your delivery needs. Fast, reliable, and affordable shipping solutions.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased overflow-x-hidden`}
      >
        <NextIntlClientProvider messages={messages}>
          <NextTopLoader
            color="#FF8C00"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #FF8C00,0 0 5px #FF8C00"
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="envia-theme"
          >
            <SidebarProvider defaultOpen={true}>
              <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
                <AppSidebar />
                <main className="flex flex-1 flex-col px-4 pb-20 md:px-6 md:pb-0">
                  <div className="flex-1">{children}</div>
                </main>
                <MobileBottomNav />
              </div>
            </SidebarProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
