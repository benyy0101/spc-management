"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvestorPosition } from "@/lib/api/allocations";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

export function InvestorPositionsBrowser({
  locale,
  items,
}: {
  locale: Locale;
  items: InvestorPosition[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedInvestorId = searchParams.get("investorId") ?? "";

  function selectInvestor(investorId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("investorId", investorId);
    router.push(`/investor-positions?${params.toString()}`);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{pick(locale, { en: "Investor", ko: "투자자" })}</TableHead>
          <TableHead>{pick(locale, { en: "Fund", ko: "펀드" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Ownership", ko: "지분율" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Commitment", ko: "약정 금액" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Paid In", ko: "납입 금액" })}</TableHead>
          <TableHead>{pick(locale, { en: "Effective Period", ko: "적용 기간" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "History", ko: "이력" })}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const selected = item.investorId === selectedInvestorId;

          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span>{item.investorCode} · {item.investorName}</span>
                  {selected ? <Badge variant="secondary">{pick(locale, { en: "Selected", ko: "선택됨" })}</Badge> : null}
                </div>
              </TableCell>
              <TableCell>{item.fundEntityCode}</TableCell>
              <TableCell className="text-right">{item.ownershipRatio}</TableCell>
              <TableCell className="text-right">{item.commitmentAmount}</TableCell>
              <TableCell className="text-right">{item.paidInAmount}</TableCell>
              <TableCell>
                {item.effectiveFrom}
                {item.effectiveTo ? ` ~ ${item.effectiveTo}` : ""}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" type="button" onClick={() => selectInvestor(item.investorId)}>
                  {pick(locale, { en: "View", ko: "보기" })}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
