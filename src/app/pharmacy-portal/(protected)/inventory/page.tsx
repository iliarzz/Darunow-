"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/use-toast";
import { portalApi } from "@/lib/portal/api";
import { formatDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";

type InventoryItem = {
  productId: string;
  name: string;
  strength?: string;
  form?: string;
  stock: number;
  lowStockThreshold?: number;
  expiresAt?: number;
  supplier?: string;
  category?: string;
  lastUpdatedAt?: number;
  lastUpdatedBy?: string;
  reorderRequested?: boolean;
};

type FormState = {
  productId: string;
  name: string;
  strength?: string;
  form?: string;
  stock: number;
  lowStockThreshold?: number;
  expiresAt?: string;
  supplier?: string;
  category?: string;
  reorderRequested?: boolean;
};

export default function PortalInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [formFilter, setFormFilter] = useState("");
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<FormState>({ productId: "", name: "", stock: 0, lowStockThreshold: 5 });
  const [stockPopover, setStockPopover] = useState<{ productId: string; value: number; threshold: number; reorder: boolean } | null>(null);
  const [detailOpen, setDetailOpen] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await portalApi.listInventory();
        setItems(data as InventoryItem[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا در دریافت موجودی");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[], [items]);
  const suppliers = useMemo(() => Array.from(new Set(items.map((i) => i.supplier).filter(Boolean))) as string[], [items]);
  const forms = useMemo(() => Array.from(new Set(items.map((i) => i.form).filter(Boolean))) as string[], [items]);

  const lowStock = useMemo(() => items.filter((i) => i.lowStockThreshold !== undefined && i.stock <= (i.lowStockThreshold ?? 0)), [items]);
  const expiringSoon = useMemo(
    () => items.filter((i) => i.expiresAt && i.expiresAt - Date.now() < 30 * 24 * 60 * 60 * 1000),
    [items],
  );

  const filtered = useMemo(() => {
    const base = tab === "low" ? lowStock : tab === "expiring" ? expiringSoon : items;
    return base
      .filter((i) => {
        if (!q) return true;
        const text = `${i.productId} ${i.name ?? ""} ${i.strength ?? ""} ${i.form ?? ""}`.toLowerCase();
        return text.includes(q.toLowerCase());
      })
      .filter((i) => (category ? i.category === category : true))
      .filter((i) => (supplier ? i.supplier === supplier : true))
      .filter((i) => (formFilter ? i.form === formFilter : true))
      .filter((i) => (showOutOfStock ? true : i.stock > 0));
  }, [category, expiringSoon, formFilter, items, lowStock, q, showOutOfStock, supplier, tab]);

  const resetForm = (item?: InventoryItem) => {
    if (item) {
      setForm({
        productId: item.productId,
        name: item.name,
        strength: item.strength,
        form: item.form,
        stock: item.stock,
        lowStockThreshold: item.lowStockThreshold ?? 5,
        expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 10) : "",
        supplier: item.supplier,
        category: item.category,
        reorderRequested: item.reorderRequested,
      });
      setEditing(item);
    } else {
      setForm({ productId: "", name: "", strength: "", form: "", stock: 0, lowStockThreshold: 5, expiresAt: "" });
      setEditing(null);
    }
  };

  const openDrawer = (item?: InventoryItem) => {
    resetForm(item);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.productId || !form.name) {
      toast({ title: "شناسه و نام اجباری است", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        productId: form.productId,
        name: form.name,
        strength: form.strength,
        form: form.form,
        stock: Number(form.stock ?? 0),
        lowStockThreshold: Number(form.lowStockThreshold ?? 0),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).getTime() : undefined,
        supplier: form.supplier,
        category: form.category,
        reorderRequested: form.reorderRequested,
      };
      if (editing) {
        const updated = await portalApi.updateInventoryItem(editing.productId, payload);
        setItems((prev) => prev.map((i) => (i.productId === editing.productId ? { ...i, ...updated } : i)));
        toast({ title: "بروزرسانی شد" });
      } else {
        const created = await portalApi.createInventoryItem(payload);
        setItems((prev) => [{ ...(created as InventoryItem), lastUpdatedAt: Date.now() }, ...prev]);
        toast({ title: "افزوده شد" });
      }
      setDrawerOpen(false);
    } catch (err) {
      toast({ title: "خطا", description: err instanceof Error ? err.message : "ثبت محصول انجام نشد", variant: "destructive" });
    }
  };

  const handleStockUpdate = async () => {
    if (!stockPopover) return;
    const { productId, value, threshold, reorder } = stockPopover;
    const current = items.find((i) => i.productId === productId);
    const delta = current ? value - (current.stock ?? 0) : value;
    try {
      await portalApi.adjustInventory(productId, delta);
      await portalApi.updateInventoryItem(productId, { lowStockThreshold: threshold, reorderRequested: reorder });
      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, stock: value, lowStockThreshold: threshold, reorderRequested: reorder, lastUpdatedAt: Date.now() }
            : item,
        ),
      );
      toast({ title: "موجودی ثبت شد" });
    } catch (err) {
      toast({ title: "خطا در به‌روزرسانی", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setStockPopover(null);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-divider bg-surface-1/95 p-3">
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-divider bg-surface-2/70 px-3 py-2">
          <Search className="h-4 w-4 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو: شناسه، نام یا شکل دارویی"
            className="h-8 flex-1 border-none bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0"
          />
        </div>
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary" className="rounded-full">
              <Filter className="me-1 h-4 w-4" /> فیلترها
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="space-y-2">
              <label className="space-y-1 text-xs text-muted">
                <span>دسته‌بندی</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-divider bg-surface-2/70 px-3 py-2 text-sm"
                >
                  <option value="">همه</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs text-muted">
                <span>تامین‌کننده</span>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full rounded-xl border border-divider bg-surface-2/70 px-3 py-2 text-sm"
                >
                  <option value="">همه</option>
                  {suppliers.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs text-muted">
                <span>شکل دارویی</span>
                <select
                  value={formFilter}
                  onChange={(e) => setFormFilter(e.target.value)}
                  className="w-full rounded-xl border border-divider bg-surface-2/70 px-3 py-2 text-sm"
                >
                  <option value="">همه</option>
                  {forms.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showOutOfStock} onChange={(e) => setShowOutOfStock(e.target.checked)} /> نمایش ناموجودها
              </label>
              <Button
                variant="ghost"
                className="w-full rounded-full"
                onClick={() => {
                  setCategory("");
                  setSupplier("");
                  setFormFilter("");
                  setShowOutOfStock(false);
                }}
              >
                پاک‌سازی
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-2xl border border-divider bg-surface-1/90 p-3 shadow-soft">
          <p className="text-[12px] text-muted">کمبود</p>
          <p className="text-lg font-bold text-primary-900">{lowStock.length} قلم</p>
        </Card>
        <Card className="rounded-2xl border border-divider bg-surface-1/90 p-3 shadow-soft">
          <p className="text-[12px] text-muted">نزدیک انقضا</p>
          <p className="text-lg font-bold text-primary-900">{expiringSoon.length} قلم</p>
        </Card>
        <Card className="rounded-2xl border border-divider bg-surface-1/90 p-3 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted">افزودن آیتم</p>
              <p className="text-lg font-bold text-primary-900">مدیریت کاتالوگ</p>
            </div>
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="rounded-full">
                  <Plus className="me-1 h-4 w-4" /> آیتم جدید
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{editing ? "ویرایش محصول" : "افزودن محصول جدید"}</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                  <div className="grid gap-2">
                    <Label>شناسه محصول</Label>
                    <Input value={form.productId ?? ""} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>نام</Label>
                    <Input value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>قدرت/دوز</Label>
                      <Input value={form.strength ?? ""} onChange={(e) => setForm((f) => ({ ...f, strength: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>شکل دارویی</Label>
                      <Input value={form.form ?? ""} onChange={(e) => setForm((f) => ({ ...f, form: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>موجودی</Label>
                      <Input
                        type="number"
                        value={form.stock ?? 0}
                        onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>آستانه کمبود</Label>
                      <Input
                        type="number"
                        value={form.lowStockThreshold ?? 5}
                        onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>تامین‌کننده</Label>
                      <Input value={form.supplier ?? ""} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>دسته‌بندی</Label>
                      <Input value={form.category ?? ""} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>تاریخ انقضا (اختیاری)</Label>
                    <Input
                      type="date"
                      value={(form.expiresAt as string) ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    />
                  </div>
                  <label className="flex items-center gap-2 rounded-xl border border-divider bg-surface-2 px-3 py-2 text-sm">
                    <Checkbox
                      checked={Boolean(form.reorderRequested)}
                      onCheckedChange={(val) => setForm((f) => ({ ...f, reorderRequested: Boolean(val) }))}
                    />
                    علامت‌گذاری برای سفارش مجدد
                  </label>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                      انصراف
                    </Button>
                    <Button onClick={handleSave}>{editing ? "ذخیره" : "افزودن"}</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </Card>
      </div>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: "all", label: "همه" },
          { value: "low", label: "کمبود" },
          { value: "expiring", label: "نزدیک انقضا" },
        ]}
        className="rounded-2xl border border-divider bg-surface-1/90 p-1 shadow-soft"
      />

      {loading && <InventorySkeleton />}
      {error && <ErrorState title="خطا در بارگذاری موجودی" description="دسترسی برقرار نشد." details={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && filtered.length === 0 && <EmptyState title="آیتمی در این بخش نیست" description="بعدا دوباره سر بزنید." />}

      {!loading && !error && filtered.length > 0 && (
        <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary-900">
              {tab === "low" ? "اقلام در کمبود" : tab === "expiring" ? "نزدیک انقضا" : "همه اقلام"}
            </p>
            <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px]">
              {filtered.length} مورد
            </Badge>
          </div>
          <div className="space-y-2">
            {filtered.map((item) => {
              const isLow = item.stock <= (item.lowStockThreshold ?? 0);
              const isExpiring = item.expiresAt ? item.expiresAt - Date.now() < 30 * 24 * 60 * 60 * 1000 : false;
              const lastUpdate = item.lastUpdatedAt ? formatDate(item.lastUpdatedAt) : null;
              return (
                <Card key={item.productId} className="space-y-2 rounded-xl border border-divider bg-surface-2/80 p-3 shadow-none">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-primary-900">{item.name ?? item.productId}</p>
                        <Badge variant="neutral" className="rounded-full px-2 py-[4px] text-[11px]">
                          {item.form ?? "شکل نامشخص"}
                        </Badge>
                        {item.reorderRequested && (
                          <Badge variant="warning" className="rounded-full px-2 py-[4px] text-[11px]">
                            لیست سفارش
                          </Badge>
                        )}
                      </div>
                      <p className="text-[12px] text-muted">
                        {item.strength} • شناسه: {item.productId}
                      </p>
                      {lastUpdate && (
                        <p className="text-[12px] text-muted">
                          آخرین بروزرسانی: {lastUpdate}
                          {item.lastUpdatedBy ? ` توسط ${item.lastUpdatedBy}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Popover
                        open={stockPopover?.productId === item.productId}
                        onOpenChange={(open) =>
                          open
                            ? setStockPopover({
                                productId: item.productId,
                                value: item.stock,
                                threshold: item.lowStockThreshold ?? 5,
                                reorder: Boolean(item.reorderRequested),
                              })
                            : setStockPopover(null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-full px-3"
                            title="ویرایش موجودی"
                          >
                            <SlidersHorizontal className="me-1 h-4 w-4" />
                            {item.stock === 0 ? "ناموجود" : `موجودی: ${item.stock}`}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-64 space-y-2">
                          <div className="space-y-1">
                            <Label className="text-xs">موجودی جدید</Label>
                            <Input
                              type="number"
                              value={stockPopover?.value ?? item.stock}
                              onChange={(e) =>
                                setStockPopover((prev) =>
                                  prev
                                    ? { ...prev, value: Number(e.target.value) }
                                    : { productId: item.productId, value: Number(e.target.value), threshold: item.lowStockThreshold ?? 5, reorder: Boolean(item.reorderRequested) },
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">آستانه کمبود</Label>
                            <Input
                              type="number"
                              value={stockPopover?.threshold ?? item.lowStockThreshold ?? 5}
                              onChange={(e) =>
                                setStockPopover((prev) =>
                                  prev
                                    ? { ...prev, threshold: Number(e.target.value) }
                                    : { productId: item.productId, value: item.stock, threshold: Number(e.target.value), reorder: Boolean(item.reorderRequested) },
                                )
                              }
                            />
                          </div>
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={stockPopover?.reorder ?? Boolean(item.reorderRequested)}
                              onCheckedChange={(val) =>
                                setStockPopover((prev) =>
                                  prev
                                    ? { ...prev, reorder: Boolean(val) }
                                    : { productId: item.productId, value: item.stock, threshold: item.lowStockThreshold ?? 5, reorder: Boolean(val) },
                                )
                              }
                            />
                            علامت سفارش مجدد
                          </label>
                          <div className="flex justify-end gap-2 pt-1">
                            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setStockPopover(null)}>
                              انصراف
                            </Button>
                            <Button size="sm" className="rounded-full" onClick={handleStockUpdate}>
                              تایید
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Badge variant={isLow ? "warning" : item.stock === 0 ? "error" : "success"} className="rounded-full px-2 py-[6px] text-[12px]">
                        {isLow ? "کمبود" : item.stock === 0 ? "ناموجود" : "موجود"}
                      </Badge>
                      {isExpiring && (
                        <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px] text-warning">
                          نزدیک انقضا
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Collapsible open={detailOpen[item.productId]} onOpenChange={(open) => setDetailOpen((prev) => ({ ...prev, [item.productId]: open }))}>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-muted">جزئیات بیشتر</p>
                      <CollapsibleTrigger className="rounded-full bg-transparent px-3 py-1 text-sm text-primary-900 hover:underline">
                        {detailOpen[item.productId] ? "بستن" : "مشاهده"}
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-2 space-y-1 rounded-xl border border-divider bg-surface-1/70 p-3 text-[13px] text-muted">
                      <div className="flex items-center justify-between">
                        <span>تامین‌کننده</span>
                        <span>{item.supplier ?? "-"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>دسته</span>
                        <span>{item.category ?? "-"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>انقضا</span>
                        <span>{item.expiresAt ? formatDate(item.expiresAt) : "-"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>آستانه کمبود</span>
                        <span>{item.lowStockThreshold ?? 0}</span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  <div className="flex items-center justify-end">
                    <Button variant="ghost" size="sm" className="rounded-full" onClick={() => openDrawer(item)}>
                      ویرایش محصول
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {!loading && !error && lowStock.length > 0 && (
        <Card className="space-y-2 rounded-2xl border border-warning/40 bg-warning/10 p-4 shadow-soft">
          <p className="text-sm font-semibold text-primary-900">هشدار کمبود موجودی</p>
          {lowStock.map((item) => (
            <div key={item.productId} className="flex items-center justify-between rounded-xl border border-warning/40 bg-surface-1/60 px-3 py-2 text-sm">
              <span>{item.name ?? item.productId}</span>
              <Badge variant="warning" className="rounded-full px-2 py-[6px] text-[12px]">
                موجودی {item.stock}
              </Badge>
            </div>
          ))}
        </Card>
      )}
      <AlertDialog open={false}>
        <AlertDialogContent />
      </AlertDialog>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border border-divider bg-surface-1/80 p-4">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="mt-2 h-3 w-24 rounded-full" />
        </Card>
      ))}
    </div>
  );
}
