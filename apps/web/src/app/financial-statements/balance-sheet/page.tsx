import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { FinancialStatementTable } from "@/features/financial-statements/financial-statement-table";
import { getBalanceSheet } from "@/lib/api/financial-statements";
import { listEntities, listTenants } from "@/lib/api/reference";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";

export default async function BalanceSheetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenants = await listTenants().catch(() => ({ items: [], count: 0 }));
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : (tenants.items[0]?.id ?? "");
  const entityId = typeof query.entityId === "string" ? query.entityId : "";
  const asOf = typeof query.asOf === "string" ? query.asOf : "2026-01-31";
  const entities = tenantId ? await listEntities(tenantId).catch(() => ({ items: [], count: 0 })) : { items: [], count: 0 };
  const data = tenantId
    ? await getBalanceSheet({
        tenantId,
        entityId: entityId || undefined,
        asOf,
      }).catch(() => null)
    : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Financial", ko: "재무보고" })}
        title={pick(locale, { en: "Balance Sheet", ko: "재무상태표" })}
        description={pick(locale, {
          en: "Review the balance sheet by company, accounting unit, and date.",
          ko: "회사, 회계 단위, 날짜 기준으로 재무상태표를 확인합니다.",
        })}
        action={
          <Link href="/statement-mappings" className={cn(buttonVariants({ variant: "outline" }))}>
            {pick(locale, { en: "Statement Mappings", ko: "재무제표 매핑" })}
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>
            {pick(locale, {
              en: "Select a company and date. The accounting unit is optional.",
              ko: "회사와 날짜를 선택하세요. 회계 단위는 선택 사항입니다.",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3">
            <NativeSelect name="tenantId" defaultValue={tenantId}>
              {tenants.items.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.code} · {tenant.name}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect name="entityId" defaultValue={entityId}>
              <option value="">{pick(locale, { en: "All entities", ko: "전체 회계주체" })}</option>
              {entities.items.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.code} · {entity.name}
                </option>
              ))}
            </NativeSelect>
            <Input name="asOf" type="date" defaultValue={asOf} />
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Balance Sheet", ko: "재무상태표" })}</CardTitle>
          <CardDescription>
            {tenantId
              ? pick(locale, { en: `As of ${asOf}`, ko: `${asOf} 기준` })
              : pick(locale, { en: "Select a company and date to view the statement.", ko: "재무상태표를 보려면 회사와 날짜를 선택하세요." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.rows.length > 0 ? (
            <FinancialStatementTable data={data} locale={locale} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, { en: "No statement data was found. Check the selected conditions.", ko: "표시할 재무상태표 자료가 없습니다. 선택한 조건을 확인하세요." })
                : pick(locale, { en: "Select a company and date first.", ko: "회사와 날짜를 먼저 선택하세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
