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
        en: "This page will show work history such as journal entry, approval, cancellation, and correction.",
        ko: "이 화면에서는 전표 입력, 승인, 취소, 정정 같은 업무 이력을 확인합니다.",
      })}
      apiItems={[pick(locale, { en: "View work history", ko: "업무 이력 보기" })]}
      nextItems={[
        pick(locale, { en: "Add filters by work type and target.", ko: "업무 유형과 대상별 필터 추가" }),
        pick(locale, { en: "Show the latest history first.", ko: "최신 이력부터 표시" }),
        pick(locale, { en: "Open detailed information in a popup.", ko: "상세 내용을 팝업으로 표시" }),
      ]}
    />
  );
}
