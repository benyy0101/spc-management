import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  ClipboardList,
  FileCog,
  BarChart3,
  BookOpenText,
  Building2,
  CircleDollarSign,
  FileBarChart2,
  FileClock,
  FileSpreadsheet,
  FolderKanban,
  Landmark,
  ListChecks,
  Logs,
  PlusSquare,
  ReceiptText,
  WalletCards,
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
  {
    label: pick(locale, { en: "Financial", ko: "재무보고" }),
    items: [
      {
        href: "/financial-statements/balance-sheet",
        label: pick(locale, { en: "Balance Sheet", ko: "재무상태표" }),
        description: pick(locale, { en: "Review balance sheet lines by entity and reporting date", ko: "회계주체와 기준일별 재무상태표 라인 검토" }),
        icon: FileBarChart2,
        status: "live",
      },
      {
        href: "/financial-statements/profit-loss",
        label: pick(locale, { en: "Profit & Loss", ko: "손익계산서" }),
        description: pick(locale, { en: "Inspect period revenue and expense movement", ko: "기간 기준 수익·비용 흐름 검토" }),
        icon: CircleDollarSign,
        status: "live",
      },
      {
        href: "/financial-statements/cash-flow",
        label: pick(locale, { en: "Cash Flow", ko: "현금흐름표" }),
        description: pick(locale, { en: "Track indirect-method cash flow presentation", ko: "간접법 기준 현금흐름 표시 검토" }),
        icon: WalletCards,
        status: "live",
      },
      {
        href: "/statement-mappings",
        label: pick(locale, { en: "Statement Mappings", ko: "재무제표 매핑" }),
        description: pick(locale, { en: "Manage account-to-statement line mappings", ko: "계정과목과 재무제표 라인 매핑 관리" }),
        icon: FileCog,
        status: "live",
      },
    ],
  },
  {
    label: pick(locale, { en: "Operations", ko: "운영" }),
    items: [
      {
        href: "/close-periods",
        label: pick(locale, { en: "Close Periods", ko: "마감 관리" }),
        description: pick(locale, { en: "Open, close, and reopen accounting periods", ko: "회계 기간의 오픈·마감·재오픈 관리" }),
        icon: FileClock,
        status: "live",
      },
      {
        href: "/allocations",
        label: pick(locale, { en: "Allocations", ko: "배분" }),
        description: pick(locale, { en: "Run pro-rata allocations and inspect outputs", ko: "지분율 배분 실행 및 결과 검토" }),
        icon: ClipboardList,
        status: "live",
      },
      {
        href: "/investor-positions",
        label: pick(locale, { en: "Investor Positions", ko: "투자자 포지션" }),
        description: pick(locale, { en: "Review investor ownership ratios and commitments", ko: "투자자 지분율과 약정 현황 검토" }),
        icon: ClipboardCheck,
        status: "live",
      },
      {
        href: "/operations/journals",
        label: pick(locale, { en: "Journal Actions", ko: "전표 운영" }),
        description: pick(locale, { en: "Manual journals, approvals, reversals, and reprocess", ko: "수기전표, 승인, 역분개, 재처리" }),
        icon: ReceiptText,
        status: "live",
      },
      {
        href: "/audit-logs",
        label: pick(locale, { en: "Audit Logs", ko: "감사 로그" }),
        description: pick(locale, { en: "Track operational actions and journal lifecycle changes", ko: "운영 액션과 전표 라이프사이클 변경 추적" }),
        icon: Logs,
        status: "live",
      },
    ],
  },
];
