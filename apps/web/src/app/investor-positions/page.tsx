import { PhaseTwoShell } from "@/components/phase-two-shell";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function InvestorPositionsPage() {
  const locale = await getServerLocale();

  return (
    <PhaseTwoShell
      locale={locale}
      eyebrow={pick(locale, { en: "Operations", ko: "운영" })}
      title={pick(locale, { en: "Investor Positions", ko: "투자자 포지션" })}
      description={pick(locale, {
        en: "This screen will show investor ownership, commitments, and paid-in balances before allocation.",
        ko: "이 화면에서는 배분 전에 투자자 지분, 약정금액, 납입금액을 확인합니다.",
      })}
      apiItems={[
        pick(locale, { en: "View investor ownership details", ko: "투자자 지분 현황 보기" }),
        pick(locale, { en: "Check past allocation history", ko: "지난 배분 이력 확인" }),
      ]}
      nextItems={[
        pick(locale, { en: "Add fund selection and list view.", ko: "펀드 선택과 목록 화면 추가" }),
        pick(locale, { en: "Show ownership and paid-in amounts.", ko: "지분율과 납입금 표시" }),
        pick(locale, { en: "Open allocation history by investor.", ko: "투자자별 배분 이력 보기 추가" }),
      ]}
    />
  );
}
