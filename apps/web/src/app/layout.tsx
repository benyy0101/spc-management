import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { getServerLocale } from "@/lib/i18n-server";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPC Accounting Web",
  description: "Operations console for SPC accounting workflows",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} className={`h-full antialiased ${locale === "ko" ? "locale-ko" : "locale-en"}`}>
      <body className="min-h-full flex flex-col">
        <AppShell locale={locale}>{children}</AppShell>
      </body>
    </html>
  );
}
