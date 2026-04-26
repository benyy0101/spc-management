"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditLog } from "@/lib/api/audit-logs";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

function formatPayload(payload: Record<string, unknown> | null) {
  if (!payload) {
    return "null";
  }

  return JSON.stringify(payload, null, 2);
}

export function AuditLogsTable({
  locale,
  items,
}: {
  locale: Locale;
  items: AuditLog[];
}) {
  const [selected, setSelected] = useState<AuditLog | null>(null);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{pick(locale, { en: "Time", ko: "시각" })}</TableHead>
            <TableHead>{pick(locale, { en: "Action", ko: "액션" })}</TableHead>
            <TableHead>{pick(locale, { en: "Resource", ko: "대상" })}</TableHead>
            <TableHead>{pick(locale, { en: "Actor", ko: "사용자" })}</TableHead>
            <TableHead>{pick(locale, { en: "Resource ID", ko: "대상 ID" })}</TableHead>
            <TableHead className="text-right">{pick(locale, { en: "Details", ko: "상세" })}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.actionType}</Badge>
              </TableCell>
              <TableCell>{item.resourceType}</TableCell>
              <TableCell className="text-muted-foreground">{item.actorUserId ?? "-"}</TableCell>
              <TableCell className="max-w-[260px] truncate">{item.resourceId}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" type="button" onClick={() => setSelected(item)}>
                  {pick(locale, { en: "View", ko: "보기" })}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => {
        if (!open) {
          setSelected(null);
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{pick(locale, { en: "Audit Log Detail", ko: "감사 로그 상세" })}</DialogTitle>
            <DialogDescription>
              {selected
                ? `${selected.actionType} · ${selected.resourceType} · ${selected.resourceId}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {selected ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">{pick(locale, { en: "Before Payload", ko: "변경 전 데이터" })}</p>
                <pre className="max-h-[420px] overflow-auto rounded-xl border border-border/70 bg-muted/30 p-4 text-xs leading-6 text-foreground">
                  {formatPayload(selected.beforePayload)}
                </pre>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">{pick(locale, { en: "After Payload", ko: "변경 후 데이터" })}</p>
                <pre className="max-h-[420px] overflow-auto rounded-xl border border-border/70 bg-muted/30 p-4 text-xs leading-6 text-foreground">
                  {formatPayload(selected.afterPayload)}
                </pre>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setSelected(null)}>
              {pick(locale, { en: "Close", ko: "닫기" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
