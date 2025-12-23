"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Pharmacy, Product } from "@/lib/types";
import { CategoryPills } from "@/components/pharmacy/category-pills";
import { ProductCard } from "@/components/pharmacy/product-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { seedPharmacies, seedProducts } from "@/lib/mock/seed";
import { useCartItems } from "@/stores/cart";
import { useToast } from "@/components/ui/use-toast";
import { useCartGuard } from "@/components/cart/useCartGuard";
import { useFavorites, toggleFavorite } from "@/stores/favorites";
import { Star } from "lucide-react";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

export default function PharmacyDetail({ params }: { params: { slug: string } }) {
  const [pharmacy, setPharmacy] = useState<Pharmacy | undefined>(
    seedPharmacies.find((p) => p.slug === params.slug),
  );
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const cartItems = useCartItems();
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const { requestAdd, conflictSheet } = useCartGuard();
  const favorites = useFavorites();
  const isFavorite = pharmacy ? favorites.pharmacyIds.includes(pharmacy.id) : false;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const fallback = seedPharmacies.find((s) => s.slug === params.slug);
      let target = fallback;
      try {
        const remote = await api.getPharmacy(params.slug);
        if (remote) target = remote;
      } catch {
        target = fallback;
      }
      setPharmacy(target);
      const pid = target?.id;
      try {
        const list = await api.listProducts(pid);
        const scoped = pid ? list.filter((p) => p.pharmacyId === pid) : list;
        setProducts(scoped?.length ? scoped : pid ? seedProducts.filter((p) => p.pharmacyId === pid) : seedProducts);
      } catch {
        setProducts(pid ? seedProducts.filter((p) => p.pharmacyId === pid) : seedProducts);
        setError("بارگذاری محصولات ناموفق بود.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug]);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.categoryFa))) as string[], [products]);
  const scopedProducts = useMemo(
    () => (pharmacy ? products.filter((p) => p.pharmacyId === pharmacy.id) : []),
    [pharmacy, products],
  );
  const filteredProducts = useMemo(() => {
    if (category) {
      return scopedProducts.filter((p) => p.categoryFa === category);
    }
    return scopedProducts;
  }, [category, scopedProducts]);

  if (!pharmacy) {
    return (
      <EmptyState
        title="داروخانه پیدا نشد."
        description="لطفا به فهرست داروخانه‌ها برگرد."
        action={{ label: "بازگشت به جستجو", href: "/pharmacies" }}
      />
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <Card className="space-y-3 border border-border bg-surface-1 p-4">
        <MediaPlaceholder aspect="banner" className="rounded-xl border border-dashed border-border/60" />
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-[18px] font-bold text-primary-900">{pharmacy.name}</h1>
            <p className="text-sm text-muted">{pharmacy.addressShort}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">
                {pharmacy.rating.toLocaleString("fa-IR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} امتیاز
              </Badge>
              <Badge variant={pharmacy.isOpen ? "success" : "warning"}>{pharmacy.isOpen ? "باز" : "بسته"}</Badge>
              <Badge variant="neutral">
                {pharmacy.deliveryEtaMin.toLocaleString("fa-IR")} تا {pharmacy.deliveryEtaMax.toLocaleString("fa-IR")} دقیقه
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface-2 text-primary-800 hover:bg-surface-3"
              aria-label="علاقه‌مندی"
              onClick={async () => {
                await toggleFavorite(pharmacy.id);
                track("favorite_toggle", { pharmacyId: pharmacy.id, favorite: !isFavorite });
              }}
            >
              <Star className={cn("h-5 w-5", isFavorite ? "fill-primary-800" : "")} />
            </button>
            <Chip selected className="cursor-default">
              تحویل مطمئن
            </Chip>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {pharmacy.tags.slice(0, 4).map((tag) => (
            <Chip key={tag} selected={false} className="cursor-default">
              {tag}
            </Chip>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">محصولات</TabsTrigger>
          <TabsTrigger value="about">اطلاعات</TabsTrigger>
          <TabsTrigger value="reviews">نظرات</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="space-y-4">
          <CategoryPills categories={categories as string[]} active={category} onSelect={(cat) => setCategory(cat)} />
          {error && <p className="text-xs text-warning">{error}</p>}
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="space-y-3 border border-border p-3">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </Card>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((prod, idx) => (
                <ProductCard key={prod.id} product={prod} index={idx} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="محصولی در این دسته نیست."
              description="به دسته دیگری سر بزن یا با داروخانه تماس بگیر."
            />
          )}
        </TabsContent>
        <TabsContent value="about">
          <Card className="space-y-2 border border-border p-5">
            <p className="text-sm text-primary-900/85">
              تیم داروخانه {pharmacy.name} با داروسازان شیفت آنلاین و ارسال سرد در دسترس است. برای مشاوره تماس بگیرید یا از طریق اپلیکیشن پیام بفرستید.
            </p>
            <p className="text-xs text-muted">پشتیبانی همه‌روزه ۸ صبح تا ۱۲ شب.</p>
          </Card>
        </TabsContent>
        <TabsContent value="reviews">
          <Card className="space-y-2 border border-border p-5">
            <p className="text-sm text-primary-900/85">هنوز دیدگاهی ثبت نشده است. شما اولین نفر باشید.</p>
            <p className="text-xs text-muted">پس از ثبت سفارش می‌توانید تجربه خود را ثبت کنید.</p>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-24 z-30 flex flex-wrap gap-2 rounded-[16px] border border-border bg-surface-1 px-4 py-3 shadow-sm">
        <Button variant="primary" className="flex-1 min-w-[140px]">
          ارسال نسخه
        </Button>
        <Button
          variant="secondary"
          className="flex-1 min-w-[160px]"
          disabled={(filteredProducts ?? []).length === 0}
          onClick={() => {
            const first = filteredProducts[0] ?? scopedProducts[0];
            if (first) {
              const conflict =
                cartItems.length > 0 && cartItems.some((c) => c.pharmacyId !== first.pharmacyId);
              requestAdd({
                id: first.id,
                pharmacyId: first.pharmacyId,
                name: first.nameFa,
                subtitle: first.dosageFa,
                price: first.priceToman,
                qty: 1,
              });
              if (!conflict) {
                toast({ title: "به سبد اضافه شد", description: first.nameFa });
              }
            }
          }}
        >
          افزودن سریع
        </Button>
        {cartCount > 0 && (
          <Button asChild variant="ghost" className="flex-1 min-w-[160px]">
            <Link href="/cart">مشاهده سبد ({cartCount.toLocaleString("fa-IR")})</Link>
          </Button>
        )}
      </div>
      {conflictSheet}
    </div>
  );
}
