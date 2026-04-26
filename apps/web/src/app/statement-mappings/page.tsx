import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { StatementMappingsTable } from "@/features/financial-statements/statement-mappings-table";
import { listAccounts, listTenants } from "@/lib/api/reference";
import { listStatementMappings } from "@/lib/api/statement-mappings";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function StatementMappingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenants = await listTenants().catch(() => ({ items: [], count: 0 }));
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : (tenants.items[0]?.id ?? "");

  const [accounts, mappings] = tenantId
    ? await Promise.all([
        listAccounts(tenantId).catch(() => ({ items: [], count: 0 })),
        listStatementMappings(tenantId).catch(() => ({ items: [], count: 0 })),
      ])
    : [{ items: [], count: 0 }, { items: [], count: 0 }];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Financial", ko: "재무보고" })}
        title={pick(locale, { en: "Statement Mappings", ko: "재무제표 매핑" })}
        description={pick(locale, {
          en: "Manage how each account appears in the balance sheet, profit and loss, and cash flow statements.",
          ko: "계정과목이 재무상태표, 손익계산서, 현금흐름표에 어떻게 표시되는지 관리합니다.",
        })}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>
            {pick(locale, {
              en: "Select a company to review statement settings.",
              ko: "재무제표 표시 기준을 보려면 회사를 선택하세요.",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[minmax(220px,320px)_auto]">
            <NativeSelect name="tenantId" defaultValue={tenantId}>
              {tenants.items.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.code} · {tenant.name}
                </option>
              ))}
            </NativeSelect>
            <Input
              type="submit"
              value={pick(locale, { en: "Load", ko: "조회" })}
              readOnly
              className="cursor-pointer font-medium"
            />
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Statement Settings", ko: "재무제표 표시 기준" })}</CardTitle>
          <CardDescription>
            {tenantId
              ? pick(locale, {
                  en: `${mappings.count} settings · ${accounts.count} accounts available`,
                  ko: `${mappings.count}개의 설정 · ${accounts.count}개의 계정과목`,
                })
              : pick(locale, { en: "No company selected.", ko: "선택된 회사가 없습니다." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && mappings.items.length > 0 ? (
            <StatementMappingsTable
              locale={locale}
              tenantId={tenantId}
              accounts={accounts.items}
              items={mappings.items}
            />
          ) : tenantId ? (
            <StatementMappingsTable
              locale={locale}
              tenantId={tenantId}
              accounts={accounts.items}
              items={[]}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {pick(locale, {
                en: "Select a company to load statement settings.",
                ko: "재무제표 표시 기준을 보려면 회사를 선택하세요.",
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
