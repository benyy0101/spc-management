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
import type { ProductReference } from "@/lib/api/reference";

export function ProductsTable({ items, locale }: { items: ProductReference[]; locale: Locale }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{pick(locale, { en: "Code", ko: "코드" })}</TableHead>
          <TableHead>{pick(locale, { en: "Name", ko: "이름" })}</TableHead>
          <TableHead>{pick(locale, { en: "Product Type", ko: "상품 유형" })}</TableHead>
          <TableHead>{pick(locale, { en: "Currency", ko: "통화" })}</TableHead>
          <TableHead>{pick(locale, { en: "Status", ko: "상태" })}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.code}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.productType}</TableCell>
            <TableCell>{item.currency}</TableCell>
            <TableCell>{item.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
