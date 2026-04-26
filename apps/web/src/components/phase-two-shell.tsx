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
            <CardDescription>{pick(locale, { en: "Planned Tasks", ko: "준비 중인 업무" })}</CardDescription>
            <CardTitle className="mt-2">{pick(locale, { en: "Included Work", ko: "포함될 기능" })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {apiItems.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-3 text-sm text-foreground"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>{pick(locale, { en: "Next Step", ko: "다음 단계" })}</CardDescription>
            <CardTitle className="mt-2">{pick(locale, { en: "To Be Added", ko: "추가 예정 내용" })}</CardTitle>
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
