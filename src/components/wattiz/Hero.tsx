import { ArrowRight } from "lucide-react";
import { forwardRef } from "react";
import heroBg from "@/assets/videos/hero-bg.mp4";

const Hero = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section
      ref={ref}
      id="top"
      className="relative min-h-screen overflow-hidden text-white pt-28 pb-16 md:pt-32 md:pb-20 flex items-center"
      style={{ background: "#0a0010" }}
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "cover", zIndex: 0 }}
      >
        <source src={heroBg} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,0,16,0.76) 0%, rgba(10,0,16,0.54) 50%, rgba(10,0,16,0.82) 100%)",
          zIndex: 1,
        }}
      />

      {/* Tech grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.03,
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div
        className="hero-content relative w-full max-w-7xl mx-auto px-6 lg:px-12"
        style={{ zIndex: 3 }}
      >
        <div className="animate-fade-in-up mx-auto max-w-5xl text-center flex flex-col items-center justify-center">
          <div className="hero-badge inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs md:text-sm font-medium backdrop-blur-md mb-7">
            <span>Plataforma inteligente de energia</span>
          </div>

          <h1 className="font-montserrat text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.04] tracking-tight text-center">
            Controle sua energia
            <br />
            <span className="text-gradient-energy">em tempo real.</span>
          </h1>

          <p className="mt-6 mx-auto text-base md:text-lg text-white/70 max-w-2xl leading-relaxed font-normal">
            O Wattiz monitora seu consumo em tempo real, identifica desperdícios
            invisíveis e te ajuda a reduzir a conta de luz com alertas
            inteligentes e insights personalizados.
          </p>

          <div className="mt-9 flex justify-center">
            <a href="/login" className="btn-energy">
              Começar agora <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";
export default Hero;
