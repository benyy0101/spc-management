import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/page-header";
import { AuditLogsTable } from "@/features/audit-logs/audit-logs-table";
import { listAuditLogs } from "@/lib/api/audit-logs";
import { listTenants } from "@/lib/api/reference";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const query = await searchParams;
  const tenants = await listTenants().catch(() => ({ items: [], count: 0 }));
  const tenantId = typeof query.tenantId === "string" ? query.tenantId : (tenants.items[0]?.id ?? "");
  const actionType = typeof query.actionType === "string" ? query.actionType : "";
  const resourceType = typeof query.resourceType === "string" ? query.resourceType : "";
  const resourceId = typeof query.resourceId === "string" ? query.resourceId : "";
  const data = tenantId
    ? await listAuditLogs({
        tenantId,
        actionType: actionType || undefined,
        resourceType: resourceType || undefined,
        resourceId: resourceId || undefined,
      }).catch(() => ({ items: [], count: 0 }))
    : { items: [], count: 0 };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Operations", ko: "운영" })}
        title={pick(locale, { en: "Audit Logs", ko: "감사 로그" })}
        description={pick(locale, {
          en: "Review work history such as manual journal entry, approval, reversal, and event reprocessing.",
          ko: "수기 전표 입력, 승인, 역분개, 이벤트 재처리 같은 업무 이력을 검토합니다.",
        })}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{pick(locale, { en: "Filters", ko: "필터" })}</CardTitle>
          <CardDescription>
            {pick(locale, {
              en: "Filter logs by company, action type, resource type, or one specific resource ID.",
              ko: "회사, 액션 유형, 대상 유형, 특정 대상 ID 기준으로 로그를 필터링합니다.",
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
                <Label htmlFor="actionType">{pick(locale, { en: "Action Type", ko: "액션 유형" })}</Label>
                <Input id="actionType" name="actionType" defaultValue={actionType} placeholder="approve_journal" maxLength={64} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resourceType">{pick(locale, { en: "Resource Type", ko: "대상 유형" })}</Label>
                <Input id="resourceType" name="resourceType" defaultValue={resourceType} placeholder="journal" maxLength={64} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resourceId">{pick(locale, { en: "Resource ID", ko: "대상 ID" })}</Label>
                <Input id="resourceId" name="resourceId" defaultValue={resourceId} placeholder="uuid" maxLength={64} />
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
          <CardTitle>{pick(locale, { en: "Audit Log List", ko: "감사 로그 목록" })}</CardTitle>
          <CardDescription>
            {tenantId
              ? pick(locale, { en: `${data.count} log entries`, ko: `${data.count}건의 로그` })
              : pick(locale, { en: "Select a company to load audit logs.", ko: "감사 로그를 보려면 회사를 선택하세요." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenantId && data.items.length > 0 ? (
            <AuditLogsTable locale={locale} items={data.items} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
              {tenantId
                ? pick(locale, { en: "No audit logs matched the current conditions.", ko: "현재 조건에 맞는 감사 로그가 없습니다." })
                : pick(locale, { en: "Select a company first.", ko: "회사를 먼저 선택하세요." })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
