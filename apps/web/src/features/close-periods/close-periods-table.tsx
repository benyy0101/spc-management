"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ClosePeriod, ClosePeriodStatus } from "@/lib/api/close-periods";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "error"; message: string };

const statusOptions: ClosePeriodStatus[] = ["open", "closing", "closed", "reopened"];

function getStatusVariant(status: ClosePeriodStatus): "default" | "secondary" | "outline" {
  switch (status) {
    case "closed":
      return "default";
    case "closing":
      return "secondary";
    default:
      return "outline";
  }
}

function canTransition(current: ClosePeriodStatus, next: ClosePeriodStatus) {
  const transitions: Record<ClosePeriodStatus, ClosePeriodStatus[]> = {
    open: ["closing"],
    closing: ["closed"],
    closed: ["reopened"],
    reopened: ["closing"],
  };

  return transitions[current].includes(next);
}

export function ClosePeriodsTable({
  locale,
  tenantId,
  items,
}: {
  locale: Locale;
  tenantId: string;
  items: ClosePeriod[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  async function handleStatusChange(closePeriodId: string, status: ClosePeriodStatus) {
    setPendingId(closePeriodId);
    setState({ kind: "idle" });

    try {
      const response = await fetch(`/api/close-periods/${closePeriodId}/status?tenantId=${encodeURIComponent(tenantId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to update close period status");
      }

      router.refresh();
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setPendingId(null);
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
            <TableHead>{pick(locale, { en: "Accounting Unit", ko: "회계 주체" })}</TableHead>
            <TableHead>{pick(locale, { en: "Ledger", ko: "장부" })}</TableHead>
            <TableHead>{pick(locale, { en: "Type", ko: "유형" })}</TableHead>
            <TableHead>{pick(locale, { en: "Period", ko: "기간" })}</TableHead>
            <TableHead>{pick(locale, { en: "Status", ko: "상태" })}</TableHead>
            <TableHead>{pick(locale, { en: "Closed At", ko: "마감 시각" })}</TableHead>
            <TableHead className="text-right">{pick(locale, { en: "Next Action", ko: "다음 액션" })}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const nextStatus = statusOptions.find((candidate) => canTransition(item.status, candidate));

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.entityCode}</TableCell>
                <TableCell>{item.bookCode}</TableCell>
                <TableCell className="uppercase">{item.periodType}</TableCell>
                <TableCell>{item.periodStart} ~ {item.periodEnd}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                </TableCell>
                <TableCell>{item.closedAt ? new Date(item.closedAt).toLocaleString() : "-"}</TableCell>
                <TableCell className="text-right">
                  {nextStatus ? (
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      disabled={pendingId === item.id}
                      onClick={() => void handleStatusChange(item.id, nextStatus)}
                    >
                      {pendingId === item.id
                        ? pick(locale, { en: "Updating...", ko: "변경 중..." })
                        : pick(locale, {
                            en: `Move to ${nextStatus}`,
                            ko: `${nextStatus}(으)로 변경`,
                          })}
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {pick(locale, { en: "No action", ko: "변경 없음" })}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
