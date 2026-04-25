"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { getNavigationSections } from "@/lib/navigation";
import { pick } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SidebarNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const navigationSections = getNavigationSections(locale);

  return (
    <aside className="flex h-full w-full flex-col border-r border-border/70 bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {pick(locale, { en: "SPC Accounting", ko: "SPC 회계" })}
            </p>
            <h1 className="mt-2 font-heading text-xl font-semibold tracking-tight">
              {pick(locale, { en: "Operations Console", ko: "운영 콘솔" })}
            </h1>
          </div>
          <Badge variant="outline">{pick(locale, { en: "MVP", ko: "MVP" })}</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {pick(locale, {
            en: "Input events, inspect journals, and validate balances before the broader platform fills out.",
            ko: "이벤트 입력, 전표 검토, 잔액 검증까지 먼저 닫고 이후 확장 기능을 채워 넣습니다.",
          })}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.label} className="mb-6 last:mb-0">
            {sectionIndex > 0 ? <Separator className="mb-4" /> : null}
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {section.label}
            </p>
            <div className="mt-3 space-y-1.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: active ? "secondary" : "ghost", size: "lg" }),
                      "h-auto w-full items-start justify-start rounded-xl px-3 py-3 text-left",
                      item.status === "planned" && "opacity-75",
                    )}
                  >
                    <span className="mt-0.5 mr-3 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {item.label}
                        {item.status === "planned" ? (
                          <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                            {pick(locale, { en: "2nd", ko: "2차" })}
                          </Badge>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {pick(locale, { en: "Context", ko: "문맥" })}
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{pick(locale, { en: "Tenant", ko: "테넌트" })}</span>
              <span className="font-medium">{pick(locale, { en: "Demo Tenant", ko: "데모 테넌트" })}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{pick(locale, { en: "Base Currency", ko: "기준 통화" })}</span>
              <span className="font-medium">USD</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{pick(locale, { en: "Timezone", ko: "타임존" })}</span>
              <span className="font-medium">Asia/Seoul</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
