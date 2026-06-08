import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import lumeFloating from "@/assets/images/lume/lume-floating.png";
import { lume as lumeApi, hasBackend, getAccessToken } from "@/api";

interface Props {
  heroRef: React.RefObject<HTMLElement | null>;
}

interface Message {
  role: "user" | "lume";
  text: string;
}

export default function LumeAssistant({ heroRef }: Props) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isLoggedIn = Boolean(getAccessToken());
  const backendAvailable = hasBackend();

  useEffect(() => {
    if (!heroRef.current) return;
    observerRef.current = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observerRef.current.observe(heroRef.current);
    return () => observerRef.current?.disconnect();
  }, [heroRef]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "lume",
          text: isLoggedIn && backendAvailable
            ? "Oi! 👋 Sou a Lume, sua assistente de energia. Posso analisar seu consumo e dar dicas para economizar. Como posso ajudar?"
            : "Oi! 👋 Sou a Lume. Faça login para eu analisar seu consumo e dar dicas personalizadas! 😊",
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Sem backend ou sem login → resposta estática
    if (!backendAvailable || !isLoggedIn) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "lume",
            text: isLoggedIn
              ? "Ainda não consigo processar mensagens sem o backend configurado. Peça ao administrador para configurar a variável VITE_API_URL."
              : "Para conversar comigo sobre seu consumo, faça login primeiro! 🔐",
          },
        ]);
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const now = new Date();
      const res = await lumeApi.chat(text, now.getMonth() + 1, now.getFullYear());
      setMessages((prev) => [...prev, { role: "lume", text: res.response }]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          role: "lume",
          text: err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (!visible) return null;

  return (
    <div className="lume-assistente">
      {open && (
        <div className="lume-balao" style={{ display: "flex", flexDirection: "column", maxHeight: 420 }}>
          <div className="lume-balao-titulo" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Lume IA 💡</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
              aria-label="Fechar"
            >✕</button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 0",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              minHeight: 120,
              maxHeight: 300,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background: msg.role === "user" ? "var(--color-primary, #22c55e)" : "var(--color-surface-2, #f3f4f6)",
                  color: msg.role === "user" ? "#fff" : "inherit",
                  borderRadius: 12,
                  padding: "8px 12px",
                  maxWidth: "85%",
                  fontSize: 13,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", fontSize: 13, color: "#888", padding: "4px 8px" }}>
                Lume está pensando...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: "flex", gap: 6, paddingTop: 8, borderTop: "1px solid #e5e7eb" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isLoggedIn ? "Pergunte algo sobre energia..." : "Faça login para conversar"}
              disabled={loading || !isLoggedIn}
              style={{
                flex: 1,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim() || !isLoggedIn}
              style={{
                background: "var(--color-primary, #22c55e)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 13,
                opacity: loading || !input.trim() || !isLoggedIn ? 0.5 : 1,
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        aria-label="Abrir Lume IA"
        className="lume-orb"
        type="button"
      >
        <span className="lume-motion-glow" aria-hidden="true" />
        <img src={lumeFloating} alt="Lume IA" />
      </button>
    </div>
  );
}
