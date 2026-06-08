import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Home, Building2, Sparkles, Plus, Trash2 } from "lucide-react";
import authCouple from "@/assets/images/auth/auth-senior-couple.jpg";
import { auth as apiAuth, appliances as apiAppliances, hasBackend, saveTokens } from "@/api";

type AuthKind = "login" | "cadastro";
type UsoTipo = "Casa" | "Negócio" | "Ambos";

type ApplianceDetail = {
  id: string;
  category: string;
  appliance: string;
  brand: string;
  model: string;
  power: string;
  quantity: string;
  hoursPerDay: string;
  daysPerWeek: string;
  peakTime: string;
  forgetOn: string;
  room: string;
  status: "ligado" | "desligado" | "alerta";
  impact: "baixo" | "médio" | "alto";
};

type CadastroData = {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  regiao: string;
  tipoUso: UsoTipo;
  tipoResidencia: string;
  moradores: string;
  contaLuz: string;
  bandeiraTarifaria: string;
  horarioMaiorConsumo: string;
  complemento: string;
  appliances: ApplianceDetail[];
};

const emptyCadastro: CadastroData = {
  nome: "",
  email: "",
  telefone: "",
  senha: "",
  confirmarSenha: "",
  cep: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  regiao: "",
  tipoUso: "Casa",
  tipoResidencia: "",
  moradores: "",
  contaLuz: "",
  bandeiraTarifaria: "Verde",
  horarioMaiorConsumo: "Noite",
  complemento: "",
  appliances: [],
};

const applianceCategories = {
  Cozinha: ["Geladeira", "Freezer", "Micro-ondas", "Air fryer", "Forno elétrico", "Cafeteira", "Liquidificador"],
  Climatização: ["Ar-condicionado", "Ventilador", "Climatizador", "Aquecedor"],
  Banheiro: ["Chuveiro elétrico", "Torneira elétrica", "Secador"],
  Lavanderia: ["Máquina de lavar", "Lava e seca", "Ferro", "Secadora"],
  Tecnologia: ["TV", "Computador", "Notebook", "Videogame", "Monitor"],
  Negócio: ["Chapinha", "Secador profissional", "Freezer comercial", "Equipamentos de salão", "Impressora", "Máquina profissional"],
};

const brandSuggestions = ["Consul", "Brastemp", "Electrolux", "Samsung", "LG", "Philco", "Mondial", "Arno", "Taiff", "Intelbras", "Epson", "HP"];
const modelSuggestions = ["Inverter", "Frost Free", "Digital", "Pro 220V", "Eco", "Smart", "Turbo", "Compacto", "Industrial", "Premium"];
const peakTimes = ["Manhã", "Tarde", "Noite", "Madrugada", "Fim de semana"];
const residenceTypes = ["Casa", "Apartamento", "Kitnet", "Sobrado", "Comércio pequeno", "Salão/estúdio", "Escritório", "Outro"];
const regions = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];
const requiredMessage = "Campo obrigatório.";

function readCadastroDraft(): CadastroData {
  if (typeof window === "undefined") return emptyCadastro;
  try {
    return { ...emptyCadastro, ...JSON.parse(localStorage.getItem("wattiz_cadastro_draft") || "{}") };
  } catch {
    return emptyCadastro;
  }
}

function saveSession(user: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wattiz_sessao", JSON.stringify(user));
}

function saveUser(user: Record<string, unknown> & { email: string }) {
  if (typeof window === "undefined") return;
  const users = JSON.parse(localStorage.getItem("wattiz_usuarios") || "[]") as Array<Record<string, unknown> & { email?: string }>;
  localStorage.setItem("wattiz_usuarios", JSON.stringify([...users.filter((u) => u.email !== user.email), user]));
}

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

function moneyToNumber(value: string) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

function Field({ label, help, error, children }: { label: string; help: string; error?: string; children: ReactNode }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      {children}
      <small className={error ? "auth-error" : ""}>{error || help}</small>
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`auth-input ${props.className || ""}`} />;
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`auth-input ${props.className || ""}`} />;
}

function AuthShell({ children, kind }: { children: ReactNode; kind: AuthKind }) {
  return (
    <main className="auth-page" aria-label={kind === "login" ? "Página de login" : "Página de cadastro"}>
      <a href="/" className="auth-back" aria-label="Voltar para a página inicial">
        <ArrowLeft size={15} /> Início
      </a>
      <section className={`auth-card ${kind === "cadastro" ? "auth-card-cadastro" : "auth-card-login"}`}>
        <div className="auth-image-side">
          <img src={authCouple} alt="Casal sorrindo usando celular para acompanhar energia" />
          <div className="auth-image-shape auth-image-shape-top" />
          <div className="auth-image-shape auth-image-shape-bottom" />
          <div className="auth-image-caption">
            <strong>Energia inteligente para todos.</strong>
            <span>Controle sua conta com clareza e praticidade.</span>
          </div>
        </div>
        <div className="auth-form-side">{children}</div>
      </section>
    </main>
  );
}

function AuthLoadingScreen() {
  return (
    <div className="auth-loading-screen" role="status" aria-live="polite" aria-label="Carregando dashboard">
      <div className="auth-loading-spinner" />
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("wattiz_email_lembrado") || "" : ""));
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = requiredMessage;
    if (!senha.trim()) nextErrors.senha = requiredMessage;
    if (senha && senha.length < 6) nextErrors.senha = "A senha precisa ter pelo menos 6 caracteres.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const normalizedEmail = email.trim().toLowerCase();

    // ── Backend real ──────────────────────────────────────────────────────
    if (hasBackend()) {
      setLoading(true);
      try {
        const tokens = await apiAuth.login(normalizedEmail, senha);
        saveTokens(tokens.access_token, tokens.refresh_token);
        const me = await apiAuth.me();
        saveSession({ nome: me.name, email: me.email, id: me.id });
        if (lembrar) localStorage.setItem("wattiz_email_lembrado", normalizedEmail);
        setMessage("Login realizado. Redirecionando para o dashboard...");
        window.setTimeout(() => { window.location.assign("/dashboard"); }, 1200);
      } catch (err: unknown) {
        setLoading(false);
        setMessage(err instanceof Error ? err.message : "Erro ao fazer login.");
      }
      return;
    }

    // ── Fallback localStorage (sem backend configurado) ───────────────────
    const storedUsers = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("wattiz_usuarios") || "[]") as Array<{ email?: string; senha?: string; nome?: string; cidade?: string; estado?: string; tipoUso?: string; contaLuz?: string; appliances?: unknown[] }>
      : [];
    const found = storedUsers.find((u) => u.email === normalizedEmail && (!u.senha || u.senha === senha));
    const sessionUser = found || {
      nome: normalizedEmail.split("@")[0] || "Usuário Wattiz",
      email: normalizedEmail,
      cidade: "Oliveira",
      estado: "MG",
      tipoUso: "Casa",
      contaLuz: "187",
      appliances: [],
      loginCriadoAutomaticamente: true,
    };
    saveSession(sessionUser);
    if (!found) saveUser({ ...sessionUser, senha, email: normalizedEmail });
    if (lembrar && typeof window !== "undefined") localStorage.setItem("wattiz_email_lembrado", normalizedEmail);
    setLoading(true);
    setMessage("Login realizado. Redirecionando para o dashboard...");
    window.setTimeout(() => { window.location.assign("/dashboard"); }, 1800);
  };

  return (
    <>
      {loading && <AuthLoadingScreen />}
      <AuthShell kind="login">
      <div className="auth-top-link">Novo por aqui? <a href="/cadastro">Criar conta</a></div>
      <h1>Entrar na conta</h1>
      <p className="auth-subtitle">Acesse seu painel Wattiz com seus dados.</p>
      <form onSubmit={submit} className="auth-form" noValidate>
        <Field label="E-mail" help="Use o e-mail cadastrado na Wattiz." error={errors.email}>
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Digite seu e-mail" autoComplete="email" />
        </Field>
        <Field label="Senha" help="Digite sua senha de acesso." error={errors.senha}>
          <div className="auth-password-wrap">
            <input value={senha} onChange={(e) => setSenha(e.target.value)} type={mostrarSenha ? "text" : "password"} placeholder="Digite sua senha" autoComplete="current-password" />
            <button type="button" onClick={() => setMostrarSenha((v) => !v)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>{mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
        </Field>
        <div className="auth-row-between">
          <label className="auth-check"><input checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} type="checkbox" /> Lembrar-me</label>
          <button type="button" className="auth-link-button" onClick={() => setMessage("Recuperação de senha pronta para conectar ao backend.")}>Esqueci a senha</button>
        </div>
        {message && <p className={message.includes("realizado") ? "auth-success" : "auth-error-box"}>{message}</p>}
        <button className="auth-primary" type="submit">Entrar</button>
        <div className="auth-separator"><span>ou continue com</span></div>
        <button type="button" className="auth-google" onClick={() => { const user = { nome: "Ariane", email: "ariane@gmail.com", cidade: "Oliveira", estado: "MG", tipoUso: "Casa", contaLuz: "187", appliances: [] }; saveSession(user); setLoading(true); setMessage("Login com Google conectado. Redirecionando..."); window.setTimeout(() => { window.location.assign("/dashboard"); }, 1800); }}><span className="google-g">G</span> Entrar com Google</button>
      </form>
      </AuthShell>
    </>
  );
}

function initialAppliance(category = "Cozinha", appliance = "Geladeira"): ApplianceDetail {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    category,
    appliance,
    brand: "",
    model: "",
    power: "",
    quantity: "1",
    hoursPerDay: "2",
    daysPerWeek: "7",
    peakTime: "Noite",
    forgetOn: "Não",
    room: category === "Banheiro" ? "Banheiro" : category === "Lavanderia" ? "Lavanderia" : category === "Tecnologia" ? "Sala" : category === "Climatização" ? "Quarto" : "Cozinha",
    status: "ligado",
    impact: "médio",
  };
}

function applianceConsumption(item: ApplianceDetail) {
  const power = Number(String(item.power).replace(/\D/g, "")) || 0;
  const qty = Number(item.quantity) || 0;
  const hours = Number(item.hoursPerDay) || 0;
  const days = Number(item.daysPerWeek) || 0;
  return (power * qty * hours * days * 4.33) / 1000;
}

function saveRegisteredAppliances(appliances: ApplianceDetail[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wattiz_appliances", JSON.stringify(appliances));
  window.dispatchEvent(new CustomEvent("wattiz-appliances-updated", { detail: appliances }));
}

export function CadastroPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CadastroData>(() => readCadastroDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("wattiz_cadastro_draft", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const cep = onlyNumbers(data.cep);
    if (cep.length !== 8) return;
    const timer = window.setTimeout(async () => {
      try {
        const address = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then((r) => r.json());
        if (!address.erro) {
          setData((current) => ({
            ...current,
            rua: current.rua || address.logradouro || "",
            bairro: current.bairro || address.bairro || "",
            cidade: current.cidade || address.localidade || "",
            estado: current.estado || address.uf || "",
            regiao: current.regiao || inferRegion(address.uf),
          }));
        }
      } catch {
        // Mantém preenchimento manual caso o serviço externo não responda.
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [data.cep]);

  const totalKwh = useMemo(() => data.appliances.reduce((sum, item) => sum + applianceConsumption(item), 0), [data.appliances]);
  const critical = useMemo(() => [...data.appliances].sort((a, b) => applianceConsumption(b) - applianceConsumption(a)).slice(0, 3), [data.appliances]);

  const setField = <K extends keyof CadastroData>(key: K, value: CadastroData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [String(key)]: "" }));
  };

  const updateAppliance = (id: string, patch: Partial<ApplianceDetail>) => {
    setData((current) => ({ ...current, appliances: current.appliances.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
    setErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((key) => delete next[`${key}-${id}`]);
      return next;
    });
  };

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};
    if (step === 0) {
      if (!data.nome.trim()) nextErrors.nome = requiredMessage;
      if (!data.email.trim()) nextErrors.email = requiredMessage;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) nextErrors.email = "Digite um e-mail válido.";
      if (!data.telefone.trim()) nextErrors.telefone = requiredMessage;
      if (!data.senha.trim()) nextErrors.senha = requiredMessage;
      if (data.senha && data.senha.length < 8) nextErrors.senha = "Use no mínimo 8 caracteres.";
      if (data.confirmarSenha !== data.senha) nextErrors.confirmarSenha = "As senhas não conferem.";
    }
    if (step === 1) {
      ["cep", "rua", "numero", "bairro", "cidade", "estado", "regiao"].forEach((key) => {
        if (!String(data[key as keyof CadastroData]).trim()) nextErrors[key] = requiredMessage;
      });
      if (data.cep && onlyNumbers(data.cep).length !== 8) nextErrors.cep = "Informe 8 números.";
    }
    if (step === 2) {
      if (!data.tipoResidencia) nextErrors.tipoResidencia = requiredMessage;
      if (!data.moradores) nextErrors.moradores = requiredMessage;
      if (!data.contaLuz) nextErrors.contaLuz = requiredMessage;
    }
    if (step === 3) {
      if (data.appliances.length === 0) nextErrors.appliances = "Adicione pelo menos um aparelho.";
      data.appliances.forEach((item) => {
        if (!item.brand.trim()) nextErrors[`brand-${item.id}`] = requiredMessage;
        if (!item.model.trim()) nextErrors[`model-${item.id}`] = requiredMessage;
        if (!String(item.power).trim()) nextErrors[`power-${item.id}`] = requiredMessage;
      });
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, 4));
  };

  const back = () => setStep((current) => Math.max(current - 1, 0));

  const finish = async () => {
    if (!validateStep()) return;

    // ── Backend real ──────────────────────────────────────────────────────
    if (hasBackend()) {
      setLoading(true);
      try {
        // 1. Cadastra o usuário
        await apiAuth.register(data.nome, data.email.trim().toLowerCase(), data.senha);

        // 2. Faz login para obter tokens
        const tokens = await apiAuth.login(data.email.trim().toLowerCase(), data.senha);
        saveTokens(tokens.access_token, tokens.refresh_token);

        // 3. Cadastra os aparelhos no backend
        const categoryMap: Record<string, string> = {
          Cozinha: "Cozinha",
          Climatização: "Climatização",
          Banheiro: "Outros",
          Lavanderia: "Lavanderia",
          Tecnologia: "Entretenimento",
          Negócio: "Outros",
        };
        for (const item of data.appliances) {
          const powerW = Number(String(item.power).replace(/\D/g, "")) || 100;
          const hoursDay = Number(item.hoursPerDay) || 1;
          const daysWeek = Number(item.daysPerWeek) || 5;
          await apiAppliances.create({
            name: `${item.appliance} ${item.brand} ${item.model}`.trim(),
            power_watts: powerW,
            hours_per_day: hoursDay,
            days_per_month: Math.round(daysWeek * 4.33),
            category: categoryMap[item.category] ?? "Outros",
          });
        }

        // 4. Salva sessão local e redireciona
        saveSession({ nome: data.nome, email: data.email.trim().toLowerCase() });
        saveRegisteredAppliances(data.appliances);
        localStorage.removeItem("wattiz_cadastro_draft");
        setMessage("Cadastro finalizado! Redirecionando...");
        window.setTimeout(() => { window.location.assign("/dashboard"); }, 1400);
      } catch (err: unknown) {
        setLoading(false);
        setMessage(err instanceof Error ? err.message : "Erro ao finalizar cadastro.");
      }
      return;
    }

    // ── Fallback localStorage ─────────────────────────────────────────────
    const user = { ...data, email: data.email.trim().toLowerCase(), perfilEnergetico: { totalKwh, critical } };
    saveUser(user);
    saveSession(user);
    saveRegisteredAppliances(data.appliances);
    if (typeof window !== "undefined") localStorage.removeItem("wattiz_cadastro_draft");
    setLoading(true);
    setMessage("Cadastro finalizado. Seu perfil energético foi salvo. Redirecionando...");
    window.setTimeout(() => { window.location.assign("/dashboard"); }, 1800);
  };

  const activeAppliance = data.appliances[0];

  return (
    <>
      {loading && <AuthLoadingScreen />}
      <AuthShell kind="cadastro">
      <div className="auth-top-link">Já tem uma conta? <a href="/login">Entrar</a></div>
      <h1>Criar conta</h1>
      <p className="auth-subtitle">Cadastro em etapas, com perguntas claras e dados salvos automaticamente.</p>
      <div className="auth-step-dots" aria-label={`Etapa ${step + 1} de 5`}>
        {[0, 1, 2, 3, 4].map((item) => <span key={item} className={item <= step ? "active" : ""}>{item + 1}</span>)}
      </div>
      <form className="auth-form auth-form-compact" noValidate>
        {step === 0 && (
          <div className="auth-grid-2">
            <Field label="Nome completo" help="Como aparece em documentos." error={errors.nome}><TextInput value={data.nome} onChange={(e) => setField("nome", e.target.value)} placeholder="Digite seu nome completo" /></Field>
            <Field label="E-mail" help="Usaremos para login e comunicação." error={errors.email}><TextInput value={data.email} onChange={(e) => setField("email", e.target.value)} type="email" placeholder="Digite seu melhor e-mail" /></Field>
            <Field label="Telefone" help="Preferencialmente WhatsApp." error={errors.telefone}><TextInput value={data.telefone} onChange={(e) => setField("telefone", e.target.value)} placeholder="(00) 00000-0000" /></Field>
            <Field label="Senha" help="Mínimo de 8 caracteres." error={errors.senha}><TextInput value={data.senha} onChange={(e) => setField("senha", e.target.value)} type="password" placeholder="Digite sua senha" /></Field>
            <Field label="Confirmar senha" help="Repita a mesma senha." error={errors.confirmarSenha}><TextInput value={data.confirmarSenha} onChange={(e) => setField("confirmarSenha", e.target.value)} type="password" placeholder="Confirme sua senha" /></Field>
          </div>
        )}

        {step === 1 && (
          <div className="auth-grid-2">
            <Field label="CEP" help="Autocompleta endereço." error={errors.cep}><TextInput value={data.cep} onChange={(e) => setField("cep", onlyNumbers(e.target.value).slice(0, 8))} placeholder="00000000" inputMode="numeric" /></Field>
            <Field label="Rua" help="Local de consumo." error={errors.rua}><TextInput value={data.rua} onChange={(e) => setField("rua", e.target.value)} placeholder="Nome da rua" /></Field>
            <Field label="Número" help="Casa, apê ou negócio." error={errors.numero}><TextInput value={data.numero} onChange={(e) => setField("numero", e.target.value)} placeholder="Ex.: 120" /></Field>
            <Field label="Bairro" help="Bairro do endereço." error={errors.bairro}><TextInput value={data.bairro} onChange={(e) => setField("bairro", e.target.value)} placeholder="Seu bairro" /></Field>
            <Field label="Cidade" help="Cidade do imóvel." error={errors.cidade}><TextInput value={data.cidade} onChange={(e) => setField("cidade", e.target.value)} placeholder="Ex.: Oliveira" /></Field>
            <Field label="Estado" help="Sigla do estado." error={errors.estado}><TextInput value={data.estado} onChange={(e) => setField("estado", e.target.value.toUpperCase().slice(0, 2))} placeholder="MG" /></Field>
            <Field label="Região" help="Ajuda a comparar clima." error={errors.regiao}><SelectInput value={data.regiao} onChange={(e) => setField("regiao", e.target.value)}><option value="">Selecione</option>{regions.map((r) => <option key={r}>{r}</option>)}</SelectInput></Field>
            <Field label="Complemento" help="Opcional: bloco, apê ou referência."><TextInput value={data.complemento} onChange={(e) => setField("complemento", e.target.value)} placeholder="Ex.: apê 302" /></Field>
          </div>
        )}

        {step === 2 && (
          <div className="auth-stack">
            <Field label="Tipo de uso" help="Onde o Wattiz será usado.">
              <div className="auth-choice-grid">
                {(["Casa", "Negócio", "Ambos"] as UsoTipo[]).map((tipo) => (
                  <button type="button" key={tipo} className={data.tipoUso === tipo ? "active" : ""} onClick={() => setField("tipoUso", tipo)}>
                    {tipo === "Casa" ? <Home size={17} /> : tipo === "Negócio" ? <Building2 size={17} /> : <Sparkles size={17} />} {tipo}
                  </button>
                ))}
              </div>
            </Field>
            <div className="auth-grid-2">
              <Field label="Tipo de residência/ambiente" help="Local principal de consumo." error={errors.tipoResidencia}><SelectInput value={data.tipoResidencia} onChange={(e) => setField("tipoResidencia", e.target.value)}><option value="">Selecione</option>{residenceTypes.map((type) => <option key={type}>{type}</option>)}</SelectInput></Field>
              <Field label="Moradores" help="Pessoas que usam energia." error={errors.moradores}><TextInput value={data.moradores} onChange={(e) => setField("moradores", e.target.value)} type="number" min="0" placeholder="Ex.: 4" /></Field>
              <Field label="Conta média de luz" help="Valor mensal aproximado." error={errors.contaLuz}><TextInput value={data.contaLuz} onChange={(e) => setField("contaLuz", e.target.value)} placeholder="Ex.: 187" inputMode="decimal" /></Field>
              <Field label="Bandeira tarifária" help="Cor atual da tarifa."><SelectInput value={data.bandeiraTarifaria} onChange={(e) => setField("bandeiraTarifaria", e.target.value)}><option>Verde</option><option>Amarela</option><option>Vermelha 1</option><option>Vermelha 2</option></SelectInput></Field>
              <Field label="Maior consumo" help="Período em que usa mais energia."><SelectInput value={data.horarioMaiorConsumo} onChange={(e) => setField("horarioMaiorConsumo", e.target.value)}>{peakTimes.map((time) => <option key={time}>{time}</option>)}</SelectInput></Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="auth-appliances">
            <div className="auth-appliance-toolbar">
              <div><strong>Eletrodomésticos</strong><small>Use marca/modelo com sugestões.</small></div>
              <button type="button" onClick={() => setData((c) => ({ ...c, appliances: [initialAppliance(), ...c.appliances] }))}><Plus size={15} /> Adicionar</button>
            </div>
            {errors.appliances && <p className="auth-error-box">{errors.appliances}</p>}
            {!activeAppliance && <p className="auth-empty">Adicione o primeiro aparelho para continuar.</p>}
            {data.appliances.length > 0 && (
              <div className="auth-appliance-list">
                {data.appliances.map((item, index) => (
                  <div className="auth-appliance-list-item" key={item.id}>
                    <span>{index + 1}</span>
                    <strong>{item.appliance || "Aparelho"}</strong>
                    <small>{item.brand || "Marca não informada"} · {applianceConsumption(item).toFixed(1)} kWh/mês</small>
                    <button type="button" onClick={() => setData((current) => ({ ...current, appliances: [item, ...current.appliances.filter((a) => a.id !== item.id)] }))}>Editar</button>
                    <button type="button" className="danger" onClick={() => setData((current) => ({ ...current, appliances: current.appliances.filter((a) => a.id !== item.id) }))}>Remover</button>
                  </div>
                ))}
              </div>
            )}
            {activeAppliance && (
              <div className="auth-appliance-card">
                <div className="auth-appliance-head"><strong>{activeAppliance.appliance}</strong><span>{data.appliances.length} aparelho(s)</span><button type="button" aria-label="Remover aparelho" onClick={() => setData((c) => ({ ...c, appliances: c.appliances.filter((a) => a.id !== activeAppliance.id) }))}><Trash2 size={14} /></button></div>
                <div className="auth-grid-3">
                  <Field label="Categoria" help="Grupo do aparelho."><SelectInput value={activeAppliance.category} onChange={(e) => updateAppliance(activeAppliance.id, { category: e.target.value, appliance: applianceCategories[e.target.value as keyof typeof applianceCategories][0] })}>{Object.keys(applianceCategories).map((cat) => <option key={cat}>{cat}</option>)}</SelectInput></Field>
                  <Field label="Aparelho" help="Equipamento usado."><SelectInput value={activeAppliance.appliance} onChange={(e) => updateAppliance(activeAppliance.id, { appliance: e.target.value })}>{applianceCategories[activeAppliance.category as keyof typeof applianceCategories].map((name) => <option key={name}>{name}</option>)}</SelectInput></Field>
                  <Field label="Marca" help="Digite ou escolha." error={errors[`brand-${activeAppliance.id}`]}><TextInput list="brand-options" value={activeAppliance.brand} onChange={(e) => updateAppliance(activeAppliance.id, { brand: e.target.value })} placeholder="Ex.: Consul" /></Field>
                  <Field label="Modelo" help="Sugestões simuladas." error={errors[`model-${activeAppliance.id}`]}><TextInput list="model-options" value={activeAppliance.model} onChange={(e) => updateAppliance(activeAppliance.id, { model: e.target.value })} placeholder="Ex.: Inverter" /></Field>
                  <Field label="Potência" help="Watts estimados." error={errors[`power-${activeAppliance.id}`]}><TextInput value={activeAppliance.power} onChange={(e) => updateAppliance(activeAppliance.id, { power: e.target.value })} placeholder="1500 W" inputMode="numeric" /></Field>
                  <Field label="Quantidade" help="Unidades iguais."><TextInput value={activeAppliance.quantity} onChange={(e) => updateAppliance(activeAppliance.id, { quantity: e.target.value })} type="number" min="1" /></Field>
                  <Field label="Horas/dia" help="Tempo ligado."><TextInput value={activeAppliance.hoursPerDay} onChange={(e) => updateAppliance(activeAppliance.id, { hoursPerDay: e.target.value })} type="number" min="0" step="0.5" /></Field>
                  <Field label="Dias/semana" help="Uso semanal."><TextInput value={activeAppliance.daysPerWeek} onChange={(e) => updateAppliance(activeAppliance.id, { daysPerWeek: e.target.value })} type="number" min="0" max="7" /></Field>
                  <Field label="Maior uso" help="Horário comum."><SelectInput value={activeAppliance.peakTime} onChange={(e) => updateAppliance(activeAppliance.id, { peakTime: e.target.value })}>{peakTimes.map((time) => <option key={time}>{time}</option>)}</SelectInput></Field>
                  <Field label="Esquece ligado?" help="Ajuda a detectar desperdício."><SelectInput value={activeAppliance.forgetOn} onChange={(e) => updateAppliance(activeAppliance.id, { forgetOn: e.target.value })}><option>Não</option><option>Às vezes</option><option>Sim</option></SelectInput></Field>
                  <Field label="Cômodo" help="Onde o aparelho fica."><TextInput value={activeAppliance.room} onChange={(e) => updateAppliance(activeAppliance.id, { room: e.target.value })} placeholder="Ex.: Cozinha" /></Field>
                  <Field label="Status" help="Estado atual."><SelectInput value={activeAppliance.status} onChange={(e) => updateAppliance(activeAppliance.id, { status: e.target.value as ApplianceDetail["status"] })}><option value="ligado">Ligado</option><option value="desligado">Desligado</option><option value="alerta">Alerta</option></SelectInput></Field>
                  <Field label="Impacto" help="Peso no consumo."><SelectInput value={activeAppliance.impact} onChange={(e) => updateAppliance(activeAppliance.id, { impact: e.target.value as ApplianceDetail["impact"] })}><option value="baixo">Baixo</option><option value="médio">Médio</option><option value="alto">Alto</option></SelectInput></Field>
                </div>
              </div>
            )}
            <datalist id="brand-options">{brandSuggestions.map((brand) => <option key={brand} value={brand} />)}</datalist>
            <datalist id="model-options">{modelSuggestions.map((model) => <option key={model} value={model} />)}</datalist>
          </div>
        )}

        {step === 4 && (
          <div className="auth-summary">
            <h2>Resumo do perfil energético</h2>
            <p>Perfil <strong>{data.tipoUso}</strong> em <strong>{data.cidade || "sua cidade"}/{data.estado || "UF"}</strong>.</p>
            <div className="auth-summary-grid">
              <div><span>Consumo estimado</span><strong>{totalKwh.toFixed(1)} kWh/mês</strong></div>
              <div><span>Conta informada</span><strong>R$ {moneyToNumber(data.contaLuz)}</strong></div>
              <div><span>Economia possível</span><strong>até R$ {Math.round(moneyToNumber(data.contaLuz) * 0.18)}/mês</strong></div>
            </div>
            <div className="auth-critical">
              <strong>Aparelhos mais críticos</strong>
              {critical.length ? critical.map((item) => <p key={item.id}><Check size={14} /> {item.appliance} — {applianceConsumption(item).toFixed(1)} kWh/mês</p>) : <p>Adicione aparelhos para gerar análise.</p>}
            </div>
            <ul className="auth-tips"><li>Priorize aparelhos de maior potência.</li><li>Evite uso prolongado em horário de pico.</li><li>Ative alertas para consumo fora do padrão.</li></ul>
            {message && <p className="auth-success">{message}</p>}
          </div>
        )}

        <div className="auth-actions">
          <button type="button" className="auth-secondary" onClick={back} disabled={step === 0}>Voltar</button>
          {step < 4 ? <button type="button" className="auth-primary" onClick={next}>Continuar <ArrowRight size={15} /></button> : <button type="button" className="auth-primary" onClick={finish}>Finalizar cadastro</button>}
        </div>
        <div className="auth-separator"><span>ou</span></div>
        <button type="button" className="auth-google" onClick={() => { const user = { nome: data.nome || "Ariane", email: data.email || "ariane@gmail.com", cidade: data.cidade || "Oliveira", estado: data.estado || "MG", tipoUso: data.tipoUso, contaLuz: data.contaLuz || "187", appliances: data.appliances }; saveUser(user); saveSession(user); saveRegisteredAppliances(data.appliances); setLoading(true); setMessage("Cadastro com Google conectado. Redirecionando..."); window.setTimeout(() => { window.location.assign("/dashboard"); }, 1800); }}><span className="google-g">G</span> Continuar com Google</button>
      </form>
      </AuthShell>
    </>
  );
}

function inferRegion(uf: string) {
  const state = String(uf || "").toUpperCase();
  if (["SP", "RJ", "MG", "ES"].includes(state)) return "Sudeste";
  if (["PR", "SC", "RS"].includes(state)) return "Sul";
  if (["GO", "MT", "MS", "DF"].includes(state)) return "Centro-Oeste";
  if (["BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA"].includes(state)) return "Nordeste";
  if (["AM", "PA", "AC", "RO", "RR", "AP", "TO"].includes(state)) return "Norte";
  return "";
}
