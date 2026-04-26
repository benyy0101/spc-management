"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { EntityReference } from "@/lib/api/reference";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "error"; message: string };

export function RunAllocationForm({
  locale,
  tenantId,
  funds,
  defaultFundEntityId,
  defaultPeriodStart,
  defaultPeriodEnd,
}: {
  locale: Locale;
  tenantId: string;
  funds: EntityReference[];
  defaultFundEntityId: string;
  defaultPeriodStart: string;
  defaultPeriodEnd: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  async function handleSubmit(formData: FormData) {
    const periodStart = String(formData.get("periodStart") ?? "");
    const periodEnd = String(formData.get("periodEnd") ?? "");

    if (periodStart && periodEnd && periodStart > periodEnd) {
      setState({
        kind: "error",
        message: pick(locale, {
          en: "The end date must be on or after the start date.",
          ko: "종료일은 시작일과 같거나 이후여야 합니다.",
        }),
      });
      return;
    }

    setPending(true);
    setState({ kind: "idle" });

    try {
      const payload = {
        tenantId,
        fundEntityId: String(formData.get("fundEntityId") ?? ""),
        periodStart,
        periodEnd,
        method: "pro_rata" as const,
        sourceAmountType: "profit" as const,
        sourceAmount: String(formData.get("sourceAmount") ?? ""),
        cashDistributionAmount: String(formData.get("cashDistributionAmount") ?? ""),
      };

      const response = await fetch("/api/allocations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to run allocations");
      }

      const params = new URLSearchParams({
        tenantId,
        fundEntityId: payload.fundEntityId,
        periodStart,
        periodEnd,
      });
      router.push(`/allocations?${params.toString()}`);
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
    <form
      onSubmit={async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await handleSubmit(new FormData(event.currentTarget));
      }}
      className="grid gap-4 lg:grid-cols-3"
    >
      <div className="space-y-2">
        <Label htmlFor="fundEntityId">{pick(locale, { en: "Fund", ko: "펀드" })}</Label>
        <NativeSelect id="fundEntityId" name="fundEntityId" defaultValue={defaultFundEntityId} required>
          {funds.map((fund) => (
            <option key={fund.id} value={fund.id}>
              {fund.code} · {fund.name}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label htmlFor="periodStart">{pick(locale, { en: "Period Start", ko: "시작일" })}</Label>
        <Input id="periodStart" name="periodStart" type="date" defaultValue={defaultPeriodStart} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="periodEnd">{pick(locale, { en: "Period End", ko: "종료일" })}</Label>
        <Input id="periodEnd" name="periodEnd" type="date" defaultValue={defaultPeriodEnd} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceAmount">{pick(locale, { en: "Source Profit Amount", ko: "배분 대상 손익 금액" })}</Label>
        <Input id="sourceAmount" name="sourceAmount" type="number" step="0.01" defaultValue="0" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cashDistributionAmount">{pick(locale, { en: "Cash Distribution", ko: "현금 배분 금액" })}</Label>
        <Input id="cashDistributionAmount" name="cashDistributionAmount" type="number" step="0.01" defaultValue="0" />
      </div>

      <div className="flex items-end">
        <Button type="submit" disabled={pending || funds.length === 0} className="w-full">
          {pending
            ? pick(locale, { en: "Running...", ko: "실행 중..." })
            : pick(locale, { en: "Run Allocation", ko: "배분 실행" })}
        </Button>
      </div>

      {state.kind === "error" ? (
        <p className="text-sm text-destructive lg:col-span-3">{state.message}</p>
      ) : null}
    </form>
  );
}
