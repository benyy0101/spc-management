import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { TrialBalanceTable } from "@/features/ledger/trial-balance-table";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { getTrialBalance } from "@/lib/api/ledger";
import { listEntities, listTenants } from "@/lib/api/reference";

export default async function TrialBalancePage({
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

  const data =
    tenantId
      ? await getTrialBalance({
          tenantId,
          entityId: entityId || undefined,
          asOf,
        }).catch(() => null)
      : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Ledger", ko: "원장" })}
        title={pick(locale, { en: "Trial Balance", ko: "시산표" })}
        description={pick(locale, {
          en: "Check whether journal balances are correctly summarized by account on the selected date.",
          ko: "선택한 날짜 기준으로 전표 잔액이 계정별로 올바르게 합산되었는지 확인합니다.",
        })}
      />
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>{pick(locale, { en: "Select a company and date. The accounting unit is optional.", ko: "회사와 날짜를 선택하세요. 회계 단위는 선택 사항입니다." })}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <NativeSelect name="tenantId" defaultValue={tenantId}>
                {tenants.items.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.code} · {tenant.name}
                  </option>
                ))}
              </NativeSelect>
              <NativeSelect name="entityId" defaultValue={entityId}>
                <option value="">{pick(locale, { en: "All accounting units", ko: "전체 회계 단위" })}</option>
                {entities.items.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.code} · {entity.name}
                  </option>
                ))}
              </NativeSelect>
              <Input name="asOf" type="date" defaultValue={asOf} />
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                {pick(locale, { en: "Search", ko: "조회" })}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Trial Balance", ko: "시산표" })}</CardTitle>
          <CardDescription>
            {tenantId ? pick(locale, { en: `As of ${asOf}`, ko: `${asOf} 기준` }) : pick(locale, { en: "Select a company and date to view balances.", ko: "잔액을 보려면 회사와 날짜를 선택하세요." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data ? (
            <TrialBalanceTable data={data} locale={locale} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, { en: "No balance data was found. Check the selected conditions.", ko: "잔액 자료가 없습니다. 선택한 조건을 다시 확인하세요." })
                : pick(locale, { en: "Select a company and date first.", ko: "회사와 날짜를 먼저 선택하세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
