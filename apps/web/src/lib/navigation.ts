import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpenText,
  Building2,
  FileSpreadsheet,
  FolderKanban,
  Landmark,
  ListChecks,
  PlusSquare,
  ReceiptText,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  status?: "live" | "planned";
};

export type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

export const getNavigationSections = (locale: Locale): NavigationSection[] => [
  {
    label: pick(locale, { en: "Core", ko: "핵심" }),
    items: [
      {
        href: "/",
        label: pick(locale, { en: "Dashboard", ko: "대시보드" }),
        description: pick(locale, { en: "Current accounting workflow overview", ko: "현재 회계 워크플로 개요" }),
        icon: BarChart3,
        status: "live",
      },
      {
        href: "/events/new",
        label: pick(locale, { en: "New Event", ko: "이벤트 입력" }),
        description: pick(locale, { en: "Post one of the 3 supported event types", ko: "지원되는 3개 이벤트 유형 중 하나 입력" }),
        icon: PlusSquare,
        status: "live",
      },
      {
        href: "/events",
        label: pick(locale, { en: "Events", ko: "이벤트" }),
        description: pick(locale, { en: "Review posted accounting events", ko: "입력된 회계 이벤트 검토" }),
        icon: ListChecks,
        status: "live",
      },
      {
        href: "/journals",
        label: pick(locale, { en: "Journals", ko: "전표" }),
        description: pick(locale, { en: "Inspect generated journal entries", ko: "생성된 분개 전표 검토" }),
        icon: ReceiptText,
        status: "live",
      },
      {
        href: "/trial-balance",
        label: pick(locale, { en: "Trial Balance", ko: "시산표" }),
        description: pick(locale, { en: "Validate balances as of a reporting date", ko: "기준일 기준 잔액 검증" }),
        icon: FileSpreadsheet,
        status: "live",
      },
    ],
  },
  {
    label: pick(locale, { en: "Reference", ko: "기준정보" }),
    items: [
      {
        href: "/accounts",
        label: pick(locale, { en: "Accounts", ko: "계정과목" }),
        description: pick(locale, { en: "COA and statement mapping", ko: "COA와 재무제표 매핑" }),
        icon: BookOpenText,
        status: "planned",
      },
      {
        href: "/products",
        label: pick(locale, { en: "Products", ko: "상품" }),
        description: pick(locale, { en: "Financial product master", ko: "금융상품 마스터" }),
        icon: FolderKanban,
        status: "planned",
      },
      {
        href: "/contracts",
        label: pick(locale, { en: "Contracts", ko: "계약" }),
        description: pick(locale, { en: "Agreement terms and conditions", ko: "계약 조건 및 약정" }),
        icon: Landmark,
        status: "planned",
      },
      {
        href: "/entities",
        label: pick(locale, { en: "Entities", ko: "회계주체" }),
        description: pick(locale, { en: "Fund and SPC reporting units", ko: "펀드/SPC 회계 단위" }),
        icon: Building2,
        status: "planned",
      },
    ],
  },
];
