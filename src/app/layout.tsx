import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { LanguageProvider } from "@/components/i18n/language-provider";
import { AppShell } from "@/components/layout/app-shell";
import { getRequestLocale } from "@/lib/i18n-server";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Riad Manager",
  description: "Internal management app for a small Moroccan riad",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale()

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LanguageProvider initialLocale={locale}>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" richColors />
        </LanguageProvider>
      </body>
    </html>
  );
}
