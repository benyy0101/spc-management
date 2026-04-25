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
          en: "Manage account-to-line mappings that drive the balance sheet, profit and loss, and cash flow statements.",
          ko: "재무상태표, 손익계산서, 현금흐름표를 구동하는 계정-라인 매핑을 관리합니다.",
        })}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>
            {pick(locale, {
              en: "Select a tenant to review and maintain statement mappings.",
              ko: "재무제표 매핑을 조회하고 관리할 tenant를 선택하세요.",
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
          <CardTitle>{pick(locale, { en: "Statement Mapping Rows", ko: "재무제표 매핑 목록" })}</CardTitle>
          <CardDescription>
            {tenantId
              ? pick(locale, {
                  en: `${mappings.count} mapping row(s) · ${accounts.count} account row(s) available`,
                  ko: `${mappings.count}개의 매핑 · ${accounts.count}개의 계정과목 사용 가능`,
                })
              : pick(locale, { en: "No tenant selected.", ko: "선택된 tenant가 없습니다." })}
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
                en: "Select a tenant to load statement mapping rows.",
                ko: "재무제표 매핑을 불러오려면 tenant를 선택하세요.",
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
