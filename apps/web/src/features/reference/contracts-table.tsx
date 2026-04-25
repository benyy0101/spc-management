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
import type { ContractReference } from "@/lib/api/reference";

export function ContractsTable({ items, locale }: { items: ContractReference[]; locale: Locale }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{pick(locale, { en: "Code", ko: "코드" })}</TableHead>
          <TableHead>{pick(locale, { en: "Type", ko: "유형" })}</TableHead>
          <TableHead>{pick(locale, { en: "Product", ko: "상품" })}</TableHead>
          <TableHead>{pick(locale, { en: "Currency", ko: "통화" })}</TableHead>
          <TableHead>{pick(locale, { en: "Effective", ko: "시작일" })}</TableHead>
          <TableHead>{pick(locale, { en: "Maturity", ko: "만기일" })}</TableHead>
          <TableHead>{pick(locale, { en: "Status", ko: "상태" })}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.code}</TableCell>
            <TableCell>{item.contractType}</TableCell>
            <TableCell>{item.productCode}</TableCell>
            <TableCell>{item.currency}</TableCell>
            <TableCell>{item.effectiveDate}</TableCell>
            <TableCell>{item.maturityDate ?? "-"}</TableCell>
            <TableCell>{item.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
