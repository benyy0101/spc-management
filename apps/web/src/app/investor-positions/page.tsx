import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { AllocationsTable } from "@/features/allocations/allocations-table";
import { InvestorPositionsBrowser } from "@/features/allocations/investor-positions-browser";
import { getInvestorAllocationHistory, listInvestorPositions } from "@/lib/api/allocations";
import { listEntities, listTenants } from "@/lib/api/reference";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function InvestorPositionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenants = await listTenants().catch(() => ({ items: [], count: 0 }));
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : (tenants.items[0]?.id ?? "");
  const entities = tenantId ? await listEntities(tenantId).catch(() => ({ items: [], count: 0 })) : { items: [], count: 0 };
  const funds = entities.items.filter((entity) => entity.entityType === "fund");
  const fundCandidates = funds.length > 0 ? funds : entities.items;
  const fundEntityId = typeof query.fundEntityId === "string" ? query.fundEntityId : (fundCandidates[0]?.id ?? "");
  const investorId = typeof query.investorId === "string" ? query.investorId : "";
  const positions = tenantId && fundEntityId
    ? await listInvestorPositions({
        tenantId,
        fundEntityId,
      }).catch(() => ({ items: [], count: 0 }))
    : { items: [], count: 0 };
  const selectedInvestorId = investorId || positions.items[0]?.investorId || "";
  const history = tenantId && selectedInvestorId
    ? await getInvestorAllocationHistory(tenantId, selectedInvestorId).catch(() => ({ items: [], count: 0 }))
    : { items: [], count: 0 };
  const selectedInvestor = positions.items.find((item) => item.investorId === selectedInvestorId) ?? null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Operations", ko: "운영" })}
        title={pick(locale, { en: "Investor Positions", ko: "투자자 포지션" })}
        description={pick(locale, {
          en: "Review investor ownership, commitments, paid-in balances, and past allocation history by fund.",
          ko: "펀드 기준으로 투자자 지분, 약정금액, 납입금액, 과거 배분 이력을 검토합니다.",
        })}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>
            {pick(locale, {
              en: "Choose a company and fund to load current investor positions.",
              ko: "회사와 펀드를 선택해 현재 투자자 포지션을 조회합니다.",
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
                <Label htmlFor="fundEntityId">{pick(locale, { en: "Fund", ko: "펀드" })}</Label>
                <NativeSelect id="fundEntityId" name="fundEntityId" defaultValue={fundEntityId}>
                  {fundCandidates.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.code} · {entity.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="investorId">{pick(locale, { en: "Investor ID", ko: "투자자 ID" })}</Label>
                <Input
                  id="investorId"
                  name="investorId"
                  defaultValue={investorId}
                  placeholder={pick(locale, { en: "Optional", ko: "선택 사항" })}
                  maxLength={64}
                />
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
          <CardTitle>{pick(locale, { en: "Current Positions", ko: "현재 포지션" })}</CardTitle>
          <CardDescription>
            {tenantId && fundEntityId
              ? pick(locale, { en: `${positions.count} investor positions`, ko: `${positions.count}건의 투자자 포지션` })
              : pick(locale, { en: "Select a company and fund first.", ko: "회사와 펀드를 먼저 선택하세요." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && fundEntityId && positions.items.length > 0 ? (
            <InvestorPositionsBrowser locale={locale} items={positions.items} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId && fundEntityId
                ? pick(locale, { en: "No investor positions were found for the selected fund.", ko: "선택한 펀드에 대한 투자자 포지션이 없습니다." })
                : pick(locale, { en: "Select a company and fund first.", ko: "회사와 펀드를 먼저 선택하세요." })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Allocation History", ko: "배분 이력" })}</CardTitle>
          <CardDescription>
            {selectedInvestor
              ? pick(locale, {
                  en: `${selectedInvestor.investorCode} · ${selectedInvestor.investorName}`,
                  ko: `${selectedInvestor.investorCode} · ${selectedInvestor.investorName}`,
                })
              : pick(locale, {
                  en: "Select one investor from the current positions list.",
                  ko: "현재 포지션 목록에서 투자자 한 명을 선택하세요.",
                })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedInvestorId && history.items.length > 0 ? (
            <AllocationsTable locale={locale} items={history.items} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {selectedInvestorId
                ? pick(locale, { en: "No allocation history was found for the selected investor.", ko: "선택한 투자자에 대한 배분 이력이 없습니다." })
                : pick(locale, { en: "Select one investor from the current positions list.", ko: "현재 포지션 목록에서 투자자 한 명을 선택하세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
