import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { getServerLocale } from "@/lib/i18n-server";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPC 회계 업무",
  description: "Work screens for SPC accounting review and entry",
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
