import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          en: "This screen will validate that posted journals roll up correctly by account as of a reporting date.",
          ko: "이 화면은 posting된 전표가 기준일 기준 계정 잔액으로 올바르게 집계되는지 검증합니다.",
        })}
      />
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>{pick(locale, { en: "The API requires `tenantId` and `asOf`. Entity remains optional.", ko: "API는 `tenantId`와 `asOf`가 필요합니다. entity는 선택 사항입니다." })}</CardDescription>
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
              <option value="">All entities</option>
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
          <CardTitle>{pick(locale, { en: "Trial Balance", ko: "시산표" })}</CardTitle>
          <CardDescription>
            {tenantId ? pick(locale, { en: `As of ${asOf}`, ko: `${asOf} 기준` }) : pick(locale, { en: "Enter a tenant ID and reporting date to load the balances.", ko: "잔액을 조회하려면 tenant와 기준일을 선택하세요." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data ? (
            <TrialBalanceTable data={data} locale={locale} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, { en: "The API request failed or returned no data. Check the API server and the selected filters.", ko: "API 요청이 실패했거나 데이터가 없습니다. 서버 상태와 선택한 필터를 확인하세요." })
                : pick(locale, { en: "No request has been sent yet. Select a tenant and reporting date to query the balances.", ko: "아직 요청이 전송되지 않았습니다. tenant와 기준일을 선택해 잔액을 조회하세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
