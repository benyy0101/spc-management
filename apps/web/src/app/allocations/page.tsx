import { PhaseTwoShell } from "@/components/phase-two-shell";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function AllocationsPage() {
  const locale = await getServerLocale();

  return (
    <PhaseTwoShell
      locale={locale}
      eyebrow={pick(locale, { en: "Operations", ko: "운영" })}
      title={pick(locale, { en: "Allocations", ko: "배분" })}
      description={pick(locale, {
        en: "This page will calculate investor allocations and show the saved results and history.",
        ko: "이 화면에서는 투자자 배분을 계산하고 저장된 결과와 이력을 보여줍니다.",
      })}
      apiItems={[
        pick(locale, { en: "View investor holding details", ko: "투자자 보유 현황 보기" }),
        pick(locale, { en: "Run allocation calculation", ko: "배분 계산 실행" }),
        pick(locale, { en: "Review saved allocation results", ko: "저장된 배분 결과 확인" }),
        pick(locale, { en: "Open detailed result by case", ko: "건별 상세 결과 확인" }),
      ]}
      nextItems={[
        pick(locale, { en: "Add fund and period filters.", ko: "펀드와 기간 선택 기능 추가" }),
        pick(locale, { en: "Add a form to run allocations and see the results.", ko: "배분 실행 입력창과 결과 목록 추가" }),
        pick(locale, { en: "Open allocation history for each investor.", ko: "투자자별 배분 이력 보기 추가" }),
      ]}
    />
  );
}
