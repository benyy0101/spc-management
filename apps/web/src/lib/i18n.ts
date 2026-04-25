export type Locale = "en" | "ko";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "spc_locale";

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "ko" ? "ko" : DEFAULT_LOCALE;
}

export function pick<T>(locale: Locale, values: { en: T; ko: T }): T {
  return values[locale];
}
