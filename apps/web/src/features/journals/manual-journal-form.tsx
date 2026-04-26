"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { AccountReference, EntityReference } from "@/lib/api/reference";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "error"; message: string };

export function ManualJournalForm({
  locale,
  tenantId,
  entities,
  accounts,
}: {
  locale: Locale;
  tenantId: string;
  entities: EntityReference[];
  accounts: AccountReference[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  async function handleSubmit(formData: FormData) {
    const debitAmount = Number(formData.get("debitAmount") ?? 0);
    const creditAmount = Number(formData.get("creditAmount") ?? 0);

    if (Math.abs(debitAmount - creditAmount) > 0.000001) {
      setState({
        kind: "error",
        message: pick(locale, {
          en: "Debit and credit amounts must match.",
          ko: "차변과 대변 금액이 일치해야 합니다.",
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
        bookCode: String(formData.get("bookCode") ?? ""),
        accountingDate: String(formData.get("accountingDate") ?? ""),
        description: String(formData.get("description") ?? ""),
        lines: [
          {
            accountCode: String(formData.get("debitAccountCode") ?? ""),
            side: "debit" as const,
            amount: String(formData.get("debitAmount") ?? ""),
            currency: String(formData.get("currency") ?? "USD"),
            description: String(formData.get("debitLineDescription") ?? ""),
          },
          {
            accountCode: String(formData.get("creditAccountCode") ?? ""),
            side: "credit" as const,
            amount: String(formData.get("creditAmount") ?? ""),
            currency: String(formData.get("currency") ?? "USD"),
            description: String(formData.get("creditLineDescription") ?? ""),
          },
        ],
      };

      const response = await fetch("/api/journals/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to create manual journal");
      }

      const params = new URLSearchParams({ tenantId });
      router.push(`/operations/journals?${params.toString()}`);
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
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          <Label htmlFor="bookCode">{pick(locale, { en: "Ledger Code", ko: "장부 코드" })}</Label>
          <Input id="bookCode" name="bookCode" defaultValue="SPC_BOOK" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountingDate">{pick(locale, { en: "Accounting Date", ko: "회계일" })}</Label>
          <Input id="accountingDate" name="accountingDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">{pick(locale, { en: "Currency", ko: "통화" })}</Label>
          <Input id="currency" name="currency" defaultValue="USD" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{pick(locale, { en: "Description", ko: "전표 설명" })}</Label>
        <Input id="description" name="description" placeholder={pick(locale, { en: "Manual adjustment entry", ko: "수기 조정 전표" })} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border/70 p-4 space-y-4">
          <p className="font-medium">{pick(locale, { en: "Debit Line", ko: "차변 라인" })}</p>
          <div className="space-y-2">
            <Label htmlFor="debitAccountCode">{pick(locale, { en: "Account", ko: "계정과목" })}</Label>
            <NativeSelect id="debitAccountCode" name="debitAccountCode" defaultValue={accounts[0]?.code ?? ""} required>
              {accounts.map((account) => (
                <option key={account.id} value={account.code}>
                  {account.code} · {account.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="debitAmount">{pick(locale, { en: "Amount", ko: "금액" })}</Label>
            <Input id="debitAmount" name="debitAmount" type="number" step="0.01" defaultValue="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debitLineDescription">{pick(locale, { en: "Line Description", ko: "라인 설명" })}</Label>
            <Input id="debitLineDescription" name="debitLineDescription" />
          </div>
        </div>

        <div className="rounded-xl border border-border/70 p-4 space-y-4">
          <p className="font-medium">{pick(locale, { en: "Credit Line", ko: "대변 라인" })}</p>
          <div className="space-y-2">
            <Label htmlFor="creditAccountCode">{pick(locale, { en: "Account", ko: "계정과목" })}</Label>
            <NativeSelect id="creditAccountCode" name="creditAccountCode" defaultValue={accounts[1]?.code ?? accounts[0]?.code ?? ""} required>
              {accounts.map((account) => (
                <option key={account.id} value={account.code}>
                  {account.code} · {account.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditAmount">{pick(locale, { en: "Amount", ko: "금액" })}</Label>
            <Input id="creditAmount" name="creditAmount" type="number" step="0.01" defaultValue="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditLineDescription">{pick(locale, { en: "Line Description", ko: "라인 설명" })}</Label>
            <Input id="creditLineDescription" name="creditLineDescription" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {state.kind === "error" ? <p className="text-sm text-destructive">{state.message}</p> : <div />}
        <Button type="submit" disabled={pending || entities.length === 0 || accounts.length === 0}>
          {pending
            ? pick(locale, { en: "Saving...", ko: "저장 중..." })
            : pick(locale, { en: "Create Manual Journal", ko: "수기 전표 생성" })}
        </Button>
      </div>
    </form>
  );
}
