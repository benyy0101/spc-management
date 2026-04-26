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
        title={pick(locale, { en: "Journal Review", ko: "전표 조회" })}
        description={pick(locale, {
          en: "Review created journals and check their status, source transaction, and details.",
          ko: "생성된 전표를 조회하고 상태, 원거래, 상세 내역을 확인합니다.",
        })}
      />
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>{pick(locale, { en: "Enter a company code to search journals.", ko: "전표를 찾으려면 회사 코드를 입력하세요." })}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4">
            <Input name="tenantId" placeholder={pick(locale, { en: "Company code", ko: "회사 코드" })} defaultValue={tenantId} />
            <Input name="entityId" placeholder={pick(locale, { en: "Accounting unit code", ko: "회계 단위 코드" })} defaultValue={entityId} />
            <Input name="from" type="date" defaultValue={from} />
            <Input name="to" type="date" defaultValue={to} />
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Results", ko: "결과" })}</CardTitle>
          <CardDescription>{tenantId ? pick(locale, { en: `${data.count} journals`, ko: `${data.count}건의 전표` }) : pick(locale, { en: "Enter a company code to load journals.", ko: "전표를 보려면 회사 코드를 입력하세요." })}</CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && data.items.length > 0 ? (
            <JournalsTable items={data.items} tenantId={tenantId} locale={locale} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, { en: "No journals matched the current conditions.", ko: "현재 조건에 맞는 전표가 없습니다." })
                : pick(locale, { en: "Start by entering a company code.", ko: "회사 코드부터 입력해 주세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
