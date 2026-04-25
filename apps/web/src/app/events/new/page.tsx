import { PageHeader } from "@/components/page-header";
import { NewEventForm } from "@/features/events/new-event-form";
import { pick } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function NewEventPage() {
  const locale = await getServerLocale();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pick(locale, { en: "Events", ko: "이벤트" })}
        title={pick(locale, { en: "Post New Accounting Event", ko: "새 회계 이벤트 입력" })}
        description={pick(locale, {
          en: "This form will stay intentionally narrow in the first pass. It only needs to support the 3 event types that validate the core loan lifecycle.",
          ko: "이 화면은 1차에서 의도적으로 범위를 좁게 유지합니다. 핵심 대출 라이프사이클을 검증하는 3개 이벤트만 지원하면 충분합니다.",
        })}
      />
      <NewEventForm locale={locale} />
    </div>
  );
}
