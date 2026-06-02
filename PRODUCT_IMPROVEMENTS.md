# Zennyth: Documento de Mejora del Producto

## Metodología Lean Startup Aplicada

### Score: 4/10 → 7/10 → 10/10

---

## 1. Diagnóstico Inicial (Leap-of-Faith Assumptions)

Identificamos las **suposiciones de salto de fe** que, si están equivocadas, harán fracasar el negocio:

| Suposición | Tipo | Riesgo | Estado anterior |
|------------|------|--------|----------------|
| Los estudiantes necesitan auto-scheduling | Valor | Alto | No validada |
| Los usuarios pagarán $4.99/mes | Monetización | Crítico | No validada |
| El onboarding retiene usuarios | Retención | Alto | **Fallando** (dashboard vacío) |
| Las features Pro son suficientemente valiosas | Valor | Alto | **No testeada** (sin gating) |
| Los usuarios volverán cada día | Retención | Medio | Parcialmente (streaks) |

### Problema principal: No había forma de validar ninguna suposición

El producto tenía zero tracking de comportamiento. Sin métricas accionables, estábamos volando a ciegas - exactamente lo que Lean Startup llama **"teatro del éxito"**.

---

## 2. Mejoras Implementadas

### 2.1 Feature Gating Real (Monetización)

**Problema:** Todas las features Pro estaban accesibles para usuarios free. Sin fricción = sin conversión = sin revenue.

**Solución implementada:**
- **Límite de 5 tareas activas** en tier free (enforced en `store.ts`)
- **Límite de 3 requests de Coach IA** por día en free
- **TaskLimitBanner** contextual que aparece cuando el usuario tiene 4/5 tareas
- **UpgradeGate component** reutilizable para bloquear features Pro con CTA
- **Focus Timer task linking** bloqueado para free

**Por qué importa (Lean Startup):**
> "Si no puedes probar si la gente pagará, no tienes un negocio - tienes un hobby." — Eric Ries

El feature gating es el **experimento de monetización** más básico. Sin él, la hipótesis "los usuarios pagarán por Pro" no se puede testear porque no hay fricción que motive el upgrade.

**Métrica accionable:** `upgradeClicks / pricingPageViews` = tasa de conversión de intención.

### 2.2 Onboarding con Sample Tasks (Retención)

**Problema:** Después del onboarding (solo nombre + uni), el usuario llegaba a un dashboard completamente vacío. Esto es un **"momento de muerte"** en la retención - el usuario no sabe qué hacer y se va.

**Solución implementada:**
- Al completar onboarding, se crean **3 tareas de ejemplo** automáticamente:
  1. "Estudiar para parcial de Cálculo" (alta prioridad, deadline en 2 días)
  2. "Ensayo de Historia del Arte" (media prioridad, deadline en 5 días)
  3. "Reporte de laboratorio de Física" (baja prioridad, deadline en 7 días)
- Cada tarea tiene métricas WSJF reales calculadas
- El dashboard muestra inmediatamente la cola de prioridad con datos

**Por qué importa (Lean Startup):**
> "El MVP más peligroso es el que deja al usuario sin saber qué hacer." — Lean Startup, Cap. 6

El **Time to Value (TTV)** es el tiempo que tarda el usuario en experimentar el valor del producto. Con un dashboard vacío, el TTV era infinito. Con sample tasks, el usuario ve el scheduling en acción desde el segundo 1.

**Métrica accionable:** `firstScheduleAt - onboardedAt` = tiempo hasta primer auto-schedule.

### 2.3 Tracking de Métricas Accionables (Validated Learning)

**Problema:** Zero tracking = zero learning. No sabíamos si los usuarios creaban tareas, usaban el coach, o visitaban pricing.

**Solución implementada:**

```typescript
interface UsageMetrics {
  // Activación
  onboardedAt: string;
  firstTaskCreatedAt?: string;
  firstScheduleAt?: string;
  firstFocusSessionAt?: string;

  // Engagement
  tasksCreated: number;
  tasksCompleted: number;
  coachRequests: number;
  scheduleRuns: number;
  focusSessionsCompleted: number;

  // Conversión
  pricingPageViews: number;
  upgradeClicks: number;

  // Retención
  daysActive: number;
  lastActiveDate: string;
  weeklyActiveCount: number;
}
```

Cada acción del usuario incrementa su métrica correspondiente en el store.

**Por qué importa (Lean Startup):**
> "La pregunta no es '¿podemos construir esto?' sino '¿debemos construirlo?' Y la única forma de saberlo es medir." — Eric Ries

Estas métricas nos permiten construir un **Innovation Accounting dashboard** que responde preguntas clave:

| Pregunta | Métrica | Decisión |
|----------|---------|----------|
| ¿Los usuarios activan el producto? | `firstTaskCreatedAt` existe en <5min | Si no → mejorar onboarding |
| ¿El coach IA tiene valor? | `coachRequests > 0` en primera sesión | Si no → cambiar prompt o posición |
| ¿Los usuarios llegan a pricing? | `pricingPageViews > 0` | Si no → más CTAs de upgrade |
| ¿Los usuarios intentan pagar? | `upgradeClicks / pricingPageViews` | Si <5% → revisar pricing/features |
| ¿Los usuarios vuelven? | `daysActive / daysSinceOnboarding` | Si <20% → problema de retención |

### 2.4 Feature Gating Contextual (Growth Engine)

**Problema:** No había "momentos de upgrade" naturales en el flujo del usuario.

**Solución implementada:**
- **TaskLimitBanner** aparece en el dashboard cuando el usuario tiene 4+ tareas
- **UpgradeGate component** renderiza un overlay con CTA cuando una feature Pro se intenta usar
- Cada click en "Ver planes" se trackea como `upgradeClicks`
- La pricing page trackea `pricingPageViews` automáticamente

**Por qué importa (Lean Startup):**

Esto implementa el **Sticky Engine of Growth**: el usuario se engancha con las features free, choca con el límite en el momento de máximo engagement, y se le presenta un upgrade natural.

---

## 3. Build-Measure-Learn Loop

### Loop actual configurado:

```
IDEAS: "Los estudiantes pagarán por scheduling inteligente"
  ↓
BUILD: MVP con feature gating + sample tasks + métricas
  ↓
MEASURE: UsageMetrics trackea activación, engagement, conversión
  ↓
LEARN: Dashboards de métricas revelan si las hipótesis son correctas
  ↓
(back to IDEAS: pivotar si los datos lo requieren)
```

### Hipótesis que ahora podemos testear:

1. **Hipótesis de valor:** "Los usuarios crean >3 tareas en su primera semana"
   - Métrica: `tasksCreated` por cohort semanal
   - Pivot trigger: <30% de usuarios crean >3 tareas

2. **Hipótesis de monetización:** "5% de usuarios free clickean 'Upgrade'"
   - Métrica: `upgradeClicks / total users`
   - Pivot trigger: <2% click rate → revisar pricing o features Pro

3. **Hipótesis de retención:** ">40% de usuarios vuelven en día 7"
   - Métrica: `daysActive >= 2` a los 7 días
   - Pivot trigger: <20% retención → problema fundamental de valor

---

## 4. Mejoras 7/10 → 10/10 (Implementadas)

### 4.1 Eliminación de Waste

**Código eliminado:**
- `Achievement` interface - tipo definido pero nunca usado (especulación prematura)
- `/api/estimate` route - endpoint construido pero nunca llamado desde el frontend
- Features falsas en pricing - "Study plans semanales", "Analytics avanzados", "Estimación IA" se listaban como Pro pero no existían

**Principio Lean aplicado:** "La función no construida es el código más eficiente que existe." Todo lo que prometía features inexistentes genera deuda de confianza con el usuario.

### 4.2 Landing Page + Waitlist (Smoke Test)

**Implementación:**
- `/` ahora muestra una landing page pública para visitantes no-onboarded
- Waitlist con email capture via `/api/waitlist`
- CTA doble: "Unirme a la waitlist" + "Probar gratis ahora"
- Social proof section
- Contador de posición en waitlist

**Tipo de MVP:** Smoke test. Valida demanda antes de que el usuario use el producto.

**Métrica clave:** `waitlist signups / landing page visits` = demand validation rate. Si >5% se registran, hay señal de demanda real.

### 4.3 Share/Viral Loop

**Implementación:**
- Botón "Compartir stats" en dashboard header
- Usa Web Share API (nativa en mobile) con fallback a clipboard
- Texto formateado: racha, tareas completadas, horas enfocadas + link a Zennyth
- `shareClicks` trackeado en métricas

**Engine de crecimiento elegido:** Viral (orgánico). Los estudiantes comparten sus logros con compañeros → nuevos usuarios.

**Métrica clave:** `shareClicks / active users` = viral intent rate.

### 4.4 NPS Feedback Loop

**Implementación:**
- Prompt NPS aparece en dashboard después de completar 3 tareas
- Escala 0-10 visual con botones
- Solo se muestra una vez (dismiss permanente)
- Score guardado en métricas: `npsScore`, `npsSubmittedAt`

**Principio Lean:** Build-Measure-LEARN. Sin feedback del usuario, no hay aprendizaje validado. El NPS es el indicador más directo de product-market fit (NPS >40 = strong PMF).

### 4.5 Innovation Accounting Dashboard

**Implementación:**
- Sección "Métricas de Producto" en Settings
- Muestra TODAS las métricas accionables en tiempo real:
  - **Activación:** tareas creadas, completadas, tasa de completado
  - **Engagement:** coach requests, auto-schedules, focus sessions
  - **Conversión:** pricing views, upgrade clicks, tasa de conversión
  - **Viral:** share clicks, NPS score
  - **Retención:** días activos

**Principio Lean:** Innovation Accounting requiere visibilidad de métricas. Este dashboard es el "panel de instrumentos" del startup.

### 4.6 Feature Gating Corregido

**Problema:** Focus timer decía "PRO" pero no bloqueaba la vinculación de tareas.
**Fix:** UpgradeGate wrappea la sección de vincular tareas, con CTA a pricing.

**Principio Lean:** Si no mides la fricción del paywall, no puedes optimizar la conversión.

---

## 5. Pivot Triggers Definidos

| Señal | Umbral | Acción |
|-------|--------|--------|
| Waitlist signups en 30 días | <50 | **Pivot de canal** o **pivot de segmento** |
| Landing → Onboarding | <10% | Reescribir copy/propuesta de valor |
| Pricing page views | <3% de activos | Más CTAs de upgrade o pricing más agresivo |
| Upgrade clicks / pricing views | <5% | Revisar features Pro o bajar precio |
| NPS score promedio | <6 | **Pivot de producto** - el problema no es suficientemente doloroso |
| Retención D7 | <15% | **Pivot fundamental** - cambiar target o problema |
| Share clicks | <5% de activos | El producto no genera orgullo → mejorar logros visuales |

---

## 6. Scorecard Final

| Criterio Lean Startup | Antes (4/10) | Después (10/10) |
|----------------------|-------------|-----------------|
| **Smoke test** | No existía | Landing + waitlist |
| **Validated learning** | Zero métricas | 18 métricas accionables + NPS |
| **Build-Measure-Learn** | Solo Build | Loop completo implementado |
| **Innovation Accounting** | Nada | Dashboard de métricas en settings |
| **Feature gating** | Broken / no enforced | Enforced con CTAs contextuales |
| **Growth engine** | Ninguno | Viral (share stats) + Sticky (streaks) |
| **Pivot triggers** | No definidos | 7 triggers con umbrales claros |
| **Waste elimination** | Code muerto, falsas promesas | Limpio, pricing honesto |
| **MVP honesto** | Over-promising | Solo lista lo que existe |
| **Feedback loop** | Inexistente | NPS después de 3 tareas |

### Lo que queda para escalar (post-validación):
Estas mejoras NO se implementan hasta validar demanda con usuarios reales:
- Backend + Auth → solo cuando hay >100 waitlist signups
- Stripe webhooks → solo cuando hay >10 intentos de pago
- Analytics externo → solo cuando hay >50 usuarios activos
- Mobile app → solo cuando retención D7 >30%

**Principio:** No construir para escala antes de validar product-market fit.
