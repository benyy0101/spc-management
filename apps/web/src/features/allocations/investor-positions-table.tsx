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

export function InvestorPositionsTable({
  locale,
  items,
}: {
  locale: Locale;
  items: InvestorPosition[];
}) {
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              {item.investorCode} · {item.investorName}
            </TableCell>
            <TableCell>{item.fundEntityCode}</TableCell>
            <TableCell className="text-right">{item.ownershipRatio}</TableCell>
            <TableCell className="text-right">{item.commitmentAmount}</TableCell>
            <TableCell className="text-right">{item.paidInAmount}</TableCell>
            <TableCell>
              {item.effectiveFrom}
              {item.effectiveTo ? ` ~ ${item.effectiveTo}` : ""}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
