import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  Brain,
  Camera,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CheckCircle2,
  Clock,
  KeyRound,
  LogOut,
  Moon,
  DollarSign,
  Gauge,
  Droplets,
  Home,
  Lightbulb,
  Plus,
  Pencil,
  Power,
  Save,
  Snowflake,
  Trash2,
  X,
  Info,
  Mic,
  MicOff,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Volume2,
  VolumeX,
  MapPin,
  Menu,
  MailCheck,
  Paperclip,
  Palette,
  ImagePlus,
  PiggyBank,
  PlugZap,
  Search,
  Settings,
  ShoppingBag,
  Crown,
  SlidersHorizontal,
  Star,
  Store,
  Sun,
  ShoppingCart,
  PackageCheck,
  Minus,
  Tv,
  User,
  WalletCards,
  Wind,
  Zap,
} from "lucide-react";
import wattizLogo from "@/assets/logos/wattiz-logo.svg";
import profileAvatar from "@/assets/images/dashboard/profile-wattiz-user.png";
import lumeFloating from "@/assets/images/lume/lume-floating.png";
import wattizTomada from "@/assets/images/produtos/wattiz-tomada.png";
import hardwareDimensoes from "@/assets/images/produtos/hardware-medidor-dimensoes.png";
import medidorDigital from "@/assets/images/produtos/hardware-medidor-digital.webp";
import tomadaMedidora from "@/assets/images/produtos/hardware-tomada-medidora.webp";
import {
  auth as apiAuth,
  appliances as apiAppliances,
  lume as apiLume,
  users,
  hasBackend,
  clearTokens,
  getAccessToken,
} from "@/api";
import { useDashboard } from "@/hooks/useDashboard";

function navigateTo(href: string) {
  if (typeof window === "undefined") return;
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "auto" });
}

type WattizUser = {
  nome?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  tipoUso?: string;
  contaMedia?: string | number;
};

type PlanId = "gratuito" | "smart" | "business";

const PLAN_STORAGE_KEY = "wattiz_current_plan";
const planNames: Record<PlanId, string> = {
  gratuito: "Gratuito",
  smart: "Smart",
  business: "Business",
};

function readCurrentPlan(): PlanId {
  if (typeof window === "undefined") return "gratuito";
  const saved = localStorage.getItem(PLAN_STORAGE_KEY) as PlanId | null;
  return saved === "smart" || saved === "business" || saved === "gratuito" ? saved : "gratuito";
}

function saveCurrentPlan(plan: PlanId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAN_STORAGE_KEY, plan);
  window.dispatchEvent(new CustomEvent("wattiz-plan-updated", { detail: plan }));
}

function useCurrentPlan() {
  const [currentPlan, setCurrentPlan] = useState<PlanId>(() => readCurrentPlan());

  useEffect(() => {
    const syncPlan = () => setCurrentPlan(readCurrentPlan());
    window.addEventListener("storage", syncPlan);
    window.addEventListener("wattiz-plan-updated", syncPlan);
    return () => {
      window.removeEventListener("storage", syncPlan);
      window.removeEventListener("wattiz-plan-updated", syncPlan);
    };
  }, []);

  const updatePlan = (plan: PlanId) => {
    saveCurrentPlan(plan);
    setCurrentPlan(plan);
  };

  return [currentPlan, updatePlan] as const;
}

type DashboardTheme = "light" | "dark";

type DashboardSettings = {
  theme: DashboardTheme;
  notifications: boolean;
  lumeAlerts: boolean;
  realtime: boolean;
  reports: boolean;
  sounds: boolean;
  compact: boolean;
};

const DASHBOARD_SETTINGS_KEY = "wattiz_dashboard_settings";
const defaultDashboardSettings: DashboardSettings = {
  theme: "light",
  notifications: true,
  lumeAlerts: true,
  realtime: true,
  reports: true,
  sounds: false,
  compact: false,
};

function readDashboardSettings(): DashboardSettings {
  if (typeof window === "undefined") return defaultDashboardSettings;
  try {
    const saved = JSON.parse(localStorage.getItem(DASHBOARD_SETTINGS_KEY) || "{}");
    return { ...defaultDashboardSettings, ...saved };
  } catch {
    return defaultDashboardSettings;
  }
}

function saveDashboardSettings(settings: DashboardSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DASHBOARD_SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("wattiz-settings-updated", { detail: settings }));
}

function useDashboardSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(() => readDashboardSettings());

  useEffect(() => {
    const syncSettings = () => setSettings(readDashboardSettings());
    window.addEventListener("storage", syncSettings);
    window.addEventListener("wattiz-settings-updated", syncSettings);
    return () => {
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener("wattiz-settings-updated", syncSettings);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.wattizTheme = settings.theme;
  }, [settings.theme]);

  const updateSettings = (partial: Partial<DashboardSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...partial };
      saveDashboardSettings(next);
      return next;
    });
  };

  return [settings, updateSettings] as const;
}

function logoutToLogin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("wattiz_sessao");
  clearTokens(); // limpa tokens JWT do backend
  navigateTo("/login");
}

const menuGroups = [
  {
    title: "Principal",
    items: [
      ["Painel de Energia", Home, "/dashboard"],
      ["Meus Eletrodomésticos", PlugZap, "/dashboard/eletrodomesticos"],
      ["Relatórios", BarChart3, "/dashboard/relatorios"],
      ["Lume IA", Bot, "/dashboard/ia-lume"],
      ["Loja", ShoppingBag, "/loja"],
      ["Planos", WalletCards, "/planos"],
    ],
  },
  {
    title: "Sistema",
    items: [
      ["Perfil", User, "/perfil"],
      ["Configurações", Settings, "/configuracoes"],
    ],
  },
] as const;

function readUser(): WattizUser {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(
      localStorage.getItem("wattiz_sessao") || localStorage.getItem("wattiz_usuario") || "{}",
    );
  } catch {
    return {};
  }
}

function formatToday() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function DashboardShell({
  children,
  page = "Painel de Energia",
}: {
  children?: ReactNode;
  page?: string;
}) {
  const [user, setUser] = useState<WattizUser>(() => readUser());
  const firstName = user.nome?.trim()?.split(" ")[0] || "Rafael";
  const email = user.email || "julia@email.com";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [settings] = useDashboardSettings();
  const [headerPhoto, setHeaderPhoto] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(PROFILE_PHOTO_KEY) || profileAvatar : profileAvatar,
  );
  const [notifications, setNotifications] = useState(() => [
    { text: "Consumo acima da média", day: "hoje", read: false, icon: AlertTriangle },
    { text: "Lume gerou nova dica", day: "hoje", read: false, icon: Sparkles },
    { text: "Relatório mensal disponível", day: "ontem", read: false, icon: BarChart3 },
    { text: "Loja liberada no seu plano", day: "ontem", read: true, icon: Store },
    { text: "Aparelho ligado há muito tempo", day: "seg", read: true, icon: PlugZap },
  ]);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const showSearch = page === "Meus Eletrodomésticos" || page === "Painel de Energia";

  useEffect(() => {
    const syncUser = () => {
      setUser(readUser());
      setHeaderPhoto(localStorage.getItem(PROFILE_PHOTO_KEY) || profileAvatar);
    };
    window.addEventListener("storage", syncUser);
    window.addEventListener("wattiz-user-updated", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("wattiz-user-updated", syncUser);
    };
  }, []);

  return (
    <main
      className={`wattiz-dashboard-shell ${collapsed ? "is-collapsed" : ""} theme-${settings.theme}`}
      id="conteudo-principal"
    >
      <aside className={`wattiz-dashboard-sidebar ${mobileMenuOpen ? "is-mobile-open" : ""}`} aria-label="Menu lateral do dashboard">
        <div className="wattiz-dashboard-logo-row">
          <a href="/dashboard" className="wattiz-dashboard-brand" aria-label="Dashboard">
            <img src={wattizLogo} alt="Wattiz" />
          </a>
          <button
            type="button"
            className="wattiz-dashboard-collapse"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Abrir sidebar" : "Recolher sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight size={21} /> : <ChevronLeft size={21} />}
          </button>
        </div>

        <nav className="wattiz-dashboard-nav" aria-label="Navegação do dashboard">
          {menuGroups.map((group) => (
            <div className="wattiz-dashboard-nav-group" key={group.title}>
              <p className="wattiz-dashboard-nav-title">{group.title}</p>
              {group.items.map(([label, Icon, href]) => {
                const active = page === label;
                return (
                  <a
                    key={label}
                    href={href}
                    className={active ? "active" : ""}
                    title={collapsed ? label : undefined}
                    aria-current={active ? "page" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      setMobileMenuOpen(false);
                      navigateTo(href);
                    }}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                    <span>{label}</span>
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <section className="wattiz-dashboard-main" aria-label="Área principal do dashboard">
        <header className="wattiz-dashboard-topbar">
          <button
            type="button"
            className="wattiz-mobile-menu-button"
            aria-label="Abrir menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="wattiz-dashboard-heading">
            <span>{page}</span>
            <h1>Olá, {firstName}</h1>
            <p>{formatToday()} · Última atualização: agora</p>
          </div>

          {showSearch && (
            <div className="wattiz-dashboard-search" role="search">
              <input
                aria-label={`Pesquisar em ${page}`}
                placeholder={`Pesquisar em ${page.toLowerCase()}...`}
              />
              <button type="button" aria-label="Pesquisar">
                <Search size={18} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="wattiz-dashboard-bell"
            aria-label="Notificações"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell size={19} />
            {unreadCount > 0 && <i>{unreadCount}</i>}
          </button>

          <div className="wattiz-account-area">
            <button
              type="button"
              className="wattiz-avatar-button"
              aria-label="Abrir opções da conta"
              onClick={() => setAccountOpen((value) => !value)}
            >
              <img
                className="wattiz-dashboard-avatar-img"
                src={headerPhoto}
                alt={`Foto de perfil de ${firstName}`}
              />
            </button>
            {accountOpen && (
              <div className="wattiz-account-menu">
                <div className="wattiz-account-menu-head">
                  <strong>{firstName}</strong>
                  <span>{email}</span>
                </div>
                <button type="button" onClick={() => navigateTo("/login")}>
                  <ChevronsUpDown size={17} />
                  Trocar de conta
                </button>
                <button type="button" onClick={logoutToLogin}>
                  <LogOut size={17} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </header>

        {notificationsOpen && (
          <>
            <button
              type="button"
              className="wattiz-notifications-backdrop"
              aria-label="Fechar notificações"
              onClick={() => setNotificationsOpen(false)}
            />
            <div className="wattiz-notifications-dropdown" role="dialog" aria-modal="true" aria-label="Notificações">
            <div className="wattiz-notifications-dropdown-head">
              <div>
                <span>Central</span>
                <h2>Notificações</h2>
              </div>
              <button type="button" aria-label="Fechar notificações" onClick={() => setNotificationsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="wattiz-notifications-actions">
              <button type="button" onClick={() => setNotifications((items) => items.map((item) => ({ ...item, read: true })))}>Marcar como lidas</button>
              <button type="button" onClick={() => setNotifications([])}>Limpar</button>
            </div>
            <div className="wattiz-notifications-list">
              {notifications.length === 0 ? (
                <p className="wattiz-notifications-empty">Nenhuma notificação no momento.</p>
              ) : (
                notifications.map(({ text, day, read, icon: Icon }) => (
                  <article key={text} className={read ? "" : "is-new"}>
                    <span><Icon size={15} /></span>
                    <div>
                      <p>{text}</p>
                      <small>{day}</small>
                    </div>
                  </article>
                ))
              )}
            </div>
            </div>
          </>
        )}

        {mobileMenuOpen && (
          <button
            type="button"
            className="wattiz-mobile-sidebar-overlay"
            aria-label="Fechar menu"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className="wattiz-dashboard-content">{children}</div>
      </section>
    </main>
  );
}


type RegisteredAppliance = {
  id?: string;
  category?: string;
  appliance?: string;
  brand?: string;
  model?: string;
  power?: string;
  quantity?: string;
  hoursPerDay?: string;
  daysPerWeek?: string;
  room?: string;
  status?: ApplianceStatus;
  impact?: "baixo" | "médio" | "alto";
};

function registeredApplianceConsumption(item: RegisteredAppliance) {
  const power = Number(String(item.power || "").replace(/\D/g, "")) || 0;
  const qty = Number(item.quantity) || 1;
  const hours = Number(item.hoursPerDay) || 0;
  const days = Number(item.daysPerWeek) || 0;
  return Number(((power * qty * hours * days * 4.33) / 1000).toFixed(1));
}

function registeredToAppliance(item: RegisteredAppliance, index: number): Appliance {
  const consumption = registeredApplianceConsumption(item);
  const cost = consumption * 0.82;
  return {
    id: Date.now() + index,
    nome: item.appliance || "Aparelho",
    categoria: item.category || "Casa",
    marca: item.brand || "",
    modelo: item.model || "",
    potencia: item.power || "",
    consumo: consumption,
    custo: `R$ ${cost.toFixed(2).replace(".", ",")}`,
    tempo: `${item.hoursPerDay || "0"}h/dia`,
    comodo: item.room || "Casa",
    horario: "Cadastro inicial",
    status: item.status || "ligado",
    impacto: item.impact || (consumption >= 60 ? "alto" : consumption >= 25 ? "médio" : "baixo"),
    observacoes: "Importado do cadastro inicial.",
  };
}

function readRegisteredAppliances(): Appliance[] {
  if (typeof window === "undefined") return initialAppliances;
  try {
    const saved = JSON.parse(localStorage.getItem("wattiz_appliances") || "[]") as RegisteredAppliance[];
    if (Array.isArray(saved) && saved.length) return saved.map(registeredToAppliance);
    const session = JSON.parse(localStorage.getItem("wattiz_sessao") || "{}");
    if (Array.isArray(session.appliances) && session.appliances.length) return session.appliances.map(registeredToAppliance);
  } catch {
    return initialAppliances;
  }
  return initialAppliances;
}

function saveDashboardAppliances(appliances: Appliance[]) {
  if (typeof window === "undefined") return;
  const normalized = appliances.map((item) => ({
    id: String(item.id),
    category: item.categoria,
    appliance: item.nome,
    brand: item.marca,
    model: item.modelo,
    power: item.potencia,
    quantity: "1",
    hoursPerDay: String(Number(String(item.tempo).match(/[\d.]+/)?.[0] || 0)),
    daysPerWeek: "7",
    room: item.comodo,
    status: item.status,
    impact: item.impacto,
  }));
  localStorage.setItem("wattiz_appliances", JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent("wattiz-appliances-updated", { detail: normalized }));
}

function applianceIconFor(name: string) {
  return applianceIcons[name] || PlugZap;
}

const metricCards = [
  {
    title: "Energia consumida hoje",
    value: "6.4 kWh",
    trend: "+4%",
    trendType: "positive",
    note: "Consumo dentro do padrão residencial",
    icon: Zap,
    href: "/dashboard/relatorios",
  },
  {
    title: "Custo estimado de energia",
    value: "R$ 5,60",
    trend: "-3%",
    trendType: "positive",
    note: "Estimativa diária equilibrada",
    icon: DollarSign,
    href: "/dashboard/relatorios",
  },
  {
    title: "Energia economizada",
    value: "R$ 1,20",
    trend: "+6%",
    trendType: "positive",
    note: "Pequenas economias acumulam",
    icon: PiggyBank,
    href: "/planos",
  },
  {
    title: "Fluxo mensal de energia",
    value: "187 kWh",
    trend: "+4%",
    trendType: "negative",
    note: "Próximo da média do mês",
    icon: BarChart3,
    href: "/dashboard/relatorios",
  },
] as const;

const weeklyBars = [58, 69, 84, 76, 93, 100, 47];
const weeklyLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const consumers = [
  { name: "Ar-condicionado", value: "4.2 kWh", percent: 88, icon: Wind },
  { name: "Geladeira", value: "2.1 kWh", percent: 54, icon: PlugZap },
  { name: "TV", value: "1.3 kWh", percent: 34, icon: Tv },
  { name: "Chuveiro", value: "3.8 kWh", percent: 82, icon: Droplets },
  { name: "Iluminação", value: "0.5 kWh", percent: 12, icon: Lightbulb },
] as const;

function DashboardHomeContent() {
  const goTo = (href: string) => navigateTo(href);
  const localAppliances = readRegisteredAppliances();
  const { dashboard: backendDash, loading: dashLoading } = useDashboard();

  // Usa dados do backend se disponíveis, senão usa localStorage
  const totalMonthlyKwh = backendDash ? backendDash.total_kwh : localAppliances.reduce((sum, item) => sum + item.consumo, 0);
  const totalMonthlyCost = backendDash ? backendDash.total_cost : Number((totalMonthlyKwh * 0.82).toFixed(2));
  const tariff = backendDash ? backendDash.active_tariff : 0.82;
  const dailyKwh = Number((totalMonthlyKwh / 30).toFixed(1));
  const dailyCost = Number((dailyKwh * tariff).toFixed(2));

  const topConsumers = backendDash
    ? backendDash.top_appliances.map((a) => ({
        name: a.name,
        value: `${a.kwh_per_month.toFixed(1)} kWh`,
        percent: Math.max(8, Math.min(100, a.percentage_of_total)),
        icon: applianceIconFor(a.name),
      }))
    : [...localAppliances].sort((a, b) => b.consumo - a.consumo).slice(0, 5).map((item) => ({
        name: item.nome,
        value: `${item.consumo || 0} kWh`,
        percent: Math.max(8, Math.min(100, (item.consumo / Math.max(localAppliances[0]?.consumo || 1, 1)) * 100)),
        icon: applianceIconFor(item.nome),
      }));

  const insights = backendDash?.insights ?? [];

  const dynamicMetricCards = metricCards.map((card) => {
    if (card.title === "Energia consumida hoje") return { ...card, value: dashLoading ? "..." : `${dailyKwh || 0} kWh`, note: `${backendDash ? backendDash.top_appliances.length : localAppliances.length} aparelho(s) monitorado(s)` };
    if (card.title === "Custo estimado de energia") return { ...card, value: dashLoading ? "..." : `R$ ${dailyCost.toFixed(2).replace(".", ",")}`, note: "Com base nos aparelhos cadastrados" };
    if (card.title === "Fluxo mensal de energia") return { ...card, value: dashLoading ? "..." : `${totalMonthlyKwh.toFixed(0)} kWh`, note: backendDash ? "Dados do backend" : "Estimativa mensal do cadastro" };
    return card;
  });
  const dynamicConsumers = topConsumers.length ? topConsumers : consumers;

  return (
    <section className="energy-panel" aria-label="Painel de Energia">
      <div className="energy-metrics-grid">
        {dynamicMetricCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              className="energy-metric-card energy-clickable"
              key={card.title}
              role="button"
              tabIndex={0}
              onClick={() => goTo(card.href)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") goTo(card.href);
              }}
              aria-label={`${card.title}. Abrir detalhes`}
            >
              <div className="energy-metric-top">
                <span className="energy-metric-icon">
                  <Icon size={22} />
                </span>
                <span className={`energy-trend ${card.trendType}`}>{card.trend}</span>
              </div>
              <strong>{card.value}</strong>
              <p>{card.title}</p>
              <em>{card.note}</em>
            </article>
          );
        })}
      </div>

      <div className="energy-main-grid">
        <article
          className="energy-card energy-flow-card energy-clickable"
          role="button"
          tabIndex={0}
          onClick={() => goTo("/dashboard/relatorios")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") goTo("/dashboard/relatorios");
          }}
          aria-label="Abrir relatórios do fluxo de energia"
        >
          <div className="energy-section-title">
            <h2>Fluxo de Energia Hoje</h2>
            <p>Veja como seus watts fluem ao longo do dia</p>
          </div>
          <div
            className="energy-line-chart"
            role="img"
            aria-label="Gráfico de consumo ao longo do dia"
          >
            <svg viewBox="0 0 900 320" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="wattizLineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f4b400" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#f4b400" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((line) => (
                <line key={`h-${line}`} x1="0" x2="900" y1={line * 86 + 20} y2={line * 86 + 20} />
              ))}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((line) => (
                <line key={`v-${line}`} y1="20" y2="278" x1={line * 128 + 2} x2={line * 128 + 2} />
              ))}
              <path
                d="M0 230 L120 246 L240 208 L360 176 L480 148 L600 132 L740 96 L900 144 L900 278 L0 278 Z"
                fill="url(#wattizLineFill)"
              />
              <path d="M0 230 L120 246 L240 208 L360 176 L480 148 L600 132 L740 96 L900 144" />
            </svg>
            {[
              ["00h", "2.6 kWh", 0, 230],
              ["03h", "2.1 kWh", 120, 246],
              ["06h", "3.2 kWh", 240, 208],
              ["09h", "4.1 kWh", 360, 176],
              ["12h", "5.0 kWh", 480, 148],
              ["15h", "5.4 kWh", 600, 132],
              ["18h", "6.1 kWh", 740, 96],
              ["21h", "4.8 kWh", 900, 144],
            ].map(([time, value, x, y]) => (
              <button
                key={time}
                type="button"
                className="energy-line-point"
                style={{ left: `${(Number(x) / 900) * 100}%`, top: `${(Number(y) / 320) * 100}%` }}
                aria-label={`${time}: ${value}`}
              >
                <span className="energy-chart-tooltip">
                  <strong>{time}</strong>
                  {value}
                </span>
              </button>
            ))}
            <div className="energy-chart-axis y">
              <span>8</span>
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>
            <div className="energy-chart-axis x">
              <span>00h</span>
              <span>03h</span>
              <span>06h</span>
              <span>09h</span>
              <span>12h</span>
              <span>15h</span>
              <span>18h</span>
              <span>21h</span>
            </div>
          </div>
        </article>

        <article
          className="energy-card energy-insights-card energy-clickable"
          role="button"
          tabIndex={0}
          onClick={() => goTo("/dashboard/ia-lume")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") goTo("/dashboard/ia-lume");
          }}
          aria-label="Abrir Lume IA"
        >
          <div className="energy-section-title compact">
            <h2>Insights da Lume</h2>
          </div>
          <div className="energy-insights-list">
            {insights.length > 0 ? (
              insights.slice(0, 3).map((insight, i) => (
                <div key={i} className={i === 0 ? "attention" : i === 1 ? "warning" : "success"}>
                  {i === 2 ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  <p>{insight}</p>
                </div>
              ))
            ) : (
              <>
                <div className="attention">
                  <AlertTriangle size={20} />
                  <p>
                    Sua casa está consumindo 15% mais energia que o normal hoje. A Lume sugere desligar
                    aparelhos em standby.
                  </p>
                </div>
                <div className="warning">
                  <AlertTriangle size={20} />
                  <p>
                    Ar-condicionado ligado há 8h seguidas — isso consome o equivalente a 33 lâmpadas LED
                    acesas.
                  </p>
                </div>
                <div className="success">
                  <CheckCircle2 size={20} />
                  <p>
                    Brilhou no fim de semana! Consumo abaixo da meta — você economizou R$ 18 em dois
                    dias.
                  </p>
                </div>
              </>
            )}
          </div>
        </article>
      </div>

      <div className="energy-bottom-grid">
        <article
          className="energy-card energy-week-card energy-clickable"
          role="button"
          tabIndex={0}
          onClick={() => goTo("/dashboard/relatorios")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") goTo("/dashboard/relatorios");
          }}
          aria-label="Abrir relatórios semanais"
        >
          <div className="energy-section-title">
            <h2>Pulso Semanal</h2>
            <p>A energia da sua semana em barras</p>
          </div>
          <div className="energy-bar-chart" aria-label="Consumo por dia da semana">
            {weeklyBars.map((height, index) => {
              const value = [15, 18, 22, 20, 25, 28, 12][index];
              return (
                <div className="energy-bar-item" key={weeklyLabels[index]}>
                  <div className="energy-bar-track">
                    <i style={{ height: `${height}%` }} />
                  </div>
                  <b className="energy-chart-tooltip">
                    <strong>{weeklyLabels[index]}</strong>
                    {value} kWh
                  </b>
                  <span>{weeklyLabels[index]}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article
          className="energy-card energy-consumers-card energy-clickable"
          role="button"
          tabIndex={0}
          onClick={() => goTo("/dashboard/eletrodomesticos")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") goTo("/dashboard/eletrodomesticos");
          }}
          aria-label="Abrir meus eletrodomésticos"
        >
          <div className="energy-section-title compact">
            <h2>Quem consome mais?</h2>
          </div>
          <div className="energy-consumer-list">
            {dynamicConsumers.map((item) => {
              const Icon = item.icon;
              return (
                <div className="energy-consumer" key={item.name}>
                  <span className="energy-consumer-icon">
                    <Icon size={21} />
                  </span>
                  <div>
                    <div className="energy-consumer-row">
                      <strong>{item.name}</strong>
                      <span>{item.value}</span>
                    </div>
                    <div className="energy-progress">
                      <i style={{ width: `${item.percent}%` }} />
                      <b className="energy-chart-tooltip">
                        <strong>{item.name}</strong>
                        {item.value}
                      </b>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}

export function DashboardPage() {
  return (
    <DashboardShell page="Painel de Energia">
      <DashboardHomeContent />
    </DashboardShell>
  );
}

type ApplianceStatus = "ligado" | "desligado" | "alerta";
type Appliance = {
  id: number;
  nome: string;
  categoria: string;
  marca: string;
  modelo: string;
  potencia: string;
  consumo: number;
  custo: string;
  tempo: string;
  comodo: string;
  horario: string;
  status: ApplianceStatus;
  impacto: "baixo" | "médio" | "alto";
  observacoes?: string;
};

const applianceSuggestions = {
  aparelho: [
    { label: "Ar-condicionado", category: "Climatização", consumption: "4.2 kWh/dia" },
    { label: "Geladeira", category: "Cozinha", consumption: "2.1 kWh/dia" },
    { label: "TV", category: "Tecnologia", consumption: "1.3 kWh/dia" },
    { label: "Chuveiro", category: "Banheiro", consumption: "3.8 kWh/dia" },
    { label: "Iluminação", category: "Casa", consumption: "0.5 kWh/dia" },
    { label: "Máquina de lavar", category: "Lavanderia", consumption: "1.6 kWh/ciclo" },
    { label: "Freezer", category: "Cozinha", consumption: "2.8 kWh/dia" },
    { label: "Notebook", category: "Tecnologia", consumption: "0.4 kWh/dia" },
    { label: "Air fryer", category: "Cozinha", consumption: "1.2 kWh/dia" },
    { label: "Forno elétrico", category: "Cozinha", consumption: "2.6 kWh/dia" },
  ],
  categoria: [
    { label: "Cozinha", category: "Geladeira, freezer, forno", consumption: "1.0 a 3.0 kWh/dia" },
    {
      label: "Climatização",
      category: "Ar-condicionado e ventilação",
      consumption: "0.8 a 5.0 kWh/dia",
    },
    {
      label: "Banheiro",
      category: "Chuveiro e torneira elétrica",
      consumption: "2.0 a 6.0 kWh/dia",
    },
    {
      label: "Lavanderia",
      category: "Lavadora, secadora e ferro",
      consumption: "0.8 a 4.0 kWh/ciclo",
    },
    { label: "Tecnologia", category: "TV, notebook e videogame", consumption: "0.2 a 1.8 kWh/dia" },
    { label: "Negócio", category: "Equipamentos comerciais", consumption: "2.0 a 9.0 kWh/dia" },
  ],
  marca: [
    { label: "Samsung", category: "Climatização e tecnologia", consumption: "média variável" },
    { label: "LG", category: "Climatização e tecnologia", consumption: "média variável" },
    { label: "Electrolux", category: "Cozinha e lavanderia", consumption: "média variável" },
    { label: "Consul", category: "Cozinha", consumption: "média variável" },
    { label: "Brastemp", category: "Cozinha e lavanderia", consumption: "média variável" },
    { label: "Philco", category: "Casa", consumption: "média variável" },
    { label: "Midea", category: "Climatização", consumption: "média variável" },
    { label: "Panasonic", category: "Tecnologia e cozinha", consumption: "média variável" },
    { label: "Lorenzetti", category: "Banheiro", consumption: "alto consumo" },
    { label: "Philips", category: "Iluminação", consumption: "baixo consumo" },
  ],
  modelo: [
    {
      label: "Samsung WindFree 12000 BTUs",
      category: "Ar-condicionado",
      consumption: "4.2 kWh/dia",
    },
    { label: "Samsung Digital Inverter", category: "Geladeira", consumption: "2.3 kWh/dia" },
    { label: "Samsung Smart TV 50 polegadas", category: "TV", consumption: "1.1 kWh/dia" },
    { label: "Samsung EcoBubble", category: "Máquina de lavar", consumption: "1.5 kWh/ciclo" },
    { label: "Samsung Neo QLED", category: "TV", consumption: "1.4 kWh/dia" },
    { label: "LG Dual Inverter", category: "Ar-condicionado", consumption: "3.9 kWh/dia" },
    { label: "LG ThinQ", category: "Geladeira smart", consumption: "2.0 kWh/dia" },
    { label: "LG Smart Washer", category: "Lavanderia", consumption: "1.4 kWh/ciclo" },
    { label: "LG OLED Evo", category: "TV", consumption: "1.2 kWh/dia" },
    { label: "Electrolux Frost Free", category: "Geladeira", consumption: "2.1 kWh/dia" },
    { label: "Consul Facilite", category: "Máquina de lavar", consumption: "1.6 kWh/ciclo" },
    { label: "Midea Xtreme Save", category: "Ar-condicionado", consumption: "3.7 kWh/dia" },
    { label: "Brastemp Inverse", category: "Geladeira", consumption: "2.4 kWh/dia" },
  ],
  potencia: [
    { label: "60 W", category: "Iluminação LED", consumption: "0.3 a 0.6 kWh/dia" },
    { label: "150 W", category: "TV / Monitor", consumption: "0.8 a 1.5 kWh/dia" },
    { label: "350 W", category: "Geladeira", consumption: "1.8 a 2.4 kWh/dia" },
    { label: "1200 W", category: "Ar-condicionado eficiente", consumption: "3.5 a 4.5 kWh/dia" },
    { label: "1500 W", category: "Air fryer / Forno", consumption: "1.5 a 3.0 kWh/dia" },
    { label: "5500 W", category: "Chuveiro elétrico", consumption: "3.0 a 6.0 kWh/dia" },
  ],
  consumo: [
    { label: "0.5", category: "Baixo consumo", consumption: "kWh/dia" },
    { label: "1.3", category: "Consumo moderado", consumption: "kWh/dia" },
    { label: "2.1", category: "Consumo médio", consumption: "kWh/dia" },
    { label: "3.8", category: "Consumo alto", consumption: "kWh/dia" },
    { label: "4.2", category: "Consumo crítico", consumption: "kWh/dia" },
  ],
  comodo: [
    { label: "Sala", category: "Área social", consumption: "uso noturno" },
    { label: "Cozinha", category: "Uso contínuo", consumption: "alto impacto" },
    { label: "Quarto", category: "Climatização", consumption: "uso noturno" },
    { label: "Banheiro", category: "Picos rápidos", consumption: "alto consumo" },
    { label: "Lavanderia", category: "Uso por ciclo", consumption: "variável" },
    { label: "Escritório", category: "Tecnologia", consumption: "uso diário" },
  ],
  horario: [
    { label: "Manhã", category: "06h às 10h", consumption: "pico curto" },
    { label: "Tarde", category: "12h às 17h", consumption: "moderado" },
    { label: "Noite", category: "18h às 23h", consumption: "pico comum" },
    { label: "Contínuo", category: "24h", consumption: "monitoramento constante" },
    { label: "18h às 23h", category: "Horário de pico", consumption: "atenção" },
  ],
  cidade: [
    { label: "Oliveira, MG", category: "Minas Gerais", consumption: "perfil residencial" },
    { label: "Belo Horizonte, MG", category: "Minas Gerais", consumption: "perfil urbano" },
    { label: "São Paulo, SP", category: "Sudeste", consumption: "perfil urbano" },
    { label: "Rio de Janeiro, RJ", category: "Sudeste", consumption: "perfil urbano" },
  ],
  cep: [
    { label: "35540-000", category: "Oliveira, MG", consumption: "Centro" },
    { label: "30110-000", category: "Belo Horizonte, MG", consumption: "Centro" },
    { label: "01001-000", category: "São Paulo, SP", consumption: "Sé" },
  ],
};

const initialAppliances: Appliance[] = [
  {
    id: 1,
    nome: "Ar-condicionado",
    categoria: "Climatização",
    marca: "Samsung",
    modelo: "WindFree",
    potencia: "1200 W",
    consumo: 4.2,
    custo: "R$ 31,40",
    tempo: "8h hoje",
    comodo: "Quarto",
    horario: "18h às 23h",
    status: "ligado",
    impacto: "alto",
    observacoes: "Maior consumo detectado no período da noite.",
  },
  {
    id: 2,
    nome: "Geladeira",
    categoria: "Cozinha",
    marca: "Electrolux",
    modelo: "Frost Free",
    potencia: "350 W",
    consumo: 2.1,
    custo: "R$ 15,70",
    tempo: "24h",
    comodo: "Cozinha",
    horario: "Contínuo",
    status: "ligado",
    impacto: "médio",
  },
  {
    id: 3,
    nome: "TV",
    categoria: "Tecnologia",
    marca: "LG",
    modelo: "Smart TV",
    potencia: "150 W",
    consumo: 1.3,
    custo: "R$ 8,90",
    tempo: "5h hoje",
    comodo: "Sala",
    horario: "19h às 22h",
    status: "ligado",
    impacto: "baixo",
  },
  {
    id: 4,
    nome: "Chuveiro",
    categoria: "Banheiro",
    marca: "Lorenzetti",
    modelo: "Advanced",
    potencia: "5500 W",
    consumo: 0,
    custo: "—",
    tempo: "Desligado",
    comodo: "Banheiro",
    horario: "Manhã",
    status: "desligado",
    impacto: "alto",
  },
  {
    id: 5,
    nome: "Iluminação",
    categoria: "Casa",
    marca: "Philips",
    modelo: "LED",
    potencia: "60 W",
    consumo: 0.5,
    custo: "R$ 3,20",
    tempo: "4h hoje",
    comodo: "Geral",
    horario: "Noite",
    status: "ligado",
    impacto: "baixo",
  },
];

const applianceIcons: Record<string, typeof Zap> = {
  "Ar-condicionado": Wind,
  Geladeira: PlugZap,
  TV: Tv,
  Chuveiro: Droplets,
  Iluminação: Lightbulb,
};

function Suggestions({
  value,
  type,
  active,
  onPick,
}: {
  value: string;
  type: keyof typeof applianceSuggestions;
  active: boolean;
  onPick: (value: string) => void;
}) {
  const query = value.trim().toLowerCase();
  const baseOptions = applianceSuggestions[type];
  const options = (
    query
      ? baseOptions.filter((item) => {
          const searchable = `${item.label} ${item.category} ${item.consumption}`.toLowerCase();
          return searchable.includes(query);
        })
      : baseOptions
  ).slice(0, 4);

  if (!active || options.length === 0) return null;

  return (
    <div className="appliance-suggestions" role="listbox" aria-label="Sugestões do campo">
      {options.map((option) => (
        <button
          type="button"
          key={option.label}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPick(option.label)}
        >
          <strong>{option.label}</strong>
          <span>{option.category}</span>
          <em>{option.consumption}</em>
        </button>
      ))}
    </div>
  );
}

function ApplianceForm({
  appliance,
  onCancel,
  onSave,
}: {
  appliance: Appliance;
  onCancel: () => void;
  onSave: (appliance: Appliance) => void;
}) {
  const [form, setForm] = useState<Appliance>(appliance);
  const [cep, setCep] = useState("");
  const [activeField, setActiveField] = useState<string | null>(null);
  const [address, setAddress] = useState({ cidade: "Oliveira", estado: "MG", rua: "", bairro: "" });
  const update = (key: keyof Appliance, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleCep(value: string) {
    setCep(value);
    if (value.replace(/\D/g, "").length >= 8) {
      setAddress({
        rua: "Rua Energia Inteligente",
        bairro: "Centro",
        cidade: "Oliveira",
        estado: "MG",
      });
    }
  }

  return (
    <section className="appliance-edit-panel">
      <div className="appliance-edit-header">
        <div>
          <button type="button" className="appliance-back" onClick={onCancel}>
            ← Voltar para aparelhos
          </button>
          <h2>{appliance.id ? "Editar aparelho" : "Conectar aparelho"}</h2>
          <p>Atualize os dados para manter o monitoramento de energia preciso.</p>
        </div>
        <button type="button" className="appliance-save" onClick={() => onSave(form)}>
          <Save size={17} /> Salvar alterações
        </button>
      </div>

      <div className="appliance-form-grid">
        <label>
          <span>Nome do aparelho</span>
          <input
            value={form.nome}
            onFocus={() => setActiveField("aparelho")}
            onBlur={() => setTimeout(() => setActiveField(null), 120)}
            onChange={(e) => update("nome", e.target.value)}
            placeholder="Ex.: Ar-condicionado"
          />
          <Suggestions
            value={form.nome}
            type="aparelho"
            active={activeField === "aparelho"}
            onPick={(v) => {
              update("nome", v);
              setActiveField(null);
            }}
          />
        </label>
        <label>
          <span>Categoria</span>
          <input
            value={form.categoria}
            onFocus={() => setActiveField("categoria")}
            onBlur={() => setTimeout(() => setActiveField(null), 120)}
            onChange={(e) => update("categoria", e.target.value)}
            placeholder="Escolha uma categoria"
          />
          <Suggestions
            value={form.categoria}
            type="categoria"
            active={activeField === "categoria"}
            onPick={(v) => {
              update("categoria", v);
              setActiveField(null);
            }}
          />
        </label>
        <label>
          <span>Marca</span>
          <input
            value={form.marca}
            onFocus={() => setActiveField("marca")}
            onBlur={() => setTimeout(() => setActiveField(null), 120)}
            onChange={(e) => update("marca", e.target.value)}
            placeholder="Ex.: Samsung, LG, Electrolux"
          />
          <Suggestions
            value={form.marca}
            type="marca"
            active={activeField === "marca"}
            onPick={(v) => {
              update("marca", v);
              setActiveField(null);
            }}
          />
        </label>
        <label>
          <span>Modelo</span>
          <input
            value={form.modelo}
            onFocus={() => setActiveField("modelo")}
            onBlur={() => setTimeout(() => setActiveField(null), 120)}
            onChange={(e) => update("modelo", e.target.value)}
            placeholder="Digite ou escolha um modelo"
          />
          <Suggestions
            value={form.modelo}
            type="modelo"
            active={activeField === "modelo"}
            onPick={(v) => {
              update("modelo", v);
              setActiveField(null);
            }}
          />
        </label>
        <label>
          <span>Potência</span>
          <input
            value={form.potencia}
            onFocus={() => setActiveField("potencia")}
            onBlur={() => setTimeout(() => setActiveField(null), 120)}
            onChange={(e) => update("potencia", e.target.value)}
            placeholder="Ex.: 1200 W"
          />
          <Suggestions
            value={form.potencia}
            type="potencia"
            active={activeField === "potencia"}
            onPick={(v) => {
              update("potencia", v);
              setActiveField(null);
            }}
          />
        </label>
        <label>
          <span>Consumo médio</span>
          <input
            value={`${form.consumo || ""}`}
            onFocus={() => setActiveField("consumo")}
            onBlur={() => setTimeout(() => setActiveField(null), 120)}
            onChange={(e) => setForm((prev) => ({ ...prev, consumo: Number(e.target.value) || 0 }))}
            placeholder="Ex.: 2.1 kWh/dia"
          />
          <Suggestions
            value={`${form.consumo || ""}`}
            type="consumo"
            active={activeField === "consumo"}
            onPick={(v) => {
              setForm((prev) => ({ ...prev, consumo: Number(v) || 0 }));
              setActiveField(null);
            }}
          />
        </label>
        <label>
          <span>Cômodo</span>
          <input
            value={form.comodo}
            onFocus={() => setActiveField("comodo")}
            onBlur={() => setTimeout(() => setActiveField(null), 120)}
            onChange={(e) => update("comodo", e.target.value)}
            placeholder="Ex.: Sala, cozinha, quarto"
          />
          <Suggestions
            value={form.comodo}
            type="comodo"
            active={activeField === "comodo"}
            onPick={(v) => {
              update("comodo", v);
              setActiveField(null);
            }}
          />
        </label>
        <label>
          <span>Horário de uso</span>
          <input
            value={form.horario}
            onFocus={() => setActiveField("horario")}
            onBlur={() => setTimeout(() => setActiveField(null), 120)}
            onChange={(e) => update("horario", e.target.value)}
            placeholder="Ex.: 18h às 23h"
          />
          <Suggestions
            value={form.horario}
            type="horario"
            active={activeField === "horario"}
            onPick={(v) => {
              update("horario", v);
              setActiveField(null);
            }}
          />
        </label>
        <label>
          <span>Status</span>
          <div className="appliance-choice-row">
            {["ligado", "desligado", "alerta"].map((status) => (
              <button
                type="button"
                key={status}
                className={form.status === status ? "active" : ""}
                onClick={() => setForm((prev) => ({ ...prev, status: status as ApplianceStatus }))}
              >
                {status}
              </button>
            ))}
          </div>
        </label>
        <label>
          <span>Impacto no consumo</span>
          <div className="appliance-choice-row">
            {["baixo", "médio", "alto"].map((impacto) => (
              <button
                type="button"
                key={impacto}
                className={form.impacto === impacto ? "active" : ""}
                onClick={() =>
                  setForm((prev) => ({ ...prev, impacto: impacto as Appliance["impacto"] }))
                }
              >
                {impacto}
              </button>
            ))}
          </div>
        </label>
        <label>
          <span>CEP</span>
          <input
            value={cep}
            onFocus={() => setActiveField("cep")}
            onBlur={() => setTimeout(() => setActiveField(null), 120)}
            onChange={(e) => handleCep(e.target.value)}
            placeholder="00000-000"
          />
          <Suggestions
            value={cep}
            type="cep"
            active={activeField === "cep"}
            onPick={(v) => {
              handleCep(v);
              setActiveField(null);
            }}
          />
        </label>
        <label>
          <span>Cidade/Estado</span>
          <input
            value={`${address.cidade}, ${address.estado}`}
            onFocus={() => setActiveField("cidade")}
            onBlur={() => setTimeout(() => setActiveField(null), 120)}
            onChange={(e) => setAddress((prev) => ({ ...prev, cidade: e.target.value }))}
            placeholder="Ex.: Oliveira, MG"
          />
          <Suggestions
            value={`${address.cidade}, ${address.estado}`}
            type="cidade"
            active={activeField === "cidade"}
            onPick={(v) => {
              setAddress((prev) => ({ ...prev, cidade: v }));
              setActiveField(null);
            }}
          />
        </label>
        <label className="appliance-full">
          <span>Automações</span>
          <textarea defaultValue="Desligar automaticamente após longo período ligado; alertar quando ultrapassar meta diária." />
        </label>
        <label className="appliance-full">
          <span>Observações</span>
          <textarea
            value={form.observacoes || ""}
            onChange={(e) => update("observacoes", e.target.value)}
          />
        </label>
      </div>
    </section>
  );
}

function categoryToBackend(cat: string): string {
  const map: Record<string, string> = {
    "Climatização": "Climatização",
    "Cozinha": "Cozinha",
    "Lavanderia": "Lavanderia",
    "Tecnologia": "Entretenimento",
    "Banheiro": "Outros",
    "Negócio": "Outros",
    "Iluminação": "Iluminação",
    "Entretenimento": "Entretenimento",
    "Informática": "Informática",
    "Aquecimento": "Aquecimento",
  };
  return map[cat] ?? "Outros";
}

function applianceToBackendPayload(item: Appliance) {
  const powerW = Number(String(item.potencia).replace(/\D/g, "")) || 100;
  const hoursMatch = String(item.tempo).match(/[\d.]+/);
  const hoursDay = hoursMatch ? Number(hoursMatch[0]) : 2;
  return {
    name: item.nome,
    power_watts: powerW,
    hours_per_day: hoursDay,
    days_per_month: 30,
    category: categoryToBackend(item.categoria),
  };
}

function backendApplianceToLocal(a: import("@/api").ApplianceResponse, index: number): Appliance {
  const kwh = a.kwh_per_month ?? 0;
  const cost = a.estimated_cost ?? kwh * 0.82;
  return {
    id: index + 1,
    nome: a.name,
    categoria: a.category,
    marca: "",
    modelo: "",
    potencia: `${a.power_watts} W`,
    consumo: Number(kwh.toFixed(1)),
    custo: `R$ ${cost.toFixed(2).replace(".", ",")}`,
    tempo: `${a.hours_per_day}h/dia`,
    comodo: "Casa",
    horario: "—",
    status: "ligado",
    impacto: kwh >= 60 ? "alto" : kwh >= 25 ? "médio" : "baixo",
    observacoes: a.id,
  };
}

function EletrodomesticosContent() {
  const [appliances, setAppliances] = useState<Appliance[]>(() => readRegisteredAppliances());
  const [editing, setEditing] = useState<Appliance | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Appliance | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Carrega do backend se disponível
  useEffect(() => {
    if (!hasBackend()) return;
    setApiLoading(true);
    apiAppliances.list()
      .then((list) => {
        if (list.length > 0) {
          const converted = list.map(backendApplianceToLocal);
          setAppliances(converted);
          saveDashboardAppliances(converted);
        }
      })
      .catch(() => {/* usa localStorage como fallback */})
      .finally(() => setApiLoading(false));
  }, []);

  useEffect(() => {
    if (!hasBackend()) saveDashboardAppliances(appliances);
  }, [appliances]);

  useEffect(() => {
    if (hasBackend()) return;
    const syncAppliances = () => setAppliances(readRegisteredAppliances());
    window.addEventListener("storage", syncAppliances);
    window.addEventListener("wattiz-appliances-updated", syncAppliances);
    return () => {
      window.removeEventListener("storage", syncAppliances);
      window.removeEventListener("wattiz-appliances-updated", syncAppliances);
    };
  }, []);

  const activeNow = appliances.filter((item) => item.status === "ligado").length;
  const totalEnergy = appliances.reduce((sum, item) => sum + item.consumo, 0);
  const totalCost = appliances.reduce(
    (sum, item) => sum + Number(item.custo.replace(/[^0-9,]/g, "").replace(",", ".") || 0),
    0,
  );

  function toggleStatus(id: number) {
    setAppliances((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "ligado" ? "desligado" : "ligado" }
          : item,
      ),
    );
  }

  async function saveAppliance(appliance: Appliance) {
    if (hasBackend()) {
      setApiError(null);
      try {
        const payload = applianceToBackendPayload(appliance);
        const backendId = appliance.observacoes; // guardamos o UUID no campo observacoes

        if (backendId && backendId.length > 10) {
          // Editar existente
          const updated = await apiAppliances.update(backendId, payload);
          setAppliances((prev) =>
            prev.map((item) =>
              item.id === appliance.id ? backendApplianceToLocal(updated, appliance.id - 1) : item
            )
          );
        } else {
          // Criar novo
          const created = await apiAppliances.create(payload);
          setAppliances((prev) => [backendApplianceToLocal(created, Date.now()), ...prev]);
        }
      } catch (err: unknown) {
        setApiError(err instanceof Error ? err.message : "Erro ao salvar aparelho.");
        return;
      }
    } else {
      setAppliances((prev) => {
        const exists = prev.some((item) => item.id === appliance.id);
        return exists
          ? prev.map((item) => (item.id === appliance.id ? appliance : item))
          : [{ ...appliance, id: Date.now() }, ...prev];
      });
    }
    setEditing(null);
  }

  async function confirmRemove() {
    if (!removeTarget) return;
    if (hasBackend()) {
      const backendId = removeTarget.observacoes;
      if (backendId && backendId.length > 10) {
        try {
          await apiAppliances.delete(backendId);
        } catch (err: unknown) {
          setApiError(err instanceof Error ? err.message : "Erro ao remover aparelho.");
          setRemoveTarget(null);
          return;
        }
      }
    }
    setAppliances((prev) => prev.filter((item) => item.id !== removeTarget.id));
    setRemoveTarget(null);
  }

  function createNew() {
    setEditing({
      id: 0,
      nome: "",
      categoria: "",
      marca: "",
      modelo: "",
      potencia: "",
      consumo: 0,
      custo: "R$ 0,00",
      tempo: "",
      comodo: "",
      horario: "",
      status: "desligado",
      impacto: "baixo",
    });
  }

  if (editing)
    return (
      <ApplianceForm appliance={editing} onCancel={() => setEditing(null)} onSave={saveAppliance} />
    );

  return (
    <section className="appliance-page">
      {apiError && (
        <div style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)", padding: "10px 16px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
          {apiError}
        </div>
      )}
      <div className="appliance-stats">
        <article>
          <span>Aparelhos conectados</span>
          <strong>{apiLoading ? "..." : appliances.length}</strong>
          <em>{hasBackend() ? "sincronizado" : "local"}</em>
        </article>
        <article>
          <span>Ativos agora</span>
          <strong className="positive">{activeNow}</strong>
          <em>monitoramento online</em>
        </article>
        <article>
          <span>Energia fluindo</span>
          <strong className="yellow">{totalEnergy.toFixed(1)} kWh</strong>
          <em>uso acumulado hoje</em>
        </article>
        <article>
          <span>Custo atual</span>
          <strong>R$ {totalCost.toFixed(2).replace(".", ",")}</strong>
          <em>estimativa do dia</em>
        </article>
        <article>
          <span>Economia do mês</span>
          <strong className="positive">R$ 62</strong>
          <em>+23% melhor</em>
        </article>
      </div>

      <div className="appliance-toolbar">
        <div>
          <h2>Meus Aparelhos</h2>
          <p>Controle seus equipamentos, consumo e impacto no consumo em tempo real.</p>
        </div>
        <button type="button" onClick={createNew}>
          <Plus size={18} /> Conectar aparelho
        </button>
      </div>

      {apiLoading && (
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem", fontSize: 14 }}>
          Carregando aparelhos...
        </p>
      )}

      <div className="appliance-grid">
        {appliances.map((item, index) => {
          const Icon = applianceIcons[item.nome] || PlugZap;
          return (
            <article className={`appliance-card tone-${index % 4}`} key={item.id}>
              <div className="appliance-card-top">
                <span className={`appliance-icon status-${item.status}`}>
                  <Icon size={18} />
                </span>
                <div>
                  <h3>{item.nome}</h3>
                  <p className={`appliance-status status-${item.status}`}>
                    {item.status === "ligado"
                      ? "Ligado"
                      : item.status === "alerta"
                        ? "Alerta"
                        : "Desligado"}
                  </p>
                </div>
                <div className="appliance-actions">
                  <button
                    type="button"
                    aria-label={`Editar ${item.nome}`}
                    onClick={() => setEditing(item)}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover ${item.nome}`}
                    className="danger"
                    onClick={() => setRemoveTarget(item)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <div className="appliance-info-grid">
                <div>
                  <span>Consumo</span>
                  <strong>{item.consumo ? `${item.consumo} kWh` : "—"}</strong>
                </div>
                <div>
                  <span>Gasto</span>
                  <strong>{item.custo}</strong>
                </div>
                <div>
                  <span>Tempo ligado</span>
                  <strong>{item.tempo}</strong>
                </div>
                <div>
                  <span>Categoria</span>
                  <strong>{item.categoria}</strong>
                </div>
              </div>
              <div className="appliance-footer">
                <span className={`impact-${item.impacto}`}>Impacto {item.impacto}</span>
                <button
                  type="button"
                  className={`appliance-power status-${item.status}`}
                  onClick={() => toggleStatus(item.id)}
                  aria-label={`${item.status === "ligado" ? "Desligar" : "Ligar"} ${item.nome}`}
                >
                  <Power size={22} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {removeTarget && (
        <div
          className="appliance-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar remoção"
        >
          <div>
            <button
              type="button"
              className="appliance-modal-close"
              onClick={() => setRemoveTarget(null)}
            >
              <X size={18} />
            </button>
            <Trash2 size={26} />
            <h3>Remover aparelho?</h3>
            <p>Essa ação removerá o aparelho do monitoramento.</p>
            <div className="appliance-modal-actions">
              <button type="button" onClick={() => setRemoveTarget(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="danger"
                onClick={confirmRemove}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function EletrodomesticosPage() {
  return (
    <DashboardShell page="Meus Eletrodomésticos">
      <EletrodomesticosContent />
    </DashboardShell>
  );
}

const reportDataByPeriod = {
  diario: {
    label: "Diário",
    cards: ["6.4 kWh", "R$ 5,60", "R$ 1,20", "Chuveiro", "6.4 kWh", "R$ 1,80"],
    bars: [32, 28, 36, 30, 38, 42, 24],
    line: [38, 34, 42, 36, 39, 44, 41, 37],
  },
  semanal: {
    label: "Semanal",
    cards: ["44 kWh", "R$ 38", "R$ 6", "Chuveiro", "6.3 kWh", "R$ 5"],
    bars: [36, 42, 40, 38, 45, 48, 32],
    line: [35, 38, 41, 37, 36, 43, 46, 40],
  },
  mensal: {
    label: "Mensal",
    cards: ["187 kWh", "R$ 165", "R$ 23", "Ar-condicionado", "6.2 kWh", "R$ 18"],
    bars: [60, 56, 64, 59, 54, 58, 62, 61, 57, 63, 0, 0],
    line: [52, 48, 55, 50, 47, 51, 54, 53, 49, 52],
  },
  anual: {
    label: "Anual",
    cards: ["2.180 kWh", "R$ 1.940", "R$ 248", "Climatização", "181 kWh", "R$ 31"],
    bars: [48, 52, 58, 55, 50, 53, 60, 62, 57, 61, 54, 50],
    line: [45, 47, 49, 48, 50, 52, 55, 54, 53, 51],
  },
} as const;

type ReportPeriod = keyof typeof reportDataByPeriod;

const reportMonths = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];
const reportBills = [
  {
    mes: "Out/2025",
    energia: "187 kWh",
    custo: "R$ 165",
    economizado: "R$ 23",
    status: "Pago",
    comparacao: "+4% vs mês anterior",
    pico: "18h às 21h",
    maiorConsumo: "Ar-condicionado",
    dica: "Evite ligar aparelhos pesados no horário de pico.",
  },
  {
    mes: "Set/2025",
    energia: "179 kWh",
    custo: "R$ 158",
    economizado: "R$ 21",
    status: "Pago",
    comparacao: "-3% vs mês anterior",
    pico: "19h às 22h",
    maiorConsumo: "Chuveiro",
    dica: "Banhos mais curtos podem reduzir o custo mensal.",
  },
  {
    mes: "Ago/2025",
    energia: "184 kWh",
    custo: "R$ 163",
    economizado: "R$ 19",
    status: "Pago",
    comparacao: "-5% vs mês anterior",
    pico: "17h às 20h",
    maiorConsumo: "Geladeira",
    dica: "Verifique vedação e temperatura da geladeira.",
  },
  {
    mes: "Jul/2025",
    energia: "193 kWh",
    custo: "R$ 171",
    economizado: "R$ 16",
    status: "Pago",
    comparacao: "+10% vs mês anterior",
    pico: "18h às 21h",
    maiorConsumo: "TV",
    dica: "Use modo economia em televisores e monitores.",
  },
  {
    mes: "Jun/2025",
    energia: "176 kWh",
    custo: "R$ 156",
    economizado: "R$ 18",
    status: "Pendente",
    comparacao: "+5% vs mês anterior",
    pico: "18h às 23h",
    maiorConsumo: "Iluminação",
    dica: "Troque lâmpadas antigas por LED eficiente.",
  },
  {
    mes: "Mai/2025",
    energia: "167 kWh",
    custo: "R$ 148",
    economizado: "R$ 15",
    status: "Pago",
    comparacao: "melhor mês do ciclo",
    pico: "16h às 19h",
    maiorConsumo: "Ar-condicionado",
    dica: "Mantenha a meta de economia mensal ativa.",
  },
] as const;

type ReportBill = (typeof reportBills)[number];

function BarsChart({ values, labels }: { values: readonly number[]; labels: readonly string[] }) {
  const maxValue = Math.max(...values, 1);
  return (
    <div className="reports-bars-chart" aria-label="Gráfico de barras de consumo">
      {values.map((value, index) => {
        const label = labels[index] || `${index + 1}`;
        const displayValue = value === 0 ? "0 kWh" : `${Math.round((value / maxValue) * 360)} kWh`;
        return (
          <div className="reports-bar-item" key={`${label}-${index}`}>
            <span style={{ height: `${Math.max(value, 3)}%` }} />
            <b className="reports-chart-tooltip">
              <strong>{label}</strong>
              {displayValue}
            </b>
            <small>{label}</small>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({
  values,
  labels = reportMonths,
}: {
  values: readonly number[];
  labels?: readonly string[];
}) {
  const points = values
    .map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - value}`)
    .join(" ");
  const maxCost = 320;
  return (
    <div className="reports-line-chart" aria-label="Gráfico de linha de custo">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-hidden="true">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {values.map((value, index) => {
        const left = (index / Math.max(values.length - 1, 1)) * 100;
        const top = 100 - value;
        const label = labels[index] || `${index + 1}`;
        const cost = Math.round((value / 100) * maxCost);
        return (
          <button
            type="button"
            className="reports-line-point"
            key={`${label}-${index}`}
            style={{ left: `${left}%`, top: `${top}%` }}
            aria-label={`${label}: R$ ${cost}`}
          >
            <b className="reports-chart-tooltip">
              <strong>{label}</strong>custo: R$ {cost}
            </b>
          </button>
        );
      })}
      <div className="reports-chart-note">
        <strong>Boa notícia!</strong>
        <span>Horário de pico ativo (18h–21h). Evite ligar aparelhos pesados.</span>
      </div>
    </div>
  );
}

function DonutChart() {
  const items = [
    ["Climatização", 35, "#f7c515"],
    ["Cozinha", 25, "#f59e0b"],
    ["Iluminação", 15, "#22c55e"],
    ["Entretenimento", 12, "#0ea5e9"],
    ["Outros", 13, "#9b5de5"],
  ] as const;
  let offset = 0;
  return (
    <div className="reports-donut-layout">
      <div className="reports-donut" aria-label="Gráfico de distribuição de energia por categoria">
        <svg viewBox="0 0 180 180" role="img">
          <circle className="reports-donut-base" cx="90" cy="90" r="66" />
          {items.map(([name, value, color]) => {
            const dashOffset = 100 - offset;
            offset += value;
            return (
              <circle
                key={name}
                className="reports-donut-segment"
                cx="90"
                cy="90"
                r="66"
                stroke={color}
                pathLength="100"
                strokeDasharray={`${value} ${100 - value}`}
                strokeDashoffset={dashOffset}
                aria-label={`${name}: ${value}%`}
              />
            );
          })}
        </svg>
        <div className="reports-donut-hole" />
        {items.map(([name, value], index) => (
          <span key={name} className={`reports-donut-tooltip tip-${index}`}>
            <strong>{name}</strong>
            {value}%
          </span>
        ))}
      </div>
      <div className="reports-donut-list">
        {items.map(([name, value, color]) => (
          <p key={name}>
            <i style={{ background: color }} /> <span>{name}</span>
            <strong>{value}%</strong>
          </p>
        ))}
      </div>
    </div>
  );
}

function buildSimplePdf(title: string, lines: string[]) {
  const normalizeText = (value: string) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[–—]/g, "-")
      .replace(/[•→↑↓⚡💡🌟🔥✅⚠️✓○●▥▤⌁☎✉]/g, "")
      .replace(/[^\x20-\x7E]/g, "")
      .trim();

  const escape = (value: string) =>
    normalizeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const streamParts: string[] = [];
  const add = (...cmds: string[]) => streamParts.push(...cmds);
  const text = (
    x: number,
    y: number,
    size: number,
    value: string,
    font = "F1",
    color = "0.04 0.03 0.12 rg",
  ) => {
    add(color, "BT", `/${font} ${size} Tf`, `${x} ${y} Td`, `(${escape(value)}) Tj`, "ET");
  };
  const rect = (x: number, y: number, w: number, h: number, fill: string, stroke = "") => {
    add(fill, `${x} ${y} ${w} ${h} re`, fill ? "f" : "");
    if (stroke) add(stroke, `${x} ${y} ${w} ${h} re`, "S");
  };
  const strokeRect = (x: number, y: number, w: number, h: number, stroke: string) => {
    add(stroke, `${x} ${y} ${w} ${h} re`, "S");
  };
  const line = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color = "0.18 0.03 0.40 RG",
    width = 0.7,
  ) => {
    add(`${width} w`, color, `${x1} ${y1} m`, `${x2} ${y2} l`, "S", "1 w");
  };
  const circle = (x: number, y: number, r: number, stroke: string, fill = "") => {
    const c = r * 0.55228475;
    if (fill) add(fill);
    add(
      stroke,
      `${x + r} ${y} m`,
      `${x + r} ${y + c} ${x + c} ${y + r} ${x} ${y + r} c`,
      `${x - c} ${y + r} ${x - r} ${y + c} ${x - r} ${y} c`,
      `${x - r} ${y - c} ${x - c} ${y - r} ${x} ${y - r} c`,
      `${x + c} ${y - r} ${x + r} ${y - c} ${x + r} ${y} c`,
      fill ? "B" : "S",
    );
  };
  const triangle = (points: string, fill: string) => add(fill, `${points} h f`);

  const now = new Date().toLocaleString("pt-BR");
  const getLine = (prefix: string) =>
    lines
      .find((item) => item.startsWith(prefix))
      ?.replace(prefix, "")
      .trim() || "";
  const usuario = getLine("Usuário:") || getLine("Usuario:") || "julia";
  const periodo = getLine("Período selecionado:") || getLine("Periodo selecionado:") || "Mensal";
  const categoria = getLine("Categoria:") || "Todas categorias";
  const historicoStart = lines.indexOf("Histórico de faturas:");
  const tableLines = historicoStart >= 0 ? lines.slice(historicoStart + 1).filter(Boolean) : [];

  const purple = "0.16 0.02 0.36 rg";
  const purpleStroke = "0.16 0.02 0.36 RG";
  const yellow = "1.00 0.72 0.00 rg";
  const yellowStroke = "1.00 0.72 0.00 RG";
  const green = "0.00 0.55 0.18 rg";
  const orange = "0.93 0.58 0.00 rg";
  const muted = "0.34 0.34 0.45 rg";
  const border = "0.70 0.66 0.82 RG";
  const softLine = "0.86 0.85 0.91 RG";

  // Fundo e cantos oficiais.
  rect(0, 0, 595, 842, "1 1 1 rg");
  triangle("0 842 m 0 752 l 86 842 l", purple);
  triangle("76 842 m 96 842 l 0 746 l", yellow);
  triangle("595 0 m 595 72 l 525 0 l", yellow);
  rect(0, 0, 595, 44, purple);

  // Logo grande central + linhas decorativas.
  text(205, 760, 54, "Wattiz", "F2", purple);
  line(34, 724, 280, 724, purpleStroke, 1.2);
  text(292, 716, 18, "*", "F2", yellow);
  line(314, 724, 561, 724, purpleStroke, 1.2);

  // Bloco superior de informações.
  strokeRect(30, 640, 535, 66, purpleStroke);
  const metaX = [58, 188, 324, 454];
  const metaLabels = ["USUARIO", "PERIODO", "CATEGORIA", "DATA DE GERACAO"];
  const metaValues = [usuario, periodo, categoria, now];
  const metaSub = ["", "01/05/2026 a 24/05/2026", "", ""];
  metaX.forEach((x, i) => {
    if (i > 0) line(x - 25, 655, x - 25, 692, "0.72 0.70 0.80 RG", 0.6);
    text(x + 28, 684, 7.1, metaLabels[i], "F2", purple);
    text(x + 28, 669, 8.6, metaValues[i], "F2");
    if (metaSub[i]) text(x + 28, 658, 6.2, metaSub[i], "F1", muted);
  });
  // Ícones vetoriais simples.
  circle(58, 678, 8, purpleStroke, purple);
  rect(50, 654, 18, 18, purple);
  strokeRect(180, 670, 16, 16, purpleStroke);
  line(180, 681, 196, 681, purpleStroke);
  line(184, 688, 184, 665, purpleStroke);
  line(192, 688, 192, 665, purpleStroke);
  [318, 334].forEach((xx) => [678, 662].forEach((yy) => strokeRect(xx, yy, 10, 10, purpleStroke)));
  circle(444, 674, 13, purpleStroke);
  line(444, 674, 444, 684, purpleStroke);
  line(444, 674, 451, 674, purpleStroke);

  // Dados do cliente.
  text(34, 602, 10, "DADOS DO CLIENTE", "F2", purple);
  strokeRect(30, 482, 535, 106, border);
  const clientLeft = [
    ["Razao Social:", "PONTO MEDIO E CIA LTDA"],
    ["Fantasia:", "PONTO MEDIO EMPREENDIMENTOS IMOBILIARIOS"],
    ["CNPJ:", "12345678/0001-54     Inscricao Est.: 2222222222"],
    ["Nome do proprietario:", usuario || "julia"],
  ];
  const clientRight = [
    ["RG:", "22444555-22     SSP-SP     CPF: 123.456.789-19"],
    ["Endereco:", "Rua Marechal Deodoro, 2342"],
    ["Cidade:", "Piracicaba - SP     CEP: 13419100"],
    ["Telefone:", "(11) 9323 87604     E-mail: email@cliente.com.br"],
  ];
  clientLeft.forEach(([a, b], i) => {
    text(44, 560 - i * 20, 8.2, a, "F2");
    text(118, 560 - i * 20, 8.2, b);
  });
  clientRight.forEach(([a, b], i) => {
    text(312, 560 - i * 20, 8.2, a, "F2");
    text(368, 560 - i * 20, 8.2, b);
  });

  // Histórico de faturas.
  text(34, 445, 10, "HISTORICO DE FATURAS", "F2", purple);
  strokeRect(30, 265, 535, 160, border);
  rect(30, 407, 535, 18, purple);
  const tableX = [62, 168, 270, 386, 500];
  ["MES/ANO", "ENERGIA (kWh)", "CUSTO (R$)", "ECONOMIZADO (R$)", "STATUS"].forEach((h, i) =>
    text(tableX[i], 413, 7.1, h, "F2", "1 1 1 rg"),
  );
  const fallbackRows = [
    "Out/2025 | Energia: 187 kWh | Custo: R$ 165 | Economizado: R$ 23 | Status: Pago",
    "Set/2025 | Energia: 179 kWh | Custo: R$ 158 | Economizado: R$ 21 | Status: Pago",
    "Ago/2025 | Energia: 184 kWh | Custo: R$ 163 | Economizado: R$ 19 | Status: Pago",
    "Jul/2025 | Energia: 193 kWh | Custo: R$ 171 | Economizado: R$ 16 | Status: Pago",
    "Jun/2025 | Energia: 176 kWh | Custo: R$ 156 | Economizado: R$ 18 | Status: Pendente",
    "Mai/2025 | Energia: 167 kWh | Custo: R$ 148 | Economizado: R$ 15 | Status: Pago",
  ];
  let y = 391;
  (tableLines.length ? tableLines : fallbackRows).slice(0, 6).forEach((row, index) => {
    const parts = row.split("|").map((part) => part.trim());
    if (index % 2 === 1) rect(30, y - 8, 535, 18, "0.987 0.987 0.997 rg");
    const month = parts[0] || "-";
    const energy = (parts[1] || "").replace("Energia:", "").trim();
    const cost = (parts[2] || "").replace("Custo:", "").trim();
    const saved = (parts[3] || "").replace("Economizado:", "").trim();
    const status = (parts[4] || "").replace("Status:", "").trim();
    text(tableX[0], y, 8.2, month);
    text(tableX[1], y, 8.2, energy);
    text(tableX[2], y, 8.2, cost);
    text(tableX[3], y, 8.2, saved);
    const statusColor =
      status === "Pendente" ? orange : status === "Atrasado" ? "0.85 0.10 0.10 rg" : green;
    text(
      tableX[4],
      y,
      8.2,
      status === "Pendente" ? `o  ${status}` : `ok  ${status}`,
      "F2",
      statusColor,
    );
    line(30, y - 10, 565, y - 10, softLine, 0.45);
    y -= 20;
  });

  // Serviço(s) realizado(s).
  text(34, 235, 10, "SERVICO(S) REALIZADO(S)", "F2", purple);
  strokeRect(30, 133, 535, 86, border);
  line(296, 145, 296, 207, softLine, 0.65);
  const serv1 = [
    ["Levantamento:", "PLANIALTIMETRICO CADASTRAL"],
    ["Equipe de campo:", "-"],
    ["Equipe de escritorio:", "-"],
    ["Finalidade:", "RETIFICACAO DE AREA"],
    ["Equipamento:", "HORIZON K200M"],
    ["ART:", "1     |     Data: 06/06/2016"],
  ];
  const serv2 = [
    ["Levantamento:", "PLANIMETRICO GEORREFERENCIADO"],
    ["Equipe de campo:", "-"],
    ["Equipe de escritorio:", "-"],
    ["Finalidade:", "GEORREFERENCIAMENTO"],
    ["Equipamento:", "HORIZON K200M"],
    ["ART:", "8     |     Data: 06/06/2016"],
  ];
  serv1.forEach(([a, b], i) => {
    text(43, 198 - i * 11.5, 7.2, a, "F2");
    text(112, 198 - i * 11.5, 7.2, b);
  });
  serv2.forEach(([a, b], i) => {
    text(314, 198 - i * 11.5, 7.2, a, "F2");
    text(384, 198 - i * 11.5, 7.2, b);
  });

  // Observações e assinatura.
  text(42, 105, 7.7, "OBSERVACOES", "F2", purple);
  text(30, 90, 6.4, "Os valores apresentados podem sofrer variacoes");
  text(30, 80, 6.4, "conforme leitura da concessionaria.");
  text(30, 68, 6.4, "Relatorio gerado automaticamente pelo sistema.");
  text(30, 58, 6.4, "Para mais detalhes, acesse sua conta ou entre");
  text(30, 48, 6.4, "em contato com nosso suporte.");
  text(405, 94, 30, "Wattiz", "F2", purple);
  line(377, 80, 548, 80, purpleStroke, 0.85);
  text(407, 66, 8.1, "Inteligência de Energia", "F2");
  text(421, 54, 7.3, "CNPJ: 45.678.912/0001-73");

  // Rodapé.
  text(45, 18, 22, "W", "F2", yellow);
  line(92, 9, 92, 34, "0.72 0.68 0.80 RG", 0.6);
  text(124, 19, 11, "(11) 9323 87604", "F2", "1 1 1 rg");
  line(230, 9, 230, 34, "0.72 0.68 0.80 RG", 0.6);
  text(260, 19, 10, "contato@wattiz.com.br", "F2", "1 1 1 rg");
  line(392, 9, 392, 34, "0.72 0.68 0.80 RG", 0.6);
  text(426, 19, 10, "www.wattiz.com.br", "F2", "1 1 1 rg");

  const stream = streamParts.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj",
    `6 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += obj + "\n";
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function RelatoriosContent() {
  const [period, setPeriod] = useState<ReportPeriod>("mensal");
  const [category, setCategory] = useState("Todas categorias");
  const [selectedBill, setSelectedBill] = useState<ReportBill | null>(null);
  const current = reportDataByPeriod[period];
  const appliances = readRegisteredAppliances();
  const totalMonth = appliances.reduce((sum, item) => sum + item.consumo, 0);
  const totalCost = totalMonth * 0.82;
  const topAppliance = [...appliances].sort((a, b) => b.consumo - a.consumo)[0];
  const user = readUser();
  const firstName = user.nome?.trim()?.split(" ")[0] || "Rafael";
  const cards = [
    ["Energia total consumida", appliances.length ? `${totalMonth.toFixed(0)} kWh` : current.cards[0], "Com base nos aparelhos cadastrados", "soft-purple"],
    ["Custo total de energia", appliances.length ? `R$ ${totalCost.toFixed(0)}` : current.cards[1], "Estimativa do período", "soft-white"],
    ["Energia economizada", current.cards[2], "+35% vs período anterior", "soft-yellow"],
    ["Maior consumo", topAppliance?.nome || current.cards[3], "Aparelho mais relevante", "soft-gray"],
    ["Média diária", appliances.length ? `${(totalMonth / 30).toFixed(1)} kWh` : current.cards[4], "Consumo médio calculado", "soft-green"],
    ["Melhor economia", current.cards[5], "Melhor resultado do ciclo", "soft-purple"],
  ] as const;

  function exportPdf() {
    const lines = [
      `Usuário: ${firstName}`,
      `Período selecionado: ${current.label}`,
      `Categoria: ${category}`,
      `Data de geração: ${new Date().toLocaleString("pt-BR")}`,
      "",
      "Resumo:",
      ...cards.map(([label, value, note]) => `${label}: ${value} — ${note}`),
      "",
      "Histórico de faturas:",
      ...reportBills.map(
        (row) =>
          `${row.mes} | Energia: ${row.energia} | Custo: ${row.custo} | Economizado: ${row.economizado} | Status: ${row.status}`,
      ),
    ];
    const blob = buildSimplePdf("Relatório", lines);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-wattiz-${period}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (selectedBill) {
    return (
      <section className="reports-page report-detail-page" aria-label="Detalhes da fatura">
        <button type="button" className="report-back-btn" onClick={() => setSelectedBill(null)}>
          ← Voltar para relatórios
        </button>
        <div className="report-detail-header">
          <div>
            <span>Detalhes da fatura</span>
            <h2>{selectedBill.mes}</h2>
            <p>Resumo completo do consumo, custos e economia do período.</p>
          </div>
          <button type="button" className="reports-export-btn" onClick={exportPdf}>
            <Save size={15} /> Exportar PDF
          </button>
        </div>

        <div className="report-detail-grid">
          <article>
            <span>Consumo total</span>
            <strong>{selectedBill.energia}</strong>
            <small>{selectedBill.comparacao}</small>
          </article>
          <article>
            <span>Custo total</span>
            <strong>{selectedBill.custo}</strong>
            <small>Conta do mês</small>
          </article>
          <article>
            <span>Economia</span>
            <strong>{selectedBill.economizado}</strong>
            <small>Economia registrada</small>
          </article>
          <article>
            <span>Status</span>
            <strong>{selectedBill.status}</strong>
            <small>Pagamento da fatura</small>
          </article>
        </div>

        <div className="report-detail-columns">
          <article className="reports-card">
            <h2>Gráfico detalhado da fatura</h2>
            <p>Variação estimada do consumo durante o ciclo.</p>
            <LineChart
              values={[42, 48, 55, 50, 61, 57, 64, 59]}
              labels={[
                "1ª sem",
                "2ª sem",
                "3ª sem",
                "4ª sem",
                "5ª sem",
                "6ª sem",
                "7ª sem",
                "8ª sem",
              ]}
            />
          </article>
          <article className="reports-card report-detail-list">
            <h2>Análise da Lume</h2>
            <p>Aparelhos e hábitos que mais influenciaram esta fatura.</p>
            <ul>
              <li>
                <span>Aparelho crítico</span>
                <strong>{selectedBill.maiorConsumo}</strong>
              </li>
              <li>
                <span>Horário de pico</span>
                <strong>{selectedBill.pico}</strong>
              </li>
              <li>
                <span>Dica personalizada</span>
                <strong>{selectedBill.dica}</strong>
              </li>
            </ul>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="reports-page" aria-label="Relatórios">
      <div className="reports-actions-bar">
        <div className="reports-tabs" role="tablist" aria-label="Período do relatório">
          {(["diario", "semanal", "mensal", "anual"] as ReportPeriod[]).map((item) => (
            <button
              key={item}
              type="button"
              className={period === item ? "active" : ""}
              onClick={() => setPeriod(item)}
            >
              {reportDataByPeriod[item].label}
            </button>
          ))}
        </div>
        <input
          className="reports-period-input"
          type="month"
          aria-label="Período personalizado"
          onChange={() => setPeriod("mensal")}
        />
        <select
          className="reports-filter-select"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filtrar por categoria"
        >
          <option>Todas categorias</option>
          <option>Climatização</option>
          <option>Cozinha</option>
          <option>Iluminação</option>
          <option>Entretenimento</option>
        </select>
        <button type="button" className="reports-export-btn" onClick={exportPdf}>
          <Save size={16} /> Exportar PDF
        </button>
      </div>

      <div className="reports-summary-grid">
        {cards.map(([label, value, note, tone]) => (
          <article className={`reports-summary-card ${tone}`} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>

      <div className="reports-chart-grid">
        <article className="reports-card reports-card-large">
          <h2>Fluxo mensal de energia</h2>
          <p>kWh que passaram pelo seu lar</p>
          <BarsChart
            values={current.bars}
            labels={period === "mensal" || period === "anual" ? reportMonths : weeklyLabels}
          />
        </article>
        <article className="reports-card reports-card-large">
          <h2>Custo na conta de luz</h2>
          <p>Quanto cada período custou em reais</p>
          <LineChart
            values={current.line}
            labels={period === "mensal" || period === "anual" ? reportMonths : weeklyLabels}
          />
        </article>
      </div>

      <div className="reports-bottom-grid">
        <article className="reports-card">
          <h2>Para onde vai sua energia?</h2>
          <DonutChart />
        </article>
        <article className="reports-card reports-table-card">
          <h2>Histórico de faturas de energia</h2>
          <div className="reports-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Energia</th>
                  <th>Custo</th>
                  <th>Economizado</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportBills.map((row) => (
                  <tr
                    key={row.mes}
                    className="reports-clickable-row"
                    onClick={() => setSelectedBill(row)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setSelectedBill(row);
                    }}
                  >
                    <td>{row.mes}</td>
                    <td>{row.energia}</td>
                    <td>{row.custo}</td>
                    <td className="reports-saving">{row.economizado}</td>
                    <td>
                      <span className={`reports-status status-${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}

export function RelatoriosPage() {
  return (
    <DashboardShell page="Relatórios">
      <RelatoriosContent />
    </DashboardShell>
  );
}

export function HistoricoPage() {
  return <DashboardShell page="Relatórios" />;
}

type LumeMessage = {
  id: number;
  role: "lume" | "user";
  text: string;
  time: string;
};

const lumeQuickQuestions = [
  "Reduzir consumo",
  "Aparelhos que gastam mais",
  "Previsão do mês",
  "Dicas rápidas",
  "Horários de pico",
];

const aboutLumeCards = [
  {
    title: "O que é a Lume?",
    text: "A Lume é sua assistente inteligente. Ela traduz dados de energia em orientações simples para você entender sua conta e seus hábitos.",
    icon: Bot,
  },
  {
    title: "Como ela funciona?",
    text: "Ela cruza consumo, horários de pico, eletrodomésticos cadastrados e histórico de relatórios para identificar padrões e oportunidades de economia.",
    icon: Sparkles,
  },
  {
    title: "Como ajuda a economizar?",
    text: "A Lume aponta aparelhos críticos, sugere mudanças de horário, alerta desperdícios e mostra pequenas ações que reduzem o custo mensal.",
    icon: PiggyBank,
  },
  {
    title: "O que ela analisa?",
    text: "Consumo diário, custo estimado, equipamentos ligados, horários de maior uso, metas, faturas e comparação com períodos anteriores.",
    icon: BarChart3,
  },
  {
    title: "Benefícios para o usuário",
    text: "Mais clareza sobre a conta, alertas inteligentes, recomendações personalizadas e uma visão prática de onde a energia está sendo usada.",
    icon: Lightbulb,
  },
  {
    title: "Segurança e privacidade",
    text: "As informações são usadas apenas para melhorar sua análise de energia. Nada é exibido fora do seu painel.",
    icon: ShieldCheck,
  },
  {
    title: "Planos e Loja",
    text: "A Lume também pode indicar planos, sensores, tomadas inteligentes e kits conforme seu perfil de energia.",
    icon: ShoppingBag,
  },
  {
    title: "Exemplos de perguntas",
    text: "Pergunte sobre consumo, economia, relatórios, aparelhos, horários de pico, planos, loja ou previsão da conta.",
    icon: Info,
  },
];

function getNowTime() {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(),
  );
}

function getLumeAnswer(question: string) {
  const text = question.toLowerCase();
  if (text.includes("reduzir") || text.includes("econom") || text.includes("economia")) {
    return "Para reduzir seu consumo, comece pelos aparelhos de maior impacto: ar-condicionado, chuveiro elétrico e geladeira. Use o ar em 23–24°C, evite banho longo no horário de pico e mantenha equipamentos em standby desligados. Com esses ajustes, sua economia estimada pode ficar entre R$ 18 e R$ 28 no mês.";
  }
  if (text.includes("gastam") || text.includes("aparelhos") || text.includes("consomem")) {
    return "Pelo seu perfil, os aparelhos que mais pesam são: ar-condicionado, chuveiro elétrico, geladeira, TV e iluminação. O ar-condicionado costuma concentrar o maior consumo quando fica ligado por muitas horas seguidas.";
  }
  if (
    text.includes("previs") ||
    text.includes("mês") ||
    text.includes("mes") ||
    text.includes("conta")
  ) {
    return "Com o ritmo atual, sua previsão mensal está próxima de R$ 165 e cerca de 187 kWh. Se o consumo noturno cair um pouco, a conta pode fechar perto de R$ 150.";
  }
  if (text.includes("verão") || text.includes("verao") || text.includes("calor")) {
    return "No verão, priorize ventilação natural no fim da tarde, use o ar-condicionado em modo econômico, limpe filtros e evite ligar aparelhos pesados no horário de pico. Isso reduz desperdício sem perder conforto.";
  }
  if (text.includes("relatório") || text.includes("relatorios") || text.includes("fatura")) {
    return "Nos relatórios, acompanhe energia consumida, custo total, economia, histórico de faturas e comparação mensal. O ideal é verificar se algum mês saiu do padrão e relacionar isso aos horários de pico.";
  }
  if (
    text.includes("plano") ||
    text.includes("loja") ||
    text.includes("sensor") ||
    text.includes("tomada")
  ) {
    return "Para acompanhar melhor seus aparelhos, a Loja pode oferecer sensores e tomadas inteligentes. Nos planos, escolha o nível que combina com a quantidade de equipamentos que você quer monitorar.";
  }
  return "Entendi. Pelo seu painel, o consumo está em um padrão residencial realista, com atenção ao ar-condicionado e aos horários de pico. Posso te ajudar a analisar aparelhos, relatórios, custos, planos ou dicas de economia.";
}

function LumeIAContent() {
  const [tab, setTab] = useState<"chat" | "about">("chat");
  const [input, setInput] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [lumeLoading, setLumeLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<LumeMessage[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("wattiz_lume_chat");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* empty */
      }
    }
    return [
      {
        id: 1,
        role: "lume",
        text: "Olá! Eu sou a Lume, sua assistente de energia. Posso ajudar com consumo, economia, aparelhos, relatórios, horários de pico, planos e loja.",
        time: getNowTime(),
      },
    ];
  });

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("wattiz_lume_chat", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const pickFemaleVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((voice) =>
        /maria|helena|heloisa|luciana|francisca|manuela|vitória|vitoria|catarina|joana|raquel|female|feminina|mulher/i.test(
          `${voice.name} ${voice.lang}`,
        ),
      ) ||
      voices.find(
        (voice) =>
          voice.lang?.toLowerCase() === "pt-br" && !/male|masculina|homem/i.test(voice.name),
      ) ||
      voices.find(
        (voice) =>
          voice.lang?.toLowerCase().startsWith("pt") && !/male|masculina|homem/i.test(voice.name),
      ) ||
      voices.find((voice) => voice.lang?.toLowerCase() === "pt-br") ||
      voices.find((voice) => voice.lang?.toLowerCase().startsWith("pt"))
    );
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text: string) => {
    if (!audioEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    const selectedVoice = pickFemaleVoice();
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.96;
    utterance.pitch = 1.28;
    utterance.volume = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || lumeLoading) return;
    const userMessage: LumeMessage = {
      id: Date.now(),
      role: "user",
      text: question,
      time: getNowTime(),
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");

    // Backend real disponível e usuário logado
    if (hasBackend() && getAccessToken()) {
      setLumeLoading(true);
      try {
        const now = new Date();
        const res = await apiLume.chat(question, now.getMonth() + 1, now.getFullYear());
        const answer: LumeMessage = {
          id: Date.now() + 1,
          role: "lume",
          text: res.response,
          time: getNowTime(),
        };
        setMessages((current) => [...current, answer]);
        setTimeout(() => speak(res.response), 120);
      } catch {
        const errMsg = "Desculpe, tive um problema ao conectar com o servidor. Tente novamente.";
        setMessages((current) => [
          ...current,
          { id: Date.now() + 1, role: "lume", text: errMsg, time: getNowTime() },
        ]);
      } finally {
        setLumeLoading(false);
      }
      return;
    }

    // Fallback local
    const answerText = getLumeAnswer(question);
    const answer: LumeMessage = {
      id: Date.now() + 1,
      role: "lume",
      text: answerText,
      time: getNowTime(),
    };
    setMessages((current) => [...current, answer]);
    setTimeout(() => speak(answerText), 120);
  };

  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg =
        "Seu navegador não ativou o reconhecimento de voz. Use o Chrome ou Edge atualizado, ou digite sua pergunta no campo de texto.";
      setMessages((current) => [
        ...current,
        { id: Date.now(), role: "lume", text: msg, time: getNowTime() },
      ]);
      speak(msg);
      return;
    }
    if (recognitionRef.current) recognitionRef.current.stop();
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
      if (transcript) setTimeout(() => sendMessage(transcript), 180);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const clearChat = () => {
    const initial = {
      id: Date.now(),
      role: "lume" as const,
      text: "Conversa limpa. Pode perguntar novamente sobre consumo, economia, relatórios, aparelhos, planos ou loja.",
      time: getNowTime(),
    };
    setMessages([initial]);
    speak(initial.text);
  };

  const handleAttachment = (type: "arquivo" | "imagem", files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const userText =
      type === "imagem" ? `Imagem anexada: ${file.name}` : `Arquivo anexado: ${file.name}`;
    const answerText =
      type === "imagem"
        ? "Recebi sua imagem. Posso usar essa referência para explicar consumo, aparelhos, relatórios ou detalhes visuais do painel."
        : "Recebi seu arquivo. Posso analisar o conteúdo e transformar as informações em orientações simples sobre energia e economia.";
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: userText, time: getNowTime() },
      { id: Date.now() + 1, role: "lume", text: answerText, time: getNowTime() },
    ]);
    setTimeout(() => speak(answerText), 120);
  };

  return (
    <section className={`lume-ia-page lume-tab-${tab}`} aria-label="Lume IA">
      <div className="lume-tabs" role="tablist" aria-label="Navegação interna da Lume IA">
        <button
          type="button"
          className={tab === "chat" ? "active" : ""}
          onClick={() => setTab("chat")}
          role="tab"
          aria-selected={tab === "chat"}
        >
          <Bot size={18} /> Chat
        </button>
        <button
          type="button"
          className={tab === "about" ? "active" : ""}
          onClick={() => setTab("about")}
          role="tab"
          aria-selected={tab === "about"}
        >
          <Info size={18} /> Sobre a Lume
        </button>
      </div>

      {tab === "chat" ? (
        <div className="lume-chat-layout">
          <div className="lume-chat-header">
            <div className="lume-avatar-mini">
              <Bot size={18} />
            </div>
            <div>
              <h2>Lume</h2>
              <p>
                {listening
                  ? "Ouvindo sua pergunta..."
                  : speaking
                    ? "Lume falando..."
                    : "Assistente de energia"}
              </p>
            </div>
            <div className="lume-header-actions">
              <button
                type="button"
                className={audioEnabled ? "active" : ""}
                onClick={() => setAudioEnabled((value) => !value)}
                aria-label={audioEnabled ? "Desativar áudio" : "Ativar áudio"}
              >
                {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button type="button" onClick={clearChat} aria-label="Limpar conversa">
                <Trash2 size={17} />
              </button>
            </div>
          </div>

          <div className="lume-messages" aria-live="polite">
            {messages.map((message) => (
              <article className={`lume-message ${message.role}`} key={message.id}>
                <span className="lume-message-name">
                  {message.role === "lume" ? "Lume" : "Você"}
                </span>
                <p>{message.text}</p>
                <time>{message.time}</time>
              </article>
            ))}
            {lumeLoading && (
              <article className="lume-message lume" aria-label="Lume está digitando">
                <span className="lume-message-name">Lume</span>
                <p style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>digitando...</p>
              </article>
            )}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <div className="lume-chat-bottom">
            <div className="lume-quick-grid" aria-label="Sugestões rápidas">
              {lumeQuickQuestions.map((question, index) => {
                const icons = [BarChart3, Lightbulb, Zap, Sparkles, Clock];
                const Icon = icons[index] || Lightbulb;
                return (
                  <button type="button" key={question} onClick={() => sendMessage(question)}>
                    <Icon size={15} /> {question}
                  </button>
                );
              })}
            </div>

            <form
              className="lume-input-row"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <button
                type="button"
                className={listening ? "listening" : ""}
                onClick={startListening}
                aria-label="Falar com a Lume"
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Anexar arquivo"
              >
                <Paperclip size={18} />
              </button>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                aria-label="Enviar imagem"
              >
                <ImagePlus size={18} />
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={lumeLoading ? "Lume está respondendo..." : "Pergunte algo à Lume..."}
                aria-label="Pergunte algo à Lume"
                disabled={lumeLoading}
              />
              <button type="submit" aria-label="Enviar pergunta" disabled={lumeLoading}>
                <Send size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="lume-hidden-file"
                onChange={(event) => handleAttachment("arquivo", event.target.files)}
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="lume-hidden-file"
                onChange={(event) => handleAttachment("imagem", event.target.files)}
              />
            </form>
          </div>
        </div>
      ) : (
        <div className="lume-about-page">
          <div className="lume-about-hero">
            <div className="lume-about-avatar">
              <img src={lumeFloating} alt="Lume, assistente de energia" />
            </div>
            <span>Conheça a Lume</span>
            <h2>Energia explicada de um jeito simples.</h2>
            <p>
              A Lume é sua assistente inteligente. Ela analisa consumo, aparelhos, faturas e
              hábitos para transformar dados técnicos em recomendações claras, úteis e econômicas.
            </p>
          </div>

          <div className="lume-about-section">
            <h3>Como funciona?</h3>
            <p>
              A Lume cruza dados do seu painel com padrões residenciais para encontrar desperdícios,
              horários de pico e oportunidades reais de economia.
            </p>
            <div className="lume-about-grid">
              {aboutLumeCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.title}>
                    <i>
                      <Icon size={18} />
                    </i>
                    <h4>{card.title}</h4>
                    <p>{card.text}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="lume-action-section">
            <h3>A Lume em ação</h3>
            <div className="lume-action-grid">
              <article>
                <span></span>
                <strong>Coletando dados</strong>
                <p>Consumo, horários, aparelhos e faturas.</p>
              </article>
              <article>
                <span></span>
                <strong>Processando padrões</strong>
                <p>Identifica picos, excessos e tendências.</p>
              </article>
              <article>
                <span></span>
                <strong>Gerando insights</strong>
                <p>Entrega dicas simples para economizar.</p>
              </article>
            </div>
          </div>

          <div className="lume-examples-section">
            <h3>Exemplos de perguntas</h3>
            <div>
              {lumeQuickQuestions.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => {
                    setTab("chat");
                    setTimeout(() => sendMessage(question), 80);
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type StoreProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  details: string;
  category: string;
  availability: "Disponível" | "Bloqueado";
  plan: "Livre" | "Business";
  image: string;
  rating: number;
  specs: string[];
  compatibility: string[];
  benefits: string[];
};

type CartItem = StoreProduct & { quantity: number };

type StoreComment = {
  user: string;
  rating: number;
  text: string;
  date: string;
};

const storeProducts: StoreProduct[] = [
  {
    id: "hardware-wattiz",
    name: "Hardware",
    brand: "Wattiz",
    price: 399.9,
    description: "Medidor inteligente que envia dados reais de consumo para o dashboard.",
    details:
      "O hardware é o produto principal da plataforma. Ele monitora o consumo, envia dados para o dashboard, melhora a precisão dos relatórios e ajuda a Lume IA a identificar desperdícios com mais segurança.",
    category: "Hardware",
    availability: "Disponível",
    plan: "Business",
    image: wattizTomada,
    rating: 4.9,
    specs: [
      "Leitura de consumo em tempo real",
      "Instalação orientada",
      "Envio de dados para o dashboard",
      "Compatível com plano Empresa",
    ],
    compatibility: ["Painel de Energia", "Relatórios", "Lume IA", "Plano Empresa"],
    benefits: [
      "Identifica desperdícios com mais precisão",
      "Melhora relatórios e previsões",
      "Monitora consumo de forma contínua",
      "Potencializa economia em empresas",
    ],
  },
  {
    id: "tomada-wattiz",
    name: "Tomada inteligente",
    brand: "Wattiz",
    price: 119.9,
    description: "Controle e medição por tomada com rotinas inteligentes.",
    details:
      "Permite acompanhar o consumo de aparelhos individuais, programar horários e receber alertas quando houver uso fora do padrão.",
    category: "Tomadas",
    availability: "Disponível",
    plan: "Livre",
    image: tomadaMedidora,
    rating: 4.9,
    specs: ["Medição por tomada", "Controle remoto", "Agendamento", "Proteção contra sobrecarga"],
    compatibility: ["Painel de Energia", "Meus Eletrodomésticos", "Lume IA"],
    benefits: ["Controle por aparelho", "Redução de standby", "Histórico individual"],
  },
  {
    id: "kit-wattiz",
    name: "Kit de monitoramento",
    brand: "Wattiz",
    price: 399.9,
    description: "Kit completo para monitoramento residencial ou empresarial.",
    details:
      "Reúne sensores, tomada e hub para criar uma base completa de leitura de energia conectada ao dashboard.",
    category: "Kits",
    availability: "Disponível",
    plan: "Livre",
    image: tomadaMedidora,
    rating: 4.9,
    specs: [
      "Kit com múltiplos dispositivos",
      "Configuração assistida",
      "Painel integrado",
      "Suporte Business",
    ],
    compatibility: ["Dashboard completo", "Relatórios PDF", "Alertas da Lume"],
    benefits: ["Implantação completa", "Melhor leitura de energia", "Recomendado para empresas"],
  },
  {
    id: "medidor-inteligente",
    name: "Medidor inteligente",
    brand: "Wattiz",
    price: 289.9,
    description: "Medição contínua para quadro elétrico com relatórios automáticos.",
    details:
      "O medidor inteligente acompanha o fluxo de energia do imóvel e envia dados para relatórios e previsões da Lume.",
    category: "Medição",
    availability: "Disponível",
    plan: "Livre",
    image: medidorDigital,
    rating: 4.7,
    specs: ["Leitura contínua", "Instalação técnica", "Relatórios automáticos", "Alta precisão"],
    compatibility: ["Relatórios", "Painel de Energia", "Lume IA"],
    benefits: ["Leitura do quadro", "Dados consolidados", "Comparativos mensais"],
  },
  {
    id: "presenca",
    name: "Sensor de presença",
    brand: "Intelbras",
    price: 89.9,
    description: "Automação por movimento para reduzir luzes esquecidas.",
    details:
      "Ideal para corredores, recepções, áreas comuns e ambientes de passagem com acionamento inteligente.",
    category: "Sensores",
    availability: "Disponível",
    plan: "Livre",
    image: tomadaMedidora,
    rating: 4.6,
    specs: ["Detecção de movimento", "Baixo consumo", "Automação de ambientes", "Uso interno"],
    compatibility: ["Rotinas", "Lume IA", "Alertas de iluminação"],
    benefits: ["Evita desperdício", "Mais conforto", "Automação simples"],
  },
  {
    id: "lampada",
    name: "Lâmpada inteligente",
    brand: "Positivo Casa Inteligente",
    price: 59.9,
    description: "Iluminação conectada com cenas, horários e controle remoto.",
    details: "Permite criar rotinas de iluminação e acompanhar impacto no consumo do mês.",
    category: "Iluminação",
    availability: "Disponível",
    plan: "Livre",
    image: medidorDigital,
    rating: 4.5,
    specs: ["Controle por app", "Cenas programáveis", "Baixo consumo", "Wi‑Fi"],
    compatibility: ["Loja", "Lume IA", "Relatórios"],
    benefits: ["Rotinas econômicas", "Controle remoto", "Mais praticidade"],
  },
  {
    id: "smart-plug",
    name: "Smart plug",
    brand: "Sonoff",
    price: 74.9,
    description: "Plug Wi‑Fi para automatizar aparelhos comuns.",
    details:
      "Transforma equipamentos tradicionais em dispositivos controláveis pelo painel.",
    category: "Tomadas",
    availability: "Disponível",
    plan: "Livre",
    image: tomadaMedidora,
    rating: 4.7,
    specs: ["Wi‑Fi", "Temporizador", "Controle remoto", "Compatível com rotinas"],
    compatibility: ["Meus Eletrodomésticos", "Lume IA", "Painel"],
    benefits: ["Reduz standby", "Automatiza aparelhos", "Controle simplificado"],
  },
  {
    id: "disjuntor",
    name: "Disjuntor inteligente",
    brand: "Steck",
    price: 219.9,
    description: "Proteção e leitura por circuito para cargas importantes.",
    details:
      "Indicado para acompanhamento avançado de circuitos, ambientes empresariais e cargas de maior consumo.",
    category: "Segurança elétrica",
    availability: "Disponível",
    plan: "Livre",
    image: medidorDigital,
    rating: 4.8,
    specs: ["Leitura por circuito", "Proteção elétrica", "Uso técnico", "Alta confiabilidade"],
    compatibility: ["Relatórios Business", "Painel de Energia", "Alertas"],
    benefits: ["Mais segurança", "Visão por circuito", "Controle profissional"],
  },
  {
    id: "rele-wifi",
    name: "Relé Wi‑Fi",
    brand: "Tuya",
    price: 68.9,
    description: "Automação discreta para interruptores e pequenas cargas.",
    details:
      "Solução compacta para automatizar pontos específicos sem grandes mudanças no sistema elétrico.",
    category: "Automação",
    availability: "Disponível",
    plan: "Livre",
    image: tomadaMedidora,
    rating: 4.4,
    specs: ["Formato compacto", "Wi‑Fi", "Controle por rotina", "Instalação técnica"],
    compatibility: ["Rotinas", "Lume IA", "Loja"],
    benefits: ["Automação discreta", "Baixo custo", "Controle por horário"],
  },
  {
    id: "interruptor",
    name: "Interruptor inteligente",
    brand: "Elgin",
    price: 129.9,
    description: "Controle de iluminação com toque, app e horários.",
    details:
      "Permite criar horários de uso, reduzir desperdícios e controlar iluminação por ambiente.",
    category: "Iluminação",
    availability: "Disponível",
    plan: "Livre",
    image: tomadaMedidora,
    rating: 4.6,
    specs: ["Touch", "Wi‑Fi", "Agendamento", "Controle por app"],
    compatibility: ["Lume IA", "Meus Eletrodomésticos", "Painel"],
    benefits: ["Mais conforto", "Economia com iluminação", "Rotinas inteligentes"],
  },
  {
    id: "medidor-tomada",
    name: "Medidor de consumo por tomada",
    brand: "Xiaomi",
    price: 139.9,
    description: "Mede consumo individual de equipamentos conectados.",
    details:
      "Ajuda a identificar quais aparelhos têm maior impacto na conta e a montar relatórios mais detalhados.",
    category: "Medição",
    availability: "Disponível",
    plan: "Livre",
    image: medidorDigital,
    rating: 4.8,
    specs: ["Medição individual", "Histórico de consumo", "Alta precisão", "Uso residencial"],
    compatibility: ["Relatórios", "Lume IA", "Dashboard"],
    benefits: ["Descobre vilões de consumo", "Dados por aparelho", "Previsões melhores"],
  },
  {
    id: "temperatura",
    name: "Sensor de temperatura",
    brand: "Xiaomi",
    price: 79.9,
    description: "Temperatura e umidade para otimizar climatização.",
    details: "Permite que a Lume relacione temperatura, horários de uso e consumo de climatização.",
    category: "Sensores",
    availability: "Disponível",
    plan: "Livre",
    image: medidorDigital,
    rating: 4.5,
    specs: ["Temperatura", "Umidade", "Baixo consumo", "Monitoramento contínuo"],
    compatibility: ["Climatização", "Lume IA", "Relatórios"],
    benefits: ["Ajustes de ar-condicionado", "Mais conforto", "Economia sazonal"],
  },
  {
    id: "hub-iot",
    name: "Hub IoT residencial",
    brand: "Wattiz",
    price: 249.9,
    description: "Centraliza dispositivos conectados da casa ou empresa.",
    details:
      "Base para conectar sensores, plugues e dispositivos parceiros com mais estabilidade e automações confiáveis.",
    category: "Hub",
    availability: "Disponível",
    plan: "Livre",
    image: tomadaMedidora,
    rating: 4.9,
    specs: ["Central IoT", "Integração multi-marcas", "Estabilidade avançada", "Suporte Business"],
    compatibility: ["Todos os módulos", "Lume IA", "Loja"],
    benefits: ["Conecta tudo", "Mais estabilidade", "Automações profissionais"],
  },
];

const storeComments: StoreComment[] = [
  {
    user: "Marina Souza",
    rating: 5,
    text: "A integração deixou os relatórios muito mais claros.",
    date: "12/05/2026",
  },
  {
    user: "Carlos Lima",
    rating: 4.8,
    text: "Produto bem construído e útil para entender gastos por ambiente.",
    date: "08/05/2026",
  },
  {
    user: "Patrícia Nunes",
    rating: 4.7,
    text: "Gostei do visual do painel e das recomendações da Lume.",
    date: "02/05/2026",
  },
];

const relatedProducts = (product: StoreProduct) =>
  storeProducts
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.category === product.category || item.brand === product.brand),
    )
    .slice(0, 3);

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function LojaWattizContent() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [brand, setBrand] = useState("Todas");
  const [selected, setSelected] = useState<StoreProduct | null>(null);
  const [currentPlan] = useCurrentPlan();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("wattiz_store_cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("wattiz_store_cart", JSON.stringify(cart));
  }, [cart]);

  const categories = [
    "Todas",
    ...Array.from(new Set(storeProducts.map((product) => product.category))),
  ];
  const brands = ["Todas", ...Array.from(new Set(storeProducts.map((product) => product.brand)))];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isWattizHardware = (product: StoreProduct) => product.id === "hardware-wattiz";

  const canAccessProduct = (product: StoreProduct) => {
    if (!isWattizHardware(product)) return true;
    return currentPlan === "business";
  };

  const filteredProducts = storeProducts.filter((product) => {
    const search =
      `${product.name} ${product.brand} ${product.description} ${product.category}`.toLowerCase();
    return (
      search.includes(query.toLowerCase()) &&
      (category === "Todas" || product.category === category) &&
      (brand === "Todas" || product.brand === brand)
    );
  });

  const goToPlans = () => navigateTo("/planos");

  const addToCart = (product: StoreProduct) => {
    if (!canAccessProduct(product)) {
      goToPlans();
      return;
    }
    setIsCartOpen(true);
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing)
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      return [...items, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((items) =>
      items
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => setCart((items) => items.filter((item) => item.id !== id));
  const finishCheckout = () => {
    alert("Solicitação finalizada com sucesso.");
    setCart([]);
  };

  if (selected) {
    const related = relatedProducts(selected);
    const allowed = canAccessProduct(selected);
    return (
      <section className="wattiz-store-page" aria-label="Detalhes do produto">
        <button type="button" className="wattiz-store-back-link" onClick={() => setSelected(null)}>
          <ChevronLeft size={17} /> Voltar para loja
        </button>

        <article className={`wattiz-product-detail-page ${allowed ? "" : "is-locked"}`}>
          <div className="wattiz-product-detail-media">
            <img src={selected.image} alt={selected.name} />
            {isWattizHardware(selected) && (
              <span className="wattiz-plan-badge">
                <Crown size={13} /> Exclusivo Empresa
              </span>
            )}
          </div>

          <div className="wattiz-product-detail-info">
            {selected.brand !== "Wattiz" && <span className="wattiz-store-brand">{selected.brand}</span>}
            <h2>{selected.name}</h2>
            <p>{selected.details}</p>

            <div className="wattiz-product-detail-meta">
              <span>
                Categoria: <strong>{selected.category}</strong>
              </span>
              <span>
                Preço estimado: <strong>{formatMoney(selected.price)}</strong>
              </span>
              <span>
                Status: <strong>{allowed ? "Disponível" : "Bloqueado"}</strong>
              </span>
              {isWattizHardware(selected) && (
                <span>
                  Plano necessário: <strong>Empresa</strong>
                </span>
              )}
            </div>

            {!allowed && (
              <div className="wattiz-business-alert">
                <Crown size={18} />
                <p>Exclusivo para o plano Empresa. Ele coleta dados reais e envia tudo para o dashboard.</p>
              </div>
            )}

            <button
              type="button"
              className="wattiz-store-plan-cta"
              onClick={() => (allowed ? addToCart(selected) : goToPlans())}
            >
              {allowed ? (isWattizHardware(selected) ? "Solicitar hardware" : "Adicionar ao carrinho") : "Ver planos"}
            </button>
          </div>
        </article>

        <div className="wattiz-product-detail-grid">
          {isWattizHardware(selected) && (
            <section>
              <h3>Como funciona</h3>
              <p>
                O hardware mede o consumo, envia os dados para o dashboard e ajuda a Lume IA a
                identificar padrões, desperdícios e oportunidades de economia.
              </p>
            </section>
          )}
          {isWattizHardware(selected) && (
            <section>
              <h3>Integração com o sistema</h3>
              <p>
                Os dados coletados aparecem nos relatórios, nos gráficos do painel e nas sugestões
                automáticas da Lume IA.
              </p>
            </section>
          )}
          <section>
            <h3>Especificações técnicas</h3>
            <ul>
              {selected.specs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Compatibilidade</h3>
            <ul>
              {selected.compatibility.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Benefícios</h3>
            <ul>
              {selected.benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="wattiz-product-comments">
          <div className="wattiz-store-section-title">
            <span>Avaliações</span>
            <h3>Comentários de usuários</h3>
          </div>
          <div>
            {storeComments.map((comment) => (
              <article key={`${comment.user}-${comment.date}`}>
                <div>
                  <strong>{comment.user}</strong>
                  <span>{comment.date}</span>
                </div>
                <p>{comment.text}</p>
                <small>
                  <Star size={13} /> {comment.rating}
                </small>
              </article>
            ))}
          </div>
        </section>

        <section className="wattiz-related-products">
          <div className="wattiz-store-section-title">
            <span>Relacionados</span>
            <h3>Produtos relacionados</h3>
          </div>
          <div>
            {related.map((item) => (
              <button type="button" key={item.id} onClick={() => setSelected(item)}>
                <img src={item.image} alt="" />
                {item.brand !== "Wattiz" && <span>{item.brand}</span>}
                <strong>{item.name}</strong>
                <small>{formatMoney(item.price)}</small>
              </button>
            ))}
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="wattiz-store-page" aria-label="Loja">
      <div className="wattiz-store-hero wattiz-store-hero-compact">
        <div>
          <span>Marketplace</span>
          <h2>Loja</h2>
          <p>Encontre dispositivos para automação, medição e economia. O hardware é exclusivo do plano Empresa.</p>
        </div>
        <div className="wattiz-store-hero-actions">
          <button
            type="button"
            className="wattiz-store-inline-cart"
            onClick={() => setIsCartOpen((open) => !open)}
            aria-label={isCartOpen ? "Fechar carrinho" : "Abrir carrinho"}
          >
            <ShoppingCart size={18} />
            <span>Carrinho</span>
            {cart.length > 0 && <strong>{cart.reduce((sum, item) => sum + item.quantity, 0)}</strong>}
          </button>
        </div>
      </div>


      <div className="wattiz-store-toolbar wattiz-store-toolbar-compact">
        <label className="wattiz-store-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar produto, marca ou categoria..."
          />
        </label>
        <label>
          <SlidersHorizontal size={15} />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <PackageCheck size={15} />
          <select value={brand} onChange={(event) => setBrand(event.target.value)}>
            {brands.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="wattiz-store-summary">
        <article>
          <strong>{filteredProducts.length}</strong>
          <span>produtos encontrados</span>
        </article>
        <article>
          <strong>Livre</strong>
          <span>produtos comuns liberados</span>
        </article>
        <article>
          <strong>Empresa</strong>
          <span>necessário para o hardware</span>
        </article>
      </div>

      <div className="wattiz-store-grid">
        {filteredProducts.map((product, index) => {
          const allowed = canAccessProduct(product);
          return (
            <article
              className={`wattiz-store-card ${allowed ? "" : "wattiz-store-card-unavailable"} tone-${index % 4}`}
              key={product.id}
              onClick={() => setSelected(product)}
            >
              <div className="wattiz-store-card-media">
                <img src={product.image} alt={product.name} />
                {isWattizHardware(product) && (
                  <span className="wattiz-plan-badge">
                    <Crown size={13} /> Exclusivo Empresa
                  </span>
                )}
              </div>
              <div className="wattiz-store-card-body">
                <div>
                  {product.brand !== "Wattiz" && <p className="wattiz-store-brand">{product.brand}</p>}
                  <h3>{product.name}</h3>
                </div>
                <p>{product.description}</p>
                <div className="wattiz-store-meta">
                  <span>{product.category}</span>
                  <span className={allowed ? "is-available" : "is-unavailable"}>
                    {allowed ? "Disponível" : "Bloqueado"}
                  </span>
                  <span>
                    <Star size={13} /> {product.rating}
                  </span>
                </div>
                <div className="wattiz-store-price-row">
                  <strong>{formatMoney(product.price)}</strong>
                  <small>Preço estimado</small>
                </div>
                {!allowed && (
                  <div className="wattiz-business-alert small">
                    <Crown size={15} />
                    <p>Hardware exclusivo do plano Empresa.</p>
                  </div>
                )}
                <div className="wattiz-store-actions" onClick={(event) => event.stopPropagation()}>
                  <button type="button" onClick={() => setSelected(product)}>
                    Ver detalhes
                  </button>
                  <button
                    type="button"
                    onClick={() => (allowed ? addToCart(product) : goToPlans())}
                  >
                    {allowed ? (isWattizHardware(product) ? "Solicitar hardware" : "Adicionar") : "Ver planos"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {isCartOpen && <button type="button" className="wattiz-cart-backdrop" onClick={() => setIsCartOpen(false)} aria-label="Fechar carrinho" />}

      <aside className={`wattiz-store-cart-panel ${isCartOpen ? "is-open" : ""}`} aria-label="Carrinho da Loja">
        <header className="wattiz-cart-header">
          <div>
            <span>Carrinho</span>
            <h3>Produtos selecionados</h3>
          </div>
          <button type="button" onClick={() => setIsCartOpen(false)} aria-label="Fechar carrinho">
            <X size={17} />
          </button>
        </header>

        <div className="wattiz-cart-content">
          {cart.length === 0 ? (
            <div className="wattiz-cart-empty">
              <ShoppingCart size={26} />
              <strong>Seu carrinho está vazio</strong>
              <p>Adicione dispositivos inteligentes para continuar.</p>
            </div>
          ) : (
            cart.map((item) => (
              <article className="wattiz-cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="wattiz-cart-item-info">
                  <strong>{item.name}</strong>
                  <small>{formatMoney(item.price)}</small>
                  <span>Subtotal: {formatMoney(item.price * item.quantity)}</span>
                </div>
                <div className="wattiz-cart-qty">
                  <button type="button" onClick={() => updateQty(item.id, -1)} aria-label="Diminuir quantidade">
                    <Minus size={13} />
                  </button>
                  <strong>{item.quantity}</strong>
                  <button type="button" onClick={() => updateQty(item.id, 1)} aria-label="Aumentar quantidade">
                    <Plus size={13} />
                  </button>
                  <button type="button" onClick={() => removeFromCart(item.id)} aria-label="Remover produto">
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <footer className="wattiz-cart-footer">
          <div>
            <span>Subtotal</span>
            <strong>{formatMoney(total)}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>
          <button type="button" onClick={finishCheckout} disabled={cart.length === 0}>
            Finalizar
          </button>
          <button type="button" onClick={() => setIsCartOpen(false)}>
            Continuar comprando
          </button>
        </footer>
      </aside>
    </section>
  );
}

export function LumeIAPage() {
  return (
    <DashboardShell page="Lume IA">
      <LumeIAContent />
    </DashboardShell>
  );
}

export function LojaPage() {
  return (
    <DashboardShell page="Loja">
      <LojaWattizContent />
    </DashboardShell>
  );
}

const dashboardPlans = [
  {
    id: "gratuito" as PlanId,
    nome: "Economia",
    preco: "Grátis",
    descricao: "A Lume funciona de graça e te atende 24 horas por dia.",
    Icone: Gauge,
    recursos: [
      "Banco de dados de eletrodomésticos",
      "Perfil básico da casa",
      "Estimativas simples de consumo",
      "Dicas para entender onde a energia é mais usada",
      "Base inicial para economia",
    ],
  },
  {
    id: "smart" as PlanId,
    nome: "Controle",
    preco: "R$ 29/mês",
    descricao: "Ferramentas para acompanhar histórico, rotina e comparação de consumo.",
    Icone: Brain,
    recursos: [
      "Histórico de consumo completo",
      "Relatórios de meses anteriores",
      "Comparação com meses recentes",
      "Simulações de gastos pela rotina",
      "Comparação com média da região",
      "Análise por casas com perfil semelhante",
    ],
  },
  {
    id: "business" as PlanId,
    nome: "Empresa",
    preco: "R$ 99/mês",
    descricao: "Inclui as funções anteriores e libera os produtos físicos da plataforma.",
    Icone: Store,
    recursos: [
      "Tudo do plano Controle",
      "Produtos físicos liberados",
      "Coleta de dados mais detalhada",
      "Resultados mais específicos",
      "Relatórios avançados",
      "Mais precisão para potencializar economia",
    ],
  },
];

function PlanosContent() {
  const [currentPlan, setCurrentPlan] = useCurrentPlan();
  const [confirmPlan, setConfirmPlan] = useState<(typeof dashboardPlans)[number] | null>(null);
  const [successPlan, setSuccessPlan] = useState<PlanId | null>(null);

  const choosePlan = (plan: (typeof dashboardPlans)[number]) => {
    if (plan.id === currentPlan) return;
    if (plan.id === "gratuito") {
      setCurrentPlan(plan.id);
      setSuccessPlan(plan.id);
      return;
    }
    setConfirmPlan(plan);
  };

  const confirmSubscription = () => {
    if (!confirmPlan) return;
    setCurrentPlan(confirmPlan.id);
    setSuccessPlan(confirmPlan.id);
    setConfirmPlan(null);
  };

  return (
    <section
      className="wattiz-dashboard-plans wattiz-dashboard-plans-clean"
      aria-label="Planos"
    >
      <div className="wattiz-plans-clean-header">
        <span>Planos</span>
        <h2>Escolha seu plano</h2>
        <p>A Lume funciona de graça. Evolua para acompanhar histórico, simulações e produtos físicos.</p>
      </div>

      {successPlan && (
        <div className="wattiz-plan-success">
          <CheckCircle2 size={18} />
          <span>
            Plano {dashboardPlans.find((plan) => plan.id === successPlan)?.nome || planNames[successPlan]} ativado. O dashboard e a loja foram atualizados
            automaticamente.
          </span>
          <button type="button" onClick={() => setSuccessPlan(null)}>
            OK
          </button>
        </div>
      )}

      <div className="wattiz-plans-grid wattiz-plans-grid-clean">
        {dashboardPlans.map((plan) => {
          const Icon = plan.Icone;
          const isCurrent = currentPlan === plan.id;
          return (
            <article
              key={plan.id}
              className={`wattiz-dashboard-plan-card wattiz-plan-card-clean ${plan.id === "smart" ? "featured" : ""} ${isCurrent ? "selected" : ""}`}
            >
              {plan.id === "smart" && <div className="wattiz-plan-popular">Mais popular</div>}
              <div className="wattiz-plan-card-topline">
                <div
                  className={`wattiz-plan-icon tone-${plan.id === "business" ? "amarelo" : plan.id === "smart" ? "destaque" : "roxo"}`}
                >
                  <Icon size={21} />
                </div>
                {isCurrent && <span>Plano atual</span>}
              </div>
              <div className="wattiz-plan-card-heading">
                <h3>{plan.nome}</h3>
                <p>{plan.descricao}</p>
              </div>
              <div className="wattiz-plan-price compact">
                <strong>{plan.preco}</strong>
              </div>
              <ul>
                {plan.recursos.map((benefit) => (
                  <li key={benefit}>
                    <CheckCircle2 size={16} />
                    {benefit}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={isCurrent ? "is-current" : ""}
                onClick={() => choosePlan(plan)}
                disabled={isCurrent}
              >
                {isCurrent
                  ? "Plano atual"
                  : plan.id === "gratuito"
                    ? "Começar grátis"
                    : plan.id === "smart"
                      ? "Assinar Controle"
                      : "Assinar Empresa"}
              </button>
            </article>
          );
        })}
      </div>

      {confirmPlan && (
        <div
          className="wattiz-plan-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar assinatura"
        >
          <article className="wattiz-plan-modal">
            <button
              type="button"
              className="wattiz-plan-modal-close"
              onClick={() => setConfirmPlan(null)}
              aria-label="Fechar"
            >
              <X size={17} />
            </button>
            <div className="wattiz-plan-modal-icon">
              <Crown size={24} />
            </div>
            <h3>Confirmar assinatura</h3>
            <p>
              Deseja ativar o {confirmPlan.nome}? A assinatura será simulada e os recursos serão
              liberados agora.
            </p>
            <div>
              <button type="button" onClick={() => setConfirmPlan(null)}>
                Cancelar
              </button>
              <button type="button" onClick={confirmSubscription}>
                Confirmar
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}


type WattizProfileData = WattizUser & {
  sobrenome?: string;
  telefone?: string;
  cpf?: string;
  senha?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  endereco?: string;
  tipoResidencia?: string;
  moradores?: string;
  contaLuz?: string;
  consumoMedio?: string;
  objetivoEnergetico?: string;
  perfilEnergetico?: { totalKwh?: number };
};

const PROFILE_PHOTO_KEY = "wattiz_profile_photo";
const PROFILE_PREFS_KEY = "wattiz_profile_preferences";

const defaultProfilePrefs = {
  temaDashboard: true,
  notificacoes: true,
  alertasLume: true,
  consumoTempoReal: true,
  sonsIA: false,
  modoEconomia: true,
};

function readProfileData(): WattizProfileData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(
      localStorage.getItem("wattiz_sessao") || localStorage.getItem("wattiz_usuario") || "{}",
    );
  } catch {
    return {};
  }
}

function saveProfileData(data: WattizProfileData) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wattiz_sessao", JSON.stringify(data));
  if (data.email) {
    try {
      const users = JSON.parse(localStorage.getItem("wattiz_usuarios") || "[]") as WattizProfileData[];
      const normalizedEmail = data.email.trim().toLowerCase();
      const nextUsers = users.map((user) =>
        user.email?.trim().toLowerCase() === normalizedEmail ? { ...user, ...data } : user,
      );
      if (!nextUsers.some((user) => user.email?.trim().toLowerCase() === normalizedEmail)) {
        nextUsers.push(data);
      }
      localStorage.setItem("wattiz_usuarios", JSON.stringify(nextUsers));
    } catch {
      localStorage.setItem("wattiz_usuarios", JSON.stringify([data]));
    }
  }
  window.dispatchEvent(new CustomEvent("wattiz-user-updated", { detail: data }));
}

function readProfilePrefs() {
  if (typeof window === "undefined") return defaultProfilePrefs;
  try {
    return { ...defaultProfilePrefs, ...JSON.parse(localStorage.getItem(PROFILE_PREFS_KEY) || "{}") };
  } catch {
    return defaultProfilePrefs;
  }
}

function profileValue(value?: string | number) {
  return value === undefined || value === null || String(value).trim() === "" ? "Não informado" : String(value);
}

function PerfilContent() {
  const [currentPlan] = useCurrentPlan();
  const [profile, setProfile] = useState<WattizProfileData>(() => readProfileData());
  const [draft, setDraft] = useState<WattizProfileData>(() => readProfileData());
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(PROFILE_PHOTO_KEY) || profileAvatar : profileAvatar,
  );
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const sync = () => {
      const next = readProfileData();
      setProfile(next);
      setDraft(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const fullName = profileValue(profile.nome || "João Silva");
  const email = profileValue(profile.email || "joao.silva@email.com");
  const phone = profileValue(profile.telefone || "(11) 99999-9999");
  const city = profileValue(profile.cidade || "São Paulo");
  const state = profileValue(profile.estado || "SP");
  const address = profileValue(profile.endereco || profile.rua || "Rua das Flores, 123");
  const cep = profileValue(profile.cep || "01234-567");

  const setDraftField = (key: keyof WattizProfileData, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveChanges = () => {
    const next = { ...profile, ...draft };
    setProfile(next);
    setDraft(next);
    saveProfileData(next);
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setEditing(false);
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setPhoto(result);
      if (typeof window !== "undefined") {
        localStorage.setItem(PROFILE_PHOTO_KEY, result);
        window.dispatchEvent(new CustomEvent("wattiz-user-updated"));
      }
    };
    reader.readAsDataURL(file);
  };

  const openDeleteModal = () => {
  setDeleteConfirmText("");
  setDeleteError("");
  setShowDeleteModal(true);
};

const closeDeleteModal = () => {
  if (deleting) return;
  setShowDeleteModal(false);
  setDeleteConfirmText("");
  setDeleteError("");
};

  const deleteAccountRequest = async () => {
  if (hasBackend() && getAccessToken()) {
    await users.deleteAccount();
  }
};

const handleDeleteAccount = async () => {
  if (deleteConfirmText.trim().toLowerCase() !== email.trim().toLowerCase()) {
    setDeleteError("O e-mail digitado não corresponde à sua conta.");
    return;
  }
  setDeleting(true);
  setDeleteError("");
  try {
    await deleteAccountRequest();
    clearTokens();
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/";
    }
  } catch (err) {
    setDeleting(false);
    setDeleteError(err instanceof Error ? err.message : "Não foi possível excluir sua conta agora. Tente novamente em instantes.");
  }
};

  const planDescription: Record<PlanId, string> = {
    gratuito: "Estimativas básicas e dicas simples",
    smart: "Histórico completo, relatórios e simulações",
    business: "Monitoramento com hardware e recursos completos",
  };

  return (
    <section className="wattiz-profile-page wattiz-profile-clean" aria-label="Perfil do usuário">
      <div className="wattiz-profile-header-card">
        <div className="wattiz-profile-photo-block">
          <img src={photo} alt={`Foto de perfil de ${fullName}`} />
          <label className="wattiz-profile-photo-button" title="Alterar foto">
            <Camera size={16} />
            <input type="file" accept="image/*" onChange={handlePhoto} />
          </label>
        </div>

        <div className="wattiz-profile-main-info">
          <div className="wattiz-profile-title-row">
            <div className="wattiz-profile-identity">
              <h2 className="wattiz-profile-name-line">
                <span>{fullName}</span>
              </h2>
              <p className="wattiz-profile-email">{email}</p>
              <div className="wattiz-profile-inline-meta">
                <small className={`wattiz-profile-name-plan plan-${currentPlan}`}>{planNames[currentPlan]}</small>
                <small>desde Março 2024</small>
              </div>
            </div>
            <button type="button" onClick={() => setEditing(true)}>Editar</button>
          </div>
        </div>
      </div>

      {saved && <div className="wattiz-profile-saved"><CheckCircle2 size={17} />Perfil atualizado com sucesso.</div>}

      {editing && (
        <article className="wattiz-profile-card wattiz-profile-edit-card">
          <div className="wattiz-profile-section-title">
            <h3>Editar perfil</h3>
            <p>Altere suas informações e salve para atualizar o perfil.</p>
          </div>
          <div className="wattiz-profile-form-grid">
            <label>Nome completo<input value={draft.nome || ""} onChange={(e) => setDraftField("nome", e.target.value)} /></label>
            <label>E-mail<input value={draft.email || ""} onChange={(e) => setDraftField("email", e.target.value)} /></label>
            <label>Telefone<input value={draft.telefone || ""} onChange={(e) => setDraftField("telefone", e.target.value)} /></label>
            <label>Endereço<input value={draft.endereco || draft.rua || ""} onChange={(e) => setDraftField("endereco", e.target.value)} /></label>
            <label>Cidade<input value={draft.cidade || ""} onChange={(e) => setDraftField("cidade", e.target.value)} /></label>
            <label>Estado<input value={draft.estado || ""} onChange={(e) => setDraftField("estado", e.target.value)} /></label>
            <label>CEP<input value={draft.cep || ""} onChange={(e) => setDraftField("cep", e.target.value)} /></label>
            <label>Nova senha<input type="password" value={draft.senha || ""} onChange={(e) => setDraftField("senha", e.target.value)} /></label>
          </div>
            <div className="wattiz-profile-actions">
              <button type="button" onClick={cancelEdit}>Cancelar</button>
              <button type="button" className="wattiz-profile-delete-button" onClick={openDeleteModal}>
                <Trash2 size={16} /> Excluir conta
              </button>
              <button type="button" onClick={saveChanges}>Salvar alterações</button>
            </div>
        </article>
      )}

      <article className="wattiz-profile-card">
        <div className="wattiz-profile-section-title"><User size={21} /><h3>Informações Pessoais</h3></div>
        <div className="wattiz-profile-field-grid">
          <div><label>Nome completo</label><span>{fullName}</span></div>
          <div><label>E-mail</label><span>{email}</span></div>
          <div><label>Telefone</label><span>{phone}</span></div>
        </div>
      </article>

      <article className="wattiz-profile-card">
        <div className="wattiz-profile-section-title"><Home size={21} /><h3>Endereço</h3></div>
        <div className="wattiz-profile-field-grid">
          <div><label>Endereço</label><span>{address}</span></div>
          <div><label>Cidade</label><span>{city}</span></div>
          <div><label>Estado</label><span>{state}</span></div>
          <div><label>CEP</label><span>{cep}</span></div>
        </div>
      </article>

      <article className="wattiz-profile-card wattiz-profile-current-plan">
        <div className="wattiz-profile-section-title"><Zap size={21} /><h3>Plano Atual</h3></div>
        <div className="wattiz-profile-plan-box">
          <div>
            <strong>{planNames[currentPlan]}</strong>
            <span>{planDescription[currentPlan]}</span>
          </div>
          <button type="button" onClick={() => navigateTo("/planos")}>Upgrade</button>
        </div>
      </article>
    </section>
  );
}

export function PlanosPage() {
  return (
    <DashboardShell page="Planos">
      <PlanosContent />
    </DashboardShell>
  );
}

export function PerfilPage() {
  return (
    <DashboardShell page="Perfil">
      <PerfilContent />
    </DashboardShell>
  );
}

function ConfiguracoesContent() {
  const [settings, updateSettings] = useDashboardSettings();
  const [activePanel, setActivePanel] = useState<"conta" | "notificacoes" | "seguranca" | "aparencia" | "ajuda" | null>(null);
  const [accountDraft, setAccountDraft] = useState(() => {
    const user = readUser();
    return {
      nome: user.nome || "Rafael",
      email: user.email || "julia@email.com",
      senha: "",
      enderecoSeguro: typeof window !== "undefined" ? localStorage.getItem("wattiz_safe_address") || "" : "",
      raio: typeof window !== "undefined" ? localStorage.getItem("wattiz_safe_radius") || "500" : "500",
      telefoneAjuda: typeof window !== "undefined" ? localStorage.getItem("wattiz_support_phone") || "" : "",
    };
  });
  const [savedMessage, setSavedMessage] = useState("");

  const openPanel = (panel: typeof activePanel) => {
    setSavedMessage("");
    setActivePanel(panel);
  };

  const showSaved = (message: string) => {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(""), 2200);
  };

  const saveAccount = async () => {
    if (hasBackend() && getAccessToken()) {
      try {
        await users.update({ name: accountDraft.nome, email: accountDraft.email });
      } catch {
        // ignora erro de API, salva localmente mesmo assim
      }
    }
    if (typeof window !== "undefined") {
      const current = readUser();
      const next = { ...current, nome: accountDraft.nome, email: accountDraft.email };
      localStorage.setItem("wattiz_sessao", JSON.stringify(next));
      localStorage.setItem("wattiz_usuario", JSON.stringify(next));
      localStorage.setItem("wattiz_safe_address", accountDraft.enderecoSeguro);
      localStorage.setItem("wattiz_safe_radius", accountDraft.raio);
      localStorage.setItem("wattiz_support_phone", accountDraft.telefoneAjuda);
      window.dispatchEvent(new CustomEvent("wattiz-user-updated"));
    }
    showSaved("Configurações salvas com sucesso.");
  };

  const settingRows: Array<{
    panel: NonNullable<typeof activePanel>;
    title: string;
    text: string;
    icon: typeof Bell;
  }> = [
    { panel: "conta", title: "Conta", text: "Nome, e-mail e senha", icon: User },
    { panel: "notificacoes", title: "Notificações", text: "Como e o que você recebe", icon: Bell },
    { panel: "seguranca", title: "Segurança", text: "Senha, sessão e autenticação", icon: ShieldCheck },
    { panel: "aparencia", title: "Aparência", text: "Tema claro ou escuro", icon: Palette },
    { panel: "ajuda", title: "Central de Ajuda", text: "Contato e dúvidas frequentes", icon: Info },
  ];

  return (
    <section className="settings-page settings-page-panel" aria-label="Configurações do dashboard">
      <div className="settings-hero settings-hero-compact">
        <div>
          <span>Preferências</span>
          <h2>Configurações</h2>
          <p>Edite sua conta, aparência, notificações e segurança do dashboard.</p>
        </div>
        <button type="button" onClick={logoutToLogin} className="settings-logout">
          <LogOut size={18} />
          Sair
        </button>
      </div>

      {savedMessage && <div className="settings-saved"><CheckCircle2 size={17} />{savedMessage}</div>}

      <div className="settings-layout-grid">
        <article className="settings-card settings-menu-card">
          {settingRows.map(({ panel, title, text, icon: Icon }) => (
            <button
              type="button"
              key={panel}
              className={activePanel === panel ? "settings-menu-row active" : "settings-menu-row"}
              onClick={() => openPanel(panel)}
            >
              <span className="settings-menu-icon"><Icon size={19} /></span>
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
              <ChevronRight size={18} />
            </button>
          ))}
        </article>

        <article className="settings-card settings-edit-card">
          {!activePanel && (
            <div className="settings-empty-state">
              <Settings size={28} />
              <h3>Escolha uma configuração</h3>
              <p>Clique em uma opção ao lado para alterar os dados da conta, tema, notificações ou segurança.</p>
            </div>
          )}

          {activePanel === "conta" && (
            <div className="settings-edit-panel">
              <div className="settings-card-title"><User size={20} /><div><h3>Conta</h3><p>Atualize seu nome, e-mail e senha de acesso.</p></div></div>
              <div className="settings-form-grid">
                <label>Nome<input value={accountDraft.nome} onChange={(e) => setAccountDraft({ ...accountDraft, nome: e.target.value })} /></label>
                <label>E-mail<input type="email" value={accountDraft.email} onChange={(e) => setAccountDraft({ ...accountDraft, email: e.target.value })} /></label>
                <label>Nova senha<input type="password" value={accountDraft.senha} placeholder="Digite uma nova senha" onChange={(e) => setAccountDraft({ ...accountDraft, senha: e.target.value })} /></label>
              </div>
              <div className="settings-panel-actions"><button type="button" onClick={() => setActivePanel(null)}>Cancelar</button><button type="button" onClick={saveAccount}>Salvar conta</button></div>
            </div>
          )}

          {activePanel === "notificacoes" && (
            <div className="settings-edit-panel">
              <div className="settings-card-title"><Bell size={20} /><div><h3>Notificações</h3><p>Escolha quais avisos devem aparecer no dashboard.</p></div></div>
              <div className="settings-options-grid single">
                {[
                  ["notifications", "Notificações gerais", "Alertas importantes e atualizações do sistema."],
                  ["lumeAlerts", "Alertas da Lume", "Sugestões inteligentes da IA sobre consumo."],
                  ["realtime", "Consumo em tempo real", "Atualizar indicadores automaticamente."],
                  ["reports", "Relatórios por e-mail", "Receber resumo semanal na conta."],
                  ["sounds", "Sons da IA", "Feedback sonoro discreto."],
                  ["compact", "Modo compacto", "Listas e cards com menos espaçamento."],
                ].map(([key, title, text]) => (
                  <button
                    type="button"
                    key={key}
                    className={settings[key as keyof DashboardSettings] ? "settings-option active" : "settings-option"}
                    onClick={() => updateSettings({ [key]: !settings[key as keyof DashboardSettings] } as Partial<DashboardSettings>)}
                  >
                    <span className="settings-option-icon"><Bell size={18} /></span>
                    <span><strong>{title}</strong><small>{text}</small></span>
                    <i />
                  </button>
                ))}
              </div>
              <div className="settings-panel-actions"><button type="button" onClick={() => setActivePanel(null)}>Voltar</button><button type="button" onClick={() => showSaved("Preferências de notificação salvas.")}>Salvar</button></div>
            </div>
          )}

          {activePanel === "seguranca" && (
            <div className="settings-edit-panel">
              <div className="settings-card-title"><ShieldCheck size={20} /><div><h3>Segurança</h3><p>Proteja sua conta e gerencie sua sessão.</p></div></div>
              <div className="settings-security-actions vertical">
                <button type="button" onClick={() => openPanel("conta")}><KeyRound size={18} /> Alterar senha</button>
                <button type="button"><Smartphone size={18} /> Dispositivos conectados: 1 ativo</button>
                <button type="button" onClick={() => navigateTo("/login")}><ChevronsUpDown size={18} /> Trocar de conta</button>
                <button type="button" onClick={logoutToLogin} className="danger"><LogOut size={18} /> Sair da conta</button>
              </div>
            </div>
          )}

          {activePanel === "aparencia" && (
            <div className="settings-edit-panel">
              <div className="settings-card-title"><Palette size={20} /><div><h3>Aparência</h3><p>Escolha o tema do dashboard com as cores da Wattiz.</p></div></div>
              <div className="settings-theme-grid">
                <button type="button" className={settings.theme === "light" ? "active" : ""} onClick={() => updateSettings({ theme: "light" })}><Sun size={19} /><strong>Claro</strong><span>Branco premium, roxo suave e amarelo discreto.</span></button>
                <button type="button" className={settings.theme === "dark" ? "active" : ""} onClick={() => updateSettings({ theme: "dark" })}><Moon size={19} /><strong>Dark</strong><span>Preto elegante com roxo e amarelo Wattiz.</span></button>
              </div>
              <div className="settings-panel-actions"><button type="button" onClick={() => setActivePanel(null)}>Voltar</button><button type="button" onClick={() => showSaved("Aparência salva.")}>Salvar aparência</button></div>
            </div>
          )}

          {activePanel === "ajuda" && (
            <div className="settings-edit-panel settings-help-panel">
              <div className="settings-card-title"><Info size={20} /><div><h3>Central de Ajuda</h3><p>Suporte rápido e respostas para dúvidas comuns.</p></div></div>
              <div className="settings-contact-grid">
                <a href="mailto:suporte@wattiz.com.br" className="settings-contact-card"><MailCheck size={21} /><span><strong>E-mail</strong><small>suporte@wattiz.com.br</small></span></a>
                <a href="https://wa.me/5511932387604" className="settings-contact-card"><Smartphone size={21} /><span><strong>WhatsApp</strong><small>Seg–Sex, das 8h às 21h</small></span></a>
              </div>
              <div className="settings-faq-list">
                {[
                  ["Como altero meu plano?", "Abra a aba Planos, escolha uma opção e confirme a assinatura."],
                  ["Como adicionar um aparelho?", "Entre em Meus Eletrodomésticos e clique em adicionar novo aparelho."],
                  ["Como funciona a Lume?", "A Lume analisa seus dados de consumo e sugere formas de economizar."],
                  ["Como exportar relatório?", "Na aba Relatórios, selecione o período e use a opção de exportação."],
                  ["Como alterar minha foto?", "Abra Perfil, clique no ícone da câmera e escolha uma imagem."],
                  ["Como liberar a Loja?", "Produtos comuns ficam liberados. O hardware Wattiz exige o plano Empresa."],
                ].map(([question, answer]) => (
                  <details key={question} open>
                    <summary>{question}</summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
              <div className="settings-panel-actions"><button type="button" onClick={() => setActivePanel(null)}>Voltar</button></div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export function ConfiguracoesPage() {
  return (
    <DashboardShell page="Configurações">
      <ConfiguracoesContent />
    </DashboardShell>
  );
}
