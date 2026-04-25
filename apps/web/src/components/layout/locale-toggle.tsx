"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";

export function LocaleToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const nextLocale: Locale = locale === "ko" ? "en" : "ko";

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/preferences/locale", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ locale: nextLocale }),
          });
          router.refresh();
        });
      }}
    >
      <Languages className="size-4" />
      {locale === "ko" ? "한국어" : "English"}
    </Button>
  );
}
