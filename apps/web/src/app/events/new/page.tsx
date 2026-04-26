import { PageHeader } from "@/components/page-header";
import { NewEventForm } from "@/features/events/new-event-form";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function NewEventPage() {
  const locale = await getServerLocale();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Transactions", ko: "거래" })}
        title={pick(locale, { en: "Enter New Transaction", ko: "새 거래 입력" })}
        description={pick(locale, {
          en: "Use this form to enter the main loan-related transactions used in daily work.",
          ko: "이 화면에서는 대출 관련 주요 거래를 입력할 수 있습니다.",
        })}
      />
      <NewEventForm locale={locale} />
    </div>
  );
}
