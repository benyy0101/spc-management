import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { FinancialStatementTable } from "@/features/financial-statements/financial-statement-table";
import { getCashFlow } from "@/lib/api/financial-statements";
import { listEntities, listTenants } from "@/lib/api/reference";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";

export default async function CashFlowPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenants = await listTenants().catch(() => ({ items: [], count: 0 }));
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : (tenants.items[0]?.id ?? "");
  const entityId = typeof query.entityId === "string" ? query.entityId : "";
  const from = typeof query.from === "string" ? query.from : "2026-01-01";
  const to = typeof query.to === "string" ? query.to : "2026-01-31";
  const entities = tenantId ? await listEntities(tenantId).catch(() => ({ items: [], count: 0 })) : { items: [], count: 0 };
  const data = tenantId
    ? await getCashFlow({
        tenantId,
        entityId: entityId || undefined,
        from,
        to,
      }).catch(() => null)
    : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Financial", ko: "재무보고" })}
        title={pick(locale, { en: "Cash Flow", ko: "현금흐름표" })}
        description={pick(locale, {
          en: "Review indirect-method cash flow lines for a reporting period using the live cash flow endpoint.",
          ko: "실제 현금흐름표 API를 기준으로 보고 기간의 간접법 현금흐름 라인을 검토합니다.",
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
              en: "The cash flow API requires tenantId, from, and to. Entity remains optional.",
              ko: "현금흐름표 API는 tenantId, from, to가 필요하며 entity는 선택 사항입니다.",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4">
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
            <Input name="from" type="date" defaultValue={from} />
            <Input name="to" type="date" defaultValue={to} />
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Cash Flow", ko: "현금흐름표" })}</CardTitle>
          <CardDescription>
            {tenantId
              ? pick(locale, { en: `${from} to ${to}`, ko: `${from} ~ ${to}` })
              : pick(locale, { en: "Select tenant and period to load statement lines.", ko: "재무제표 라인을 조회하려면 tenant와 기간을 선택하세요." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.rows.length > 0 ? (
            <FinancialStatementTable data={data} locale={locale} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, { en: "The API request failed or returned no statement rows. Check the API server, statement mappings, and selected period.", ko: "API 요청이 실패했거나 재무제표 라인이 없습니다. 서버 상태, 매핑, 선택한 기간을 확인하세요." })
                : pick(locale, { en: "No request has been sent yet. Select tenant and period to load the cash flow statement.", ko: "아직 요청이 전송되지 않았습니다. tenant와 기간을 선택해 현금흐름표를 조회하세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
