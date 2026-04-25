import type { ReactNode } from "react";
import { LocaleToggle } from "@/components/layout/locale-toggle";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

export function AppShell({ children, locale }: { children: ReactNode; locale: Locale }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,36,72,0.08),_transparent_34%),linear-gradient(180deg,_rgba(246,247,251,0.9),_rgba(255,255,255,1))]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <SidebarNav locale={locale} />
        </div>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-border/70 bg-background/80 px-5 py-4 backdrop-blur sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {pick(locale, { en: "MVP Phase 1", ko: "1차 MVP" })}
                </p>
                <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
                  {pick(locale, { en: "Accounting Workflow", ko: "회계 워크플로" })}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                  {pick(locale, { en: "3 event types enabled", ko: "이벤트 유형 3개 지원" })}
                </div>
                <LocaleToggle locale={locale} />
              </div>
            </div>
          </header>
          <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
