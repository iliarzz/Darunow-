"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command as CommandRoot,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { hasPermission } from "@/lib/rbac/permissions";
import type { Permission, Role } from "@/lib/rbac/types";
import { cn } from "@/lib/utils";
import {
  Bell,
  Boxes,
  CirclePower,
  ClipboardList,
  Command,
  FileText,
  Headset,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  PackageSearch,
  Search,
  Settings,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
};

const navItems: NavItem[] = [
  { href: "/pharmacy-portal", label: "داشبورد", icon: LayoutDashboard },
  { href: "/pharmacy-portal/orders", label: "سفارش‌ها", icon: ClipboardList, permission: "ORDERS_VIEW" },
  { href: "/pharmacy-portal/prescriptions", label: "نسخه‌ها", icon: FileText, permission: "PRESCRIPTIONS_REVIEW" },
  { href: "/pharmacy-portal/inventory", label: "موجودی", icon: Boxes, permission: "INVENTORY_MANAGE" },
  { href: "/pharmacy-portal/finance", label: "مالی", icon: Wallet, permission: "FINANCE_VIEW" },
  { href: "/pharmacy-portal/support", label: "پشتیبانی", icon: Headset, permission: "SUPPORT_VIEW" },
  { href: "/pharmacy-portal/settings", label: "تنظیمات", icon: Settings, permission: "SETTINGS_MANAGE" },
];

export function PortalLayout({
  children,
  pharmacyName,
  pharmacyId,
  role,
  permissions,
  onLogout,
}: {
  children: ReactNode;
  pharmacyName: string;
  pharmacyId: string;
  role: Role;
  permissions: Permission[];
  onLogout?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [search, setSearch] = useState("");

  const can = useMemo(() => {
    const own = new Set(permissions ?? []);
    return (perm?: Permission) => !perm || own.has(perm) || hasPermission(role, perm);
  }, [permissions, role]);

  useEffect(() => {
    const stored = window.localStorage.getItem("darunow.portal.navCollapsed");
    if (stored) setCollapsed(stored === "1");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("darunow.portal.navCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const initials = useMemo(() => pharmacyName?.trim().slice(0, 2) || "دار", [pharmacyName]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        (target as HTMLElement | null)?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const allowedNav = useMemo(
    () => navItems.filter((item) => can(item.permission)),
    [can],
  );

  const handleSearch = (value?: string) => {
    const q = (value ?? search).trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.push(`/pharmacy-portal/orders${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-surface-2 text-primary-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 lg:flex-row lg:gap-6 lg:px-6">
        <aside className="sticky top-3 z-30 hidden lg:block">
          <Card
            className={cn(
              "flex h-[calc(100vh-32px)] flex-col justify-between rounded-2xl border border-divider/80 bg-surface-1/90 p-3 shadow-soft backdrop-blur",
              collapsed ? "w-[82px]" : "w-64",
            )}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-2/90 px-2 py-2">
                {!collapsed && (
                  <div className="space-y-[2px]">
                    <p className="text-[11px] text-muted">پرتال داروخانه</p>
                    <p className="truncate text-[13px] font-semibold text-primary-900">{pharmacyName}</p>
                    <Badge variant="outline" className="w-fit rounded-full px-2 py-[3px] text-[10px]">
                      کد: {pharmacyId}
                    </Badge>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 rounded-xl p-0"
                  onClick={() => setCollapsed((prev) => !prev)}
                  title={collapsed ? "باز کردن منو" : "بستن منو"}
                >
                  {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                </Button>
              </div>

              <nav className="space-y-1">
                {allowedNav.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all",
                        active ? "bg-surface-3 text-primary-900 shadow-xs" : "text-muted hover:bg-surface-2/90 hover:text-primary-900",
                        collapsed && "justify-center px-2",
                      )}
                      title={item.label}
                    >
                      <Icon className="h-5 w-5" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className={cn("flex items-center gap-2 rounded-xl border border-divider px-3 py-2", collapsed && "justify-center px-2")}>
              <Badge variant="neutral" className="rounded-full px-2 py-[3px] text-[10px]">
                نقش: {role}
              </Badge>
              {!collapsed && onLogout && (
                <Button variant="ghost" size="sm" className="rounded-full" onClick={onLogout}>
                  خروج
                </Button>
              )}
            </div>
          </Card>
        </aside>
        <main className="flex-1 space-y-4">
          <header className="sticky top-3 z-40">
            <Card className="flex flex-col gap-3 rounded-2xl border border-divider/80 bg-surface-1/95 px-4 py-3.5 shadow-soft backdrop-blur md:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-200/70 text-base font-bold text-primary-900">
                    {initials}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-muted">پرتال داروخانه</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-primary-900 lg:text-[20px]">{pharmacyName}</p>
                      <Badge variant="outline" className="rounded-full px-2.5 py-[3px] text-[10px]">
                        کد: {pharmacyId}
                      </Badge>
                      <Badge variant="neutral" className="rounded-full px-2.5 py-[3px] text-[10px]">
                        نقش: {role}
                      </Badge>
                    </div>
                    <p className="text-[11px] leading-5 text-muted">دسترسی سریع به سفارش، موجودی و پشتیبانی</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={online ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-9 rounded-full px-3.5 text-[11.5px]",
                      online ? "text-success-800 shadow-none" : "text-muted hover:text-primary-900",
                    )}
                    onClick={() => setOnline((v) => !v)}
                  >
                    <CirclePower className="me-1 h-4 w-4" />
                    {online ? "در حال پذیرش" : "آفلاین"}
                  </Button>
                  <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-xl p-0" title="اعلان‌ها">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-danger-500" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 rounded-full px-3.5 text-[11.5px]"
                    onClick={() => setPaletteOpen(true)}
                    title="Command Palette"
                  >
                    <Command className="me-1 h-4 w-4" />
                    ⌘K
                  </Button>
                  {onLogout && (
                    <Button variant="ghost" size="sm" className="h-9 rounded-full px-3.5 text-[11.5px]" onClick={onLogout}>
                      خروج
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-divider/80 pt-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="relative flex min-w-[260px] flex-1 items-center gap-2 rounded-2xl border border-divider bg-surface-2 px-3 py-2.5 shadow-inner"
                >
                  <Search className="h-4 w-4 text-muted" />
                  <Input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="جستجوی سفارش، مشتری یا کالا (کلید /)"
                    className="h-9 flex-1 border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                    data-portal-search
                  />
                  {search && (
                    <Button variant="ghost" size="sm" className="h-8 rounded-full px-2 text-[11px]" type="button" onClick={() => setSearch("")}>
                      پاکسازی
                    </Button>
                  )}
                  <Button type="submit" size="sm" className="h-9 rounded-full px-4 text-[11.5px]">
                    جستجو
                  </Button>
                </form>
                <div className="ms-auto flex items-center gap-1 lg:hidden">
                  {allowedNav.slice(0, 4).map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href} className={cn("rounded-full p-2", active && "bg-surface-3")}>
                        <Icon className="h-4 w-4" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Card>
          </header>
          <div className="space-y-4">{children}</div>
        </main>
      </div>
      <PortalCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} actions={allowedNav} onNavigate={(href) => router.push(href)} />
    </div>
  );
}

type CommandAction = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function PortalCommandPalette({
  open,
  onOpenChange,
  actions,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: CommandAction[];
  onNavigate: (href: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border border-divider/80 bg-surface-1/95 p-0 shadow-elev-2">
        <CommandRoot label="پالت فرمان پرتال" className="rounded-2xl">
          <CommandInput placeholder="پرش سریع بین بخش‌های پرتال" />
          <CommandList>
            <CommandEmpty>یافت نشد.</CommandEmpty>
            <CommandGroup heading="بخش‌ها">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <CommandItem
                    key={action.href}
                    value={action.label}
                    onSelect={() => {
                      onNavigate(action.href);
                      onOpenChange(false);
                    }}
                  >
                    <Icon className="me-2 h-4 w-4 text-muted" />
                    <span>{action.label}</span>
                    <CommandShortcut>↵</CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="میانبرها">
              <CommandItem
                value="focus-search"
                onSelect={() => {
                  const searchBox = document.querySelector<HTMLInputElement>("[data-portal-search]");
                  searchBox?.focus();
                  searchBox?.select();
                  onOpenChange(false);
                }}
              >
                <Search className="me-2 h-4 w-4 text-muted" />
                <span>Focus جستجو</span>
                <CommandShortcut>/</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandRoot>
      </DialogContent>
    </Dialog>
  );
}
