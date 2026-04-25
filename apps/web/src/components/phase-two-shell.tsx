import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

export function PhaseTwoShell({
  locale,
  eyebrow,
  title,
  description,
  apiItems,
  nextItems,
  children,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  description: string;
  apiItems: string[];
  nextItems: string[];
  children?: ReactNode;
}) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>{pick(locale, { en: "Connected API", ko: "연결 대상 API" })}</CardDescription>
            <CardTitle className="mt-2">{pick(locale, { en: "Server Contract", ko: "서버 계약" })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {apiItems.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-3 font-mono text-sm text-foreground"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>{pick(locale, { en: "Implementation Notes", ko: "구현 메모" })}</CardDescription>
            <CardTitle className="mt-2">{pick(locale, { en: "Next Web Work", ko: "다음 웹 작업" })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextItems.map((item) => (
              <div key={item} className="rounded-xl border border-border/70 bg-background px-4 py-3 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {children}
    </div>
  );
}
