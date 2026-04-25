import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { JournalsTable } from "@/features/journals/journals-table";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { listJournals } from "@/lib/api/journals";

export default async function JournalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : "";
  const entityId = typeof query.entityId === "string" ? query.entityId : "";
  const from = typeof query.from === "string" ? query.from : "";
  const to = typeof query.to === "string" ? query.to : "";

  const data =
    tenantId
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
        eyebrow={pick(locale, { en: "Journals", ko: "전표" })}
        title={pick(locale, { en: "Journal Review", ko: "전표 검토" })}
        description={pick(locale, {
          en: "This view will become the main accounting review surface, backed by GET /journals and GET /journals/:id.",
          ko: "이 화면은 GET /journals와 GET /journals/:id를 기반으로 전표 검토의 핵심 화면이 됩니다.",
        })}
      />
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>{pick(locale, { en: "Provide at least a tenant ID to query journals.", ko: "전표 조회를 위해 최소한 tenant ID가 필요합니다." })}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4">
            <Input name="tenantId" placeholder="Tenant UUID" defaultValue={tenantId} />
            <Input name="entityId" placeholder="Entity UUID" defaultValue={entityId} />
            <Input name="from" type="date" defaultValue={from} />
            <Input name="to" type="date" defaultValue={to} />
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Results", ko: "결과" })}</CardTitle>
          <CardDescription>{tenantId ? pick(locale, { en: `${data.count} journal(s)`, ko: `${data.count}건의 전표` }) : pick(locale, { en: "Enter a tenant ID to load journals.", ko: "전표를 불러오려면 tenant ID를 입력하세요." })}</CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && data.items.length > 0 ? (
            <JournalsTable items={data.items} tenantId={tenantId} locale={locale} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, { en: "The API returned no matching journals for the current filter set.", ko: "현재 필터 조건에 맞는 전표가 없습니다." })
                : pick(locale, { en: "No request has been sent yet. Start by entering the tenant ID from the seeded API environment.", ko: "아직 요청이 전송되지 않았습니다. seeded 환경의 tenant ID부터 입력하세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
