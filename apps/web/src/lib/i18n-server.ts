import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

export async function getServerLocale() {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("spc_locale")?.value);
}
