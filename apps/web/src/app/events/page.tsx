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
        eyebrow={pick(locale, { en: "Events", ko: "이벤트" })}
        title={pick(locale, { en: "Accounting Events", ko: "회계 이벤트" })}
        description={pick(locale, {
          en: "This screen will consume GET /events and provide the primary audit trail from business event to generated journals.",
          ko: "이 화면은 GET /events를 사용해 업무 이벤트에서 생성 전표로 이어지는 핵심 감사 추적 경로를 제공합니다.",
        })}
      />
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>{pick(locale, { en: "Provide at least a tenant ID to query the API.", ko: "API 조회를 위해 최소한 tenant ID가 필요합니다." })}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-5">
            <Input name="tenantId" placeholder={pick(locale, { en: "Tenant UUID", ko: "Tenant UUID" })} defaultValue={tenantId} />
            <Input name="entityId" placeholder={pick(locale, { en: "Entity UUID", ko: "Entity UUID" })} defaultValue={entityId} />
            <Input name="eventType" placeholder={pick(locale, { en: "interest_accrual", ko: "interest_accrual" })} defaultValue={eventType} />
            <Input name="from" type="date" defaultValue={from} />
            <Input name="to" type="date" defaultValue={to} />
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Results", ko: "결과" })}</CardTitle>
          <CardDescription>{tenantId ? pick(locale, { en: `${data.count} event(s)`, ko: `${data.count}건의 이벤트` }) : pick(locale, { en: "Enter a tenant ID to load events.", ko: "이벤트를 불러오려면 tenant ID를 입력하세요." })}</CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && data.items.length > 0 ? (
            <EventsTable items={data.items} locale={locale} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, { en: "The API returned no matching events for the current filter set.", ko: "현재 필터 조건에 맞는 이벤트가 없습니다." })
                : pick(locale, { en: "No request has been sent yet. Start by entering the tenant ID from the seeded API environment.", ko: "아직 요청이 전송되지 않았습니다. seeded 환경의 tenant ID부터 입력하세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
