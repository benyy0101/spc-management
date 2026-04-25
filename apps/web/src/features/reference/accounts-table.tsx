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
import type { AccountReference } from "@/lib/api/reference";

export function AccountsTable({ items, locale }: { items: AccountReference[]; locale: Locale }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{pick(locale, { en: "Code", ko: "코드" })}</TableHead>
          <TableHead>{pick(locale, { en: "Name", ko: "이름" })}</TableHead>
          <TableHead>{pick(locale, { en: "Type", ko: "유형" })}</TableHead>
          <TableHead>{pick(locale, { en: "Statement", ko: "재무제표" })}</TableHead>
          <TableHead>{pick(locale, { en: "Normal", ko: "정상잔액" })}</TableHead>
          <TableHead>{pick(locale, { en: "Active", ko: "사용" })}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.code}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.accountType}</TableCell>
            <TableCell>{item.statementType}</TableCell>
            <TableCell>{item.normalBalance}</TableCell>
            <TableCell>{item.isActive ? pick(locale, { en: "yes", ko: "예" }) : pick(locale, { en: "no", ko: "아니오" })}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
