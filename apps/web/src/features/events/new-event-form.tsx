"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { ContractReference, EntityReference, ProductReference, TenantReference } from "@/lib/api/reference";
import { cn } from "@/lib/utils";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "success"; eventId: string; journalCount: number; duplicate: boolean }
  | { kind: "error"; message: string };

type ReferenceState =
  | { kind: "idle"; entities: EntityReference[]; products: ProductReference[]; contracts: ContractReference[] }
  | { kind: "loading"; entities: EntityReference[]; products: ProductReference[]; contracts: ContractReference[] }
  | { kind: "success"; entities: EntityReference[]; products: ProductReference[]; contracts: ContractReference[] }
  | { kind: "error"; entities: EntityReference[]; products: ProductReference[]; contracts: ContractReference[]; message: string };

type ReferencePayload<T> = {
  items: T[];
  count: number;
};

type TenantState =
  | { kind: "idle"; tenants: TenantReference[] }
  | { kind: "loading"; tenants: TenantReference[] }
  | { kind: "success"; tenants: TenantReference[] }
  | { kind: "error"; tenants: TenantReference[]; message: string };

const defaultValues = {
  accountingDate: "2026-01-31",
  tradeDate: "2026-01-31",
  amount: "42000",
  currency: "USD",
  bookCode: "SPC_BOOK",
};

export function NewEventForm({ locale }: { locale: Locale }) {
  const [eventType, setEventType] = useState<"loan_origination" | "interest_accrual" | "principal_repayment">(
    "interest_accrual",
  );
  const [eventId, setEventId] = useState(() => `WEB-${crypto.randomUUID()}`);
  const [tenantId, setTenantId] = useState("");
  const [entityId, setEntityId] = useState("");
  const [productId, setProductId] = useState("");
  const [contractId, setContractId] = useState("");
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });
  const [tenants, setTenants] = useState<TenantState>({ kind: "idle", tenants: [] });
  const [references, setReferences] = useState<ReferenceState>({
    kind: "idle",
    entities: [],
    products: [],
    contracts: [],
  });

  const selectedEntityId =
    entityId && references.entities.some((entity) => entity.id === entityId) ? entityId : (references.entities[0]?.id ?? "");

  const selectedProductId =
    productId && references.products.some((product) => product.id === productId) ? productId : (references.products[0]?.id ?? "");

  const contractOptions = useMemo(() => {
    if (!selectedProductId) {
      return references.contracts;
    }

    return references.contracts.filter((contract) => contract.productId === selectedProductId);
  }, [selectedProductId, references.contracts]);

  const selectedContractId =
    contractId && contractOptions.some((contract) => contract.id === contractId) ? contractId : (contractOptions[0]?.id ?? "");
  const selectedTenant = tenants.tenants.find((tenant) => tenant.id === tenantId) ?? null;
  const selectedEntity = references.entities.find((entity) => entity.id === selectedEntityId) ?? null;
  const selectedProduct = references.products.find((product) => product.id === selectedProductId) ?? null;
  const selectedContract = contractOptions.find((contract) => contract.id === selectedContractId) ?? null;
  const canSubmit = Boolean(
    tenantId &&
      selectedEntityId &&
      selectedProductId &&
      selectedContractId &&
      references.kind !== "loading" &&
      tenants.kind !== "loading",
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTenants() {
      setTenants((previous) => ({ kind: "loading", tenants: previous.tenants }));

      try {
        const response = await fetch("/api/tenants", { cache: "no-store" });
        if (!response.ok) {
          const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(errorPayload?.message ?? "Failed to load tenants");
        }

        const payload = (await response.json()) as ReferencePayload<TenantReference>;
        if (cancelled) {
          return;
        }

        setTenants({ kind: "success", tenants: payload.items });
        setTenantId((current) => (current && payload.items.some((tenant) => tenant.id === current) ? current : (payload.items[0]?.id ?? "")));
      } catch (error) {
        if (cancelled) {
          return;
        }

        setTenants({
          kind: "error",
          tenants: [],
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    void loadTenants();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!tenantId.trim()) {
      return;
    }

    let cancelled = false;

    async function loadReferences() {
      setReferences((previous) => ({
        kind: "loading",
        entities: previous.entities,
        products: previous.products,
        contracts: previous.contracts,
      }));

      try {
        const [entitiesResponse, productsResponse, contractsResponse] = await Promise.all([
          fetch(`/api/entities?tenantId=${encodeURIComponent(tenantId)}`, { cache: "no-store" }),
          fetch(`/api/products?tenantId=${encodeURIComponent(tenantId)}`, { cache: "no-store" }),
          fetch(`/api/contracts?tenantId=${encodeURIComponent(tenantId)}`, { cache: "no-store" }),
        ]);

        const failedResponse = [entitiesResponse, productsResponse, contractsResponse].find((response) => !response.ok);
        if (failedResponse) {
          const errorPayload = (await failedResponse.json().catch(() => null)) as { message?: string } | null;
          throw new Error(errorPayload?.message ?? "Failed to load reference data");
        }

        const [entitiesPayload, productsPayload, contractsPayload] = await Promise.all([
          entitiesResponse.json() as Promise<ReferencePayload<EntityReference>>,
          productsResponse.json() as Promise<ReferencePayload<ProductReference>>,
          contractsResponse.json() as Promise<ReferencePayload<ContractReference>>,
        ]);

        if (cancelled) {
          return;
        }

        setReferences({
          kind: "success",
          entities: entitiesPayload.items,
          products: productsPayload.items,
          contracts: contractsPayload.items,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setReferences({
          kind: "error",
          entities: [],
          products: [],
          contracts: [],
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    void loadReferences();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setState({ kind: "idle" });

    const payload = {
      tenantId: String(formData.get("tenantId") ?? ""),
      accountingBasis: "KGAAP_GENERAL",
      baseCurrency: "USD",
      event: {
        eventId: String(formData.get("eventId") ?? ""),
        eventType,
        entityId: String(formData.get("entityId") ?? ""),
        bookCode: String(formData.get("bookCode") ?? "SPC_BOOK"),
        accountingDate: String(formData.get("accountingDate") ?? ""),
        tradeDate: String(formData.get("tradeDate") ?? ""),
        currency: String(formData.get("currency") ?? "USD"),
        amount: String(formData.get("amount") ?? ""),
        productId: String(formData.get("productId") ?? ""),
        contractId: String(formData.get("contractId") ?? ""),
      },
    };

    try {
      const response = await fetch("/api/accounting-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? "Failed to post accounting event");
      }

      setState({
        kind: "success",
        eventId: result.eventId,
        journalCount: result.journalCount,
        duplicate: result.skippedAsDuplicate,
      });
      setEventId(`WEB-${crypto.randomUUID()}`);
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
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Loan Lifecycle Event</CardTitle>
        <CardDescription>
          {pick(locale, {
            en: "The first connected client form is intentionally narrow. Select the seeded tenant, then choose the seeded entity, product, and contract references from the connected API.",
            ko: "첫 연결형 클라이언트 폼은 의도적으로 범위를 좁게 유지합니다. seeded tenant를 고른 뒤, entity/product/contract를 API에서 선택하세요.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventType">{pick(locale, { en: "Event Type", ko: "이벤트 유형" })}</Label>
              <Select value={eventType} onValueChange={(value) => setEventType(value as typeof eventType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={pick(locale, { en: "Select one of the enabled event types", ko: "지원되는 이벤트 유형을 선택하세요" })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loan_origination">{pick(locale, { en: "Loan Origination", ko: "대출 실행" })}</SelectItem>
                  <SelectItem value="interest_accrual">{pick(locale, { en: "Interest Accrual", ko: "이자 발생" })}</SelectItem>
                  <SelectItem value="principal_repayment">{pick(locale, { en: "Principal Repayment", ko: "원금 상환" })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="eventId">{pick(locale, { en: "Event ID", ko: "이벤트 ID" })}</Label>
                <button
                  type="button"
                  onClick={() => setEventId(`WEB-${crypto.randomUUID()}`)}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-auto px-0 text-xs")}
                >
                  <RotateCcw className="size-3.5" />
                  {pick(locale, { en: "Regenerate", ko: "재생성" })}
                </button>
              </div>
              <Input id="eventId" name="eventId" value={eventId} onChange={(event) => setEventId(event.target.value)} required />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenantId">{pick(locale, { en: "Tenant", ko: "테넌트" })}</Label>
              <input type="hidden" name="tenantId" value={tenantId} />
              <Select
                value={tenantId}
                onValueChange={(value) => {
                  const nextTenantId = value ?? "";
                  setTenantId(nextTenantId);
                  setEntityId("");
                  setProductId("");
                  setContractId("");
                  if (!nextTenantId) {
                    setReferences({ kind: "idle", entities: [], products: [], contracts: [] });
                  }
                }}
                disabled={tenants.tenants.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={pick(locale, { en: "Select a tenant", ko: "테넌트를 선택하세요" })} />
                </SelectTrigger>
                <SelectContent>
                  {tenants.tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.code} · {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entityId">{pick(locale, { en: "Entity", ko: "회계주체" })}</Label>
              <input type="hidden" name="entityId" value={selectedEntityId} />
              <Select
                value={selectedEntityId}
                onValueChange={(value) => setEntityId(value ?? "")}
                disabled={!tenantId || references.entities.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={tenantId ? pick(locale, { en: "Select an entity", ko: "회계주체를 선택하세요" }) : pick(locale, { en: "Select a tenant first", ko: "먼저 테넌트를 선택하세요" })} />
                </SelectTrigger>
                <SelectContent>
                  {references.entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.code} · {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productId">{pick(locale, { en: "Product", ko: "상품" })}</Label>
              <input type="hidden" name="productId" value={selectedProductId} />
              <Select
                value={selectedProductId}
                onValueChange={(value) => setProductId(value ?? "")}
                disabled={!tenantId || references.products.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={tenantId ? pick(locale, { en: "Select a product", ko: "상품을 선택하세요" }) : pick(locale, { en: "Select a tenant first", ko: "먼저 테넌트를 선택하세요" })} />
                </SelectTrigger>
                <SelectContent>
                  {references.products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.code} · {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractId">{pick(locale, { en: "Contract", ko: "계약" })}</Label>
              <input type="hidden" name="contractId" value={selectedContractId} />
              <Select
                value={selectedContractId}
                onValueChange={(value) => setContractId(value ?? "")}
                disabled={!tenantId || contractOptions.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={tenantId ? pick(locale, { en: "Select a contract", ko: "계약을 선택하세요" }) : pick(locale, { en: "Select a tenant first", ko: "먼저 테넌트를 선택하세요" })} />
                </SelectTrigger>
                <SelectContent>
                  {contractOptions.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.code} · {contract.contractType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="bookCode">{pick(locale, { en: "Book Code", ko: "장부 코드" })}</Label>
              <Input id="bookCode" name="bookCode" defaultValue={defaultValues.bookCode} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{pick(locale, { en: "Currency", ko: "통화" })}</Label>
              <Input id="currency" name="currency" defaultValue={defaultValues.currency} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountingDate">{pick(locale, { en: "Accounting Date", ko: "회계일" })}</Label>
              <Input id="accountingDate" name="accountingDate" type="date" defaultValue={defaultValues.accountingDate} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeDate">{pick(locale, { en: "Trade Date", ko: "거래일" })}</Label>
              <Input id="tradeDate" name="tradeDate" type="date" defaultValue={defaultValues.tradeDate} required />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_220px]">
            <div className="space-y-2">
              <Label htmlFor="amount">{pick(locale, { en: "Amount", ko: "금액" })}</Label>
              <Input id="amount" name="amount" defaultValue={defaultValues.amount} required />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={pending || !canSubmit} className="w-full">
                {pending ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                {pick(locale, { en: "Submit Event", ko: "이벤트 제출" })}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              {pick(locale, { en: "Posting context", ko: "Posting 문맥" })}
            </div>
            <p className="mt-2 leading-6">
              {selectedTenant ? `${selectedTenant.code}` : pick(locale, { en: "Select a tenant", ko: "테넌트 선택" })} /{" "}
              {selectedEntity ? `${selectedEntity.code}` : pick(locale, { en: "Select an entity", ko: "회계주체 선택" })} /{" "}
              {selectedProduct ? `${selectedProduct.code}` : pick(locale, { en: "Select a product", ko: "상품 선택" })} /{" "}
              {selectedContract ? `${selectedContract.code}` : pick(locale, { en: "Select a contract", ko: "계약 선택" })}
            </p>
          </div>

          {state.kind === "success" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{state.duplicate ? pick(locale, { en: "Duplicate", ko: "중복" }) : pick(locale, { en: "Posted", ko: "처리 완료" })}</Badge>
                <span className="font-medium">{state.eventId}</span>
              </div>
              <p className="mt-2">
                {pick(locale, {
                  en: `Journal count: ${state.journalCount}. ${state.duplicate ? "No new journals were created." : "Posting completed."}`,
                  ko: `전표 수: ${state.journalCount}. ${state.duplicate ? "새 전표는 생성되지 않았습니다." : "Posting이 완료되었습니다."}`,
                })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/events?tenantId=${encodeURIComponent(tenantId)}&entityId=${encodeURIComponent(selectedEntityId)}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
                >
                  {pick(locale, { en: "View Events", ko: "이벤트 보기" })}
                </Link>
                <Link
                  href={`/journals?tenantId=${encodeURIComponent(tenantId)}&entityId=${encodeURIComponent(selectedEntityId)}&from=${encodeURIComponent(defaultValues.accountingDate)}&to=${encodeURIComponent(defaultValues.accountingDate)}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
                >
                  {pick(locale, { en: "View Journals", ko: "전표 보기" })}
                </Link>
              </div>
            </div>
          ) : null}

          {state.kind === "error" ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.message}
            </div>
          ) : null}

          {references.kind === "loading" ? (
            <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {pick(locale, { en: "Loading entity, product, and contract references for this tenant.", ko: "이 테넌트의 entity, product, contract 기준정보를 불러오는 중입니다." })}
            </div>
          ) : null}

          {references.kind === "error" ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {references.message}
            </div>
          ) : null}

          {tenants.kind === "loading" ? (
            <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {pick(locale, { en: "Loading tenant list.", ko: "테넌트 목록을 불러오는 중입니다." })}
            </div>
          ) : null}

          {tenants.kind === "error" ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {tenants.message}
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
