import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { JournalOperationsTable } from "@/features/journals/journal-operations-table";
import { ManualJournalForm } from "@/features/journals/manual-journal-form";
import { listJournals } from "@/lib/api/journals";
import { listAccounts, listEntities, listTenants } from "@/lib/api/reference";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function JournalOperationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenants = await listTenants().catch(() => ({ items: [], count: 0 }));
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : (tenants.items[0]?.id ?? "");
  const entityId = typeof query.entityId === "string" ? query.entityId : "";
  const from = typeof query.from === "string" ? query.from : "";
  const to = typeof query.to === "string" ? query.to : "";
  const entities = tenantId ? await listEntities(tenantId).catch(() => ({ items: [], count: 0 })) : { items: [], count: 0 };
  const accounts = tenantId ? await listAccounts(tenantId).catch(() => ({ items: [], count: 0 })) : { items: [], count: 0 };
  const journals = tenantId
    ? await listJournals({
        tenantId,
        entityId: entityId || undefined,
        from: from || undefined,
        to: to || undefined,
      }).catch(() => ({ items: [], count: 0 }))
    : { items: [], count: 0 };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Operations", ko: "운영" })}
        title={pick(locale, { en: "Journal Actions", ko: "전표 운영" })}
        description={pick(locale, {
          en: "Create manual journals and operate draft, posted, and source-linked journals in one place.",
          ko: "수기 전표를 생성하고 draft, posted, 원천 이벤트 연계 전표를 한곳에서 운영합니다.",
        })}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>
            {pick(locale, {
              en: "Load journals by company, accounting unit, and accounting date range.",
              ko: "회사, 회계 주체, 회계일 범위 기준으로 전표를 조회합니다.",
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
                <Label htmlFor="entityId">{pick(locale, { en: "Accounting Unit", ko: "회계 주체" })}</Label>
                <NativeSelect id="entityId" name="entityId" defaultValue={entityId}>
                  <option value="">{pick(locale, { en: "All accounting units", ko: "전체 회계 주체" })}</option>
                  {entities.items.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.code} · {entity.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="from">{pick(locale, { en: "From", ko: "시작일" })}</Label>
                <Input id="from" name="from" type="date" defaultValue={from} maxLength={10} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">{pick(locale, { en: "To", ko: "종료일" })}</Label>
                <Input id="to" name="to" type="date" defaultValue={to} maxLength={10} />
              </div>
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
          <CardTitle>{pick(locale, { en: "Create Manual Journal", ko: "수기 전표 생성" })}</CardTitle>
          <CardDescription>
            {pick(locale, {
              en: "Create a balanced two-line manual journal that is posted immediately.",
              ko: "차대합이 맞는 2라인 수기 전표를 생성하며, 생성 즉시 posted 상태가 됩니다.",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId ? (
            <ManualJournalForm
              locale={locale}
              tenantId={tenantId}
              entities={entities.items}
              accounts={accounts.items}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {pick(locale, { en: "Select a company first.", ko: "회사를 먼저 선택하세요." })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Journal Operations", ko: "전표 운영 목록" })}</CardTitle>
          <CardDescription>
            {tenantId
              ? pick(locale, { en: `${journals.count} journals`, ko: `${journals.count}건의 전표` })
              : pick(locale, { en: "Select a company to load journals.", ko: "전표를 보려면 회사를 선택하세요." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && journals.items.length > 0 ? (
            <JournalOperationsTable items={journals.items} tenantId={tenantId} locale={locale} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, { en: "No journals matched the current conditions.", ko: "현재 조건에 맞는 전표가 없습니다." })
                : pick(locale, { en: "Select a company first.", ko: "회사를 먼저 선택하세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
