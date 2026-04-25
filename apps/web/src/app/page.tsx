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
      label: pick(locale, { en: "Enabled Event Types", ko: "지원 이벤트 유형" }),
      value: "3",
      description: pick(locale, { en: "Loan origination, interest accrual, principal repayment", ko: "대출 실행, 이자 발생, 원금 상환" }),
      icon: Zap,
    },
    {
      label: pick(locale, { en: "Primary Review Surface", ko: "주요 검토 화면" }),
      value: pick(locale, { en: "Journals", ko: "전표" }),
      description: pick(locale, { en: "Generated postings remain the first audit checkpoint", ko: "생성된 분개 전표가 첫 번째 감사 검토 지점입니다." }),
      icon: ReceiptText,
    },
    {
      label: pick(locale, { en: "Validation Output", ko: "검증 결과물" }),
      value: pick(locale, { en: "Trial Balance", ko: "시산표" }),
      description: pick(locale, { en: "The first aggregate view that closes the accounting loop", ko: "회계 흐름을 닫는 첫 집계 화면입니다." }),
      icon: Scale,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Dashboard", ko: "대시보드" })}
        title={pick(locale, { en: "Accounting Flow Overview", ko: "회계 흐름 개요" })}
        description={pick(locale, {
          en: "Use the console to post supported accounting events, inspect the generated journals, and confirm the resulting balances in the trial balance.",
          ko: "이 콘솔에서 지원되는 회계 이벤트를 입력하고, 생성된 전표를 검토한 뒤, 시산표에서 결과 잔액을 확인할 수 있습니다.",
        })}
        action={
          <Link href="/events/new" className={cn(buttonVariants())}>
            {pick(locale, { en: "New Event", ko: "이벤트 입력" })}
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
            <CardDescription>{pick(locale, { en: "Execution Path", ko: "실행 경로" })}</CardDescription>
            <CardTitle className="mt-2">{pick(locale, { en: "Core Workflow", ko: "핵심 워크플로" })}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              [
                pick(locale, { en: "1. Post Event", ko: "1. 이벤트 입력" }),
                pick(locale, { en: "Capture one of the 3 supported event types from the operations team.", ko: "운영팀이 입력하는 3개 지원 이벤트 중 하나를 등록합니다." }),
              ],
              [
                pick(locale, { en: "2. Inspect Journals", ko: "2. 전표 검토" }),
                pick(locale, { en: "Confirm debit and credit lines, dimensions, and journal numbers.", ko: "차변/대변 라인, 차원, 전표번호를 확인합니다." }),
              ],
              [
                pick(locale, { en: "3. Validate Balances", ko: "3. 잔액 검증" }),
                pick(locale, { en: "Check that the resulting balances roll into the trial balance as expected.", ko: "결과 잔액이 시산표에 기대한 대로 반영되는지 확인합니다." }),
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
                <CardDescription>{pick(locale, { en: "Roadmap", ko: "로드맵" })}</CardDescription>
                <CardTitle className="mt-2">{pick(locale, { en: "Extended Workspace", ko: "확장 작업 영역" })}</CardTitle>
              </div>
              <Badge variant="outline">{pick(locale, { en: "Expandable", ko: "확장 가능" })}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              pick(locale, { en: "Accounts and COA review", ko: "계정과목과 COA 검토" }),
              pick(locale, { en: "Product master and contract lookup", ko: "상품 마스터와 계약 조회" }),
              pick(locale, { en: "Entity and reporting-unit administration", ko: "회계주체와 보고 단위 관리" }),
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
