"use client";

import { useZenStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, X, Sparkles, Zap, Brain, Timer, Flame, ArrowLeft, Shield, CreditCard } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// Only list features that ACTUALLY exist in the product (Lean: no false promises)
const features = [
  { text: "Hasta 5 tareas activas", free: true, pro: false },
  { text: "Tareas ilimitadas", free: false, pro: true, highlight: true },
  { text: "Auto-scheduling WSJF", free: true, pro: true },
  { text: "Bloques Pomodoro con breaks", free: false, pro: true, highlight: true },
  { text: "Zen Coach IA (3/día)", free: true, pro: false },
  { text: "Zen Coach IA ilimitado", free: false, pro: true, highlight: true },
  { text: "Focus Timer", free: true, pro: true },
  { text: "Focus Timer + vincular tareas", free: false, pro: true },
  { text: "Streaks y racha", free: true, pro: true },
  { text: "Analytics de productividad", free: true, pro: true },
];

export default function PricingPage() {
  const { tier, trackEvent } = useZenStore();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  useEffect(() => { trackEvent("pricingPageViews"); }, []);

  const monthlyPrice = 4.99;
  const yearlyPrice = 39.99;
  const yearlyMonthly = (yearlyPrice / 12).toFixed(2);
  const savings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ billingCycle }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.message || "Configura STRIPE_SECRET_KEY en .env.local");
    } catch { alert("Error al procesar."); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="Volver"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-text-1">Elige tu plan</h1>
          <p className="text-sm text-text-2 mt-0.5">Desbloquea todo el potencial de tu productividad</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={() => setBillingCycle("monthly")} className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer", billingCycle === "monthly" ? "bg-surface text-text-1 border border-border" : "text-text-3 hover:text-text-2")}>Mensual</button>
        <button onClick={() => setBillingCycle("yearly")} className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer relative", billingCycle === "yearly" ? "bg-surface text-text-1 border border-border" : "text-text-3 hover:text-text-2")}>
          Anual<Badge variant="accent" className="absolute -top-2.5 -right-8 text-[9px] px-1.5">-{savings}%</Badge>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card hover={false}>
          <div className="mb-6"><h2 className="text-lg font-bold text-text-1">Free</h2><p className="text-xs text-text-2 mt-1">Para empezar a organizar</p></div>
          <div className="mb-6"><span className="text-4xl font-bold text-text-1 tabular-nums">$0</span><span className="text-sm text-text-3 ml-1">/siempre</span></div>
          <Button variant="secondary" className="w-full mb-6" disabled={tier === "free"}>{tier === "free" ? "Plan actual" : "Cambiar a Free"}</Button>
          <div className="space-y-3">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-2.5">
                {f.free ? <Check className="w-4 h-4 text-accent flex-shrink-0" /> : <X className="w-4 h-4 text-text-3 flex-shrink-0" />}
                <span className={cn("text-sm", f.free ? "text-text-2" : "text-text-3")}>{f.text}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card hover={false} className="relative border-primary/20">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge variant="premium" className="shadow-sm shadow-primary/10"><Sparkles className="w-3 h-3" />Más popular</Badge></div>
          <div className="mb-6 mt-2"><h2 className="text-lg font-bold text-text-1 flex items-center gap-2">Pro<Sparkles className="w-4 h-4 text-primary" /></h2><p className="text-xs text-text-2 mt-1">Scheduling inteligente + IA</p></div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-text-1 tabular-nums">${billingCycle === "yearly" ? yearlyMonthly : monthlyPrice}</span><span className="text-sm text-text-3 ml-1">/mes</span>
            {billingCycle === "yearly" && <p className="text-xs text-accent mt-1">${yearlyPrice}/año</p>}
          </div>
          <Button className="w-full mb-6" onClick={handleCheckout} disabled={loading || tier === "pro"}>
            {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Procesando...</span> : tier === "pro" ? "Plan actual" : <><Zap className="w-4 h-4" />Upgrade a Pro</>}
          </Button>
          <div className="space-y-3">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-2.5">
                <Check className={cn("w-4 h-4 flex-shrink-0", f.highlight ? "text-primary" : "text-accent")} />
                <span className={cn("text-sm", f.highlight ? "text-text-1 font-semibold" : "text-text-2")}>{f.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 pb-8">
        <div className="flex items-center gap-2 text-xs text-text-3"><Shield className="w-4 h-4" /><span>Cancela cuando quieras</span></div>
        <div className="flex items-center gap-2 text-xs text-text-3"><CreditCard className="w-4 h-4" /><span>Pago seguro con Stripe</span></div>
        <div className="flex items-center gap-2 text-xs text-text-3"><Zap className="w-4 h-4" /><span>Acceso inmediato</span></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FeatureHL icon={<Brain className="w-5 h-5 text-primary" />} title="IA que aprende de ti" desc="Coach con consejos personalizados, no genéricos" />
        <FeatureHL icon={<Timer className="w-5 h-5 text-accent" />} title="Pomodoro automático" desc="Bloques de 50min con descansos integrados" />
        <FeatureHL icon={<Flame className="w-5 h-5 text-warning" />} title="Energy-aware" desc="Tareas difíciles en tus horas de máxima energía" />
      </div>
    </div>
  );
}

function FeatureHL({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card hover={false} className="text-center p-6">
      <div className="w-10 h-10 rounded-xl bg-bg-subtle flex items-center justify-center mx-auto mb-3">{icon}</div>
      <h3 className="text-sm font-bold text-text-1 mb-1.5">{title}</h3>
      <p className="text-xs text-text-2 leading-relaxed">{desc}</p>
    </Card>
  );
}
