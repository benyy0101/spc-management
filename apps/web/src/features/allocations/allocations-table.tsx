import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvestorAllocation } from "@/lib/api/allocations";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

export function AllocationsTable({
  locale,
  items,
}: {
  locale: Locale;
  items: InvestorAllocation[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{pick(locale, { en: "Investor", ko: "투자자" })}</TableHead>
          <TableHead>{pick(locale, { en: "Fund", ko: "펀드" })}</TableHead>
          <TableHead>{pick(locale, { en: "Period", ko: "기간" })}</TableHead>
          <TableHead>{pick(locale, { en: "Method", ko: "방식" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Ownership", ko: "지분율" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Source Amount", ko: "원천 금액" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Allocated Profit", ko: "배분 손익" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Cash Distribution", ko: "현금 배분" })}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              {item.investorCode} · {item.investorName}
            </TableCell>
            <TableCell>{item.fundEntityCode}</TableCell>
            <TableCell>{item.periodStart} ~ {item.periodEnd}</TableCell>
            <TableCell>{item.allocationMethod}</TableCell>
            <TableCell className="text-right">{item.ownershipRatio}</TableCell>
            <TableCell className="text-right">{item.sourceAmount}</TableCell>
            <TableCell className="text-right">{item.allocatedProfitAmount}</TableCell>
            <TableCell className="text-right">{item.cashDistributionAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
