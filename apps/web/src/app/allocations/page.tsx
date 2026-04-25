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
        en: "This page will run pro-rata investor allocations and expose the saved allocation results and history.",
        ko: "이 페이지는 지분율 기준 투자자 배분을 실행하고 저장된 배분 결과와 이력을 보여줍니다.",
      })}
      apiItems={["GET /investor-positions", "POST /allocations/run", "GET /allocations", "GET /allocations/:id"]}
      nextItems={[
        pick(locale, { en: "Add fund entity and period filters.", ko: "fund entity와 기간 필터 추가" }),
        pick(locale, { en: "Expose run-allocation form and result list.", ko: "배분 실행 폼과 결과 목록 노출" }),
        pick(locale, { en: "Link into investor-level history drill-down.", ko: "투자자별 이력 drill-down 연결" }),
      ]}
    />
  );
}
