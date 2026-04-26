import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { CreateClosePeriodForm } from "@/features/close-periods/create-close-period-form";
import { ClosePeriodsTable } from "@/features/close-periods/close-periods-table";
import { listClosePeriods } from "@/lib/api/close-periods";
import { listEntities, listTenants } from "@/lib/api/reference";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function ClosePeriodsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenants = await listTenants().catch(() => ({ items: [], count: 0 }));
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : (tenants.items[0]?.id ?? "");
  const entityId = typeof query.entityId === "string" ? query.entityId : "";
  const bookId = typeof query.bookId === "string" ? query.bookId : "";
  const status = typeof query.status === "string" ? query.status : "";
  const entities = tenantId ? await listEntities(tenantId).catch(() => ({ items: [], count: 0 })) : { items: [], count: 0 };
  const data = tenantId
    ? await listClosePeriods({
        tenantId,
        entityId: entityId || undefined,
        bookId: bookId || undefined,
        status: status ? (status as "open" | "closing" | "closed" | "reopened") : undefined,
      }).catch(() => ({ items: [], count: 0 }))
    : { items: [], count: 0 };

  const bookOptions = [...new Map(data.items.map((item) => [item.bookId, { id: item.bookId, code: item.bookCode }])).values()];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Operations", ko: "운영" })}
        title={pick(locale, { en: "Close Periods", ko: "마감 관리" })}
        description={pick(locale, {
          en: "Manage accounting close periods by company, accounting unit, and ledger.",
          ko: "회사, 회계 주체, 장부 기준으로 회계 마감 기간을 관리합니다.",
        })}
        action={tenantId ? <CreateClosePeriodForm locale={locale} tenantId={tenantId} entities={entities.items} closePeriods={data.items} /> : undefined}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>
            {pick(locale, {
              en: "Select a company first, then narrow the close period list by accounting unit, ledger, and status.",
              ko: "회사를 먼저 선택하고 회계 주체, 장부, 상태로 마감 목록을 좁혀보세요.",
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
                <Label htmlFor="bookId">{pick(locale, { en: "Ledger", ko: "장부" })}</Label>
                <NativeSelect id="bookId" name="bookId" defaultValue={bookId}>
                  <option value="">{pick(locale, { en: "All ledgers", ko: "전체 장부" })}</option>
                  {bookOptions.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.code}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{pick(locale, { en: "Status", ko: "상태" })}</Label>
                <NativeSelect id="status" name="status" defaultValue={status}>
                  <option value="">{pick(locale, { en: "All statuses", ko: "전체 상태" })}</option>
                  <option value="open">open</option>
                  <option value="closing">closing</option>
                  <option value="closed">closed</option>
                  <option value="reopened">reopened</option>
                </NativeSelect>
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
          <CardTitle>{pick(locale, { en: "Close Period List", ko: "마감 목록" })}</CardTitle>
          <CardDescription>
            {tenantId
              ? pick(locale, { en: `${data.count} close periods`, ko: `${data.count}건의 마감 기간` })
              : pick(locale, { en: "Select a company to load close periods.", ko: "마감 목록을 보려면 회사를 선택하세요." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && data.items.length > 0 ? (
            <ClosePeriodsTable locale={locale} tenantId={tenantId} items={data.items} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, {
                    en: "No close periods matched the current filters.",
                    ko: "현재 조건에 맞는 마감 기간이 없습니다.",
                  })
                : pick(locale, {
                    en: "Select a company first.",
                    ko: "회사를 먼저 선택하세요.",
                  })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
