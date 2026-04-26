"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JournalRecord } from "@/lib/api/journals";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "error"; message: string };

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "approved") {
    return "secondary";
  }
  if (status === "posted") {
    return "default";
  }
  return "outline";
}

export function JournalOperationsTable({
  items,
  tenantId,
  locale,
}: {
  items: JournalRecord[];
  tenantId: string;
  locale: Locale;
}) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  async function runAction(key: string, action: () => Promise<Response>, fallbackMessage: string) {
    setPendingKey(key);
    setState({ kind: "idle" });

    try {
      const response = await action();
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message ?? fallbackMessage);
      }
      router.refresh();
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <div className="space-y-4">
      {state.kind === "error" ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{pick(locale, { en: "Journal No", ko: "전표번호" })}</TableHead>
            <TableHead>{pick(locale, { en: "Date", ko: "회계일" })}</TableHead>
            <TableHead>{pick(locale, { en: "Entity", ko: "회계주체" })}</TableHead>
            <TableHead>{pick(locale, { en: "Type", ko: "유형" })}</TableHead>
            <TableHead>{pick(locale, { en: "Status", ko: "상태" })}</TableHead>
            <TableHead>{pick(locale, { en: "Source Event", ko: "원천 이벤트" })}</TableHead>
            <TableHead>{pick(locale, { en: "Description", ko: "설명" })}</TableHead>
            <TableHead className="text-right">{pick(locale, { en: "Actions", ko: "액션" })}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.journalNo}</TableCell>
              <TableCell>{item.accountingDate}</TableCell>
              <TableCell>{item.entityCode}</TableCell>
              <TableCell>{item.journalType}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(item.postingStatus)}>{item.postingStatus}</Badge>
              </TableCell>
              <TableCell className="max-w-[180px] truncate text-muted-foreground">{item.sourceEventId ?? "-"}</TableCell>
              <TableCell className="max-w-[220px] truncate">{item.description ?? "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    href={`/journals/${item.id}?tenantId=${encodeURIComponent(tenantId)}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
                  >
                    {pick(locale, { en: "View", ko: "보기" })}
                    <ArrowRight className="size-4" />
                  </Link>
                  {item.postingStatus === "draft" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendingKey === `approve:${item.id}`}
                      onClick={() =>
                        void runAction(
                          `approve:${item.id}`,
                          () => fetch(`/api/journals/${item.id}/approve?tenantId=${encodeURIComponent(tenantId)}`, { method: "POST" }),
                          "Failed to approve journal",
                        )
                      }
                    >
                      {pendingKey === `approve:${item.id}`
                        ? pick(locale, { en: "Approving...", ko: "승인 중..." })
                        : pick(locale, { en: "Approve", ko: "승인" })}
                    </Button>
                  ) : null}
                  {item.postingStatus === "posted" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendingKey === `reverse:${item.id}`}
                      onClick={() =>
                        void runAction(
                          `reverse:${item.id}`,
                          () =>
                            fetch(`/api/journals/${item.id}/reverse?tenantId=${encodeURIComponent(tenantId)}`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ reversalDate: item.accountingDate }),
                            }),
                          "Failed to reverse journal",
                        )
                      }
                    >
                      {pendingKey === `reverse:${item.id}`
                        ? pick(locale, { en: "Reversing...", ko: "역분개 중..." })
                        : pick(locale, { en: "Reverse", ko: "역분개" })}
                    </Button>
                  ) : null}
                  {item.sourceEventId ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendingKey === `reprocess:${item.id}`}
                      onClick={() =>
                        void runAction(
                          `reprocess:${item.id}`,
                          () => fetch(`/api/events/${item.sourceEventId}/reprocess?tenantId=${encodeURIComponent(tenantId)}`, { method: "POST" }),
                          "Failed to reprocess event",
                        )
                      }
                    >
                      {pendingKey === `reprocess:${item.id}`
                        ? pick(locale, { en: "Reprocessing...", ko: "재처리 중..." })
                        : pick(locale, { en: "Reprocess", ko: "재처리" })}
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
