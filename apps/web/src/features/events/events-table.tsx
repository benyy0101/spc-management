import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EventRecord } from "@/lib/api/events";
import { formatAmount } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

export function EventsTable({ items, locale }: { items: EventRecord[]; locale: Locale }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{pick(locale, { en: "Accounting Date", ko: "회계일" })}</TableHead>
          <TableHead>{pick(locale, { en: "Event Type", ko: "이벤트 유형" })}</TableHead>
          <TableHead>{pick(locale, { en: "Entity", ko: "회계주체" })}</TableHead>
          <TableHead>{pick(locale, { en: "Book", ko: "장부" })}</TableHead>
          <TableHead>{pick(locale, { en: "Status", ko: "상태" })}</TableHead>
          <TableHead>{pick(locale, { en: "Amount", ko: "금액" })}</TableHead>
          <TableHead>{pick(locale, { en: "Event Key", ko: "이벤트 키" })}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.accountingDate}</TableCell>
            <TableCell className="font-medium">{item.eventType}</TableCell>
            <TableCell>{item.entityCode}</TableCell>
            <TableCell>{item.bookCode}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.status}</Badge>
            </TableCell>
            <TableCell>{formatAmount(item.amount, item.currency)}</TableCell>
            <TableCell className="max-w-[220px] truncate text-muted-foreground">{item.idempotencyKey}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
