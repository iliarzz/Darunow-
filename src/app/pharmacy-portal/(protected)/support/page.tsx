"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { InfoChip } from "@/components/ui/InfoChip";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { portalApi } from "@/lib/portal/api";
import { formatDate, formatTime } from "@/lib/format";
import { Clock3, MessageSquare, PhoneCall } from "lucide-react";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  lastMessageAt: number;
  slaMinutes?: number;
  messages?: { id: string; sender: string; body: string; at: number }[];
};

const macros = ["در حال بررسی هستیم", "سفارش ارسال شد", "نیاز به اطلاعات بیشتر داریم", "به تیم فنی منتقل شد"];

export default function PortalSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [statusTab, setStatusTab] = useState("open");
  const [q, setQ] = useState("");
  const [internalNote, setInternalNote] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await portalApi.listTickets();
        setTickets(data as Ticket[]);
        setSelected((data as Ticket[])[0] ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا در دریافت تیکت‌ها");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filtered = tickets.filter((t) => {
    const statusText = (t.status ?? "").toLowerCase();
    const matchesTab =
      statusTab === "open"
        ? statusText.includes("open")
        : statusTab === "waiting"
          ? statusText.includes("waiting") || statusText.includes("pending")
          : statusText.includes("closed") || statusText.includes("resolved");
    const matchesQ = q ? `${t.subject} ${t.id}`.toLowerCase().includes(q.toLowerCase()) : true;
    return matchesTab && matchesQ;
  });

  return (
    <div className="space-y-4 pb-16">
      <Card className="rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <p className="text-sm text-muted">پشتیبانی و تیکت‌ها</p>
            <h1 className="text-2xl font-bold text-primary-900">صف تیکت</h1>
          </div>
          <Badge variant="neutral" className="rounded-full px-3 py-[6px] text-[12px]">
            {tickets.length} تیکت
          </Badge>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-divider bg-surface-1/95 p-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو بر اساس موضوع یا شناسه"
          className="h-9 w-full flex-1 rounded-xl border-divider bg-surface-2/80 text-sm"
        />
      </div>

      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList className="grid w-full grid-cols-3 gap-2">
          <TabsTrigger value="open">باز</TabsTrigger>
          <TabsTrigger value="waiting">منتظر پاسخ شما</TabsTrigger>
          <TabsTrigger value="closed">بسته</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && <ErrorState title="خطا در بارگذاری تیکت‌ها" description="لطفا دوباره تلاش کنید." details={error} onRetry={() => window.location.reload()} />}
      {loading && <SupportSkeleton />}
      {!loading && !error && filtered.length === 0 && <EmptyState title="تیکتی ثبت نشده" />}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[1.05fr,1.4fr]">
          <Card className="space-y-2 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
            {filtered.map((t) => {
              const sla = t.slaMinutes ?? 30;
              const remainingMs = Math.max(0, (t.lastMessageAt ?? Date.now()) + sla * 60000 - Date.now());
              const remainingMin = Math.ceil(remainingMs / 60000);
              const active = selected?.id === t.id;
              return (
                <button
                  key={t.id}
                  className={`w-full rounded-xl border px-3 py-2 text-start transition ${active ? "border-primary-500 bg-accent-200/40" : "border-divider bg-surface-2 hover:border-primary-200"}`}
                  onClick={() => setSelected(t)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary-900">{t.subject}</p>
                    <Badge variant="outline" className="rounded-full px-2 py-[4px] text-[11px]">
                      {t.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[12px] text-muted">
                    <Clock3 className="h-4 w-4" />
                    آخرین پیام: {formatDate(t.lastMessageAt)} • {formatTime(t.lastMessageAt)}
                    <InfoChip>
                      SLA: {remainingMs === 0 ? "تمام" : `${remainingMin} دقیقه`}
                    </InfoChip>
                  </div>
                  <div className="mt-2 flex items-center justify-end">
                    <Button size="sm" variant="ghost" className="rounded-full">
                      مشاهده
                    </Button>
                  </div>
                </button>
              );
            })}
          </Card>

          <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
            {selected ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted">تیکت {selected.id}</p>
                    <h2 className="text-lg font-bold text-primary-900">{selected.subject}</h2>
                  </div>
                  <Badge variant="outline" className="rounded-full px-3 py-[6px] text-[12px]">
                    {selected.status}
                  </Badge>
                </div>

                <div className="space-y-2 rounded-xl border border-divider bg-surface-2/80 p-3">
                  {(selected.messages ?? []).length === 0 && <p className="text-sm text-muted">پیامی ثبت نشده است.</p>}
                  {(selected.messages ?? []).map((m) => (
                    <div key={m.id} className="rounded-lg border border-divider bg-surface-1 p-2">
                      <div className="flex items-center justify-between text-[12px] text-muted">
                        <span>{m.sender}</span>
                        <span>
                          {formatDate(m.at)} • {formatTime(m.at)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-primary-900">{m.body}</p>
                    </div>
                  ))}
                </div>

                <Collapsible open={internalNote} onOpenChange={setInternalNote}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary-900">یادداشت داخلی</p>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Checkbox checked={internalNote} onCheckedChange={(val) => setInternalNote(Boolean(val))} />
                      داخلی
                      <CollapsibleTrigger className="rounded-full bg-transparent px-3 py-1 text-sm text-primary-900 hover:underline">
                        {internalNote ? "پنهان" : "نمایش"}
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <Textarea className="mt-2" placeholder="یادداشت داخلی" />
                  </CollapsibleContent>
                </Collapsible>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary-900">ماکرو سریع</p>
                  <div className="flex flex-wrap gap-2">
                    {macros.map((m) => (
                      <Button key={m} size="sm" variant="secondary" className="rounded-full" onClick={() => setReply(m)}>
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>

                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="پاسخ یا یادداشت" />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      toast({ title: "پاسخ ارسال شد" });
                      setReply("");
                    }}
                  >
                    ارسال پاسخ
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => {
                      setSelected((prev) => (prev ? { ...prev, status: "RESOLVED" } : prev));
                      toast({ title: "تیکت بسته شد" });
                    }}
                  >
                    بستن تیکت
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => toast({ title: "به تماس منتقل شد" })}>
                    <PhoneCall className="me-1 h-4 w-4" /> تماس
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => toast({ title: "یادداشت ثبت شد" })}>
                    <MessageSquare className="me-1 h-4 w-4" /> یادداشت
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState title="تیکتی انتخاب نشده" description="یک تیکت را از لیست انتخاب کنید." />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function SupportSkeleton() {
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
