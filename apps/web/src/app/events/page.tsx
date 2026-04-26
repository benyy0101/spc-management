import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { EventsTable } from "@/features/events/events-table";
import { listEvents } from "@/lib/api/events";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : "";
  const entityId = typeof query.entityId === "string" ? query.entityId : "";
  const eventType = typeof query.eventType === "string" ? query.eventType : "";
  const from = typeof query.from === "string" ? query.from : "";
  const to = typeof query.to === "string" ? query.to : "";

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
          <CardDescription>{pick(locale, { en: "Select a company code to search transactions.", ko: "거래를 찾으려면 회사 코드를 입력하세요." })}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-5">
            <Input name="tenantId" placeholder={pick(locale, { en: "Company code", ko: "회사 코드" })} defaultValue={tenantId} />
            <Input name="entityId" placeholder={pick(locale, { en: "Accounting unit code", ko: "회계 단위 코드" })} defaultValue={entityId} />
            <Input name="eventType" placeholder={pick(locale, { en: "Transaction type", ko: "거래 유형" })} defaultValue={eventType} />
            <Input name="from" type="date" defaultValue={from} />
            <Input name="to" type="date" defaultValue={to} />
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
