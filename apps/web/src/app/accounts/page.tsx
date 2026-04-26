import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { AccountsTable } from "@/features/reference/accounts-table";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { listAccounts, listTenants } from "@/lib/api/reference";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string[] | string | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenants = await listTenants().catch(() => ({ items: [], count: 0 }));
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : (tenants.items[0]?.id ?? "");
  const data = tenantId ? await listAccounts(tenantId).catch(() => ({ items: [], count: 0 })) : { items: [], count: 0 };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Reference", ko: "기준정보" })}
        title={pick(locale, { en: "Accounts", ko: "계정과목" })}
        description={pick(locale, { en: "Review the account list used in journals and reports.", ko: "전표와 보고서에 쓰이는 계정과목 목록을 확인합니다." })}
      />
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>{pick(locale, { en: "Select a company to view the account list.", ko: "계정과목 목록을 보려면 회사를 선택하세요." })}</CardDescription>
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
            <Input type="submit" value={pick(locale, { en: "Load", ko: "조회" })} readOnly className="cursor-pointer font-medium" />
          </form>
        </CardContent>
      </Card>
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Chart of Accounts", ko: "계정과목 체계" })}</CardTitle>
          <CardDescription>{tenantId ? pick(locale, { en: `${data.count} accounts`, ko: `${data.count}개의 계정과목` }) : pick(locale, { en: "No company selected.", ko: "선택된 회사가 없습니다." })}</CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && data.items.length > 0 ? (
            <AccountsTable items={data.items} locale={locale} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {pick(locale, { en: "No accounts were found for the selected company.", ko: "선택한 회사에 계정과목 정보가 없습니다." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
