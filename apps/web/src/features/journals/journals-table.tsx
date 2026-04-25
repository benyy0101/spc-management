import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
import type { JournalRecord } from "@/lib/api/journals";
import { cn } from "@/lib/utils";

export function JournalsTable({ items, tenantId, locale }: { items: JournalRecord[]; tenantId: string; locale: Locale }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{pick(locale, { en: "Journal No", ko: "전표번호" })}</TableHead>
          <TableHead>{pick(locale, { en: "Accounting Date", ko: "회계일" })}</TableHead>
          <TableHead>{pick(locale, { en: "Entity", ko: "회계주체" })}</TableHead>
          <TableHead>{pick(locale, { en: "Book", ko: "장부" })}</TableHead>
          <TableHead>{pick(locale, { en: "Status", ko: "상태" })}</TableHead>
          <TableHead>{pick(locale, { en: "Source Event", ko: "원천 이벤트" })}</TableHead>
          <TableHead>{pick(locale, { en: "Description", ko: "설명" })}</TableHead>
          <TableHead className="text-right">{pick(locale, { en: "Review", ko: "검토" })}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.journalNo}</TableCell>
              <TableCell>{item.accountingDate}</TableCell>
              <TableCell>{item.entityCode}</TableCell>
              <TableCell>{item.bookCode}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.postingStatus}</Badge>
              </TableCell>
              <TableCell className="max-w-[180px] truncate text-muted-foreground">{item.sourceEventId ?? "-"}</TableCell>
              <TableCell className="max-w-[260px] truncate">{item.description ?? "-"}</TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/journals/${item.id}?tenantId=${encodeURIComponent(tenantId)}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
                >
                  {pick(locale, { en: "View", ko: "보기" })}
                  <ArrowRight className="size-4" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
