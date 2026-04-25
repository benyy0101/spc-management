import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, normalizeLocale } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { locale?: string } | null;
  const locale = normalizeLocale(body?.locale ?? DEFAULT_LOCALE);

  const response = NextResponse.json({ locale });
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
