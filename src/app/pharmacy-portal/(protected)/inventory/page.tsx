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
import { Filter, Plus, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
};

export default function PortalInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("all");
  const [adjustTarget, setAdjustTarget] = useState<{ productId: string; delta: number } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<FormState>({ productId: "", name: "", stock: 0, lowStockThreshold: 5 });
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
      .filter((i) => (showOutOfStock ? true : i.stock > 0));
  }, [category, expiringSoon, items, lowStock, q, showOutOfStock, supplier, tab]);

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

  const confirmAdjust = async () => {
    if (!adjustTarget) return;
    const { productId, delta } = adjustTarget;
    try {
      await portalApi.adjustInventory(productId, delta);
      setItems((prev) =>
        prev.map((item) => (item.productId === productId ? { ...item, stock: Math.max(0, (item.stock ?? 0) + delta) } : item)),
      );
      toast({ title: "به‌روزرسانی شد", description: `موجودی جدید برای ${productId}` });
    } catch (err) {
      toast({ title: "خطا در به‌روزرسانی", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setAdjustTarget(null);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      <Card className="rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">موجودی انبار</p>
            <h1 className="text-2xl font-bold text-primary-900">کنترل موجودی</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={lowStock.length > 0 ? "warning" : "neutral"} className="rounded-full px-3 py-[6px] text-[12px]">
              هشدار کمبود: {lowStock.length}
            </Badge>
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="rounded-full">
                  <Plus className="me-1 h-4 w-4" /> افزودن محصول
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
        </div>
      </Card>

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
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showOutOfStock} onChange={(e) => setShowOutOfStock(e.target.checked)} /> نمایش ناموجودها
              </label>
              <Button
                variant="ghost"
                className="w-full rounded-full"
                onClick={() => {
                  setCategory("");
                  setSupplier("");
                  setShowOutOfStock(false);
                }}
              >
                پاک‌سازی
              </Button>
            </div>
          </PopoverContent>
        </Popover>
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
                <div
                  key={item.productId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-divider bg-surface-2 px-3 py-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-primary-900">{item.name ?? item.productId}</p>
                      <Badge variant="neutral" className="rounded-full px-2 py-[4px] text-[11px]">
                        {item.form ?? "شکل نامشخص"}
                      </Badge>
                    </div>
                    <p className="text-[12px] text-muted">
                      {item.strength} • شناسه: {item.productId}
                    </p>
                    {lastUpdate && (
                      <p className="text-[12px] text-muted">آخرین بروزرسانی: {lastUpdate}{item.lastUpdatedBy ? ` توسط ${item.lastUpdatedBy}` : ""}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={isLow ? "warning" : item.stock === 0 ? "error" : "neutral"} className="rounded-full px-2 py-[6px] text-[12px]">
                      {item.stock === 0 ? "ناموجود" : `موجودی: ${item.stock}`}
                    </Badge>
                    {isExpiring && (
                      <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px] text-warning">
                        نزدیک انقضا
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => setAdjustTarget({ productId: item.productId, delta: -1 })}
                      >
                        -
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => setAdjustTarget({ productId: item.productId, delta: 1 })}
                      >
                        +
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full" onClick={() => openDrawer(item)}>
                      ویرایش
                    </Button>
                  </div>
                </div>
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

      <AlertDialog open={Boolean(adjustTarget)} onOpenChange={(open) => !open && setAdjustTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تایید تغییر موجودی</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted">مقدار به‌روزرسانی: {adjustTarget?.delta ?? 0} واحد</p>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAdjust}>تایید</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
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
