"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type PartnerRegistration,
  type PartnerRegistrationStatus,
  type PartnerRegistrationType,
  addRegistration,
  bulkUpdateStatus,
  createRegistrationId,
  getRegistrations,
  removeRegistrations,
  updateRegistration,
} from "@/lib/partner-registrations";

const typeLabels: Record<PartnerRegistrationType, string> = {
  waitlist: "لیست انتظار",
  pharmacy: "داروخانه",
  clinic: "کلینیک",
  hospital: "بیمارستان",
};

const statusLabels: Record<PartnerRegistrationStatus, string> = {
  pending: "در انتظار",
  approved: "تأیید شده",
  denied: "رد شده",
};

const statusStyles: Record<PartnerRegistrationStatus, string> = {
  pending: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  approved: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  denied: "border-rose-300/30 bg-rose-300/10 text-rose-100",
};

const typeOptions: Array<PartnerRegistrationType | "all"> = ["all", "waitlist", "pharmacy", "clinic", "hospital"];
const statusOptions: Array<PartnerRegistrationStatus | "all"> = ["all", "pending", "approved", "denied"];
const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "name", label: "نام (الفبا)" },
];

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleString("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
};

const toEndOfDay = (value: string) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const formatIranPhone = (value: string) => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0098")) {
    digits = `0${digits.slice(4)}`;
  } else if (digits.startsWith("98")) {
    digits = `0${digits.slice(2)}`;
  }
  if (digits.length > 11) digits = digits.slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

type NewEntry = {
  type: PartnerRegistrationType;
  status: PartnerRegistrationStatus;
  name: string;
  managerName: string;
  city: string;
  phone: string;
  email: string;
  note: string;
  internalNote: string;
  license: string;
  specialty: string;
  department: string;
  bedCount: string;
};

const createDefaultEntry = (): NewEntry => ({
  type: "pharmacy",
  status: "pending",
  name: "",
  managerName: "",
  city: "",
  phone: "",
  email: "",
  note: "",
  internalNote: "",
  license: "",
  specialty: "",
  department: "",
  bedCount: "",
});

const validateNewEntry = (entry: NewEntry) => {
  const errors: Partial<Record<keyof NewEntry, string>> = {};
  if (entry.type !== "waitlist" && !entry.name.trim()) {
    errors.name = "نام مجموعه ضروری است.";
  }
  if (!entry.email.trim()) {
    errors.email = "ایمیل ضروری است.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email.trim())) {
    errors.email = "ایمیل معتبر نیست.";
  }
  if (entry.type !== "waitlist") {
    const phoneDigits = entry.phone.replace(/\D/g, "");
    if (!phoneDigits) {
      errors.phone = "شماره تماس ضروری است.";
    } else if (!/^09\d{9}$/.test(phoneDigits)) {
      errors.phone = "شماره تماس معتبر نیست.";
    }
  }
  return errors;
};

const buildSearchText = (item: PartnerRegistration) => {
  const extraValues = item.extra ? Object.values(item.extra).join(" ") : "";
  return [
    item.name,
    item.managerName,
    item.city,
    item.phone,
    item.email,
    item.note,
    item.internalNote,
    extraValues,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const exportCsv = (items: PartnerRegistration[]) => {
  const headers = [
    "id",
    "type",
    "status",
    "name",
    "managerName",
    "city",
    "phone",
    "email",
    "note",
    "internalNote",
    "extra",
    "createdAt",
    "updatedAt",
    "createdBy",
  ];
  const escapeCsv = (value: string) => `"${value.replace(/\"/g, '""')}"`;
  const rows = items.map((item) => {
    const extra = item.extra ? JSON.stringify(item.extra) : "";
    return [
      item.id,
      item.type,
      item.status,
      item.name,
      item.managerName ?? "",
      item.city ?? "",
      item.phone ?? "",
      item.email ?? "",
      item.note ?? "",
      item.internalNote ?? "",
      extra,
      item.createdAt,
      item.updatedAt ?? "",
      item.createdBy ?? "",
    ].map((value) => escapeCsv(String(value ?? "")));
  });
  const csvContent = ["\uFEFF" + headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "darunow-partners.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function ComingSoonAdminPage() {
  const [items, setItems] = useState<PartnerRegistration[]>([]);
  const [typeFilter, setTypeFilter] = useState<PartnerRegistrationType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PartnerRegistrationStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newEntry, setNewEntry] = useState<NewEntry>(createDefaultEntry());
  const [newErrors, setNewErrors] = useState<Partial<Record<keyof NewEntry, string>>>({});

  useEffect(() => {
    setItems(getRegistrations());
  }, []);

  const stats = useMemo(() => {
    const pending = items.filter((item) => item.status === "pending").length;
    const approved = items.filter((item) => item.status === "approved").length;
    const denied = items.filter((item) => item.status === "denied").length;
    return {
      total: items.length,
      pending,
      approved,
      denied,
    };
  }, [items]);

  const filtered = useMemo(() => {
    let next = items.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      next = next.filter((item) => buildSearchText(item).includes(needle));
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      next = next.filter((item) => new Date(item.createdAt) >= from);
    }
    if (dateTo) {
      const to = toEndOfDay(dateTo);
      next = next.filter((item) => new Date(item.createdAt) <= to);
    }
    if (sortBy === "newest") {
      next = [...next].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      next = [...next].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      next = [...next].sort((a, b) => a.name.localeCompare(b.name, "fa"));
    }
    return next;
  }, [items, typeFilter, statusFilter, query, dateFrom, dateTo, sortBy]);

  const allFilteredIds = useMemo(() => filtered.map((item) => item.id), [filtered]);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.includes(id));

  const refreshItems = () => {
    setItems(getRegistrations());
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.href = "/coming-soon/admin/login";
    }
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleStatusChange = (id: string, status: PartnerRegistrationStatus) => {
    const next = updateRegistration(id, { status });
    setItems(next);
  };

  const handleBulkStatus = (status: PartnerRegistrationStatus) => {
    if (!selected.length) return;
    const next = bulkUpdateStatus(selected, status);
    setItems(next);
    setSelected([]);
  };

  const handleBulkDelete = () => {
    if (!selected.length) return;
    const next = removeRegistrations(selected);
    setItems(next);
    setSelected([]);
  };

  const handleDelete = (id: string) => {
    const next = removeRegistrations([id]);
    setItems(next);
    setSelected((prev) => prev.filter((item) => item !== id));
  };

  const handleNoteSave = (id: string) => {
    const value = noteDrafts[id]?.trim();
    const next = updateRegistration(id, { internalNote: value || undefined });
    setItems(next);
  };

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateNewEntry(newEntry);
    setNewErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const extra: Record<string, string> = {};
    if (newEntry.type === "pharmacy" && newEntry.license.trim()) extra.license = newEntry.license.trim();
    if (newEntry.type === "clinic" && newEntry.specialty.trim()) extra.specialty = newEntry.specialty.trim();
    if (newEntry.type === "hospital") {
      if (newEntry.department.trim()) extra.department = newEntry.department.trim();
      if (newEntry.bedCount.trim()) extra.bedCount = newEntry.bedCount.trim();
    }
    const entry: PartnerRegistration = {
      id: createRegistrationId(),
      type: newEntry.type,
      name: newEntry.type === "waitlist" ? "عضویت لیست انتظار" : newEntry.name.trim(),
      managerName: newEntry.managerName.trim() || undefined,
      city: newEntry.city.trim() || undefined,
      phone: newEntry.phone.trim() || undefined,
      email: newEntry.email.trim(),
      note: newEntry.note.trim() || undefined,
      internalNote: newEntry.internalNote.trim() || undefined,
      extra: Object.keys(extra).length ? extra : undefined,
      createdAt: new Date().toISOString(),
      status: newEntry.status,
      createdBy: "admin",
    };
    const next = addRegistration(entry);
    setItems(next);
    setNewEntry(createDefaultEntry());
    setNewErrors({});
    setShowCreate(false);
  };

  const showCreateExtra = newEntry.type !== "waitlist";

  return (
    <section className="mx-auto flex min-h-[84vh] max-w-6xl flex-col px-6 pb-16 pt-10" data-allow-copy="true">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-white/50">دارونَو · پنل مدیریت</div>
          <h1 className="mt-2 text-2xl font-semibold">درخواست‌های همکاری و لیست انتظار</h1>
          <p className="mt-2 text-sm text-white/55">نمایش، پیگیری و مدیریت درخواست‌های ثبت‌شده.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-white/70">
            <Shield className="h-4 w-4 text-white/60" />
            دسترسی محافظت‌شده
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="cs-hover-smooth inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-white/80 transition hover:border-white/30 hover:bg-white/10"
          >
            خروج
            <LogOut className="h-4 w-4 text-white/60" />
          </button>
          <button
            type="button"
            onClick={refreshItems}
            className="cs-hover-smooth inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-white/80 transition hover:border-white/30 hover:bg-white/10"
          >
            بروزرسانی
            <RefreshCw className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </header>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <StatCard label="کل درخواست‌ها" value={`${stats.total}`} />
            <StatCard label="در انتظار بررسی" value={`${stats.pending}`} tone="pending" />
            <StatCard label="تأیید شده" value={`${stats.approved}`} tone="approved" />
            <StatCard label="رد شده" value={`${stats.denied}`} tone="denied" />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-white/12 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="جستجو بین نام، ایمیل، تلفن، شهر، توضیحات"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-white/12 bg-black/30 pr-10 pl-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25 focus:bg-black/35"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white outline-none transition focus:border-white/25"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as PartnerRegistrationType | "all")}
                  className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white outline-none transition focus:border-white/25"
                >
                  {typeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "همه نوع‌ها" : typeLabels[option]}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as PartnerRegistrationStatus | "all")}
                  className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white outline-none transition focus:border-white/25"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "همه وضعیت‌ها" : statusLabels[option]}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white outline-none transition focus:border-white/25"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white outline-none transition focus:border-white/25"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/12 bg-white/5 p-5 backdrop-blur-xl">
              <div className="text-xs text-white/50">انتخاب‌شده</div>
              <div className="mt-2 text-2xl font-semibold">{selected.length}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton onClick={() => handleBulkStatus("approved")} tone="approve" disabled={!selected.length}>
                  تأیید گروهی
                </ActionButton>
                <ActionButton onClick={() => handleBulkStatus("denied")} tone="deny" disabled={!selected.length}>
                  رد گروهی
                </ActionButton>
                <ActionButton onClick={() => handleBulkStatus("pending")} tone="reset" disabled={!selected.length}>
                  بازگشت به انتظار
                </ActionButton>
                <ActionButton onClick={handleBulkDelete} tone="danger" disabled={!selected.length}>
                  حذف
                  <Trash2 className="h-4 w-4" />
                </ActionButton>
                <ActionButton onClick={() => exportCsv(filtered)} tone="neutral">
                  خروجی CSV
                  <Download className="h-4 w-4" />
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/12 bg-white/5 p-5 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setShowCreate((prev) => !prev)}
              className="flex w-full items-center justify-between text-sm font-semibold text-white/80"
            >
              افزودن درخواست جدید
              {showCreate ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showCreate ? (
              <form className="mt-5 space-y-4" onSubmit={handleCreateSubmit}>
                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    value={newEntry.type}
                    onChange={(event) =>
                      setNewEntry((prev) => ({ ...prev, type: event.target.value as PartnerRegistrationType }))
                    }
                    className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white outline-none transition focus:border-white/25"
                  >
                    {typeOptions
                      .filter((option): option is PartnerRegistrationType => option !== "all")
                      .map((option) => (
                        <option key={option} value={option}>
                          {typeLabels[option]}
                        </option>
                      ))}
                  </select>
                  <select
                    value={newEntry.status}
                    onChange={(event) =>
                      setNewEntry((prev) => ({ ...prev, status: event.target.value as PartnerRegistrationStatus }))
                    }
                    className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white outline-none transition focus:border-white/25"
                  >
                    {statusOptions
                      .filter((option): option is PartnerRegistrationStatus => option !== "all")
                      .map((option) => (
                        <option key={option} value={option}>
                          {statusLabels[option]}
                        </option>
                      ))}
                  </select>
                  <input
                    type="text"
                    placeholder="نام مجموعه"
                    value={newEntry.name}
                    onChange={(event) => setNewEntry((prev) => ({ ...prev, name: event.target.value }))}
                    className={cn(
                      "h-11 rounded-2xl border bg-black/30 px-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25",
                      newErrors.name ? "border-rose-300/60" : "border-white/12"
                    )}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    type="text"
                    placeholder="نام مسئول"
                    value={newEntry.managerName}
                    onChange={(event) => setNewEntry((prev) => ({ ...prev, managerName: event.target.value }))}
                    className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25"
                  />
                  <input
                    type="text"
                    placeholder="شهر"
                    value={newEntry.city}
                    onChange={(event) => setNewEntry((prev) => ({ ...prev, city: event.target.value }))}
                    className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25"
                  />
                  <input
                    type="tel"
                    placeholder="شماره تماس"
                    value={newEntry.phone}
                    onChange={(event) =>
                      setNewEntry((prev) => ({ ...prev, phone: formatIranPhone(event.target.value) }))
                    }
                    className={cn(
                      "h-11 rounded-2xl border bg-black/30 px-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25",
                      newErrors.phone ? "border-rose-300/60" : "border-white/12"
                    )}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="email"
                    placeholder="ایمیل"
                    value={newEntry.email}
                    onChange={(event) => setNewEntry((prev) => ({ ...prev, email: event.target.value }))}
                    className={cn(
                      "h-11 rounded-2xl border bg-black/30 px-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25",
                      newErrors.email ? "border-rose-300/60" : "border-white/12"
                    )}
                  />
                  <input
                    type="text"
                    placeholder="یادداشت داخلی"
                    value={newEntry.internalNote}
                    onChange={(event) => setNewEntry((prev) => ({ ...prev, internalNote: event.target.value }))}
                    className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="توضیح کوتاه"
                  value={newEntry.note}
                  onChange={(event) => setNewEntry((prev) => ({ ...prev, note: event.target.value }))}
                  className="min-h-[88px] w-full resize-none rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25"
                />
                {showCreateExtra ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    {newEntry.type === "pharmacy" ? (
                      <input
                        type="text"
                        placeholder="کد مجوز داروخانه"
                        value={newEntry.license}
                        onChange={(event) => setNewEntry((prev) => ({ ...prev, license: event.target.value }))}
                        className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25"
                      />
                    ) : null}
                    {newEntry.type === "clinic" ? (
                      <input
                        type="text"
                        placeholder="تخصص کلینیک"
                        value={newEntry.specialty}
                        onChange={(event) => setNewEntry((prev) => ({ ...prev, specialty: event.target.value }))}
                        className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25"
                      />
                    ) : null}
                    {newEntry.type === "hospital" ? (
                      <>
                        <input
                          type="text"
                          placeholder="بخش اصلی"
                          value={newEntry.department}
                          onChange={(event) => setNewEntry((prev) => ({ ...prev, department: event.target.value }))}
                          className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="تعداد تخت"
                          value={newEntry.bedCount}
                          onChange={(event) =>
                            setNewEntry((prev) => ({ ...prev, bedCount: event.target.value.replace(/\D/g, "") }))
                          }
                          className="h-11 rounded-2xl border border-white/12 bg-black/30 px-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25"
                        />
                      </>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 text-xs text-rose-200/80">
                  {newErrors.name || newErrors.email || newErrors.phone ? "لطفاً خطاها را رفع کنید." : ""}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="cs-hover-smooth inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2 text-xs font-semibold text-[#050913] transition hover:translate-y-[-1px]"
                  >
                    ایجاد درخواست
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewEntry(createDefaultEntry());
                      setNewErrors({});
                    }}
                    className="cs-hover-smooth inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/30"
                  >
                    پاکسازی فرم
                  </button>
                </div>
              </form>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-white/50">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="cs-hover-smooth rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 transition hover:border-white/30"
            >
              {allSelected ? "حذف انتخاب همه" : "انتخاب همه نتایج"}
            </button>
            <div>{`نمایش ${filtered.length} مورد`}</div>
          </div>

          <div className="mt-4 space-y-4">
            {filtered.length === 0 ? (
              <div className="rounded-[28px] border border-white/12 bg-white/5 px-6 py-10 text-center text-sm text-white/60 backdrop-blur-xl">
                هنوز درخواستی ثبت نشده است.
              </div>
            ) : (
              filtered.map((item) => {
                const isExpanded = expanded.includes(item.id);
                const noteValue = noteDrafts[item.id] ?? item.internalNote ?? "";
                return (
                  <div
                    key={item.id}
                    className="rounded-[28px] border border-white/12 bg-white/5 p-5 backdrop-blur-xl"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() => toggleSelected(item.id)}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-black/20 text-[#7EB3CC] focus:ring-[#7EB3CC]/40"
                        />
                        <div>
                          <div className="text-sm font-semibold text-white/90">{item.name}</div>
                          <div className="mt-1 text-xs text-white/50">
                            {typeLabels[item.type]}
                            {item.city ? ` • ${item.city}` : ""}
                            {item.createdBy ? ` • ${item.createdBy === "admin" ? "ثبت مدیر" : "فرم کاربر"}` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-[11px] font-semibold",
                            statusStyles[item.status]
                          )}
                        >
                          {statusLabels[item.status]}
                        </span>
                        <span className="text-xs text-white/45">{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-xs text-white/70 md:grid-cols-3">
                      <InfoBlock label="مسئول" value={item.managerName || "—"} />
                      <InfoBlock label="تلفن" value={item.phone || "—"} />
                      <InfoBlock label="ایمیل" value={item.email || "—"} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <ActionButton onClick={() => handleStatusChange(item.id, "approved")} tone="approve">
                        تأیید
                        <Check className="h-4 w-4" />
                      </ActionButton>
                      <ActionButton onClick={() => handleStatusChange(item.id, "denied")} tone="deny">
                        رد
                        <X className="h-4 w-4" />
                      </ActionButton>
                      <ActionButton onClick={() => handleStatusChange(item.id, "pending")} tone="reset">
                        بازگشت به انتظار
                      </ActionButton>
                      <ActionButton onClick={() => handleDelete(item.id)} tone="danger">
                        حذف
                        <Trash2 className="h-4 w-4" />
                      </ActionButton>
                      <ActionButton onClick={() => toggleExpanded(item.id)} tone="neutral">
                        {isExpanded ? "بستن جزئیات" : "جزئیات"}
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </ActionButton>
                    </div>

                    {isExpanded ? (
                      <div className="mt-4 space-y-3">
                        {item.note ? (
                          <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs text-white/60">
                            {item.note}
                          </div>
                        ) : null}

                        {item.extra ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(item.extra).map(([key, value]) => (
                              <span
                                key={key}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60"
                              >
                                {`${labelizeExtraKey(key)}: ${value}`}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs text-white/55">یادداشت داخلی</div>
                          <textarea
                            rows={2}
                            value={noteValue}
                            onChange={(event) =>
                              setNoteDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))
                            }
                            className="mt-2 min-h-[80px] w-full resize-none rounded-2xl border border-white/12 bg-black/30 px-4 py-2 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-white/25"
                          />
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
                            <button
                              type="button"
                              onClick={() => handleNoteSave(item.id)}
                              className="cs-hover-smooth rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:border-white/30"
                            >
                              ذخیره یادداشت
                            </button>
                            {item.updatedAt ? <span>{`آخرین به‌روزرسانی: ${formatDate(item.updatedAt)}`}</span> : null}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "pending" | "approved" | "denied";
}) {
  const toneStyles: Record<typeof tone, string> = {
    neutral: "border-white/10 bg-white/5 text-white/80",
    pending: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    approved: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    denied: "border-rose-300/30 bg-rose-300/10 text-rose-100",
  };
  return (
    <div className={cn("rounded-2xl border px-4 py-4", toneStyles[tone])}>
      <div className="text-xs text-white/55">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="text-[11px] text-white/45">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/90">{value}</div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  tone,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  tone: "approve" | "deny" | "reset" | "danger" | "neutral";
  disabled?: boolean;
}) {
  const tones = {
    approve: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:border-emerald-200/60",
    deny: "border-rose-300/30 bg-rose-300/10 text-rose-100 hover:border-rose-200/60",
    reset: "border-white/10 bg-white/5 text-white/70 hover:border-white/30",
    danger: "border-rose-300/30 bg-rose-300/10 text-rose-100 hover:border-rose-200/60",
    neutral: "border-white/10 bg-white/5 text-white/70 hover:border-white/30",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "cs-hover-smooth inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition",
        tones[tone],
        disabled ? "cursor-not-allowed opacity-40" : ""
      )}
    >
      {children}
    </button>
  );
}

function labelizeExtraKey(key: string) {
  if (key === "license") return "کد مجوز";
  if (key === "specialty") return "تخصص";
  if (key === "department") return "بخش";
  if (key === "bedCount") return "تعداد تخت";
  return key;
}
