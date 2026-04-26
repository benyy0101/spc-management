"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { EntityReference } from "@/lib/api/reference";
import type { ClosePeriod, ClosePeriodType, ClosePeriodStatus } from "@/lib/api/close-periods";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "error"; message: string };

type BookOption = {
  id: string;
  code: string;
};

export function CreateClosePeriodForm({
  locale,
  tenantId,
  entities,
  closePeriods,
}: {
  locale: Locale;
  tenantId: string;
  entities: EntityReference[];
  closePeriods: ClosePeriod[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  const bookOptions = useMemo<BookOption[]>(() => {
    const byId = new Map<string, BookOption>();

    for (const item of closePeriods) {
      if (!byId.has(item.bookId)) {
        byId.set(item.bookId, {
          id: item.bookId,
          code: item.bookCode,
        });
      }
    }

    return [...byId.values()].sort((a, b) => a.code.localeCompare(b.code));
  }, [closePeriods]);

  async function handleSubmit(formData: FormData) {
    const periodStart = String(formData.get("periodStart") ?? "");
    const periodEnd = String(formData.get("periodEnd") ?? "");

    if (periodStart && periodEnd && periodStart > periodEnd) {
      setState({
        kind: "error",
        message: pick(locale, {
          en: "The period end date must be on or after the start date.",
          ko: "마감 종료일은 시작일과 같거나 이후여야 합니다.",
        }),
      });
      return;
    }

    setPending(true);
    setState({ kind: "idle" });

    try {
      const payload = {
        tenantId,
        entityId: String(formData.get("entityId") ?? ""),
        bookId: String(formData.get("bookId") ?? ""),
        periodType: String(formData.get("periodType") ?? "month") as ClosePeriodType,
        periodStart,
        periodEnd,
        status: String(formData.get("status") ?? "open") as ClosePeriodStatus,
      };

      const response = await fetch("/api/close-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to create close period");
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        {pick(locale, { en: "Add Close Period", ko: "마감 기간 등록" })}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{pick(locale, { en: "Register Close Period", ko: "마감 기간 등록" })}</DialogTitle>
          <DialogDescription>
            {pick(locale, {
              en: "Create a close period record for the selected accounting unit and ledger.",
              ko: "선택한 회계 주체와 장부에 대해 마감 기간을 등록합니다.",
            })}
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-close-period-form"
          onSubmit={async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            await handleSubmit(new FormData(event.currentTarget));
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="entityId">{pick(locale, { en: "Accounting Unit", ko: "회계 주체" })}</Label>
            <NativeSelect id="entityId" name="entityId" defaultValue={entities[0]?.id ?? ""} required>
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.code} · {entity.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookId">{pick(locale, { en: "Ledger", ko: "장부" })}</Label>
            {bookOptions.length > 0 ? (
              <NativeSelect id="bookId" name="bookId" defaultValue={bookOptions[0].id} required>
                {bookOptions.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.code}
                  </option>
                ))}
              </NativeSelect>
            ) : (
              <Input id="bookId" name="bookId" placeholder="book uuid" required />
            )}
            <p className="text-xs leading-5 text-muted-foreground">
              {bookOptions.length > 0
                ? pick(locale, {
                    en: "Ledger options are derived from existing close period records.",
                    ko: "장부 목록은 기존 마감 데이터에서 추출합니다.",
                  })
                : pick(locale, {
                    en: "No ledger reference is available yet, so enter the book ID directly.",
                    ko: "아직 장부 기준정보 조회가 없어 book ID를 직접 입력해야 합니다.",
                  })}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="periodType">{pick(locale, { en: "Period Type", ko: "기간 유형" })}</Label>
              <NativeSelect id="periodType" name="periodType" defaultValue="month">
                <option value="month">{pick(locale, { en: "Month", ko: "월" })}</option>
                <option value="quarter">{pick(locale, { en: "Quarter", ko: "분기" })}</option>
                <option value="year">{pick(locale, { en: "Year", ko: "연" })}</option>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{pick(locale, { en: "Initial Status", ko: "초기 상태" })}</Label>
              <NativeSelect id="status" name="status" defaultValue="open">
                <option value="open">open</option>
                <option value="closing">closing</option>
                <option value="closed">closed</option>
                <option value="reopened">reopened</option>
              </NativeSelect>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="periodStart">{pick(locale, { en: "Period Start", ko: "시작일" })}</Label>
              <Input id="periodStart" name="periodStart" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd">{pick(locale, { en: "Period End", ko: "종료일" })}</Label>
              <Input id="periodEnd" name="periodEnd" type="date" required />
            </div>
          </div>
        </form>

        <DialogFooter>
          {state.kind === "error" ? (
            <p className="mr-auto text-sm text-destructive">{state.message}</p>
          ) : (
            <div className="mr-auto" />
          )}
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            {pick(locale, { en: "Cancel", ko: "취소" })}
          </Button>
          <Button type="submit" form="create-close-period-form" disabled={pending || entities.length === 0}>
            {pending
              ? pick(locale, { en: "Saving...", ko: "저장 중..." })
              : pick(locale, { en: "Save", ko: "저장" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
