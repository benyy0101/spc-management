import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { EventsTable } from "@/features/events/events-table";
import { listEvents } from "@/lib/api/events";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { listEntities, listTenants } from "@/lib/api/reference";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenants = await listTenants().catch(() => ({ items: [], count: 0 }));
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : (tenants.items[0]?.id ?? "");
  const entityId = typeof query.entityId === "string" ? query.entityId : "";
  const eventType = typeof query.eventType === "string" ? query.eventType : "";
  const from = typeof query.from === "string" ? query.from : "";
  const to = typeof query.to === "string" ? query.to : "";
  const entities = tenantId ? await listEntities(tenantId).catch(() => ({ items: [], count: 0 })) : { items: [], count: 0 };

  const data =
    tenantId
      ? await listEvents({
          tenantId,
          entityId: entityId || undefined,
          eventType: eventType || undefined,
          from: from || undefined,
          to: to || undefined,
        }).catch(() => ({ items: [], count: 0 }))
      : { items: [], count: 0 };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Transactions", ko: "거래" })}
        title={pick(locale, { en: "Transaction History", ko: "거래 내역" })}
        description={pick(locale, {
          en: "Review entered transactions and trace them to the journals created from them.",
          ko: "입력된 거래와 그에 따라 생성된 전표 흐름을 확인합니다.",
        })}
      />
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>{pick(locale, { en: "Select company, accounting unit, and transaction type to search transactions.", ko: "회사, 회계 단위, 거래 유형을 선택해 거래를 조회하세요." })}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                <Label htmlFor="entityId">{pick(locale, { en: "Accounting Unit", ko: "회계 단위" })}</Label>
                <NativeSelect id="entityId" name="entityId" defaultValue={entityId}>
                  <option value="">{pick(locale, { en: "All accounting units", ko: "전체 회계 단위" })}</option>
                  {entities.items.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.code} · {entity.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">{pick(locale, { en: "Transaction Type", ko: "거래 유형" })}</Label>
                <NativeSelect id="eventType" name="eventType" defaultValue={eventType}>
                  <option value="">{pick(locale, { en: "All transaction types", ko: "전체 거래 유형" })}</option>
                  <option value="loan_origination">{pick(locale, { en: "Loan Origination", ko: "대출 실행" })}</option>
                  <option value="interest_accrual">{pick(locale, { en: "Interest Accrual", ko: "이자 발생" })}</option>
                  <option value="principal_repayment">{pick(locale, { en: "Principal Repayment", ko: "원금 상환" })}</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="from">{pick(locale, { en: "From", ko: "시작일" })}</Label>
                <Input id="from" name="from" type="date" defaultValue={from} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">{pick(locale, { en: "To", ko: "종료일" })}</Label>
                <Input id="to" name="to" type="date" defaultValue={to} />
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
          <CardTitle>{pick(locale, { en: "Results", ko: "결과" })}</CardTitle>
          <CardDescription>{tenantId ? pick(locale, { en: `${data.count} transactions`, ko: `${data.count}건의 거래` }) : pick(locale, { en: "Enter a company code to load transactions.", ko: "거래를 보려면 회사 코드를 입력하세요." })}</CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && data.items.length > 0 ? (
            <EventsTable items={data.items} locale={locale} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, { en: "No transactions matched the current conditions.", ko: "현재 조건에 맞는 거래가 없습니다." })
                : pick(locale, { en: "Start by entering a company code.", ko: "회사 코드부터 입력해 주세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
