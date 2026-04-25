import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { FinancialStatementResponse } from "@/lib/api/financial-statements";

const statementLabel = (locale: Locale, value: "BS" | "PL" | "CF") =>
  ({
    BS: pick(locale, { en: "Balance Sheet", ko: "재무상태표" }),
    PL: pick(locale, { en: "Profit & Loss", ko: "손익계산서" }),
    CF: pick(locale, { en: "Cash Flow", ko: "현금흐름표" }),
  })[value];

export function FinancialStatementTable({
  data,
  locale,
}: {
  data: FinancialStatementResponse;
  locale: Locale;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{pick(locale, { en: "Line Code", ko: "라인 코드" })}</TableHead>
          <TableHead>{pick(locale, { en: "Line Name", ko: "라인명" })}</TableHead>
          <TableHead>{pick(locale, { en: "Statement", ko: "재무제표" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Amount", ko: "금액" })}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.rows.map((row) => (
          <TableRow key={`${row.statementType}:${row.lineCode}`}>
            <TableCell className="font-medium">{row.lineCode}</TableCell>
            <TableCell>{row.lineName}</TableCell>
            <TableCell>{statementLabel(locale, row.statementType)}</TableCell>
            <TableCell className="text-right">{formatAmount(row.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>{pick(locale, { en: "Total", ko: "합계" })}</TableCell>
          <TableCell className="text-right">{formatAmount(data.totals.amount)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
