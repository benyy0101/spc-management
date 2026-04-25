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
        en: "This screen will display investor ownership ratios, commitments, and paid-in balances before allocation runs.",
        ko: "이 화면은 배분 실행 전 투자자 지분율, 약정금액, 납입금액을 검토하는 화면입니다.",
      })}
      apiItems={["GET /investor-positions", "GET /investors/:id/allocation-history"]}
      nextItems={[
        pick(locale, { en: "Add fund filter and position table.", ko: "fund 필터와 포지션 테이블 추가" }),
        pick(locale, { en: "Expose ownership and paid-in views.", ko: "지분율과 납입금 뷰 노출" }),
        pick(locale, { en: "Link to allocation history by investor.", ko: "투자자별 배분 이력 연결" }),
      ]}
    />
  );
}
