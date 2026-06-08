import { useEffect, useRef, useState, type FormEvent } from "react";
import { Building2, Check, Eye, EyeOff, Home, Laptop, Menu, Sparkles, X, Zap } from "lucide-react";
import wattizLogo from "@/assets/logos/wattiz-logo.svg";
import wattizLogoDark from "@/assets/logos/wattiz-logo-dark.svg";

const links = [
  { href: "#lume", label: "Lume IA" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "FAQ" },
];

type AuthMode = "login" | "cadastro";
type UsoWattiz = "Casa" | "Negócio" | "Ambos";
type StoredUser = {
  nome?: string;
  email: string;
  senha?: string;
  provider?: "email" | "google";
  perfil?: {
    uso?: UsoWattiz;
    cidade?: string;
    estado?: string;
    moradores?: string;
    conta?: string;
    aparelhos?: string[];
    maisUsado?: string;
    maiorConsumo?: string;
    esqueceLigado?: string;
    horario?: string;
  };
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
        };
        oauth2?: {
          initTokenClient: (options: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

const getUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem("wattiz_usuarios") || "[]") as StoredUser[];
  } catch {
    return [];
  }
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem("wattiz_usuarios", JSON.stringify(users));
};

const decodeJwtPayload = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(normalized))));
  } catch {
    return null;
  }
};

const cadastroEtapas = ["Conta", "Perfil", "Aparelhos", "Hábitos", "IA Wattiz"];
const aparelhosCasa = [
  "Geladeira",
  "Chuveiro elétrico",
  "Ar-condicionado",
  "Ferro de passar",
  "Máquina de lavar",
  "Televisão",
  "Micro-ondas",
  "Ventilador",
  "Computador",
  "Torneira aquecida",
  "Aquecedor elétrico",
];
const aparelhosNegocio = ["Secador", "Chapinha", "Equipamentos comerciais", "Freezer", "Máquinas profissionais"];
const horariosConsumo = ["Manhã", "Tarde", "Noite", "Madrugada"];


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [cadastroEtapa, setCadastroEtapa] = useState(0);
  const [usoWattiz, setUsoWattiz] = useState<UsoWattiz>("Casa");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [moradores, setMoradores] = useState("");
  const [contaLuz, setContaLuz] = useState("");
  const [aparelhosSelecionados, setAparelhosSelecionados] = useState<string[]>([]);
  const [maisUsado, setMaisUsado] = useState("");
  const [maiorConsumo, setMaiorConsumo] = useState("");
  const [esqueceLigado, setEsqueceLigado] = useState("Às vezes");
  const [horarioConsumo, setHorarioConsumo] = useState("Noite");
  const [lembrar, setLembrar] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState<"erro" | "sucesso" | "info">("info");
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);
  const googleScriptLoaded = useRef(false);

  const mostrarMensagem = (texto: string, tipo: "erro" | "sucesso" | "info" = "info") => {
    setMensagem(texto);
    setMensagemTipo(tipo);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = authMode ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [authMode]);

  const abrirModal = (modo: AuthMode) => {
    setAuthMode(modo);
    setOpen(false);
    mostrarMensagem("");
    setNome("");
    setEmail(localStorage.getItem("wattiz_email_lembrado") || "");
    setSenha("");
    setConfirmarSenha("");
    setCadastroEtapa(0);
    setUsoWattiz("Casa");
    setCidade("");
    setEstado("");
    setMoradores("");
    setContaLuz("");
    setAparelhosSelecionados([]);
    setMaisUsado("");
    setMaiorConsumo("");
    setEsqueceLigado("Às vezes");
    setHorarioConsumo("Noite");
    setMostrarSenha(false);
  };

  const fecharModal = () => {
    setAuthMode(null);
    mostrarMensagem("");
  };

  const concluirLogin = (usuario: StoredUser, texto = "Login realizado com sucesso!") => {
    localStorage.setItem("wattiz_sessao", JSON.stringify(usuario));
    if (lembrar && usuario.email) {
      localStorage.setItem("wattiz_email_lembrado", usuario.email);
    } else {
      localStorage.removeItem("wattiz_email_lembrado");
    }
    mostrarMensagem(texto, "sucesso");
    setTimeout(fecharModal, 850);
  };

  const alternarAparelho = (aparelho: string) => {
    setAparelhosSelecionados((atuais) =>
      atuais.includes(aparelho) ? atuais.filter((item) => item !== aparelho) : [...atuais, aparelho],
    );
  };

  const concluirCadastro = () => {
    const emailLimpo = email.trim().toLowerCase();
    const nomeLimpo = nome.trim();
    const novoUsuario: StoredUser = {
      nome: nomeLimpo,
      email: emailLimpo,
      senha: senha.trim(),
      provider: "email",
      perfil: {
        uso: usoWattiz,
        cidade,
        estado,
        moradores,
        conta: contaLuz,
        aparelhos: aparelhosSelecionados,
        maisUsado,
        maiorConsumo,
        esqueceLigado,
        horario: horarioConsumo,
      },
    };

    const usuarios = getUsers();
    saveUsers([...usuarios.filter((u) => u.email !== emailLimpo), novoUsuario]);
    localStorage.setItem("wattiz_onboarding_finalizado", "true");
    concluirLogin(novoUsuario, `Conta criada! A IA Wattiz preparou seu perfil, ${nomeLimpo.split(" ")[0]}.`);
  };

  const proximaEtapaCadastro = () => {
    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();
    const nomeLimpo = nome.trim();

    if (cadastroEtapa === 0) {
      if (!nomeLimpo || !emailLimpo || !senhaLimpa || !confirmarSenha.trim()) {
        mostrarMensagem("Preencha nome, e-mail, senha e confirmação.", "erro");
        return;
      }
      if (senhaLimpa.length < 6) {
        mostrarMensagem("A senha precisa ter pelo menos 6 caracteres.", "erro");
        return;
      }
      if (senhaLimpa !== confirmarSenha.trim()) {
        mostrarMensagem("As senhas não combinam.", "erro");
        return;
      }
      if (getUsers().some((u) => u.email === emailLimpo)) {
        mostrarMensagem("Esse e-mail já está cadastrado. Tente entrar.", "erro");
        return;
      }
    }

    if (cadastroEtapa === 1 && (!cidade.trim() || !estado.trim() || !moradores.trim() || !contaLuz.trim())) {
      mostrarMensagem("Complete seu perfil energético para continuar.", "erro");
      return;
    }

    if (cadastroEtapa === 2 && aparelhosSelecionados.length === 0) {
      mostrarMensagem("Selecione pelo menos um aparelho.", "erro");
      return;
    }

    if (cadastroEtapa === 3 && (!maisUsado.trim() || !maiorConsumo.trim())) {
      mostrarMensagem("Conte seus principais hábitos de consumo.", "erro");
      return;
    }

    mostrarMensagem("");
    if (cadastroEtapa < cadastroEtapas.length - 1) {
      setCadastroEtapa((etapa) => etapa + 1);
      return;
    }
    concluirCadastro();
  };

  const enviarFormulario = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (authMode === "cadastro") {
      proximaEtapaCadastro();
      return;
    }

    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      mostrarMensagem("Preencha todos os campos para continuar.", "erro");
      return;
    }

    if (senhaLimpa.length < 6) {
      mostrarMensagem("A senha precisa ter pelo menos 6 caracteres.", "erro");
      return;
    }

    const usuario = getUsers().find((u) => u.email === emailLimpo && u.senha === senhaLimpa);

    if (!usuario) {
      mostrarMensagem("E-mail ou senha incorretos. Crie uma conta primeiro.", "erro");
      return;
    }

    concluirLogin(usuario, `Bem-vinda(o) de volta${usuario.nome ? `, ${usuario.nome.split(" ")[0]}` : ""}!`);
  };

  const entrarComGoogle = () => {
    setCarregandoGoogle(true);
    mostrarMensagem("");

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

    if (!clientId) {
      setCarregandoGoogle(false);
      mostrarMensagem("Para o Google abrir igual ao exemplo, configure VITE_GOOGLE_CLIENT_ID na Vercel.", "erro");
      return;
    }

    const salvarUsuarioGoogle = (dados: { name?: string; email?: string }) => {
      if (!dados.email) {
        mostrarMensagem("Não foi possível confirmar sua conta Google.", "erro");
        return;
      }

      const usuario: StoredUser = {
        nome: dados.name || "Usuário Google",
        email: String(dados.email).toLowerCase(),
        provider: "google",
      };

      const usuarios = getUsers();
      if (!usuarios.some((u) => u.email === usuario.email)) {
        saveUsers([...usuarios, usuario]);
      }
      concluirLogin(usuario, `Login com Google realizado${usuario.nome ? `, ${usuario.nome.split(" ")[0]}` : ""}!`);
    };

    const inicializarGoogle = () => {
      if (!window.google?.accounts?.oauth2) {
        setCarregandoGoogle(false);
        mostrarMensagem("Não foi possível carregar o Google agora. Tente novamente.", "erro");
        return;
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        prompt: "select_account",
        callback: async (response) => {
          if (response.error || !response.access_token) {
            setCarregandoGoogle(false);
            mostrarMensagem("Login com Google cancelado ou não autorizado.", "erro");
            return;
          }

          try {
            const perfil = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${response.access_token}` },
            }).then((r) => r.json());
            setCarregandoGoogle(false);
            salvarUsuarioGoogle({ name: perfil.name, email: perfil.email });
          } catch {
            setCarregandoGoogle(false);
            mostrarMensagem("Não foi possível buscar seus dados do Google.", "erro");
          }
        },
      });

      tokenClient.requestAccessToken();
    };

    if (googleScriptLoaded.current) {
      inicializarGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded.current = true;
      inicializarGoogle();
    };
    script.onerror = () => {
      setCarregandoGoogle(false);
      mostrarMensagem("Erro ao carregar o login do Google.", "erro");
    };
    document.body.appendChild(script);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[90] transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0010]/82 backdrop-blur-xl border-b border-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.18)]"
            : "bg-transparent"
        }`}
      >
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 h-16 md:h-20 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3" aria-label="Ir para o início">
            <img
              src={wattizLogo}
              alt="Logo Wattiz"
              className="h-10 md:h-12 w-auto object-contain transition-all duration-300 drop-shadow-[0_0_16px_rgba(250,204,21,0.28)]"
            />
          </a>

          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-white/85 transition-colors relative after:absolute after:left-0 after:-bottom-0.5 after:h-[3px] after:w-0 after:bg-[#facc15] hover:text-white hover:after:w-full after:transition-all"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 relative z-[95]">
            <a
              href="/login"
              className={`min-h-[44px] cursor-pointer rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15]/70 active:scale-[0.98] ${
                scrolled
                  ? "border border-[#a855f7]/55 text-white hover:border-[#facc15]/70 hover:bg-white/10"
                  : "border border-white/35 text-white hover:bg-white/12 hover:border-[#facc15]/70 hover:shadow-[0_0_18px_rgba(250,204,21,0.18)]"
              }`}
            >
              Entrar
            </a>
            <a
              href="/cadastro"
              className="min-h-[44px] cursor-pointer rounded-full bg-[#facc15] px-6 py-3 text-sm font-semibold text-[#0a0010] shadow-[0_10px_26px_-12px_rgba(250,204,21,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fde047] hover:shadow-[0_14px_34px_-12px_rgba(250,204,21,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15]/70 active:scale-[0.98]"
            >
              Cadastrar
            </a>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              scrolled ? "text-foreground hover:bg-soft-bg" : "text-white hover:bg-white/10"
            }`}
            aria-label="menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-white border-t border-border px-6 py-4 flex flex-col gap-4 shadow-lg">
            <img src={wattizLogoDark} alt="Logo Wattiz" className="h-10 w-fit object-contain mb-1" />
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-foreground/80">
                {l.label}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href="/login"
                onClick={() => setOpen(false)}
                className="min-h-[44px] cursor-pointer rounded-full border border-[#6b21d0]/35 px-5 py-3 text-center text-sm font-semibold text-[#0a0010] transition hover:bg-[#f5f4ff] active:scale-[0.98]"
              >
                Entrar
              </a>
              <a
                href="/cadastro"
                onClick={() => setOpen(false)}
                className="min-h-[44px] cursor-pointer rounded-full bg-[#facc15] px-5 py-3 text-center text-sm font-semibold text-[#0a0010] transition hover:bg-[#fde047] active:scale-[0.98]"
              >
                Cadastrar
              </a>
            </div>
          </div>
        )}
      </header>

      {authMode && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[#0a0010]/75 px-4 py-3 backdrop-blur-md"
          onClick={fecharModal}
        >
          <div
            className={`auth-modal relative w-full ${authMode === "cadastro" ? "max-w-[520px]" : "max-w-[405px]"} max-h-[90vh] overflow-visible rounded-[22px] border border-[#a855f7]/25 bg-[#12071a] p-6 font-['Poppins'] shadow-[0_28px_80px_rgba(0,0,0,0.45)] sm:p-7`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#facc15]/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-[#6b21d0]/35 blur-3xl" />

            <button
              type="button"
              onClick={fecharModal}
              className="absolute right-4 top-4 z-30 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15]/70 active:scale-95"
              aria-label="Fechar modal"
            >
              <X size={20} className="pointer-events-none" />
            </button>

            <div className="relative z-10">
              <span className="mb-2.5 inline-flex rounded-full border border-[#facc15]/35 bg-[#facc15]/10 px-4 py-1.5 font-['Montserrat'] text-[10px] font-bold uppercase tracking-[0.24em] text-[#facc15]">
                {authMode === "login" ? "Acesso" : "Nova conta"}
              </span>
              <h2 className="font-['Montserrat'] text-[22px] font-extrabold leading-tight text-white sm:text-[24px]">
                {authMode === "login" ? "Entrar no Wattiz" : "Cadastrar no Wattiz"}
              </h2>
              <p className="mt-2 text-[13px] leading-5 text-white/65">
                {authMode === "login"
                  ? "Acesse sua área para acompanhar consumo, alertas e insights da Lume."
                  : "Vamos montar seu perfil energético em poucos passos, com IA e visual premium."}
              </p>

              <form onSubmit={enviarFormulario} className="mt-4 space-y-2.5">
                {authMode === "cadastro" && (
                  <div className="mb-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-white/45">
                      {cadastroEtapas.map((etapa, index) => (
                        <span key={etapa} className={index <= cadastroEtapa ? "text-[#facc15]" : ""}>
                          {index + 1}
                        </span>
                      ))}
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#facc15] to-[#22c55e] transition-all duration-500"
                        style={{ width: `${((cadastroEtapa + 1) / cadastroEtapas.length) * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 font-['Montserrat'] text-[12px] font-bold uppercase tracking-[0.18em] text-white/50">
                      Etapa {cadastroEtapa + 1} — {cadastroEtapas[cadastroEtapa]}
                    </p>
                  </div>
                )}

                {authMode === "login" && (
                  <>
                    <label className="block text-[13px] font-medium text-white/75">
                      E-mail
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Digite seu e-mail"
                        className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-[14px] text-white outline-none ring-0 transition placeholder:text-white/35 focus:border-[#a855f7]/60 focus:bg-white/10 focus:outline-none focus:ring-0 focus-visible:outline-none"
                      />
                    </label>

                    <label className="block text-[13px] font-medium text-white/75">
                      Senha
                      <div className="mt-1.5 flex items-center rounded-2xl border border-white/10 bg-white/[0.08] pr-3 transition focus-within:border-[#a855f7]/60 focus-within:bg-white/10">
                        <input
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          type={mostrarSenha ? "text" : "password"}
                          placeholder="Sua senha"
                          className="w-full bg-transparent px-4 py-2 text-[14px] text-white outline-none ring-0 placeholder:text-white/35 focus:outline-none focus:ring-0 focus-visible:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha((v) => !v)}
                          className="shrink-0 text-white/55 transition hover:text-[#facc15] focus:outline-none focus-visible:outline-none"
                          aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {mostrarSenha ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                      </div>
                    </label>

                    <div className="flex items-center justify-between gap-3 pt-1 text-[13px]">
                      <label className="flex cursor-pointer items-center gap-2 text-white/65">
                        <input
                          checked={lembrar}
                          onChange={(e) => setLembrar(e.target.checked)}
                          type="checkbox"
                          className="h-4 w-4 rounded border-white/20 bg-white/10 accent-[#facc15] focus:outline-none focus:ring-0 focus-visible:outline-none"
                        />
                        Lembrar-me
                      </label>
                      <button
                        type="button"
                        onClick={() => mostrarMensagem("Recuperação de senha pronta para conectar ao backend.", "info")}
                        className="font-medium text-white/75 underline decoration-white/25 underline-offset-4 transition hover:text-[#facc15] focus:outline-none focus-visible:outline-none"
                      >
                        Esqueci a senha
                      </button>
                    </div>
                  </>
                )}

                {authMode === "cadastro" && cadastroEtapa === 0 && (
                  <div className="space-y-2.5">
                    <label className="block text-[13px] font-medium text-white/75">
                      Nome completo
                      <input value={nome} onChange={(e) => setNome(e.target.value)} type="text" placeholder="Seu nome completo" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-[14px] text-white outline-none transition placeholder:text-white/35 focus:border-[#a855f7]/60 focus:bg-white/10" />
                    </label>
                    <label className="block text-[13px] font-medium text-white/75">
                      E-mail
                      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Digite seu e-mail" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-[14px] text-white outline-none transition placeholder:text-white/35 focus:border-[#a855f7]/60 focus:bg-white/10" />
                    </label>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <label className="block text-[13px] font-medium text-white/75">
                        Senha
                        <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" placeholder="Mín. 6 caracteres" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-[14px] text-white outline-none transition placeholder:text-white/35 focus:border-[#a855f7]/60 focus:bg-white/10" />
                      </label>
                      <label className="block text-[13px] font-medium text-white/75">
                        Confirmar
                        <input value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} type="password" placeholder="Repita a senha" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-[14px] text-white outline-none transition placeholder:text-white/35 focus:border-[#a855f7]/60 focus:bg-white/10" />
                      </label>
                    </div>
                  </div>
                )}

                {authMode === "cadastro" && cadastroEtapa === 1 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {(["Casa", "Negócio", "Ambos"] as UsoWattiz[]).map((tipo) => (
                        <button key={tipo} type="button" onClick={() => setUsoWattiz(tipo)} className={`rounded-2xl border px-2 py-3 text-[12px] font-semibold transition ${usoWattiz === tipo ? "border-[#facc15]/60 bg-[#facc15]/15 text-[#facc15] shadow-[0_0_18px_rgba(250,204,21,0.15)]" : "border-white/10 bg-white/[0.06] text-white/65 hover:bg-white/10"}`}>
                          {tipo === "Casa" ? <Home className="mx-auto mb-1" size={17} /> : tipo === "Negócio" ? <Building2 className="mx-auto mb-1" size={17} /> : <Sparkles className="mx-auto mb-1" size={17} />}
                          {tipo}
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-[#a855f7]/60" />
                      <input value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Estado" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-[#a855f7]/60" />
                      <input value={moradores} onChange={(e) => setMoradores(e.target.value)} placeholder="Moradores" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-[#a855f7]/60" />
                      <input value={contaLuz} onChange={(e) => setContaLuz(e.target.value)} placeholder="Conta média R$" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-[#a855f7]/60" />
                    </div>
                  </div>
                )}

                {authMode === "cadastro" && cadastroEtapa === 2 && (
                  <div className="space-y-2">
                    <p className="text-[13px] text-white/65">Quais aparelhos você possui?</p>
                    <div className="grid max-h-[210px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                      {[...aparelhosCasa, ...(usoWattiz !== "Casa" ? aparelhosNegocio : [])].map((aparelho) => {
                        const ativo = aparelhosSelecionados.includes(aparelho);
                        return (
                          <button key={aparelho} type="button" onClick={() => alternarAparelho(aparelho)} className={`rounded-2xl border px-2 py-2 text-left text-[11px] font-semibold transition ${ativo ? "border-[#22c55e]/60 bg-[#22c55e]/15 text-[#bbf7d0] shadow-[0_0_16px_rgba(34,197,94,0.16)]" : "border-white/10 bg-white/[0.06] text-white/60 hover:bg-white/10"}`}>
                            <Zap size={14} className="mb-1" />
                            {aparelho}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {authMode === "cadastro" && cadastroEtapa === 3 && (
                  <div className="space-y-2.5">
                    <input value={maisUsado} onChange={(e) => setMaisUsado(e.target.value)} placeholder="Qual aparelho você mais usa?" className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-[#a855f7]/60" />
                    <input value={maiorConsumo} onChange={(e) => setMaiorConsumo(e.target.value)} placeholder="Qual acha que mais consome?" className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-[#a855f7]/60" />
                    <select value={esqueceLigado} onChange={(e) => setEsqueceLigado(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#211229] px-4 py-2 text-[14px] text-white outline-none focus:border-[#a855f7]/60">
                      <option>Sim</option><option>Às vezes</option><option>Não</option>
                    </select>
                    <div className="grid grid-cols-4 gap-2">
                      {horariosConsumo.map((horario) => <button key={horario} type="button" onClick={() => setHorarioConsumo(horario)} className={`rounded-2xl border px-2 py-2 text-[11px] font-semibold ${horarioConsumo === horario ? "border-[#facc15]/60 bg-[#facc15]/15 text-[#facc15]" : "border-white/10 bg-white/[0.06] text-white/60"}`}>{horario}</button>)}
                    </div>
                  </div>
                )}

                {authMode === "cadastro" && cadastroEtapa === 4 && (
                  <div className="rounded-3xl border border-[#22c55e]/25 bg-[#22c55e]/10 p-4 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#facc15]/35 bg-[#facc15]/10 text-[#facc15] shadow-[0_0_24px_rgba(250,204,21,0.18)]">
                      <Laptop size={24} />
                    </div>
                    <h3 className="font-['Montserrat'] text-[16px] font-extrabold text-white">IA Wattiz analisando seu perfil...</h3>
                    <div className="my-3 space-y-1.5">
                      <span className="block h-1.5 rounded-full bg-gradient-to-r from-[#22c55e] via-[#facc15] to-[#a855f7]" />
                      <span className="mx-auto block h-1.5 w-4/5 rounded-full bg-white/15" />
                    </div>
                    <p className="text-[12px] leading-5 text-white/65">Economia estimada: <b className="text-[#22c55e]">até 18%</b> ao mês. Principais alertas: chuveiro, ar-condicionado e horários de pico.</p>
                  </div>
                )}

                {mensagem && (
                  <p
                    className={`rounded-2xl px-4 py-2 text-[13px] ${
                      mensagemTipo === "erro"
                        ? "border border-red-400/30 bg-red-500/10 text-red-200"
                        : mensagemTipo === "sucesso"
                          ? "border border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                          : "border border-[#facc15]/20 bg-[#facc15]/10 text-[#fde047]"
                    }`}
                  >
                    {mensagem}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  {authMode === "cadastro" && cadastroEtapa > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        mostrarMensagem("");
                        setCadastroEtapa((etapa) => Math.max(0, etapa - 1));
                      }}
                      className="w-1/3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-[14px] font-semibold text-white/75 transition hover:bg-white/12 focus:outline-none focus-visible:outline-none"
                    >
                      Voltar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-[#facc15] px-5 py-2 text-[14px] font-semibold text-[#0a0010] shadow-[0_14px_34px_-14px_rgba(250,204,21,1)] transition hover:-translate-y-0.5 hover:bg-[#fde047] focus:outline-none focus-visible:outline-none active:scale-[0.99]"
                  >
                    {authMode === "login" ? "Entrar" : cadastroEtapa === cadastroEtapas.length - 1 ? "Finalizar cadastro" : "Continuar"}
                  </button>
                </div>
              </form>

              <div className="my-3 flex items-center gap-4 text-[13px] text-white/40">
                <span className="h-px flex-1 bg-white/10" />
                ou
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={entrarComGoogle}
                disabled={carregandoGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-2 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#facc15]/50 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:outline-none"
              >
                <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.8-3.3-11.4-7.9L6 33.2C9.2 39.6 15.9 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C36.9 39.3 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
                {carregandoGoogle ? "Conectando..." : "Entrar com Google"}
              </button>

              <p className="mt-3 text-center text-[13px] text-white/50">
                {authMode === "login" ? "Novo por aqui?" : "Já tem conta?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    mostrarMensagem("");
                    setAuthMode(authMode === "login" ? "cadastro" : "login");
                    setSenha("");
                    setMostrarSenha(false);
                  }}
                  className="font-extrabold text-[#facc15] underline decoration-[#facc15]/30 underline-offset-4 transition hover:text-[#fde047] focus:outline-none focus-visible:outline-none"
                >
                  {authMode === "login" ? "Crie sua conta" : "Entrar agora"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
