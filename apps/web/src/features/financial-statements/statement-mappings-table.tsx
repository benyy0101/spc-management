"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
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
import type { AccountReference } from "@/lib/api/reference";
import type { StatementMapping } from "@/lib/api/statement-mappings";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "error"; message: string };

export function StatementMappingsTable({
  locale,
  tenantId,
  accounts,
  items,
}: {
  locale: Locale;
  tenantId: string;
  accounts: AccountReference[];
  items: StatementMapping[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StatementMapping | null>(null);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  async function handleCreate(formData: FormData) {
    setPending(true);
    setState({ kind: "idle" });

    try {
      const payload = {
        tenantId,
        accountId: String(formData.get("accountId") ?? ""),
        statementType: String(formData.get("statementType") ?? "") as "BS" | "PL" | "CF",
        lineCode: String(formData.get("lineCode") ?? ""),
        lineName: String(formData.get("lineName") ?? ""),
        displayOrder: Number(formData.get("displayOrder") ?? 0),
      };

      const response = await fetch("/api/statement-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to create statement mapping");
      }

      setCreateOpen(false);
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

  async function handleEdit(formData: FormData) {
    if (!editTarget) {
      return;
    }

    setPending(true);
    setState({ kind: "idle" });

    try {
      const payload = {
        lineCode: String(formData.get("lineCode") ?? ""),
        lineName: String(formData.get("lineName") ?? ""),
        displayOrder: Number(formData.get("displayOrder") ?? 0),
      };

      const response = await fetch(`/api/statement-mappings/${editTarget.id}?tenantId=${encodeURIComponent(tenantId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to update statement mapping");
      }

      setEditTarget(null);
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
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button />}>
            {pick(locale, { en: "Add Mapping", ko: "매핑 추가" })}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{pick(locale, { en: "Create Statement Mapping", ko: "재무제표 매핑 생성" })}</DialogTitle>
              <DialogDescription>
                {pick(locale, {
                  en: "Create a new account-to-statement line mapping for the selected tenant.",
                  ko: "선택한 tenant에 대해 계정과목과 재무제표 라인을 새로 매핑합니다.",
                })}
              </DialogDescription>
            </DialogHeader>
            <form
              id="create-statement-mapping-form"
              onSubmit={async (event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                await handleCreate(new FormData(event.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="accountId">{pick(locale, { en: "Account", ko: "계정과목" })}</Label>
                <NativeSelect id="accountId" name="accountId" defaultValue={accounts[0]?.id ?? ""}>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.code} · {account.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statementType">{pick(locale, { en: "Statement", ko: "재무제표" })}</Label>
                <NativeSelect id="statementType" name="statementType" defaultValue="BS">
                  <option value="BS">BS</option>
                  <option value="PL">PL</option>
                  <option value="CF">CF</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lineCode">{pick(locale, { en: "Line Code", ko: "라인 코드" })}</Label>
                <Input id="lineCode" name="lineCode" placeholder="INTEREST_INCOME" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lineName">{pick(locale, { en: "Line Name", ko: "라인명" })}</Label>
                <Input id="lineName" name="lineName" placeholder="Interest Income" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">{pick(locale, { en: "Display Order", ko: "표시 순서" })}</Label>
                <Input id="displayOrder" name="displayOrder" type="number" min="0" defaultValue="10" required />
              </div>
            </form>
            <DialogFooter>
              {state.kind === "error" ? (
                <p className="mr-auto text-sm text-destructive">{state.message}</p>
              ) : (
                <div className="mr-auto" />
              )}
              <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>
                {pick(locale, { en: "Cancel", ko: "취소" })}
              </Button>
              <Button type="submit" form="create-statement-mapping-form" disabled={pending || accounts.length === 0}>
                {pending
                  ? pick(locale, { en: "Saving...", ko: "저장 중..." })
                  : pick(locale, { en: "Create", ko: "생성" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{pick(locale, { en: "Account", ko: "계정" })}</TableHead>
            <TableHead>{pick(locale, { en: "Account Name", ko: "계정명" })}</TableHead>
            <TableHead>{pick(locale, { en: "Statement", ko: "재무제표" })}</TableHead>
            <TableHead>{pick(locale, { en: "Line Code", ko: "라인 코드" })}</TableHead>
            <TableHead>{pick(locale, { en: "Line Name", ko: "라인명" })}</TableHead>
            <TableHead className="text-right">{pick(locale, { en: "Order", ko: "순서" })}</TableHead>
            <TableHead className="text-right">{pick(locale, { en: "Actions", ko: "액션" })}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.accountCode}</TableCell>
              <TableCell>{item.accountName}</TableCell>
              <TableCell>{item.statementType}</TableCell>
              <TableCell>{item.lineCode}</TableCell>
              <TableCell>{item.lineName}</TableCell>
              <TableCell className="text-right">{item.displayOrder}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" type="button" onClick={() => {
                  setState({ kind: "idle" });
                  setEditTarget(item);
                }}>
                  {pick(locale, { en: "Edit", ko: "수정" })}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={Boolean(editTarget)} onOpenChange={(open) => {
        if (!open) {
          setEditTarget(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pick(locale, { en: "Edit Statement Mapping", ko: "재무제표 매핑 수정" })}</DialogTitle>
            <DialogDescription>
              {pick(locale, {
                en: "Update the selected mapping line code, line name, and display order.",
                ko: "선택한 매핑의 라인 코드, 라인명, 표시 순서를 수정합니다.",
              })}
            </DialogDescription>
          </DialogHeader>
          {editTarget ? (
            <form
              id="edit-statement-mapping-form"
              onSubmit={async (event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                await handleEdit(new FormData(event.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>{pick(locale, { en: "Account", ko: "계정과목" })}</Label>
                <Input value={`${editTarget.accountCode} · ${editTarget.accountName}`} readOnly />
              </div>
              <div className="space-y-2">
                <Label>{pick(locale, { en: "Statement", ko: "재무제표" })}</Label>
                <Input value={editTarget.statementType} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lineCode">{pick(locale, { en: "Line Code", ko: "라인 코드" })}</Label>
                <Input id="edit-lineCode" name="lineCode" defaultValue={editTarget.lineCode} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lineName">{pick(locale, { en: "Line Name", ko: "라인명" })}</Label>
                <Input id="edit-lineName" name="lineName" defaultValue={editTarget.lineName} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-displayOrder">{pick(locale, { en: "Display Order", ko: "표시 순서" })}</Label>
                <Input
                  id="edit-displayOrder"
                  name="displayOrder"
                  type="number"
                  min="0"
                  defaultValue={String(editTarget.displayOrder)}
                  required
                />
              </div>
            </form>
          ) : null}
          <DialogFooter>
            {state.kind === "error" ? (
              <p className="mr-auto text-sm text-destructive">{state.message}</p>
            ) : (
              <div className="mr-auto" />
            )}
            <Button variant="outline" type="button" onClick={() => setEditTarget(null)}>
              {pick(locale, { en: "Cancel", ko: "취소" })}
            </Button>
            <Button type="submit" form="edit-statement-mapping-form" disabled={pending || !editTarget}>
              {pending
                ? pick(locale, { en: "Saving...", ko: "저장 중..." })
                : pick(locale, { en: "Update", ko: "수정" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
