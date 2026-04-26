import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { EntitiesTable } from "@/features/reference/entities-table";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { listEntities, listTenants } from "@/lib/api/reference";

export default async function EntitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenants = await listTenants().catch(() => ({ items: [], count: 0 }));
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : (tenants.items[0]?.id ?? "");
  const data = tenantId ? await listEntities(tenantId).catch(() => ({ items: [], count: 0 })) : { items: [], count: 0 };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Reference", ko: "기준정보" })}
        title={pick(locale, { en: "Accounting Units", ko: "회계 단위" })}
        description={pick(locale, { en: "Review the accounting units used in transaction and balance screens.", ko: "거래와 잔액 화면에서 사용하는 회계 단위를 확인합니다." })}
      />
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>{pick(locale, { en: "Select a company to view accounting units.", ko: "회계 단위를 보려면 회사를 선택하세요." })}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="max-w-sm">
              <NativeSelect name="tenantId" defaultValue={tenantId}>
                {tenants.items.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.code} · {tenant.name}
                  </option>
                ))}
              </NativeSelect>
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
          <CardTitle>{pick(locale, { en: "Accounting Units", ko: "회계 단위" })}</CardTitle>
          <CardDescription>{tenantId ? pick(locale, { en: `${data.count} units`, ko: `${data.count}개의 회계 단위` }) : pick(locale, { en: "No company selected.", ko: "선택된 회사가 없습니다." })}</CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId ? (
            <EntitiesTable items={data.items} locale={locale} tenantId={tenantId} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {pick(locale, { en: "Select a company first.", ko: "회사를 먼저 선택하세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
