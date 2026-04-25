import { PhaseTwoShell } from "@/components/phase-two-shell";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function ClosePeriodsPage() {
  const locale = await getServerLocale();

  return (
    <PhaseTwoShell
      locale={locale}
      eyebrow={pick(locale, { en: "Operations", ko: "운영" })}
      title={pick(locale, { en: "Close Periods", ko: "마감 관리" })}
      description={pick(locale, {
        en: "This page will let operators create close periods and move them through open, closing, closed, and reopened states.",
        ko: "이 페이지는 운영자가 마감 기간을 생성하고 open, closing, closed, reopened 상태로 전이시키는 화면입니다.",
      })}
      apiItems={["GET /close-periods", "POST /close-periods", "PATCH /close-periods/:id/status"]}
      nextItems={[
        pick(locale, { en: "List close periods by tenant, entity, and book.", ko: "tenant, entity, book 기준 마감 목록 표시" }),
        pick(locale, { en: "Add create form and state transition actions.", ko: "생성 폼과 상태 전이 액션 추가" }),
        pick(locale, { en: "Expose posting-block context in the UI.", ko: "posting 차단 컨텍스트를 화면에 노출" }),
      ]}
    />
  );
}
