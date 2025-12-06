import type { Metadata } from "next";
import { Inter, DM_Sans, JetBrains_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MarketplaceProvider } from "@/contexts/MarketplaceContext";
import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";
import { ProductDiscoveryPopup } from "@/components/copilot/ProductDiscoveryPopup";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
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
        <ThemeProvider>
          <MarketplaceProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <ConditionalFooter />
            </div>
            <ProductDiscoveryPopup />
          </MarketplaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
