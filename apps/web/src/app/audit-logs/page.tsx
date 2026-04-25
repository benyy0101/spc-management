import { PhaseTwoShell } from "@/components/phase-two-shell";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function AuditLogsPage() {
  const locale = await getServerLocale();

  return (
    <PhaseTwoShell
      locale={locale}
      eyebrow={pick(locale, { en: "Operations", ko: "운영" })}
      title={pick(locale, { en: "Audit Logs", ko: "감사 로그" })}
      description={pick(locale, {
        en: "This page will expose operational history for posting, manual journals, approvals, reversals, and reprocess actions.",
        ko: "이 페이지는 posting, 수기전표, 승인, 역분개, 재처리 같은 운영 이력을 보여줍니다.",
      })}
      apiItems={["GET /audit-logs"]}
      nextItems={[
        pick(locale, { en: "Add filters for action type, resource type, and resource id.", ko: "action type, resource type, resource id 필터 추가" }),
        pick(locale, { en: "Render logs in reverse chronological order.", ko: "최신순 감사 로그 렌더링" }),
        pick(locale, { en: "Expose payload detail in a dialog.", ko: "payload 상세를 dialog로 노출" }),
      ]}
    />
  );
}
