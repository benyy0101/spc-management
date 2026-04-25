import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { TrialBalanceResponse } from "@/lib/api/ledger";
import { formatAmount } from "@/lib/format";

export function TrialBalanceTable({ data, locale }: { data: TrialBalanceResponse; locale: Locale }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{pick(locale, { en: "Account", ko: "계정" })}</TableHead>
          <TableHead>{pick(locale, { en: "Name", ko: "계정명" })}</TableHead>
          <TableHead>{pick(locale, { en: "Statement", ko: "재무제표" })}</TableHead>
          <TableHead>{pick(locale, { en: "Normal", ko: "정상잔액" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Debit", ko: "차변" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Credit", ko: "대변" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Balance", ko: "잔액" })}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.rows.map((row) => (
          <TableRow key={row.accountId}>
            <TableCell className="font-medium">{row.accountCode}</TableCell>
            <TableCell>{row.accountName}</TableCell>
            <TableCell>{row.statementType}</TableCell>
            <TableCell>{row.normalBalance}</TableCell>
            <TableCell className="text-right">{formatAmount(row.debitAmount)}</TableCell>
            <TableCell className="text-right">{formatAmount(row.creditAmount)}</TableCell>
            <TableCell className="text-right">{formatAmount(row.balanceAmount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>{pick(locale, { en: "Totals", ko: "합계" })}</TableCell>
          <TableCell className="text-right">{formatAmount(data.totals.debitAmount)}</TableCell>
          <TableCell className="text-right">{formatAmount(data.totals.creditAmount)}</TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  );
}
