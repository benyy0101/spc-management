import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { AllocationsTable } from "@/features/allocations/allocations-table";
import { InvestorPositionsTable } from "@/features/allocations/investor-positions-table";
import { RunAllocationForm } from "@/features/allocations/run-allocation-form";
import { listAllocations, listInvestorPositions } from "@/lib/api/allocations";
import { listEntities, listTenants } from "@/lib/api/reference";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function AllocationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenants = await listTenants().catch(() => ({ items: [], count: 0 }));
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : (tenants.items[0]?.id ?? "");
  const entities = tenantId ? await listEntities(tenantId).catch(() => ({ items: [], count: 0 })) : { items: [], count: 0 };
  const funds = entities.items.filter((entity) => entity.entityType === "fund");
  const fundCandidates = funds.length > 0 ? funds : entities.items;
  const fundEntityId = typeof query.fundEntityId === "string" ? query.fundEntityId : (fundCandidates[0]?.id ?? "");
  const periodStart = typeof query.periodStart === "string" ? query.periodStart : "2026-01-01";
  const periodEnd = typeof query.periodEnd === "string" ? query.periodEnd : "2026-01-31";
  const positions = tenantId && fundEntityId
    ? await listInvestorPositions({
        tenantId,
        fundEntityId,
      }).catch(() => ({ items: [], count: 0 }))
    : { items: [], count: 0 };
  const allocations = tenantId && fundEntityId
    ? await listAllocations({
        tenantId,
        fundEntityId,
        periodStart,
        periodEnd,
      }).catch(() => ({ items: [], count: 0 }))
    : { items: [], count: 0 };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Operations", ko: "운영" })}
        title={pick(locale, { en: "Allocations", ko: "배분" })}
        description={pick(locale, {
          en: "Run pro-rata allocations and review the saved results by fund and period.",
          ko: "펀드와 기간 기준으로 pro-rata 배분을 실행하고 저장된 결과를 검토합니다.",
        })}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>
            {pick(locale, {
              en: "Choose a company, fund, and period to inspect allocation results.",
              ko: "회사, 펀드, 기간을 선택해 배분 결과를 조회하세요.",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="tenantId">{pick(locale, { en: "Company", ko: "회사" })}</Label>
                <NativeSelect id="tenantId" name="tenantId" defaultValue={tenantId}>
                  {tenants.items.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.code} · {tenant.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fundEntityId">{pick(locale, { en: "Fund", ko: "펀드" })}</Label>
                <NativeSelect id="fundEntityId" name="fundEntityId" defaultValue={fundEntityId}>
                  {fundCandidates.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.code} · {entity.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodStart">{pick(locale, { en: "Period Start", ko: "시작일" })}</Label>
                <Input id="periodStart" name="periodStart" type="date" defaultValue={periodStart} maxLength={10} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodEnd">{pick(locale, { en: "Period End", ko: "종료일" })}</Label>
                <Input id="periodEnd" name="periodEnd" type="date" defaultValue={periodEnd} maxLength={10} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">{pick(locale, { en: "Search", ko: "조회" })}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Run Allocation", ko: "배분 실행" })}</CardTitle>
          <CardDescription>
            {pick(locale, {
              en: "Use the current fund and period to generate new allocation rows.",
              ko: "현재 선택한 펀드와 기간으로 새 배분 결과를 생성합니다.",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && fundCandidates.length > 0 ? (
            <RunAllocationForm
              locale={locale}
              tenantId={tenantId}
              funds={fundCandidates}
              defaultFundEntityId={fundEntityId}
              defaultPeriodStart={periodStart}
              defaultPeriodEnd={periodEnd}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {pick(locale, {
                en: "A company and fund reference must be available before allocations can run.",
                ko: "배분을 실행하려면 회사와 펀드 기준정보가 먼저 필요합니다.",
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Investor Positions", ko: "투자자 포지션" })}</CardTitle>
          <CardDescription>
            {tenantId && fundEntityId
              ? pick(locale, { en: `${positions.count} positions`, ko: `${positions.count}건의 포지션` })
              : pick(locale, { en: "Select a fund to load investor positions.", ko: "펀드를 선택하면 투자자 포지션을 조회합니다." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && fundEntityId && positions.items.length > 0 ? (
            <InvestorPositionsTable locale={locale} items={positions.items} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId && fundEntityId
                ? pick(locale, { en: "No investor positions were found for the selected fund.", ko: "선택한 펀드에 대한 투자자 포지션이 없습니다." })
                : pick(locale, { en: "Select a company and fund first.", ko: "회사와 펀드를 먼저 선택하세요." })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Allocation Results", ko: "배분 결과" })}</CardTitle>
          <CardDescription>
            {tenantId && fundEntityId
              ? pick(locale, { en: `${allocations.count} allocation rows`, ko: `${allocations.count}건의 배분 결과` })
              : pick(locale, { en: "Select a fund and period to load allocation results.", ko: "펀드와 기간을 선택하면 배분 결과를 조회합니다." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && fundEntityId && allocations.items.length > 0 ? (
            <AllocationsTable locale={locale} items={allocations.items} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId && fundEntityId
                ? pick(locale, { en: "No allocation results matched the current conditions.", ko: "현재 조건에 맞는 배분 결과가 없습니다." })
                : pick(locale, { en: "Select a company and fund first.", ko: "회사와 펀드를 먼저 선택하세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
