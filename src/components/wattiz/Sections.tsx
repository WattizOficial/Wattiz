import {
  AlertTriangle,
  TrendingDown,
  EyeOff,
  Gauge,
  Brain,
  Bell,
  PiggyBank,
  BarChart3,
  Lightbulb,
  Cpu,
  Home,
  Store,
  Smartphone,
  Check,
  Star,
  ArrowRight,
  ShoppingCart,
  Lock,
  Wifi,
  Package,
  Clock3,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import lumeSection from "@/assets/images/lume/lume-section.png";
import familiasImg from "@/assets/images/landing/familias-wattiz.png";
import pequenosNegociosImg from "@/assets/images/landing/pequenos-negocios-wattiz.png";
import residenciasImg from "@/assets/images/landing/residencias-wattiz.png";
import pessoa1Img from "@/assets/images/depoimentos/pessoa1.webp";
import pessoa2Img from "@/assets/images/depoimentos/pessoa2.webp";
import pessoa3Img from "@/assets/images/depoimentos/pessoa3.webp";
import pessoa4Img from "@/assets/images/depoimentos/pessoa4.webp";
import pessoa5Img from "@/assets/images/depoimentos/pessoa5.webp";
import wattizTomada from "@/assets/images/produtos/wattiz-tomada.png";
import hardwareDimensoes from "@/assets/images/produtos/hardware-medidor-dimensoes.png";
import hardwareTomadaMedidora from "@/assets/images/produtos/hardware-tomada-medidora.webp";
import hardwareMedidorDigital from "@/assets/images/produtos/hardware-medidor-digital.webp";
import demoDayVideo from "@/assets/videos/DEMODAY.mp4";

const Section = ({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <section id={id} className={`py-16 md:py-24 px-6 lg:px-10 ${className}`}>
    <div className="max-w-6xl mx-auto">{children}</div>
  </section>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-block px-3 py-1 rounded-full bg-energy/15 text-[#7a5a00] text-xs font-semibold tracking-wider uppercase mb-4">
    {children}
  </div>
);

export default function Sections() {
  const paraQuemCards = [
    {
      titulo: "Famílias",
      texto: "Controle melhor os gastos de casa.",
      img: familiasImg,
      alt: "Família usando tecnologia em casa",
    },
    {
      titulo: "Residencial",
      texto: "Entenda o consumo da sua casa pelo app.",
      img: residenciasImg,
      alt: "Residência com consumo monitorado pelo aplicativo",
    },
    {
      titulo: "Pequenos negócios",
      texto: "Reduza desperdícios no dia a dia.",
      img: pequenosNegociosImg,
      alt: "Pequeno negócio usando tecnologia",
    },
  ];

  const [paraQuemAtivo, setParaQuemAtivo] = useState(0);
  const [paraQuemPausado, setParaQuemPausado] = useState(false);
  const paraQuemRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (paraQuemPausado) return;

    const intervalo = window.setInterval(() => {
      setParaQuemAtivo((atual) => (atual + 1) % paraQuemCards.length);
    }, 3200);

    return () => window.clearInterval(intervalo);
  }, [paraQuemPausado, paraQuemCards.length]);



  return (
    <>
      {/* 2. PARA QUEM É */}
      <section ref={paraQuemRef} className="para-quem-nubank" aria-labelledby="para-quem-titulo">
        <div className="para-quem-nubank-topo">
          <span className="para-quem-nubank-badge">Para quem é</span>
          <h2 id="para-quem-titulo">Energia inteligente para todos</h2>
          <p>
            Escolha seu momento e veja como o Wattiz ajuda em casa, no app ou no seu pequeno negócio.
          </p>
        </div>

        <div className="para-quem-carrossel" aria-live="polite">
          {paraQuemCards.map((card, index) => {
            const posicao = (index - paraQuemAtivo + paraQuemCards.length) % paraQuemCards.length;
            const classePosicao = posicao === 0 ? "ativo" : posicao === 1 ? "direita" : "esquerda";

            return (
              <button
                type="button"
                key={card.titulo}
                className={`para-quem-card ${classePosicao}`}
                onClick={() => setParaQuemAtivo(index)}
                aria-label={`Ver opção ${card.titulo}`}
              >
                <img src={card.img} alt={card.alt} />
                <div className="para-quem-card-overlay">
                  <h3>{card.titulo}</h3>
                  <span>{card.texto}</span>
                  <strong>Saiba mais</strong>
                </div>
              </button>
            );
          })}
        </div>

        <div className="para-quem-controles" aria-label="Controles do carrossel Para quem é">
          <div className="para-quem-bolinhas">
            {paraQuemCards.map((card, index) => (
              <button
                key={card.titulo}
                type="button"
                className={paraQuemAtivo === index ? "ativo" : ""}
                onClick={() => setParaQuemAtivo(index)}
                aria-label={`Mostrar ${card.titulo}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="para-quem-pause"
            onClick={() => setParaQuemPausado((atual) => !atual)}
            aria-label={paraQuemPausado ? "Continuar carrossel" : "Pausar carrossel"}
          >
            {paraQuemPausado ? "▶" : "Ⅱ"}
          </button>
        </div>
      </section>

      {/* HARDWARE */}
      <HardwarePremiumVideoSection />

      <Section id="problema" className="bg-white">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">
            Você paga pelo que <span className="text-gradient-purple">não vê</span>.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A maior parte do desperdício de energia acontece sem você perceber.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: TrendingDown, title: "Conta sempre alta", desc: "Sem entender o porquê do valor subir mês a mês." },
            { icon: EyeOff, title: "Consumo invisível", desc: "Aparelhos em standby consomem 24h por dia." },
            { icon: AlertTriangle, title: "Desperdícios ocultos", desc: "Falhas silenciosas que custam caro." },
            { icon: Gauge, title: "Sem controle real", desc: "Falta visibilidade sobre o que gasta mais." },
          ].map((c) => (
            <div
              key={c.title}
              className="p-5 rounded-2xl border border-border bg-white hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-energy/15 flex items-center justify-center mb-4">
                <c.icon className="w-6 h-6 text-[#7a5a00]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. LUME IA */}
      <Section id="lume" className="bg-[#0a0010] text-white relative overflow-hidden">
        {/* ambient glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple/25 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-energy/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative grid lg:grid-cols-2 gap-10 items-center">
          {/* Lume bee illustration */}
          <div className="relative flex items-center justify-center order-2 lg:order-1">
            <div
              className="absolute rounded-full"
              style={{
                width: "340px",
                height: "340px",
                background: "radial-gradient(circle, rgba(107,33,208,0.30) 0%, rgba(250,204,21,0.10) 60%, transparent 80%)",
                filter: "blur(20px)",
              }}
            />
            <div
              className="absolute rounded-full border-2"
              style={{
                width: "300px",
                height: "300px",
                borderColor: "rgba(168,85,247,0.45)",
                boxShadow: "0 0 30px 6px rgba(168,85,247,0.3), inset 0 0 30px 4px rgba(168,85,247,0.1)",
              }}
            />
            <img
              src={lumeSection}
              alt="Lume IA"
              className="relative"
              style={{
                width: "clamp(240px, 32vw, 380px)",
                height: "clamp(240px, 32vw, 380px)",
                objectFit: "contain",
                filter: "drop-shadow(0 0 30px rgba(168,85,247,0.55)) drop-shadow(0 0 60px rgba(250,204,21,0.2))",
                animation: "lume-float 4s ease-in-out infinite",
              }}
            />
          </div>

          {/* Text content */}
          <div className="order-1 lg:order-2">
            <div className="inline-block px-3 py-1 rounded-full bg-purple/20 text-purple-light text-xs font-semibold tracking-wider uppercase mb-4 border border-purple/30">
              Lume IA
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Sua assistente de{" "}
              <span className="text-gradient-purple">energia inteligente</span>.
            </h2>
            <p className="mt-4 text-white/65 text-lg leading-relaxed">
              A Lume aprende seus hábitos, monitora 24h e te avisa antes que o
              desperdício vire prejuízo.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: Brain, t: "Aprende seu padrão de consumo", sub: "Análise comportamental contínua" },
                { icon: Bell, t: "Alertas em tempo real", sub: "Notificações inteligentes 24/7" },
                { icon: PiggyBank, t: "Recomendações para economizar", sub: "Insights personalizados por IA" },
              ].map((f) => (
                <div key={f.t} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 hover:border-purple/30 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple/40 to-energy/20 border border-purple/30 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-purple-light" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{f.t}</div>
                    <div className="text-white/45 text-xs">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 5. GESTÃO DE CONSUMO */}
      <MedidorInteligenteSection />

      {/* 6. FUNCIONALIDADES */}
      <FuncionalidadesSection />

      {/* 8. LOJA WATTIZ */}
      <Section id="loja" className="bg-gradient-to-b from-white via-[#fafafa] to-white overflow-hidden">
        <div>
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-[#fff9e6] to-[#fffaed] border border-[#f5d972] text-xs font-semibold tracking-[0.15em] uppercase text-[#6b5a00] mb-5 shadow-sm">
            LOJA WATTIZ
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-[-0.02em] mb-4 text-[#050505]">
            Hardwares compatíveis com o Wattiz
          </h2>
          <p className="text-[#666] text-sm md:text-base font-normal leading-relaxed max-w-2xl mx-auto">
            A plataforma Wattiz é conectada a parceiros e lojas que vendem produtos compatíveis para monitoramento energético. Escolha seu dispositivo, integre ao ecossistema Wattiz e acompanhe tudo em um só lugar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              tag: "MEDIDOR",
              imagem: hardwareDimensoes,
              nome: "Medidor de Energia DIN",
              descricao: "Modelo compacto para acompanhar consumo em kWh com instalação em quadro elétrico.",
              preco: "Produto parceiro",
              detalhe: "Disponível em lojas conectadas",
            },
            {
              tag: "TOMADA",
              imagem: hardwareTomadaMedidora,
              nome: "Tomada Medidora Inteligente",
              descricao: "Ideal para medir aparelhos individuais e entender o gasto de equipamentos específicos.",
              preco: "Produto parceiro",
              detalhe: "Compatível com monitoramento por tomada",
            },
            {
              tag: "DIGITAL",
              imagem: hardwareMedidorDigital,
              nome: "Medidor Digital de Energia",
              descricao: "Hardware para leituras digitais e integração com controle energético residencial ou comercial.",
              preco: "Produto parceiro",
              detalhe: "Integração com o ecossistema Wattiz",
            },
          ].map((produto) => (
            <div
              key={produto.nome}
              className="group relative bg-white rounded-[1.35rem] overflow-hidden hover:shadow-[0_14px_36px_rgba(107,33,208,0.14)] transition-all duration-500 hover:-translate-y-1 flex flex-col border border-[#e8ddfb]"
            >
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-block bg-gradient-to-r from-[#facc15] to-[#fde047] text-[#0a0010] text-[0.65rem] font-semibold px-3 py-1.5 rounded-full tracking-[0.08em] uppercase shadow-sm">
                  {produto.tag}
                </span>
              </div>

              <div className="relative flex items-center justify-center h-52 bg-gradient-to-b from-[#fbfaff] to-[#f6f1ff] px-7 py-7 overflow-hidden">
                <div className="absolute inset-x-8 bottom-5 h-10 bg-purple/15 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="relative z-10 max-h-40 w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 tracking-tight text-[#080808]">
                  {produto.nome}
                </h3>
                <p className="text-sm text-[#625978] mb-5 leading-relaxed flex-1 font-normal">
                  {produto.descricao}
                </p>

                <div className="mb-1">
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6b21d0] to-[#a855f7]">
                    {produto.preco}
                  </span>
                </div>
                <p className="text-xs text-[#8a819d] mb-5 font-normal">
                  {produto.detalhe}
                </p>

                <a
                  href="#contato"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#facc15] to-[#fde047] text-[#0a0010] font-semibold text-sm hover:shadow-[0_4px_16px_rgba(250,204,21,0.34)] transition-all duration-300"
                >
                  Ver disponibilidade
                </a>
              </div>
            </div>
          ))}
        </div>
        </div>
      </Section>

      {/* 9. PLANOS */}
      <Section id="planos" className="bg-white">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Eyebrow>Planos</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold text-[#050505]">
            Escolha seu plano.
          </h2>
          <p className="mt-3 text-[#6f668d] text-base font-medium">
            Comece com a Lume gratuita e evolua quando precisar de mais controle.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
          {[
            {
              nome: "Economia",
              subtitulo: "A Lume funciona de graça e atende 24 horas por dia.",
              preco: "Grátis",
              detalhe: "",
              botao: "Começar grátis",
              destaque: false,
              Icone: Gauge,
              beneficios: [
                "Banco de dados de eletrodomésticos",
                "Perfil básico da casa",
                "Estimativas simples de consumo",
                "Dicas de onde a energia é mais usada",
                "Base inicial para economizar",
              ],
            },
            {
              nome: "Controle",
              subtitulo: "Histórico, relatórios, simulações e comparações.",
              preco: "R$ 29",
              detalhe: "/mês",
              botao: "Assinar Controle",
              destaque: true,
              Icone: Brain,
              beneficios: [
                "Relatórios de meses anteriores",
                "Comparação com meses recentes",
                "Simulações pela rotina da casa",
                "Comparação com média da região",
                "Perfis semelhantes de consumo",
                "Acompanhamento mais completo",
              ],
            },
            {
              nome: "Empresa",
              subtitulo: "Produtos físicos e dados mais detalhados.",
              preco: "R$ 99",
              detalhe: "/mês",
              botao: "Falar com vendas",
              destaque: false,
              Icone: Store,
              beneficios: [
                "Tudo do plano Controle",
                "Produtos físicos da plataforma",
                "Coleta de dados mais detalhada",
                "Resultados mais específicos",
                "Relatórios avançados",
                "Mais precisão para economizar",
              ],
            },
          ].map((plano) => (
            <div
              key={plano.nome}
              className={`relative flex min-h-[500px] flex-col rounded-[24px] bg-white px-6 py-7 transition-all duration-300 hover:-translate-y-1.5 ${
                plano.destaque
                  ? "border-2 border-[#7c3aed] shadow-[0_16px_38px_rgba(107,33,208,0.18)] lg:scale-[1.015]"
                  : "border border-[#e2d9f3] shadow-[0_12px_32px_rgba(28,11,54,0.05)] hover:shadow-[0_16px_38px_rgba(107,33,208,0.12)]"
              }`}
            >
              {plano.destaque && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#8b3fd6] to-[#facc15] px-6 py-1.5 text-xs font-bold text-white shadow-[0_0_35px_rgba(168,85,247,0.45)]">
                  Mais popular
                </span>
              )}

              <div className="mb-5 flex h-[50px] w-[50px] items-center justify-center rounded-2xl bg-[#f2ecff]">
                <plano.Icone className="h-6 w-6 text-[#6b21d0]" strokeWidth={2.4} />
              </div>

              <h3 className="font-['Montserrat'] text-[1.25rem] font-bold leading-tight text-[#050505]">
                {plano.nome}
              </h3>
              <p className="mt-2 min-h-[48px] font-['Poppins'] text-[0.9rem] leading-relaxed text-[#665c85]">
                {plano.subtitulo}
              </p>

              <div className="mt-7 flex items-end gap-1 font-['Montserrat'] text-[#050505]">
                <span className="text-[2.2rem] font-bold leading-none tracking-[-0.04em]">
                  {plano.preco}
                </span>
                {plano.detalhe && (
                  <span className="pb-1.5 font-['Poppins'] text-[0.9rem] font-medium text-[#4b3b78]">
                    {plano.detalhe}
                  </span>
                )}
              </div>

              <ul className="mt-7 flex-1 space-y-3.5">
                {plano.beneficios.map((beneficio) => (
                  <li key={beneficio} className="flex items-start gap-3 font-['Poppins'] text-[0.88rem] leading-relaxed text-[#665c85]">
                    <Check
                      className={`mt-1 h-4 w-4 shrink-0 ${plano.destaque ? "text-[#facc15]" : "text-[#6b21d0]"}`}
                      strokeWidth={3}
                    />
                    <span>{beneficio}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contato"
                className={`mt-7 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 font-['Montserrat'] text-sm font-bold transition-all duration-300 ${
                  plano.destaque
                    ? "bg-[#facc15] text-[#0a0010] shadow-[0_8px_16px_rgba(250,204,21,0.28)] hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(250,204,21,0.42)]"
                    : "bg-[#f4f1ff] text-[#111111] hover:bg-[#ece4ff] hover:text-[#6b21d0]"
                }`}
              >
                {plano.botao}
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* 10. DEPOIMENTOS / COMENTÁRIOS */}
      <section className="secao-comentarios">
        <h2 className="secao-titulo">QUEM USA O WATTIZ RECOMENDA</h2>

        <div className="comentarios-infinito">
          <div className="comentarios-track">
            {[
              { foto: pessoa1Img, comentario: "Com o Wattiz consegui entender melhor meu consumo e comecei a economizar energia.", nome: "Carlos • São Paulo" },
              { foto: pessoa2Img, comentario: "A Lume me mostrou desperdícios que eu nem percebia dentro de casa.", nome: "Ana • Guarulhos" },
              { foto: pessoa3Img, comentario: "Minha mãe consegue usar super fácil. O app é simples, bonito e direto.", nome: "Juliana • São Paulo" },
              { foto: pessoa4Img, comentario: "Agora consigo acompanhar meus gastos pelo celular de um jeito muito mais claro.", nome: "Rafaela • Itaquaquecetuba" },
              { foto: pessoa5Img, comentario: "O Wattiz me ajudou a criar hábitos melhores e evitar desperdício de energia.", nome: "Larissa • São Paulo" },
              { foto: pessoa1Img, comentario: "Com o Wattiz consegui entender melhor meu consumo e comecei a economizar energia.", nome: "Carlos • São Paulo" },
              { foto: pessoa2Img, comentario: "A Lume me mostrou desperdícios que eu nem percebia dentro de casa.", nome: "Ana • Guarulhos" },
              { foto: pessoa3Img, comentario: "Minha mãe consegue usar super fácil. O app é simples, bonito e direto.", nome: "Juliana • São Paulo" },
              { foto: pessoa4Img, comentario: "Agora consigo acompanhar meus gastos pelo celular de um jeito muito mais claro.", nome: "Rafaela • Itaquaquecetuba" },
              { foto: pessoa5Img, comentario: "O Wattiz me ajudou a criar hábitos melhores e evitar desperdício de energia.", nome: "Larissa • São Paulo" },
            ].map((depoimento, index) => (
              <div className="comentario-card" key={`${depoimento.nome}-${index}`}>
                <img
                  src={depoimento.foto}
                  alt={`Foto de ${depoimento.nome}`}
                  className="comentario-foto"
                />

                <div className="comentario-conteudo">
                  <div className="comentario-estrelas" aria-label="5 estrelas">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="comentario-estrela" />
                    ))}
                  </div>
                  <p className="comentario-texto">“{depoimento.comentario}”</p>
                  <span className="comentario-nome">{depoimento.nome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. COMO FUNCIONA */}
      <Section className="bg-soft-bg">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold">3 passos para economizar.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: "01", t: "Instale", d: "Conecte o Wattiz Meter ao seu quadro de luz." },
            { n: "02", t: "Conecte", d: "Faça o pareamento com o app via WiFi." },
            { n: "03", t: "Economize", d: "A Lume IA começa a otimizar seu consumo." },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="text-6xl font-bold text-gradient-purple mb-4">{s.n}</div>
              <h3 className="text-xl font-semibold mb-2">{s.t}</h3>
              <p className="text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 13. FAQ */}
      <FAQSection />

      {/* 14. CONTATO / CHAMADA FINAL */}
      <Section id="contato" className="bg-[#0a0010] text-white relative overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(250,204,21,0.14),transparent_30%),radial-gradient(circle_at_82%_35%,rgba(168,85,247,0.22),transparent_34%),linear-gradient(135deg,#0a0010_0%,#120018_52%,#07000c_100%)]" />
        <div className="absolute -top-24 right-10 w-72 h-72 rounded-full bg-energy/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-purple/20 blur-3xl" />

        <div className="relative grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-energy/45 bg-energy/10 text-energy text-xs font-semibold tracking-[0.18em] uppercase mb-6">
              Comece agora
            </div>

            <h2 className="font-montserrat text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold leading-[1.06] tracking-tight">
              Comece agora.
              <span className="block text-gradient-energy mt-2">A Lume te espera.</span>
            </h2>

            <p className="mt-5 max-w-xl text-white/70 text-base md:text-lg leading-relaxed font-poppins">
              Teste uma nova forma de entender sua energia com a ajuda da inteligência artificial do Wattiz.
            </p>
          </div>

          <form className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] backdrop-blur-xl p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
            <div className="space-y-5">
              <label className="block">
                <span className="block mb-2 text-sm md:text-base font-medium text-white/75">Nome</span>
                <input
                  type="text"
                  placeholder="Seu nome"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3.5 text-white placeholder:text-white/35 outline-none transition focus:border-energy/60 focus:bg-white/[0.13]"
                />
              </label>

              <label className="block">
                <span className="block mb-2 text-sm md:text-base font-medium text-white/75">Email</span>
                <input
                  type="email"
                  placeholder="voce@email.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3.5 text-white placeholder:text-white/35 outline-none transition focus:border-energy/60 focus:bg-white/[0.13]"
                />
              </label>

              <label className="block">
                <span className="block mb-2 text-sm md:text-base font-medium text-white/75">Mensagem</span>
                <textarea
                  placeholder="Como podemos ajudar?"
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-5 py-3.5 text-white placeholder:text-white/35 outline-none transition focus:border-energy/60 focus:bg-white/[0.13]"
                />
              </label>

              <button
                type="button"
                className="w-full rounded-2xl bg-energy px-6 py-3.5 font-semibold text-[#0a0010] shadow-[0_0_30px_rgba(250,204,21,0.22)] transition hover:-translate-y-0.5 hover:bg-energy-glow hover:shadow-[0_0_42px_rgba(250,204,21,0.34)]"
              >
                Enviar mensagem
              </button>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}



function MedidorInteligenteSection() {
  const porcentagem = 65;
  const raio = 84;
  const circunferencia = 2 * Math.PI * raio;
  const progressoTraco = (circunferencia * porcentagem) / 100;

  return (
    <Section className="bg-white !py-14 md:!py-16">
      <div
        className="relative overflow-hidden rounded-[1.6rem] bg-[#0a0010] px-8 py-8 shadow-[0_24px_80px_rgba(10,0,16,0.18)] md:px-14 md:py-10 lg:px-16"
      >
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-purple/25 blur-[90px]" />
        <div className="absolute -bottom-28 left-1/3 h-52 w-64 rounded-full bg-energy/10 blur-[90px]" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-block text-xs font-bold uppercase tracking-[0.18em] text-energy">
              GESTÃO DE CONSUMO
            </div>

            <h3 className="font-montserrat text-3xl font-bold leading-tight text-white md:text-4xl">
              Consumo em tempo real
            </h3>

            <p className="mt-6 max-w-2xl font-poppins text-base font-normal leading-relaxed text-white/62 md:text-lg">
              Acompanhe seu consumo em tempo real com indicadores claros, dados precisos e visual profissional.
            </p>

            <div className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-8 lg:max-w-lg">
              <div>
                <strong className="block font-montserrat text-4xl font-bold text-energy md:text-[2.2rem]">
                  R$ 187
                </strong>
                <span className="mt-3 block font-poppins text-sm font-normal text-white/45">
                  Custo estimado este mês
                </span>
              </div>

              <div>
                <strong className="block font-montserrat text-4xl font-bold text-white md:text-[2.2rem]">
                  342 kWh
                </strong>
                <span className="mt-3 block font-poppins text-sm font-normal text-white/45">
                  Consumo atual
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative flex h-56 w-56 items-center justify-center md:h-52 md:w-64">
              <svg
                viewBox="0 0 220 220"
                className="h-full w-full medidor-grafico-scroll"
                style={{ transform: "rotate(-90deg)" }}
                aria-hidden="true"
              >
                <circle
                  cx="110"
                  cy="110"
                  r={raio}
                  fill="none"
                  stroke="rgba(107,33,208,0.42)"
                  strokeWidth="20"
                />
                <circle
                  cx="110"
                  cy="110"
                  r={raio}
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray={`${progressoTraco} ${circunferencia}`}
                  className="drop-shadow-[0_0_18px_rgba(250,204,21,0.45)] medidor-traco-scroll"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <strong className="font-montserrat text-5xl font-bold text-energy md:text-6xl">
                  {porcentagem}%
                </strong>
                <span className="mt-3 font-poppins text-sm font-normal text-white/48">
                  da meta
                </span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-5 font-poppins text-sm font-medium text-white/48">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-energy" /> Consumido
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple" /> Disponível
              </span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function FuncionalidadesSection() {
  const secaoRef = useRef<HTMLElement | null>(null);
  const [visivel, setVisivel] = useState(false);

  const titulo = "Tudo que você precisa em um só lugar.";

  const funcionalidades = [
    {
      icon: Gauge,
      t: "Monitoramento 24/7",
      d: "Veja seu consumo em tempo real.",
      animacao: "esquerda",
      tamanho: "grande",
    },
    {
      icon: Brain,
      t: "Lume IA",
      d: "Sugestões inteligentes para reduzir desperdícios.",
      animacao: "baixo",
      tamanho: "medio",
    },
    {
      icon: Bell,
      t: "Alertas inteligentes",
      d: "Receba avisos antes do gasto subir.",
      animacao: "direita",
      tamanho: "medio",
    },
    {
      icon: PiggyBank,
      t: "Economia na conta",
      d: "Dicas para reduzir custos.",
      animacao: "esquerda",
      tamanho: "medio",
    },
    {
      icon: BarChart3,
      t: "Gráficos simples",
      d: "Entenda tudo rapidamente.",
      animacao: "baixo",
      tamanho: "grande",
    },
    {
      icon: Clock3,
      t: "Histórico de consumo",
      d: "Compare dias e meses.",
      animacao: "direita",
      tamanho: "pequeno",
    },
    {
      icon: Lightbulb,
      t: "Insights diários",
      d: "Receba recomendações simples e úteis.",
      animacao: "esquerda",
      tamanho: "pequeno",
    },
    {
      icon: Smartphone,
      t: "Controle pelo app",
      d: "Tudo na palma da sua mão.",
      animacao: "direita",
      tamanho: "medio",
    },
    {
      icon: Cpu,
      t: "...e muito mais",
      d: "Uma plataforma completa para sua energia.",
      animacao: "baixo",
      tamanho: "medio",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) setVisivel(true);
      },
      { threshold: 0.22 }
    );

    if (secaoRef.current) observer.observe(secaoRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={secaoRef}
      id="funcionalidades"
      className={`secao-funcionalidades-webstudio ${visivel ? "ativa" : ""}`}
    >
      <div className="funcionalidades-webstudio-container">
        <div className="funcionalidades-webstudio-topo">
          <span className="funcionalidades-webstudio-badge">FUNCIONALIDADES</span>

          <h2 className="funcionalidades-webstudio-titulo" aria-label={titulo}>
            {titulo.split("").map((letra, index) => (
              <span
                key={`${letra}-${index}`}
                className="funcionalidades-letra"
                style={{ transitionDelay: `${index * 8}ms` }}
              >
                {letra === " " ? "\u00A0" : letra}
              </span>
            ))}
          </h2>

          <p className="funcionalidades-webstudio-subtexto">
            Explore recursos de monitoramento, alertas e análises pensados para deixar seu consumo mais claro, organizado e econômico.
          </p>
        </div>

        <div className="funcionalidades-webstudio-lista">
          {funcionalidades.map((item, index) => {
            const Icone = item.icon;
            const texto = item.d;

            return (
              <article
                key={item.t}
                className={`funcionalidade-webstudio-card ${item.animacao} ${item.tamanho} card-${index + 1}`}
                style={{ transitionDelay: `${90 + index * 45}ms` }}
              >
                <div
                  className="funcionalidade-webstudio-icone"
                  style={{ transitionDelay: `${130 + index * 45}ms` }}
                >
                  <Icone size={21} strokeWidth={2.15} />
                </div>

                <div className="funcionalidade-webstudio-textos">
                  <h3>
                    {item.t.split("").map((letra, letraIndex) => (
                      <span
                        key={`${item.t}-${letraIndex}`}
                        className="funcionalidade-texto-letra"
                        style={{ transitionDelay: `${150 + index * 45 + letraIndex * 4}ms` }}
                      >
                        {letra === " " ? "\u00A0" : letra}
                      </span>
                    ))}
                  </h3>

                  <p>
                    {texto.split(" ").map((palavra, palavraIndex) => (
                      <span
                        key={`${item.t}-${palavra}-${palavraIndex}`}
                        className="funcionalidade-palavra"
                        style={{ transitionDelay: `${190 + index * 45 + palavraIndex * 12}ms` }}
                      >
                        {palavra}&nbsp;
                      </span>
                    ))}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HardwarePremiumVideoSection() {
  const secaoRef = useRef<HTMLElement | null>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entrada]) => {
        setVisivel(entrada.isIntersecting);
      },
      { threshold: 0.28 }
    );

    if (secaoRef.current) observer.observe(secaoRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={secaoRef}
      className={`hardware-premium-video ${visivel ? "hardware-visivel" : ""}`}
    >
      <div className="hardware-premium-glow hardware-glow-amarelo" />
      <div className="hardware-premium-glow hardware-glow-roxo" />

      <div className="hardware-premium-container">
        <div className="hardware-premium-texto">
          <span className="hardware-premium-badge">WATTIZ METER</span>

          <h2>
            Hardware <span>premium</span>,
            <br />
            instalação simples.
          </h2>

          <p>
            Conecte o Wattiz Meter ao seu quadro de luz e comece a monitorar
            seu consumo em minutos.
          </p>

          <ul>
            {[
              "Plug & play",
              "Wi-Fi integrado",
              "Compatível com medidores residenciais",
              "Atualizações automáticas",
            ].map((item) => (
              <li key={item}>
                <Check size={19} strokeWidth={2.8} />
                {item}
              </li>
            ))}
          </ul>

          <div className="hardware-premium-acoes">
            <a href="#loja" className="hardware-botao hardware-botao-principal">
              Conhecer hardware
              <ArrowRight size={17} />
            </a>

          </div>
        </div>

        <div className="hardware-video-area">
          <div className="hardware-video-card">
            <div className="hardware-video-moldura">
              <video
                src={demoDayVideo}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="hardware-video"
              />
              <div className="hardware-video-overlay" />
            </div>

            <div className="hardware-chips">
              {[
                ["Wi-Fi", "Integrado"],
                ["App", "Controle"],
                ["IA", "Lume"],
              ].map(([titulo, texto], index) => (
                <div className="hardware-chip" key={titulo} style={{ transitionDelay: `${650 + index * 120}ms` }}>
                  <strong>{titulo}</strong>
                  <span>{texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const items = [
    {
      q: "O que é o Wattiz?",
      a: "O Wattiz é uma solução inteligente para acompanhar o consumo de energia de forma simples. A ideia é mostrar dados claros, alertas e dicas para ajudar você a entender onde está gastando mais e como pode economizar no dia a dia.",
    },
    {
      q: "Como a Lume IA ajuda na economia?",
      a: "A Lume analisa seus padrões de consumo e identifica possíveis desperdícios, horários de maior gasto e mudanças no uso dos aparelhos. Com isso, ela transforma dados técnicos em avisos fáceis de entender e sugestões práticas para reduzir a conta de luz.",
    },
    {
      q: "Preciso instalar algum equipamento?",
      a: "Para acompanhar dados em tempo real com mais precisão, o ideal é usar o Wattiz Meter. Ele funciona como um medidor inteligente conectado ao sistema. Mesmo assim, o app também pode apresentar relatórios, dicas e simulações conforme o plano escolhido.",
    },
    {
      q: "O Wattiz funciona em qualquer residência?",
      a: "Sim. O Wattiz foi pensado para casas e apartamentos com consumo residencial comum. A proposta é ser simples para famílias, estudantes, pessoas que moram sozinhas e qualquer usuário que queira acompanhar melhor seus gastos de energia.",
    },
    {
      q: "Posso usar em pequenos negócios?",
      a: "Pode. O Wattiz também é útil para salões, padarias, lojas e pequenos comércios que precisam entender melhor onde a energia está sendo consumida. Isso ajuda a reduzir desperdícios e melhorar o controle dos custos mensais.",
    },
    {
      q: "Como acompanho meu consumo?",
      a: "Você acompanha pelo painel do Wattiz, com gráficos, indicadores e alertas simples. A plataforma mostra informações como consumo atual, custo estimado, comparação de uso e possíveis pontos de desperdício.",
    },
    {
      q: "Posso cancelar quando quiser?",
      a: "Sim. A proposta dos planos é ser flexível. Você pode cancelar quando quiser, sem fidelidade e sem multa, mantendo uma experiência simples e transparente para o usuário.",
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" className="bg-white">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="text-2xl md:text-4xl font-bold">Perguntas frequentes.</h2>
        <p className="mt-3 text-muted-foreground text-sm md:text-base leading-relaxed">
          Tire suas principais dúvidas sobre o Wattiz, a Lume IA, os planos e o monitoramento inteligente de energia.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-3xl border border-[#e2d9f3] bg-white overflow-hidden shadow-[0_12px_30px_rgba(10,0,16,0.04)] transition hover:border-purple/35"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full px-5 md:px-7 py-4 md:py-5 flex items-center justify-between gap-5 text-left font-medium text-[#0a0010] hover:bg-soft-bg/60 transition"
            >
              <span>{it.q}</span>
              <span className={`text-purple text-2xl leading-none transition-transform ${open === i ? "rotate-45" : ""}`}>+</span>
            </button>

            {open === i && (
              <div className="px-5 md:px-7 pb-5 text-sm md:text-base text-muted-foreground leading-relaxed animate-fade-in-up">
                {it.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
