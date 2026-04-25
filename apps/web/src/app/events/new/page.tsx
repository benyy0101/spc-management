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
          en: "This form focuses on the supported event types needed to operate the core loan lifecycle.",
          ko: "이 화면은 핵심 대출 라이프사이클 운영에 필요한 지원 이벤트 유형에 집중합니다.",
        })}
      />
      <NewEventForm locale={locale} />
    </div>
  );
}
