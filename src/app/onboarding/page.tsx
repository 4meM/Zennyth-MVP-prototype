"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useZenStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, GraduationCap } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useZenStore();
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");

  const canContinue = name.trim().length >= 2;

  const handleContinue = () => {
    if (!canContinue) return;
    completeOnboarding(name.trim(), university.trim());
    router.push("/");
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-bg">
      <div className="w-full max-w-md animate-fade-in-up space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
            <Sparkles className="w-8 h-8 text-on-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text-1 tracking-tight">Zennyth</h1>
          <p className="text-text-2 text-sm mt-1.5">Tu asistente de productividad estudiantil</p>
        </div>

        <Card hover={false} className="space-y-5">
          <div className="text-center pb-2">
            <div className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-text-1">Cuéntanos sobre ti</h2>
            <p className="text-xs text-text-2 mt-1">Personalizamos tu experiencia</p>
          </div>

          <Input id="onboard-name" label="Tu nombre" placeholder="ej. Alex" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <Input id="onboard-university" label="Universidad (opcional)" placeholder="ej. UNAM, Tec de Monterrey" value={university} onChange={(e) => setUniversity(e.target.value)} />
          <Button onClick={handleContinue} disabled={!canContinue} size="lg" className="w-full">Comenzar<ArrowRight className="w-4 h-4" /></Button>
        </Card>

        <p className="text-center text-[11px] text-text-3">Tus datos se guardan localmente en tu navegador</p>
      </div>
    </div>
  );
}
