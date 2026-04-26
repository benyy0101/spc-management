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
        en: "This page will manage accounting periods from open to closed and reopened.",
        ko: "이 화면에서는 회계 기간을 시작, 마감, 재개 상태로 관리합니다.",
      })}
      apiItems={[
        pick(locale, { en: "View closing schedule", ko: "마감 일정 보기" }),
        pick(locale, { en: "Register a closing period", ko: "마감 기간 등록" }),
        pick(locale, { en: "Change closing status", ko: "마감 상태 변경" }),
      ]}
      nextItems={[
        pick(locale, { en: "Show the closing list by company, accounting unit, and ledger.", ko: "회사, 회계 단위, 장부별 마감 목록 표시" }),
        pick(locale, { en: "Add a registration form and status change actions.", ko: "등록창과 상태 변경 기능 추가" }),
        pick(locale, { en: "Show when additional journal posting is blocked.", ko: "추가 전표 입력 제한 여부 표시" }),
      ]}
    />
  );
}
