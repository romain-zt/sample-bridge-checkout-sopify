import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shopify Bridge Checkout - Stripe Integration",
  description:
    "Starter kit production-ready pour intégrer Stripe Checkout dans votre boutique Shopify avec Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}

