import Link from "next/link";
import { ArrowRight, ReceiptText, Scale, Zap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";

export default async function Home() {
  const locale = await getServerLocale();
  const statCards = [
    {
      label: pick(locale, { en: "Supported Transaction Types", ko: "지원 거래 유형" }),
      value: "3",
      description: pick(locale, { en: "Loan origination, interest accrual, principal repayment", ko: "대출 실행, 이자 발생, 원금 상환" }),
      icon: Zap,
    },
    {
      label: pick(locale, { en: "Main Review Screen", ko: "주요 검토 화면" }),
      value: pick(locale, { en: "Journals", ko: "전표" }),
      description: pick(locale, { en: "Created journal entries are checked here first", ko: "생성된 전표를 가장 먼저 확인하는 화면입니다." }),
      icon: ReceiptText,
    },
    {
      label: pick(locale, { en: "Balance Check Screen", ko: "잔액 확인 화면" }),
      value: pick(locale, { en: "Trial Balance", ko: "시산표" }),
      description: pick(locale, { en: "Use it to confirm balances by account", ko: "계정별 잔액을 확인할 때 사용하는 화면입니다." }),
      icon: Scale,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Overview", ko: "전체 현황" })}
        title={pick(locale, { en: "Accounting Work Overview", ko: "회계 업무 개요" })}
        description={pick(locale, {
          en: "Enter transactions, review created journals, and check the final balances from one place.",
          ko: "거래 입력, 전표 검토, 최종 잔액 확인을 한곳에서 진행할 수 있습니다.",
        })}
        action={
          <Link href="/events/new" className={cn(buttonVariants())}>
            {pick(locale, { en: "New Transaction", ko: "거래 입력" })}
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-3">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="mt-2 text-2xl">{item.value}</CardTitle>
                  </div>
                  <div className="rounded-xl bg-muted p-3 text-muted-foreground">
                    <Icon className="size-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>{pick(locale, { en: "Work Order", ko: "업무 순서" })}</CardDescription>
            <CardTitle className="mt-2">{pick(locale, { en: "Main Steps", ko: "주요 단계" })}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              [
                pick(locale, { en: "1. Enter Transaction", ko: "1. 거래 입력" }),
                pick(locale, { en: "Register one of the supported transactions.", ko: "지원되는 거래 유형 중 하나를 등록합니다." }),
              ],
              [
                pick(locale, { en: "2. Review Journals", ko: "2. 전표 검토" }),
                pick(locale, { en: "Check debit, credit, journal number, and description.", ko: "차변과 대변, 전표번호, 적요를 확인합니다." }),
              ],
              [
                pick(locale, { en: "3. Check Balances", ko: "3. 잔액 확인" }),
                pick(locale, { en: "Confirm that the final balances are reflected as expected.", ko: "최종 잔액이 예상대로 반영되었는지 확인합니다." }),
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardDescription>{pick(locale, { en: "Related Work", ko: "관련 업무" })}</CardDescription>
                <CardTitle className="mt-2">{pick(locale, { en: "More Screens", ko: "추가 화면" })}</CardTitle>
              </div>
              <Badge variant="outline">{pick(locale, { en: "More Coming", ko: "계속 추가" })}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              pick(locale, { en: "Account list review", ko: "계정과목 확인" }),
              pick(locale, { en: "Product and contract lookup", ko: "상품과 계약 조회" }),
              pick(locale, { en: "Accounting unit management", ko: "회계 단위 관리" }),
            ].map((item) => (
              <div key={item} className="rounded-xl border border-dashed border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
