import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { JournalLineRecord } from "@/lib/api/journals";
import { formatAmount } from "@/lib/format";

export function JournalLinesTable({ lines, locale }: { lines: JournalLineRecord[]; locale: Locale }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{pick(locale, { en: "Line", ko: "라인" })}</TableHead>
          <TableHead>{pick(locale, { en: "Account", ko: "계정" })}</TableHead>
          <TableHead>{pick(locale, { en: "Name", ko: "계정명" })}</TableHead>
          <TableHead>{pick(locale, { en: "Description", ko: "설명" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Debit", ko: "차변" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Credit", ko: "대변" })}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => (
          <TableRow key={line.id}>
            <TableCell>{line.lineNo}</TableCell>
            <TableCell className="font-medium">{line.accountCode}</TableCell>
            <TableCell>{line.accountName}</TableCell>
            <TableCell>{line.description ?? "-"}</TableCell>
            <TableCell className="text-right">{formatAmount(line.debitAmount, line.currency)}</TableCell>
            <TableCell className="text-right">{formatAmount(line.creditAmount, line.currency)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
