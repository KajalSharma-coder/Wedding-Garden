"use client";

import Link from "next/link";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  GalleryHorizontal,
  ImagePlus,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Users,
  X
} from "lucide-react";
import { LocalMedia } from "@/components/local-media";
import { API_BASE, readJson } from "@/lib/api-client";

type Mode = "dashboard" | "services" | "add-service" | "bookings" | "leads" | "reviews" | "availability" | "profile";
type ApiState<T> = { loading: boolean; error: string; data: T | null };
type TableColumn<T> = { key: string; label: string; render: (row: T) => React.ReactNode; mobile?: boolean };

const nav = [
  { href: "/vendor-dashboard", label: "Dashboard", mode: "dashboard", icon: LayoutDashboard },
  { href: "/vendor-dashboard/services", label: "My Services", mode: "services", icon: GalleryHorizontal },
  { href: "/vendor-dashboard/add-service", label: "Add Service", mode: "add-service", icon: Plus },
  { href: "/vendor-dashboard/bookings", label: "Bookings", mode: "bookings", icon: CalendarDays },
  { href: "/vendor-dashboard/leads", label: "Leads", mode: "leads", icon: Mail },
  { href: "/vendor-dashboard/reviews", label: "My Reviews", mode: "reviews", icon: Star },
  { href: "/vendor-dashboard/availability", label: "Availability", mode: "availability", icon: Clock3 },
  { href: "/vendor-dashboard/profile", label: "Profile", mode: "profile", icon: Settings }
] as const;

const categories = ["Gardens", "Decoration", "DJ Band", "Makeup Artists", "Pandit Ji", "Anchor", "Caterers", "Car & Bus", "Photography", "Mehendi Artists", "Destination Wedding", "Corporate Events", "Banquet Halls", "Resorts"];
const inputClass = "input-luxury";

async function api(path: string, init: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const nextInit: RequestInit = { ...init };

  if (init.body instanceof FormData) {
    const entries = Array.from(init.body.entries());
    const hasFiles = entries.some(([, value]) => value instanceof File && value.size > 0);

    if (!hasFiles) {
      nextInit.body = JSON.stringify(Object.fromEntries(entries.map(([key, value]) => [key, String(value)])));
      nextInit.headers = { "Content-Type": "application/json", ...(init.headers || {}) };
    }
  }

  try {
    const response = await fetch(url, { credentials: "include", ...nextInit });
    return readJson(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Node API is not reachable at ${API_BASE}. Start it with npm run dev:api or npm run dev.`);
    }
    throw error;
  }
}

function money(value: unknown) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function titleFor(mode: Mode) {
  return nav.find((item) => item.mode === mode)?.label || "Dashboard";
}

function Status({ value }: { value: string }) {
  const status = String(value || "pending").toLowerCase();
  const styles: Record<string, string> = {
    approved: "border-emerald-400/30 bg-emerald-400/12 text-emerald-200",
    accepted: "border-emerald-400/30 bg-emerald-400/12 text-emerald-200",
    completed: "border-blue-300/30 bg-blue-300/12 text-blue-100",
    pending: "border-amber-300/35 bg-amber-300/12 text-amber-100",
    blocked: "border-rose-300/35 bg-rose-300/12 text-rose-100",
    booked: "border-blue-300/30 bg-blue-300/12 text-blue-100",
    cancelled: "border-rose-300/35 bg-rose-300/12 text-rose-100",
    rejected: "border-rose-300/35 bg-rose-300/12 text-rose-100",
    suspended: "border-zinc-300/25 bg-zinc-300/10 text-zinc-100",
    available: "border-emerald-400/30 bg-emerald-400/12 text-emerald-200"
  };

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${styles[status] || styles.pending}`}>{status}</span>;
}

function Empty({ text }: { text: string }) {
  return (
    <div className="dashboard-card p-8 text-center text-sm text-cream/68">
      <Sparkles className="mx-auto mb-3 text-gold" size={28} />
      {text}
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`dashboard-card ${className}`}>{children}</section>;
}

function Field({
  label,
  hint,
  icon: Icon,
  children
}: {
  label: string;
  hint?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cream/70">
        {Icon ? <Icon size={14} className="text-gold" /> : null}
        {label}
      </span>
      {children}
      {hint ? <span className="text-xs leading-5 text-cream/48">{hint}</span> : null}
    </label>
  );
}

function DataTable<T>({
  rows,
  columns,
  searchPlaceholder,
  emptyText
}: {
  rows: T[];
  columns: TableColumn<T>[];
  searchPlaceholder: string;
  emptyText: string;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(needle));
  }, [query, rows]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, rows.length]);

  return (
    <Panel className="overflow-hidden">
      <div className="card-header">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream/45" size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} className={`${inputClass} w-full pl-10`} />
        </div>
        <span className="text-sm text-cream/55">{filtered.length} record{filtered.length === 1 ? "" : "s"}</span>
      </div>
      {current.length ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="table-luxury">
              <thead>
                <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
              </thead>
              <tbody>
                {current.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 p-4 md:hidden">
            {current.map((row, rowIndex) => (
              <article key={rowIndex} className="rounded-[8px] border border-white/10 bg-black/18 p-4">
                {columns.filter((column) => column.mobile !== false).map((column) => (
                  <div key={column.key} className="mb-3 last:mb-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cream/45">{column.label}</p>
                    <div className="mt-1 text-sm text-cream/84">{column.render(row)}</div>
                  </div>
                ))}
              </article>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-white/10 p-4 text-sm text-cream/60">
            <button className="btn-secondary px-3 py-2" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">
              <ChevronLeft size={16} /> Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button className="btn-secondary px-3 py-2" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} type="button">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <div className="p-4"><Empty text={emptyText} /></div>
      )}
    </Panel>
  );
}

export function VendorDashboardClient({ mode }: { mode: Mode }) {
  const [state, setState] = useState<ApiState<any>>({ loading: true, error: "", data: null });
  const [services, setServices] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeService = useMemo(() => services[0], [services]);

  async function load() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const dashboard = await api("/vendors/dashboard");
      const serviceData = await api("/vendors/services");
      let pageData: any = {};
      if (mode === "bookings") pageData = await api("/vendors/bookings");
      if (mode === "leads") pageData = await api("/vendors/leads");
      if (mode === "reviews") pageData = await api("/vendors/reviews");
      if (mode === "availability" && serviceData.services?.[0]) {
        pageData = await api(`/vendors/availability?service_id=${serviceData.services[0].id}`);
      }
      setServices(serviceData.services || []);
      setState({ loading: false, error: "", data: { ...dashboard, ...pageData } });
    } catch (error) {
      setState({ loading: false, error: error instanceof Error ? error.message : "Could not load dashboard.", data: null });
    }
  }

  useEffect(() => {
    load();
  }, [mode]);

  async function submitForm(event: React.FormEvent<HTMLFormElement>, path: string) {
    event.preventDefault();
    setMessage("");
    const formElement = event.currentTarget as HTMLFormElement;
    try {
      const method = path.includes("/vendors/services/") || path === "/vendors/profile" ? "PUT" : "POST";
      const result = await api(path, { method, body: new FormData(formElement) });
      setMessage(result.message || "Saved.");
      formElement.reset();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed.");
    }
  }

  async function post(path: string, body: Record<string, string | number>) {
    const form = new FormData();
    const method = String(body._method || (path.includes("/vendors/bookings/") ? "PATCH" : "POST"));
    Object.entries(body).forEach(([key, value]) => {
      if (key !== "_method") form.set(key, String(value));
    });
    const result = await api(path, { method, body: form });
    setMessage(result.message || "Saved.");
    await load();
  }

  async function logout() {
    try {
      await api("/vendors/logout", { method: "POST", body: new FormData() });
    } catch (error) {
      console.warn("Vendor logout API was not reachable.", error);
    }
    window.location.href = "/";
  }

  if (state.error.includes("Vendor login required")) {
    return <VendorLogin message={message} submitForm={submitForm} />;
  }

  const active = nav.find((item) => item.mode === mode);

  return (
    <main className="min-h-screen bg-[#090405] text-ivory">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(215,164,59,0.16),transparent_34%),linear-gradient(135deg,#090405_0%,#16070c_50%,#2a0710_100%)]" />
      <div className="lg:grid lg:grid-cols-[292px_minmax(0,1fr)]">
        <aside className={`fixed inset-y-0 left-0 z-50 w-[292px] overflow-y-auto border-r border-white/10 bg-[#090405]/96 p-5 shadow-2xl backdrop-blur-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="grid size-12 place-items-center rounded-[8px] bg-gold font-black text-ink shadow-glow">RV</span>
              <span className="min-w-0">
                <strong className="block truncate font-display text-xl">Royal Vivah</strong>
                <small className="block text-xs uppercase tracking-[0.22em] text-gold">Vendor Suite</small>
              </span>
            </Link>
            <button className="grid size-10 place-items-center rounded-[8px] border border-white/12 text-cream lg:hidden" onClick={() => setSidebarOpen(false)} type="button" aria-label="Close sidebar">
              <X size={18} />
            </button>
          </div>
          <div className="mt-6 rounded-[8px] border border-gold/20 bg-gold/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Workspace</p>
            <p className="mt-2 truncate text-sm font-semibold text-cream/86">{state.data?.vendor?.business_name || "Vendor Account"}</p>
            {state.data?.vendor?.status ? <div className="mt-3"><Status value={state.data.vendor.status} /></div> : null}
          </div>
          <nav className="mt-6 grid gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-bold transition ${item.mode === mode ? "bg-gold text-ink shadow-glow" : "text-cream/72 hover:bg-white/[0.07] hover:text-gold"}`}
              >
                <item.icon size={18} className={item.mode === mode ? "text-ink" : "text-gold/75 transition group-hover:text-gold"} />
                {item.label}
              </Link>
            ))}
            <button className="mt-5 flex items-center gap-3 rounded-[8px] border border-white/10 px-4 py-3 text-left text-sm font-bold text-cream/70 transition hover:border-gold/35 hover:bg-gold/10 hover:text-gold" onClick={logout} type="button">
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </aside>

        {sidebarOpen ? <button className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar overlay" type="button" /> : null}

        <section className="min-w-0 overflow-hidden p-4 md:p-8">
          <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button className="grid size-11 place-items-center rounded-[8px] border border-white/12 bg-white/[0.05] text-cream lg:hidden" onClick={() => setSidebarOpen(true)} type="button" aria-label="Open sidebar">
                <Menu size={19} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">Live Node + MySQL</p>
                <h1 className="mt-2 truncate font-display text-3xl leading-tight md:text-5xl">{active?.label || "Dashboard"}</h1>
              </div>
            </div>
            <Link href="/vendor-dashboard/add-service" className="btn-primary">
              <Plus size={17} /> Add Service
            </Link>
          </header>

          {message ? <div className="mb-5 rounded-[8px] border border-gold/30 bg-gold/12 p-4 text-sm font-semibold text-gold">{message}</div> : null}
          {state.error && !state.loading ? <div className="mb-5 rounded-[8px] border border-rose-300/25 bg-rose-400/10 p-4 text-sm text-rose-100">{state.error}</div> : null}
          {state.loading ? <Empty text="Loading live dashboard data..." /> : null}
          {!state.loading && !state.error && mode === "dashboard" ? <Dashboard data={state.data} services={services} /> : null}
          {!state.loading && mode === "services" ? <Services services={services} post={post} submitForm={submitForm} onServicesChange={load} /> : null}
          {!state.loading && mode === "add-service" ? <ServiceForm onSubmit={(event) => submitForm(event, "/vendors/services")} /> : null}
          {!state.loading && mode === "bookings" ? <Bookings rows={state.data?.bookings || []} post={post} /> : null}
          {!state.loading && mode === "leads" ? <Leads rows={state.data?.inquiries || []} /> : null}
          {!state.loading && mode === "reviews" ? <Reviews rows={state.data?.reviews || []} /> : null}
          {!state.loading && mode === "availability" ? <Availability services={services} activeService={activeService} rows={state.data?.availability || []} submitForm={submitForm} /> : null}
          {!state.loading && mode === "profile" ? <Profile vendor={state.data?.vendor} submitForm={submitForm} /> : null}
        </section>
      </div>
    </main>
  );
}

function VendorLogin({ message, submitForm }: { message: string; submitForm: (event: React.FormEvent<HTMLFormElement>, path: string) => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#090405] px-4 py-10 text-ivory">
      <section className="w-full max-w-md rounded-[8px] border border-gold/20 bg-white/[0.06] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
        <span className="grid size-14 place-items-center rounded-[8px] bg-gold text-ink"><Sparkles size={24} /></span>
        <h1 className="mt-5 font-display text-4xl text-gold">Vendor Login</h1>
        <p className="mt-2 text-sm leading-6 text-cream/65">Access your Royal Vivah vendor workspace.</p>
        <form className="mt-6 grid gap-4" onSubmit={(event) => submitForm(event, "/vendors/login")}>
          <Field label="Email" icon={Mail}><input className={inputClass} name="email" type="email" placeholder="vendor@example.com" required /></Field>
          <Field label="Password" icon={Settings}><input className={inputClass} name="password" type="password" placeholder="Password" required /></Field>
          <button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-gold px-5 py-3 text-sm font-black text-ink shadow-glow transition hover:bg-cream" type="submit">Login</button>
          <div className="flex flex-wrap justify-between gap-3">
            <Link className="text-sm font-semibold text-cream/70 hover:text-gold" href="/">Back to home</Link>
            <Link className="text-sm font-semibold text-gold hover:text-cream" href="/vendor/register">Register as vendor</Link>
            <Link className="text-sm font-semibold text-gold hover:text-cream" href="/vendor/forgot-password">Forgot password</Link>
          </div>
        </form>
        {message ? <p className="mt-4 text-sm text-cream/75">{message}</p> : null}
      </section>
    </main>
  );
}

function Dashboard({ data, services }: { data: any; services: any[] }) {
  const counts = data.serviceCounts || {};
  const totalServices = Object.values(counts).reduce((a: any, b: any) => Number(a) + Number(b), 0);
  const cards = [
    { label: "Total Services", value: totalServices, icon: GalleryHorizontal, tone: "from-gold/24 to-white/[0.04]" },
    { label: "Approved Services", value: counts.approved || 0, icon: CheckCircle2, tone: "from-emerald-400/18 to-white/[0.04]" },
    { label: "Pending Services", value: counts.pending || 0, icon: Clock3, tone: "from-amber-300/18 to-white/[0.04]" },
    { label: "Total Bookings", value: data.bookings?.total || 0, icon: CalendarDays, tone: "from-blue-300/18 to-white/[0.04]" },
    { label: "Total Leads", value: data.leads?.total || 0, icon: Users, tone: "from-purple-300/14 to-white/[0.04]" },
    { label: "Revenue", value: money(data.bookings?.revenue), icon: IndianRupee, tone: "from-gold/24 to-white/[0.04]" }
  ];
  const max = Math.max(Number(counts.approved || 0), Number(counts.pending || 0), Number(counts.rejected || 0), 1);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className={`rounded-[8px] border border-white/12 bg-gradient-to-br ${card.tone} p-6 shadow-[0_22px_60px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:border-gold/35`}>
            <div className="flex items-center justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-[8px] border border-gold/25 bg-gold/12 text-gold"><card.icon size={22} /></span>
              <span className="text-xs font-black uppercase tracking-[0.18em] text-cream/45">Live</span>
            </div>
            <p className="mt-5 text-sm font-semibold text-cream/60">{card.label}</p>
            <strong className="mt-2 block text-3xl text-ivory">{card.value}</strong>
          </article>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Panel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">Service Status</p>
              <h2 className="mt-2 font-display text-3xl">Approval Pipeline</h2>
            </div>
            <BriefcaseBusiness className="text-gold" />
          </div>
          <div className="mt-6 grid gap-4">
            {["approved", "pending", "rejected"].map((key) => (
              <div key={key}>
                <div className="mb-2 flex justify-between text-sm"><span className="capitalize text-cream/70">{key}</span><strong>{counts[key] || 0}</strong></div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gold" style={{ width: `${(Number(counts[key] || 0) / max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">Recent Services</p>
          <div className="mt-5 grid gap-3">
            {services.slice(0, 4).map((service) => (
              <div key={service.id} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-black/18 p-3">
                <LocalMedia src={service.cover_image} alt={service.category || service.service_name || "Vendor service"} className="size-14 rounded-[8px]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{service.service_name}</p>
                  <p className="text-xs text-cream/50">{money(service.price)}</p>
                </div>
                <Status value={service.status} />
              </div>
            ))}
            {!services.length ? <Empty text="No services submitted yet." /> : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Services({ services, post, submitForm, onServicesChange }: { services: any[]; post: (path: string, body: Record<string, string | number>) => Promise<void>; submitForm: (event: React.FormEvent<HTMLFormElement>, path: string) => void; onServicesChange: () => Promise<void> }) {
  if (!services.length) return <Empty text="No services submitted yet." />;
  return (
    <div className="grid gap-5">
      <DataTable
        rows={services}
        searchPlaceholder="Search services..."
        emptyText="No matching services found."
        columns={[
          { key: "service", label: "Service", render: (service) => <div className="flex items-center gap-3"><LocalMedia src={service.cover_image} alt={service.category || service.service_name || "Vendor service"} className="size-14 rounded-[8px]" /><div><p className="font-bold text-ivory">{service.service_name}</p><p className="text-xs text-cream/50">{service.category}</p></div></div> },
          { key: "price", label: "Price", render: (service) => <span className="font-bold text-gold">{money(service.price)}</span> },
          { key: "location", label: "Location", render: (service) => service.location || "-" },
          { key: "status", label: "Status", render: (service) => <Status value={service.status} /> },
          { key: "actions", label: "Actions", render: (service) => <div className="flex flex-wrap gap-2"><button className="rounded-[8px] border border-rose-300/25 px-3 py-2 text-xs font-bold text-rose-100 transition hover:bg-rose-400/10" onClick={() => post(`/vendors/services/${service.id}`, { _method: "DELETE" })} type="button"><Trash2 className="me-1 inline" size={14} />Delete</button></div>, mobile: false }
        ]}
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {services.map((service) => (
          <Panel key={service.id} className="p-5">
            <div className="flex gap-4">
              <LocalMedia src={service.cover_image} alt={service.category || service.service_name || "Vendor service"} className="h-28 w-36 shrink-0 rounded-[8px]" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-2xl">{service.service_name}</h2>
                  <Status value={service.status} />
                </div>
                <p className="text-gold">{money(service.price)}</p>
                <p className="line-clamp-2 text-sm text-cream/62">{service.description}</p>
              </div>
            </div>
            <details className="mt-4 rounded-[8px] border border-white/10 p-4">
              <summary className="cursor-pointer text-sm font-bold text-gold"><Pencil className="me-2 inline" size={15} />Edit Details</summary>
              <form className="mt-4 grid gap-4" onSubmit={(event) => submitForm(event, `/vendors/services/${service.id}`)}>
                <input type="hidden" name="service_id" value={service.id} />
                <Field label="Service Name"><input className={inputClass} name="service_name" defaultValue={service.service_name} required /></Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Category"><select className={inputClass} name="category" defaultValue={service.category}>{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
                  <Field label="Price"><input className={inputClass} name="price" type="number" defaultValue={service.price} required /></Field>
                </div>
                <Field label="Description"><textarea className={inputClass} name="description" defaultValue={service.description} required /></Field>
                <Field label="Features"><textarea className={inputClass} name="features" defaultValue={Array.isArray(service.features) ? service.features.join("\n") : service.features || ""} /></Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Capacity"><input className={inputClass} name="capacity" defaultValue={service.capacity || ""} /></Field>
                  <Field label="Location"><input className={inputClass} name="location" defaultValue={service.location || ""} required /></Field>
                  <Field label="Availability"><input className={inputClass} name="availability" defaultValue={service.availability || ""} required /></Field>
                  <Field label="WhatsApp"><input className={inputClass} name="whatsapp_number" defaultValue={service.whatsapp_number || ""} required /></Field>
                  <Field label="Contact Details"><input className={inputClass} name="contact_details" defaultValue={service.contact_details || ""} required /></Field>
                  <Field label="Video URL"><input className={inputClass} name="video_url" defaultValue={service.video_url || ""} /></Field>
                </div>
                <button className="inline-flex w-fit items-center gap-2 rounded-[8px] bg-gold px-5 py-3 text-sm font-black text-ink transition hover:bg-cream" type="submit">Save Changes</button>
              </form>
            </details>
            <ImageManager serviceId={service.id} onChange={onServicesChange} />
          </Panel>
        ))}
      </div>
    </div>
  );
}

function ImageManager({ serviceId, onChange }: { serviceId: string | number; onChange: () => Promise<void> }) {
  const [images, setImages] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const data = await api(`/vendors/services/${serviceId}/images`);
    setImages(data.images || []);
  }

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget as HTMLFormElement;
    const form = new FormData(formElement);
    form.set("service_id", String(serviceId));
    const result = await api(`/vendors/services/${serviceId}/images`, { method: "POST", body: form });
    setMessage(result.message || "Images uploaded.");
    formElement.reset();
    await load();
    await onChange();
  }

  async function imagePost(path: string, body: Record<string, string | number>) {
    const form = new FormData();
    const method = String(body._method || "PATCH");
    Object.entries(body).forEach(([key, value]) => {
      if (key !== "_method") form.set(key, String(value));
    });
    const result = await api(path, { method, body: form });
    setMessage(result.message || "Saved.");
    await load();
    await onChange();
  }

  async function move(imageId: number, direction: number) {
    const order = images.map((image) => String(image.id));
    const index = order.indexOf(String(imageId));
    const next = index + direction;
    if (index < 0 || next < 0 || next >= order.length) return;
    [order[index], order[next]] = [order[next], order[index]];
    await imagePost(`/vendors/services/${serviceId}/images/order`, { order: JSON.stringify(order) });
  }

  return (
    <details className="mt-4 rounded-[8px] border border-white/10 p-4" onToggle={(event) => { if ((event.currentTarget as HTMLDetailsElement).open && !open) { setOpen(true); load(); } }}>
      <summary className="cursor-pointer text-sm font-bold text-gold"><GalleryHorizontal className="me-2 inline" size={15} />Manage Images and Card Cover</summary>
      <form className="mt-4 flex flex-wrap gap-3" onSubmit={upload}>
        <input className={inputClass} name="images[]" type="file" accept=".jpg,.jpeg,.png,.webp" multiple required />
        <button className="rounded-[8px] bg-gold px-5 py-3 text-sm font-black text-ink transition hover:bg-cream" type="submit">Upload</button>
      </form>
      {message ? <p className="mt-3 text-sm text-gold">{message}</p> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {images.map((image, index) => (
          <div key={image.id} className="rounded-[8px] border border-white/10 bg-black/20 p-2">
            <LocalMedia src={image.file_path} alt="Vendor service gallery image" className="h-36 w-full rounded-[8px]" />
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="rounded-[8px] border border-gold/30 px-3 py-2 text-xs font-bold text-gold" onClick={() => imagePost(`/vendors/images/${image.id}/featured`, {})} type="button">{Number(image.is_featured) === 1 ? "Card Cover" : "Use on Card"}</button>
              <button className="rounded-[8px] border border-white/15 px-3 py-2 text-xs font-bold text-cream/70 disabled:opacity-35" onClick={() => move(image.id, -1)} disabled={index === 0} type="button">Up</button>
              <button className="rounded-[8px] border border-white/15 px-3 py-2 text-xs font-bold text-cream/70 disabled:opacity-35" onClick={() => move(image.id, 1)} disabled={index === images.length - 1} type="button">Down</button>
              <button className="rounded-[8px] border border-rose-300/25 px-3 py-2 text-xs font-bold text-rose-100" onClick={() => imagePost(`/vendors/images/${image.id}`, { _method: "DELETE" })} type="button">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function ServiceForm({ onSubmit }: { onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  function updatePreviews(files: FileList | null) {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(files ? Array.from(files).slice(0, 8).map((file) => URL.createObjectURL(file)) : []);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (inputRef.current && event.dataTransfer.files.length) {
      inputRef.current.files = event.dataTransfer.files;
      updatePreviews(event.dataTransfer.files);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    updatePreviews(event.target.files);
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <Panel className="p-5 md:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-[8px] bg-gold/12 text-gold"><BriefcaseBusiness size={20} /></span>
          <div><h2 className="font-display text-3xl">Service Basics</h2><p className="mt-1 text-sm text-cream/55">Core information shown to customers.</p></div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Service Name" icon={Sparkles} hint="Required"><input className={inputClass} name="service_name" placeholder="Royal Wedding Decor" required /></Field>
          <Field label="Category" icon={BriefcaseBusiness}><select className={inputClass} name="category" required>{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Price" icon={BadgeIndianRupee}><input className={inputClass} name="price" type="number" min="0" step="0.01" placeholder="50000" required /></Field>
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Description" hint="Write a polished customer-facing description."><textarea className={`${inputClass} min-h-32`} name="description" rows={4} placeholder="Describe your service, inclusions and experience." required /></Field>
          <Field label="Features" hint="One feature per line."><textarea className={`${inputClass} min-h-28`} name="features" rows={3} placeholder={"Premium stage setup\nFloral entry gate\nDedicated coordinator"} /></Field>
        </div>
      </Panel>

      <Panel className="p-5 md:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-[8px] bg-gold/12 text-gold"><MapPin size={20} /></span>
          <div><h2 className="font-display text-3xl">Availability and Contact</h2><p className="mt-1 text-sm text-cream/55">Operational details for bookings and inquiries.</p></div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Capacity" icon={Users}><input className={inputClass} name="capacity" placeholder="200-800 guests" /></Field>
          <Field label="Location" icon={MapPin}><input className={inputClass} name="location" placeholder="Jaipur" required /></Field>
          <Field label="Availability" icon={CalendarDays}><input className={inputClass} name="availability" placeholder="Available weekdays/weekends" required /></Field>
          <Field label="Contact Details" icon={Phone}><input className={inputClass} name="contact_details" placeholder="+91 98765 43210" required /></Field>
          <Field label="WhatsApp Number" icon={MessageCircle}><input className={inputClass} name="whatsapp_number" placeholder="919876543210" required /></Field>
          <Field label="Video URL" icon={Eye}><input className={inputClass} name="video_url" placeholder="https://..." /></Field>
        </div>
      </Panel>

      <Panel className="p-5 md:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-[8px] bg-gold/12 text-gold"><ImagePlus size={20} /></span>
          <div><h2 className="font-display text-3xl">Service Images</h2><p className="mt-1 text-sm text-cream/55">Drag and drop multiple images or browse from your device.</p></div>
        </div>
        <label
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`grid cursor-pointer place-items-center rounded-[8px] border border-dashed p-8 text-center transition ${dragging ? "border-gold bg-gold/12" : "border-white/18 bg-black/18 hover:border-gold/45 hover:bg-gold/8"}`}
        >
          <Upload className="text-gold" size={34} />
          <strong className="mt-3 text-lg">Drop images here</strong>
          <span className="mt-1 text-sm text-cream/55">JPG, PNG or WEBP. Multiple uploads supported.</span>
          <input ref={inputRef} className="sr-only" name="images[]" type="file" accept=".jpg,.jpeg,.png,.webp" multiple required onChange={handleFileChange} />
        </label>
        {previews.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {previews.map((preview) => <img key={preview} className="h-28 w-full rounded-[8px] object-cover" src={preview} alt="" />)}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-cream/48">Garden services may require more images based on backend validation.</p>
          <button className="inline-flex items-center gap-2 rounded-[8px] bg-gold px-6 py-3 text-sm font-black text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-cream" type="submit">
            <Upload size={17} /> Submit Service
          </button>
        </div>
      </Panel>
    </form>
  );
}

function Bookings({ rows, post }: { rows: any[]; post: (path: string, body: Record<string, string | number>) => Promise<void> }) {
  return (
    <DataTable
      rows={rows}
      searchPlaceholder="Search bookings..."
      emptyText="No booking requests yet."
      columns={[
        { key: "client", label: "Client", render: (b) => <div><p className="font-bold text-ivory">{b.customer_name}</p><p className="text-xs text-cream/50">{b.customer_phone}</p></div> },
        { key: "service", label: "Service", render: (b) => b.service_name || "-" },
        { key: "date", label: "Event Date", render: (b) => b.event_date },
        { key: "status", label: "Status", render: (b) => <Status value={b.status} /> },
        { key: "actions", label: "Actions", render: (b) => <div className="flex flex-wrap gap-2">{["accepted", "cancelled", "completed"].map((status) => <button key={status} className="rounded-[8px] border border-gold/25 px-3 py-2 text-xs font-bold text-gold transition hover:bg-gold/10" onClick={() => post(`/vendors/bookings/${b.id}`, { status })} type="button">{status}</button>)}</div> }
      ]}
    />
  );
}

function Leads({ rows }: { rows: any[] }) {
  return (
    <DataTable
      rows={rows}
      searchPlaceholder="Search leads..."
      emptyText="No leads or inquiries yet."
      columns={[
        { key: "name", label: "Name", render: (lead) => <strong className="text-ivory">{lead.name}</strong> },
        { key: "mobile", label: "Mobile", render: (lead) => <span className="text-gold">{lead.mobile}</span> },
        { key: "service", label: "Service", render: (lead) => lead.service_name || "General inquiry" },
        { key: "date", label: "Event Date", render: (lead) => lead.event_date || "-" },
        { key: "message", label: "Message", render: (lead) => <span className="line-clamp-2">{lead.message || "-"}</span> },
        { key: "created", label: "Created", render: (lead) => lead.created_at || "-" }
      ]}
    />
  );
}

function Reviews({ rows }: { rows: any[] }) {
  return (
    <DataTable
      rows={rows}
      searchPlaceholder="Search reviews..."
      emptyText="No customer reviews yet."
      columns={[
        { key: "service", label: "Service", render: (review) => review.service_name || "-" },
        { key: "customer", label: "Customer", render: (review) => <strong className="text-ivory">{review.customer_name}</strong> },
        { key: "rating", label: "Rating", render: (review) => <span className="text-gold">{"★".repeat(Number(review.rating || 5))}</span> },
        { key: "review", label: "Review", render: (review) => <span className="line-clamp-2">{review.review}</span> },
        { key: "status", label: "Status", render: (review) => <Status value={review.status} /> },
        { key: "created", label: "Created", render: (review) => review.created_at || "-" }
      ]}
    />
  );
}

function Availability({ services, activeService, rows, submitForm }: { services: any[]; activeService: any; rows: any[]; submitForm: (event: React.FormEvent<HTMLFormElement>, path: string) => void }) {
  if (!services.length) return <Empty text="Add a service before managing availability." />;
  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Panel className="p-5">
        <h2 className="font-display text-3xl">Set Availability</h2>
        <form className="mt-5 grid gap-4" onSubmit={(event) => submitForm(event, "/vendors/availability")}>
          <Field label="Service"><select className={inputClass} name="service_id" defaultValue={activeService?.id}>{services.map((s) => <option key={s.id} value={s.id}>{s.service_name}</option>)}</select></Field>
          <Field label="Date"><input className={inputClass} name="available_date" type="date" required /></Field>
          <Field label="Status"><select className={inputClass} name="status"><option value="available">Available</option><option value="blocked">Blocked</option><option value="booked">Booked</option></select></Field>
          <button className="rounded-[8px] bg-gold px-5 py-3 text-sm font-black text-ink transition hover:bg-cream" type="submit">Save Date</button>
        </form>
      </Panel>
      <DataTable
        rows={rows}
        searchPlaceholder="Search dates..."
        emptyText="No availability dates saved for the first service."
        columns={[
          { key: "date", label: "Date", render: (row) => row.available_date },
          { key: "status", label: "Status", render: (row) => <Status value={row.status} /> }
        ]}
      />
    </div>
  );
}

function Profile({ vendor, submitForm }: { vendor: any; submitForm: (event: React.FormEvent<HTMLFormElement>, path: string) => void }) {
  const social = vendor?.social_links ? JSON.parse(vendor.social_links) : {};
  return (
    <form className="grid gap-6" onSubmit={(event) => submitForm(event, "/vendors/profile")}>
      <Panel className="p-5 md:p-6">
        <div className="mb-5 flex items-center gap-4">
          <LocalMedia src={vendor?.profile_image} alt={vendor?.business_name || "Vendor profile"} className="size-20 rounded-[8px] border border-gold/25" />
          <div>
            <h2 className="font-display text-3xl">{vendor?.business_name || "Vendor Profile"}</h2>
            <p className="text-sm text-cream/55">{vendor?.email}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Business Name" icon={BriefcaseBusiness}><input className={inputClass} name="business_name" defaultValue={vendor?.business_name || ""} required /></Field>
          <Field label="Email" icon={Mail}><input className={inputClass} name="email" type="email" defaultValue={vendor?.email || ""} required /></Field>
          <Field label="Phone" icon={Phone}><input className={inputClass} name="phone" defaultValue={vendor?.phone || ""} required /></Field>
          <Field label="City" icon={MapPin}><input className={inputClass} name="city" defaultValue={vendor?.city || ""} required /></Field>
          <Field label="Instagram"><input className={inputClass} name="instagram" defaultValue={social.instagram || ""} /></Field>
          <Field label="Facebook"><input className={inputClass} name="facebook" defaultValue={social.facebook || ""} /></Field>
          <Field label="Website"><input className={inputClass} name="website" defaultValue={social.website || ""} /></Field>
          <Field label="Profile Image"><input className={inputClass} name="profile_image" type="file" accept=".jpg,.jpeg,.png,.webp" /></Field>
        </div>
        <button className="mt-6 rounded-[8px] bg-gold px-6 py-3 text-sm font-black text-ink shadow-glow transition hover:bg-cream" type="submit">Update Profile</button>
      </Panel>
    </form>
  );
}
