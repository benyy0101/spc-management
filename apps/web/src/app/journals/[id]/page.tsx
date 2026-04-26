import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { JournalLinesTable } from "@/features/journals/journal-lines-table";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { getJournalById } from "@/lib/api/journals";
import { cn } from "@/lib/utils";

export default async function JournalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const { id } = await params;
  const query = await searchParams;
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : "";

  const journal = tenantId ? await getJournalById(tenantId, id).catch(() => null) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Journals", ko: "전표" })}
        title={journal ? journal.journalNo : pick(locale, { en: "Journal Detail", ko: "전표 상세" })}
        description={pick(locale, {
          en: "Review the journal summary and its detailed entries.",
          ko: "전표의 기본 정보와 상세 내역을 확인합니다.",
        })}
        action={
          <Link href={tenantId ? `/journals?tenantId=${encodeURIComponent(tenantId)}` : "/journals"} className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}>
            <ChevronLeft className="size-4" />
            {pick(locale, { en: "Back to journals", ko: "전표 목록으로" })}
          </Link>
        }
      />

      {journal ? (
        <>
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{pick(locale, { en: "Basic Information", ko: "기본 정보" })}</CardTitle>
              <CardDescription>{pick(locale, { en: "Summary information for this journal.", ko: "이 전표의 요약 정보입니다." })}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{pick(locale, { en: "Journal No", ko: "전표번호" })}</dt>
                  <dd className="mt-2 text-sm font-medium">{journal.journalNo}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{pick(locale, { en: "Accounting Date", ko: "회계일" })}</dt>
                  <dd className="mt-2 text-sm">{journal.accountingDate}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{pick(locale, { en: "Accounting Unit", ko: "회계 단위" })}</dt>
                  <dd className="mt-2 text-sm">{journal.entityCode}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{pick(locale, { en: "Book", ko: "장부" })}</dt>
                  <dd className="mt-2 text-sm">{journal.bookCode}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{pick(locale, { en: "Status", ko: "상태" })}</dt>
                  <dd className="mt-2 text-sm">{journal.postingStatus}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{pick(locale, { en: "Journal Type", ko: "전표 유형" })}</dt>
                  <dd className="mt-2 text-sm">{journal.journalType}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{pick(locale, { en: "Source Transaction", ko: "원거래" })}</dt>
                  <dd className="mt-2 text-sm">{journal.sourceEventId ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{pick(locale, { en: "Processed At", ko: "처리 시각" })}</dt>
                  <dd className="mt-2 text-sm">{journal.postedAt ?? "-"}</dd>
                </div>
              </dl>
              <div className="mt-6 rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm">
                <span className="font-medium">{pick(locale, { en: "Description:", ko: "설명:" })}</span> {journal.description ?? pick(locale, { en: "No description", ko: "설명 없음" })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{pick(locale, { en: "Details", ko: "상세 내역" })}</CardTitle>
              <CardDescription>{pick(locale, { en: `${journal.lines?.length ?? 0} entries in this journal.`, ko: `이 전표에는 ${journal.lines?.length ?? 0}개의 내역이 있습니다.` })}</CardDescription>
            </CardHeader>
            <CardContent>
              {journal.lines && journal.lines.length > 0 ? (
                <JournalLinesTable lines={journal.lines} locale={locale} />
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
                  {pick(locale, { en: "There are no detailed entries for this journal.", ko: "이 전표에 표시할 상세 내역이 없습니다." })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="pt-4">
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, { en: "The journal could not be found for the selected company.", ko: "선택한 회사에서 해당 전표를 찾지 못했습니다." })
                : pick(locale, { en: "A company code is required to open the journal detail.", ko: "전표 상세를 보려면 회사 코드가 필요합니다." })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
