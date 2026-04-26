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
        label: pick(locale, { en: "Overview", ko: "전체 현황" }),
        description: pick(locale, { en: "See the current accounting work at a glance", ko: "현재 회계 업무 흐름을 한눈에 봅니다" }),
        icon: BarChart3,
        status: "live",
      },
      {
        href: "/events/new",
        label: pick(locale, { en: "New Transaction", ko: "거래 입력" }),
        description: pick(locale, { en: "Enter a new transaction from the supported list", ko: "지원되는 거래 유형 중 하나를 입력합니다" }),
        icon: PlusSquare,
        status: "live",
      },
      {
        href: "/events",
        label: pick(locale, { en: "Transactions", ko: "거래 내역" }),
        description: pick(locale, { en: "Review entered transactions", ko: "입력된 거래를 확인합니다" }),
        icon: ListChecks,
        status: "live",
      },
      {
        href: "/journals",
        label: pick(locale, { en: "Journals", ko: "전표" }),
        description: pick(locale, { en: "Review created journal entries", ko: "생성된 전표를 검토합니다" }),
        icon: ReceiptText,
        status: "live",
      },
      {
        href: "/trial-balance",
        label: pick(locale, { en: "Trial Balance", ko: "시산표" }),
        description: pick(locale, { en: "Check balances for a selected date", ko: "선택한 날짜 기준 잔액을 확인합니다" }),
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
        description: pick(locale, { en: "Account list and statement linkage", ko: "계정과목과 재무제표 연결을 봅니다" }),
        icon: BookOpenText,
        status: "planned",
      },
      {
        href: "/products",
        label: pick(locale, { en: "Products", ko: "상품" }),
        description: pick(locale, { en: "Registered product list", ko: "등록된 상품 목록을 봅니다" }),
        icon: FolderKanban,
        status: "planned",
      },
      {
        href: "/contracts",
        label: pick(locale, { en: "Contracts", ko: "계약" }),
        description: pick(locale, { en: "Contract details and terms", ko: "계약 내용과 조건을 확인합니다" }),
        icon: Landmark,
        status: "planned",
      },
      {
        href: "/entities",
        label: pick(locale, { en: "Entities", ko: "회계주체" }),
        description: pick(locale, { en: "Fund and SPC accounting units", ko: "펀드와 SPC 회계 단위를 봅니다" }),
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
        description: pick(locale, { en: "Review the balance sheet by date and accounting unit", ko: "날짜와 회계 단위별 재무상태표를 확인합니다" }),
        icon: FileBarChart2,
        status: "live",
      },
      {
        href: "/financial-statements/profit-loss",
        label: pick(locale, { en: "Profit & Loss", ko: "손익계산서" }),
        description: pick(locale, { en: "Review revenue and expense changes for a period", ko: "기간별 수익과 비용 변동을 확인합니다" }),
        icon: CircleDollarSign,
        status: "live",
      },
      {
        href: "/financial-statements/cash-flow",
        label: pick(locale, { en: "Cash Flow", ko: "현금흐름표" }),
        description: pick(locale, { en: "Review cash inflow and outflow for a period", ko: "기간별 현금 유입과 유출을 확인합니다" }),
        icon: WalletCards,
        status: "live",
      },
      {
        href: "/statement-mappings",
        label: pick(locale, { en: "Statement Mappings", ko: "재무제표 매핑" }),
        description: pick(locale, { en: "Manage how accounts appear on statements", ko: "계정과목이 재무제표에 표시되는 방식을 관리합니다" }),
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
        description: pick(locale, { en: "Manage the opening and closing of periods", ko: "회계 기간의 시작과 마감을 관리합니다" }),
        icon: FileClock,
        status: "live",
      },
      {
        href: "/allocations",
        label: pick(locale, { en: "Allocations", ko: "배분" }),
        description: pick(locale, { en: "Run investor allocations and review results", ko: "투자자 배분을 실행하고 결과를 확인합니다" }),
        icon: ClipboardList,
        status: "live",
      },
      {
        href: "/investor-positions",
        label: pick(locale, { en: "Investor Positions", ko: "투자자 포지션" }),
        description: pick(locale, { en: "Review investor ownership and commitments", ko: "투자자 지분과 약정 현황을 확인합니다" }),
        icon: ClipboardCheck,
        status: "live",
      },
      {
        href: "/operations/journals",
        label: pick(locale, { en: "Journal Actions", ko: "전표 운영" }),
        description: pick(locale, { en: "Manual entry, approval, cancellation, and correction", ko: "수기 입력, 승인, 취소, 정정 업무" }),
        icon: ReceiptText,
        status: "live",
      },
      {
        href: "/audit-logs",
        label: pick(locale, { en: "Audit Logs", ko: "감사 로그" }),
        description: pick(locale, { en: "Check work history and status changes", ko: "업무 이력과 상태 변경 내역을 확인합니다" }),
        icon: Logs,
        status: "live",
      },
    ],
  },
];
