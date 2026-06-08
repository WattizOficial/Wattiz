import { Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import wattizLogo from "@/assets/logos/wattiz-logo.svg";

const footerLinks = [
  { href: "#top", label: "Início" },
  { href: "#lume", label: "Lume IA" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "FAQ" },
  { href: "#contato", label: "Contato" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0010] text-white pt-16 pb-8 px-6 lg:px-10 border-t border-purple/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(250,204,21,0.09),transparent_26%),radial-gradient(circle_at_90%_35%,rgba(168,85,247,0.18),transparent_32%)]" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_0.8fr] mb-12">
          <div>
            <a href="#top" className="inline-flex items-center mb-5" aria-label="Wattiz">
              <img
                src={wattizLogo}
                alt="Logo Wattiz"
                className="h-12 md:h-14 w-auto object-contain drop-shadow-[0_0_18px_rgba(250,204,21,0.22)]"
              />
            </a>

            <p className="max-w-md text-white/65 leading-relaxed">
              Wattiz é uma solução inteligente para monitoramento de energia com apoio da IA Lume.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {[Instagram, Linkedin, Twitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/70 transition hover:border-energy hover:text-energy hover:bg-energy/10"
                  aria-label="Rede social Wattiz"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-extrabold uppercase tracking-[0.18em] text-energy">
              Navegação
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition hover:text-energy">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-extrabold uppercase tracking-[0.18em] text-energy">
              Contato
            </h4>
            <div className="space-y-3 text-sm text-white/70">
              <a href="mailto:contato@wattiz.com" className="flex items-center gap-2 transition hover:text-energy">
                <Mail className="w-4 h-4" />
                contato@wattiz.com
              </a>
              <p>São Paulo, Brasil</p>
              <p>Energia inteligente, simples e acessível.</p>
            </div>
          </div>
        </div>

        <div className="pt-7 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-white/45 text-sm">
          <span>© {new Date().getFullYear()} Wattiz. Todos os direitos reservados.</span>
          <div className="flex gap-6">
            <a href="#" className="transition hover:text-energy">Privacidade</a>
            <a href="#" className="transition hover:text-energy">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
