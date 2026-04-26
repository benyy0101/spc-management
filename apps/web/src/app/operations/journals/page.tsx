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
        en: "This page will bring journal entry, approval, cancellation, and correction work into one place.",
        ko: "이 화면에서는 수기 입력, 승인, 취소, 정정 같은 전표 업무를 한곳에서 처리합니다.",
      })}
      apiItems={[
        pick(locale, { en: "Enter a manual journal", ko: "수기 전표 입력" }),
        pick(locale, { en: "Approve a prepared journal", ko: "작성된 전표 승인" }),
        pick(locale, { en: "Cancel a journal entry", ko: "전표 취소 처리" }),
        pick(locale, { en: "Correct a source transaction and process again", ko: "원거래 정정 후 다시 처리" }),
      ]}
      nextItems={[
        pick(locale, { en: "Add a manual journal entry form.", ko: "수기 전표 입력창 추가" }),
        pick(locale, { en: "Add approval and cancellation buttons to the journal list.", ko: "전표 목록에 승인과 취소 버튼 추가" }),
        pick(locale, { en: "Add controls to correct and rerun source transactions.", ko: "원거래 정정 및 재처리 기능 추가" }),
      ]}
    />
  );
}
