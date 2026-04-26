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
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { EntityReference } from "@/lib/api/reference";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "error"; message: string };

const entityTypes = ["asset_manager", "fund", "spc", "corporate", "other"] as const;

export function EntitiesTable({
  items,
  locale,
  tenantId,
}: {
  items: EntityReference[];
  locale: Locale;
  tenantId: string;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EntityReference | null>(null);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  async function createOrUpdate(url: string, method: "POST" | "PATCH", payload: Record<string, unknown>) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(result?.message ?? "Failed to save entity");
    }
  }

  async function handleCreate(formData: FormData) {
    setPending(true);
    setState({ kind: "idle" });
    try {
      await createOrUpdate("/api/entities", "POST", {
        tenantId,
        code: String(formData.get("code") ?? ""),
        name: String(formData.get("name") ?? ""),
        entityType: String(formData.get("entityType") ?? ""),
        functionalCurrency: String(formData.get("functionalCurrency") ?? ""),
        status: String(formData.get("status") ?? "active"),
      });
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
      await createOrUpdate(`/api/entities/${editTarget.id}?tenantId=${encodeURIComponent(tenantId)}`, "PATCH", {
        code: String(formData.get("code") ?? ""),
        name: String(formData.get("name") ?? ""),
        entityType: String(formData.get("entityType") ?? ""),
        functionalCurrency: String(formData.get("functionalCurrency") ?? ""),
        status: String(formData.get("status") ?? "active"),
      });
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

  async function handleDeactivate(item: EntityReference) {
    setPending(true);
    setState({ kind: "idle" });
    try {
      await createOrUpdate(`/api/entities/${item.id}?tenantId=${encodeURIComponent(tenantId)}`, "PATCH", {
        status: "inactive",
      });
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
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button />}>
            {pick(locale, { en: "Add Unit", ko: "회계 단위 추가" })}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{pick(locale, { en: "Add Accounting Unit", ko: "회계 단위 추가" })}</DialogTitle>
              <DialogDescription>
                {pick(locale, { en: "Register a new entity used in accounting and reporting.", ko: "회계와 보고에 사용할 새 회계 단위를 등록합니다." })}
              </DialogDescription>
            </DialogHeader>
            <form
              id="create-entity-form"
              onSubmit={async (event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                await handleCreate(new FormData(event.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="create-code">{pick(locale, { en: "Code", ko: "코드" })}</Label>
                <Input id="create-code" name="code" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-name">{pick(locale, { en: "Name", ko: "이름" })}</Label>
                <Input id="create-name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-entityType">{pick(locale, { en: "Type", ko: "유형" })}</Label>
                <NativeSelect id="create-entityType" name="entityType" defaultValue="spc">
                  {entityTypes.map((entityType) => (
                    <option key={entityType} value={entityType}>{entityType}</option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-functionalCurrency">{pick(locale, { en: "Currency", ko: "통화" })}</Label>
                <Input id="create-functionalCurrency" name="functionalCurrency" defaultValue="USD" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-status">{pick(locale, { en: "Status", ko: "상태" })}</Label>
                <NativeSelect id="create-status" name="status" defaultValue="active">
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </NativeSelect>
              </div>
            </form>
            <DialogFooter>
              {state.kind === "error" ? <p className="mr-auto text-sm text-destructive">{state.message}</p> : <div className="mr-auto" />}
              <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>
                {pick(locale, { en: "Cancel", ko: "취소" })}
              </Button>
              <Button type="submit" form="create-entity-form" disabled={pending}>
                {pending ? pick(locale, { en: "Saving...", ko: "저장 중..." }) : pick(locale, { en: "Save", ko: "저장" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {state.kind === "error" ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{pick(locale, { en: "Code", ko: "코드" })}</TableHead>
            <TableHead>{pick(locale, { en: "Name", ko: "이름" })}</TableHead>
            <TableHead>{pick(locale, { en: "Type", ko: "유형" })}</TableHead>
            <TableHead>{pick(locale, { en: "Currency", ko: "통화" })}</TableHead>
            <TableHead>{pick(locale, { en: "Status", ko: "상태" })}</TableHead>
            <TableHead className="text-right">{pick(locale, { en: "Manage", ko: "관리" })}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.code}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.entityType}</TableCell>
              <TableCell>{item.functionalCurrency}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => {
                    setState({ kind: "idle" });
                    setEditTarget(item);
                  }}>
                    {pick(locale, { en: "Edit", ko: "수정" })}
                  </Button>
                  {item.status !== "inactive" ? (
                    <Button variant="outline" size="sm" type="button" disabled={pending} onClick={() => void handleDeactivate(item)}>
                      {pick(locale, { en: "Deactivate", ko: "비활성화" })}
                    </Button>
                  ) : null}
                </div>
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
            <DialogTitle>{pick(locale, { en: "Edit Accounting Unit", ko: "회계 단위 수정" })}</DialogTitle>
            <DialogDescription>
              {pick(locale, { en: "Update the selected entity information.", ko: "선택한 회계 단위 정보를 수정합니다." })}
            </DialogDescription>
          </DialogHeader>
          {editTarget ? (
            <form
              id="edit-entity-form"
              onSubmit={async (event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                await handleEdit(new FormData(event.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-code">{pick(locale, { en: "Code", ko: "코드" })}</Label>
                <Input id="edit-code" name="code" defaultValue={editTarget.code} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">{pick(locale, { en: "Name", ko: "이름" })}</Label>
                <Input id="edit-name" name="name" defaultValue={editTarget.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-entityType">{pick(locale, { en: "Type", ko: "유형" })}</Label>
                <NativeSelect id="edit-entityType" name="entityType" defaultValue={editTarget.entityType}>
                  {entityTypes.map((entityType) => (
                    <option key={entityType} value={entityType}>{entityType}</option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-functionalCurrency">{pick(locale, { en: "Currency", ko: "통화" })}</Label>
                <Input id="edit-functionalCurrency" name="functionalCurrency" defaultValue={editTarget.functionalCurrency} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">{pick(locale, { en: "Status", ko: "상태" })}</Label>
                <NativeSelect id="edit-status" name="status" defaultValue={editTarget.status}>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </NativeSelect>
              </div>
            </form>
          ) : null}
          <DialogFooter>
            {state.kind === "error" ? <p className="mr-auto text-sm text-destructive">{state.message}</p> : <div className="mr-auto" />}
            <Button variant="outline" type="button" onClick={() => setEditTarget(null)}>
              {pick(locale, { en: "Cancel", ko: "취소" })}
            </Button>
            <Button type="submit" form="edit-entity-form" disabled={pending || !editTarget}>
              {pending ? pick(locale, { en: "Saving...", ko: "저장 중..." }) : pick(locale, { en: "Save", ko: "저장" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
