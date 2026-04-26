import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { getNavigationSections } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export default async function Home() {
  const locale = await getServerLocale();
  const navigationSections = getNavigationSections(locale);
  const sectionDescriptions = {
    [pick(locale, { en: "Core", ko: "핵심" })]: pick(locale, {
      en: "The main accounting flow from transaction entry to journal and balance review.",
      ko: "거래 입력부터 전표와 잔액 검토까지 이어지는 기본 회계 흐름입니다.",
    }),
    [pick(locale, { en: "Reference", ko: "기준정보" })]: pick(locale, {
      en: "Master data used across transactions, journals, and reports.",
      ko: "거래, 전표, 보고서 전반에서 공통으로 사용하는 기준정보입니다.",
    }),
    [pick(locale, { en: "Financial", ko: "재무보고" })]: pick(locale, {
      en: "Statement review screens that summarize balances into reports.",
      ko: "잔액을 재무제표 형태로 집계해 검토하는 보고 화면입니다.",
    }),
    [pick(locale, { en: "Operations", ko: "운영" })]: pick(locale, {
      en: "Operational control screens for close, allocations, corrections, and audit trails.",
      ko: "마감, 배분, 정정, 감사 추적 같은 운영 통제 화면입니다.",
    }),
  } as const;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Overview", ko: "전체 현황" })}
        title={pick(locale, { en: "Accounting Work Overview", ko: "회계 업무 개요" })}
        description={pick(locale, {
          en: "Use this page as an index to understand what each accounting screen is for before you go into the detailed work.",
          ko: "세부 화면으로 들어가기 전에 각 회계 기능이 어떤 업무를 위한 것인지 먼저 훑어보는 인덱스 화면입니다.",
        })}
        action={
          <Link href="/events/new" className={cn(buttonVariants())}>
            {pick(locale, { en: "New Transaction", ko: "거래 입력" })}
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <section className="grid gap-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>{pick(locale, { en: "Work Guide", ko: "업무 안내" })}</CardDescription>
            <CardTitle className="mt-2">{pick(locale, { en: "Recommended Order", ko: "권장 확인 순서" })}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-4">
            {[
              [
                pick(locale, { en: "1. Core", ko: "1. 핵심" }),
                pick(locale, { en: "Start with transaction entry, transaction history, journals, and trial balance.", ko: "거래 입력, 거래 내역, 전표, 시산표부터 보면 기본 회계 흐름을 이해하기 쉽습니다." }),
              ],
              [
                pick(locale, { en: "2. Reference", ko: "2. 기준정보" }),
                pick(locale, { en: "Then review the master data behind those transactions and journals.", ko: "그다음 거래와 전표의 기반이 되는 기준정보를 확인합니다." }),
              ],
              [
                pick(locale, { en: "3. Financial", ko: "3. 재무보고" }),
                pick(locale, { en: "Move on to financial statements to see how balances are reported.", ko: "잔액이 재무제표에서 어떻게 표현되는지 재무보고 화면에서 확인합니다." }),
              ],
              [
                pick(locale, { en: "4. Operations", ko: "4. 운영" }),
                pick(locale, { en: "Use operations screens for closing, adjustments, allocations, and audit follow-up.", ko: "마감, 정정, 배분, 감사 추적이 필요할 때 운영 화면을 사용합니다." }),
              ],
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border border-border/70 bg-background p-4">
                <p className="font-medium">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>{pick(locale, { en: "Feature Categories", ko: "기능 분류" })}</CardDescription>
            <CardTitle className="mt-2">{pick(locale, { en: "Category Guide", ko: "기능 안내" })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {navigationSections.map((section) => (
              <div key={section.label} className="rounded-xl border border-dashed border-border/80 bg-muted/40 px-4 py-3">
                <p className="font-medium text-foreground">{section.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {sectionDescriptions[section.label as keyof typeof sectionDescriptions]}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {navigationSections.map((section) => (
          <Card key={section.label} className="border-border/70 shadow-sm">
            <CardHeader>
              <CardDescription>{pick(locale, { en: "Category", ko: "분류" })}</CardDescription>
              <CardTitle className="mt-2">{section.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl border border-border/70 bg-background px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
