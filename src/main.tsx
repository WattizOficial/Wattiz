import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Header from "@/components/wattiz/Header";
import Hero from "@/components/wattiz/Hero";
import Sections from "@/components/wattiz/Sections";
import LumeAssistant from "@/components/wattiz/LumeAssistant";
import Footer from "@/components/wattiz/Footer";
import { LoginPage, CadastroPage } from "@/components/wattiz/AuthPages";
import { DashboardPage, EletrodomesticosPage, RelatoriosPage, HistoricoPage, LumeIAPage, LojaPage, PlanosPage, PerfilPage, ConfiguracoesPage } from "@/components/wattiz/DashboardPages";
import "./styles.css";

function HomePage() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <div className="home-page min-h-screen bg-background text-foreground">
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo-principal" tabIndex={-1}>
        <Hero ref={heroRef} />
        <Sections />
      </main>
      <Footer />
      <LumeAssistant heroRef={heroRef} />
    </div>
  );
}

function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target || anchor.download || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (!["/", "/login", "/cadastro", "/dashboard", "/dashboard/eletrodomesticos", "/dashboard/relatorios", "/dashboard/historico", "/dashboard/ia-lume", "/loja", "/planos", "/perfil", "/configuracoes"].includes(url.pathname)) return;

      event.preventDefault();
      window.history.pushState({}, "", url.pathname + url.search + url.hash);
      setPath(window.location.pathname);

      if (url.pathname === "/" && url.hash) {
        requestAnimationFrame(() => {
          const target = document.querySelector(url.hash);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };

    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick);
    };
  }, []);

  if (path === "/login") return <LoginPage />;
  if (path === "/cadastro") return <CadastroPage />;
  if (path === "/dashboard") return <DashboardPage />;
  if (path === "/dashboard/eletrodomesticos") return <EletrodomesticosPage />;
  if (path === "/dashboard/relatorios") return <RelatoriosPage />;
  if (path === "/dashboard/historico") return <HistoricoPage />;
  if (path === "/dashboard/ia-lume") return <LumeIAPage />;
  if (path === "/loja") return <LojaPage />;
  if (path === "/planos") return <PlanosPage />;
  if (path === "/perfil") return <PerfilPage />;
  if (path === "/configuracoes") return <ConfiguracoesPage />;
  return <HomePage />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
