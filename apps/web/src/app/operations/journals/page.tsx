import { PhaseTwoShell } from "@/components/phase-two-shell";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function JournalOperationsPage() {
  const locale = await getServerLocale();

  return (
    <PhaseTwoShell
      locale={locale}
      eyebrow={pick(locale, { en: "Operations", ko: "운영" })}
      title={pick(locale, { en: "Journal Actions", ko: "전표 운영" })}
      description={pick(locale, {
        en: "This page will group manual journal creation, approval, reversal, and source-event reprocess actions into one operational surface.",
        ko: "이 페이지는 수기전표 생성, 승인, 역분개, 원천 이벤트 재처리 액션을 하나의 운영 화면으로 묶습니다.",
      })}
      apiItems={[
        "POST /journals/manual",
        "POST /journals/:id/approve",
        "POST /journals/:id/reverse",
        "POST /events/:id/reprocess",
      ]}
      nextItems={[
        pick(locale, { en: "Add manual journal form.", ko: "수기전표 입력 폼 추가" }),
        pick(locale, { en: "Expose approve and reverse actions from journal lists.", ko: "전표 목록에서 승인·역분개 액션 노출" }),
        pick(locale, { en: "Add event reprocess controls for source events.", ko: "원천 이벤트 재처리 컨트롤 추가" }),
      ]}
    />
  );
}
