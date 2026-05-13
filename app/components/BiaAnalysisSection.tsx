"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Activity, ArrowUpRight, Droplets, Flame, Scale } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from "react";

import { BiaHologramVideo } from "./BiaHologramVideo";

const WHATSAPP_BIA = "https://wa.me/393494480633";

function useAnimatedNumber(target: number, enabled: boolean, duration = 1.35) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setValue(0);
      return;
    }
    const c = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(v)
    });
    return () => c.stop();
  }, [target, enabled, duration]);
  return value;
}

function MetricSpark({ gradientId }: { gradientId: string }) {
  return (
    <svg className="bia-apex-metric-spark mt-3 h-[38px] w-full" viewBox="0 0 140 38" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(110, 185, 175, 0.22)" />
          <stop offset="100%" stopColor="rgba(90, 155, 148, 0)" />
        </linearGradient>
      </defs>
      <line x1="0" y1="32" x2="140" y2="32" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      <motion.path
        d="M 0 28 L 22 24 L 44 26 L 66 16 L 88 20 L 110 12 L 140 10 L 140 32 L 0 32 Z"
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M 0 28 L 22 24 L 44 26 L 66 16 L 88 20 L 110 12 L 140 10"
        fill="none"
        stroke="rgba(165, 205, 198, 0.28)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.55, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

type MetricDef = {
  key: string;
  label: string;
  /** Testo statico se `animTarget` assente */
  value: string;
  suffix?: string;
  /** Valore da animare al mount (scroll) */
  animTarget?: number;
  /** Arrotondamento decimale per display animato */
  animDecimals?: number;
  sub: string;
  barPct: number;
  foot: string;
  icon: typeof Droplets;
};

const METRICS: MetricDef[] = [
  {
    key: "hydration",
    label: "Idratazione",
    value: "78",
    animTarget: 78,
    suffix: "%",
    sub: "Bilancio acque",
    barPct: 78,
    foot: "Bilancio idrico corporeo e stato di idratazione cellulare.",
    icon: Droplets
  },
  {
    key: "muscle",
    label: "Massa muscolare",
    value: "24.2",
    animTarget: 24.2,
    animDecimals: 1,
    suffix: " kg",
    sub: "Struttura magra",
    barPct: 72,
    foot: "Distribuzione stimata della massa magra e performance metabolica.",
    icon: Activity
  },
  {
    key: "metabolism",
    label: "Metabolismo",
    value: "1 420",
    animTarget: 1420,
    suffix: " kcal",
    sub: "Energia a riposo",
    barPct: 68,
    foot: "Stima energetica basale e consumo metabolico giornaliero.",
    icon: Flame
  },
  {
    key: "balance",
    label: "Equilibrio corporeo",
    value: "88",
    animTarget: 88,
    suffix: "/100",
    sub: "Proporzioni corporee",
    barPct: 88,
    foot: "Analisi della simmetria e armonia della composizione corporea.",
    icon: Scale
  }
];

function AnalysisMetricCard({
  m,
  index,
  gradientPrefix,
  inView
}: {
  m: MetricDef;
  index: number;
  gradientPrefix: string;
  inView: boolean;
}) {
  const Icon = m.icon;
  const gid = `${gradientPrefix}-spark-${m.key}`;
  const target = m.animTarget ?? 0;
  const hasAnim = m.animTarget != null;
  const animated = useAnimatedNumber(target, inView && hasAnim, 1.2 + index * 0.06);
  const decimals = m.animDecimals ?? 0;
  const displayMain = !hasAnim
    ? m.value
    : !inView
      ? m.value
      : m.key === "metabolism"
        ? Math.round(animated).toLocaleString("it-IT")
        : decimals > 0
          ? animated.toFixed(decimals)
          : Math.round(animated).toString();

  return (
    <motion.article
      className="bia-clinical-metric bia-apex-metric bia-apex-metric-dashboard group relative flex h-full min-h-0 min-w-0 flex-col rounded-[1.12rem] border border-white/[0.055] bg-[rgba(5,12,11,0.34)] p-[1.05rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.032)] backdrop-blur-xl transition-[border-color,box-shadow,transform,opacity] duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-5 md:p-5"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -2,
        scale: 1.01,
        transition: { type: "spring", stiffness: 420, damping: 36 }
      }}
    >
      <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-70" />
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-[0.65rem] border border-white/[0.06] bg-white/[0.025] text-cyan-200/45 shadow-none transition-colors duration-500 group-hover:text-cyan-100/55">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </span>
      </div>
      <h4 className="mt-3.5 text-[12px] font-medium tracking-[-0.01em] text-white/[0.88]">{m.label}</h4>
      <p className="mt-1.5 text-[11px] font-medium leading-snug tracking-wide text-white/42">{m.sub}</p>
      <p className="bia-clinical-metric-value bia-apex-metric-value mt-3 font-semibold tabular-nums tracking-[-0.03em] text-white/[0.94] [font-feature-settings:'tnum'_1] text-[1.58rem] leading-none sm:text-[1.75rem]">
        {displayMain}
        <span className="text-[0.88rem] font-medium text-white/45">{m.suffix}</span>
      </p>
      <MetricSpark gradientId={gid} />
      <div className="mt-2.5">
        <div className="mb-1 flex items-center justify-between gap-2 text-[9px] font-medium tracking-wide text-white/38">
          <span className="flex items-center gap-1.5">
            <span className="bia-apex-mini-pulse" aria-hidden />
            Rilevanza
          </span>
          <span className="tabular-nums text-cyan-200/40">{m.barPct}%</span>
        </div>
        <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="bia-apex-metric-bar-fill h-full rounded-full"
            initial={{ width: "0%" }}
            whileInView={{ width: `${m.barPct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.45, delay: 0.08 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
      <p className="mt-auto pt-3.5 text-[12px] leading-relaxed text-white/50 line-clamp-4">{m.foot}</p>
    </motion.article>
  );
}

function CompletionPanel({ inView }: { inView: boolean }) {
  const ringGradientId = useId().replace(/:/g, "");
  const progress = useAnimatedNumber(100, inView, 1.6);
  const dash = 2 * Math.PI * 36;
  const off = dash * (1 - progress / 100);

  return (
    <motion.div
      className="bia-clinical-completion bia-apex-completion bia-apex-panel-interactive group relative overflow-hidden rounded-[1.12rem] border border-white/[0.07] bg-[rgba(6,16,14,0.4)] px-5 py-4 backdrop-blur-xl md:px-6 md:py-5"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-teal-400/[0.06] blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
      <div className="relative flex flex-wrap items-start gap-5 md:gap-6">
        <div className="relative h-[88px] w-[88px] shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 88 88" aria-hidden>
            <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle
              cx="44"
              cy="44"
              r="36"
              fill="none"
              stroke={`url(#${ringGradientId})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={off}
            />
            <defs>
              <linearGradient id={ringGradientId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5eead4" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.35" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/38">Completezza</span>
            <span className="mt-0.5 text-lg font-semibold tabular-nums text-white md:text-xl">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-center gap-2.5 text-white">
            <span className="bia-apex-status-pulse" aria-hidden />
            <p className="text-[15px] font-semibold tracking-[-0.02em] md:text-base">Sintesi composizionale</p>
          </div>
          <p className="text-[12.5px] leading-relaxed text-white/60 md:text-[13px] md:leading-[1.58]">
            Integrazione dei parametri idrici, strutturali ed energetici per una lettura armonica della composizione corporea.
            I valori sono esemplificativi; interpretazione e piano nutrizionale in sede.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function BiaAnalysisSection() {
  const prefersReducedMotion = useReducedMotion();
  const metricsRef = useRef(null);
  const hologramViewportRef = useRef<HTMLDivElement>(null);
  const inView = useInView(metricsRef, { once: true, amount: 0.15 });
  const uid = useId().replace(/:/g, "");

  const onHologramPointer = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const el = hologramViewportRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / Math.max(r.width, 1)) * 100;
    const y = ((e.clientY - r.top) / Math.max(r.height, 1)) * 100;
    el.style.setProperty("--bia-vx", `${x}%`);
    el.style.setProperty("--bia-vy", `${y}%`);
  }, [prefersReducedMotion]);

  const onHologramLeave = useCallback(() => {
    const el = hologramViewportRef.current;
    if (!el) return;
    el.style.setProperty("--bia-vx", "50%");
    el.style.setProperty("--bia-vy", "50%");
  }, []);

  return (
    <section
      id="bia-analysis"
      data-reveal
      className="bia-apex-section relative w-full overflow-x-hidden px-4 py-6 sm:px-5 sm:py-7 md:px-6 md:py-8 lg:px-8 lg:py-9"
      aria-labelledby="bia-analysis-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_48%_at_50%_0%,rgba(45,200,170,0.05),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.22] bg-[linear-gradient(105deg,transparent_0%,rgba(0,28,24,0.12)_48%,transparent_72%)]" />

      <div className="relative z-[1] mx-auto w-full max-w-[min(1180px,100%)]">
        <motion.header
          className="mb-4 md:mb-5 lg:mb-6"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -6% 0px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-200/58">Composizione corporea</p>
          <h2
            id="bia-analysis-heading"
            className="mt-2.5 max-w-[22ch] text-balance text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl md:text-[2.05rem] md:leading-[1.06] lg:text-[2.2rem]"
          >
            BIA e tecnologie avanzate
          </h2>
          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-white/68 md:text-[15px] md:leading-[1.62]">
            Analisi volumetrica avanzata della composizione corporea tramite acquisizione multi-frequenza e visualizzazione clinica
            interattiva.
          </p>
        </motion.header>

        <div ref={metricsRef} className="bia-apex-dashboard-grid">
          <div className="bia-apex-left-stack min-h-0 min-w-0">
            <motion.div
              className="bia-apex-scan-card bia-apex-scan-shell relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[1.2rem] border border-white/[0.07]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent opacity-50" />
              <div className="pointer-events-none absolute inset-px rounded-[1.14rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />

              <div className="relative z-[4] flex flex-shrink-0 flex-col gap-0.5 px-4 pb-1 pt-3.5 md:px-5 md:pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/38">Acquisizione</p>
                <p className="text-sm font-semibold tracking-tight text-white md:text-[0.95rem]">Scansione volumetrica BIA</p>
              </div>

              <div className="relative z-[3] flex min-h-0 flex-1 flex-col justify-center px-2.5 py-2.5 md:px-4 md:py-4">
                <div
                  ref={hologramViewportRef}
                  className="bia-apex-viewport bia-apex-viewport--interactive bia-hologram-viewport-host relative mx-auto flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden rounded-[0.95rem] border border-white/[0.09] md:rounded-[1rem]"
                  onMouseMove={onHologramPointer}
                  onMouseLeave={onHologramLeave}
                >
                  <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col">
                    <BiaHologramVideo
                      prefersReducedMotion={Boolean(prefersReducedMotion)}
                      hudInView={inView}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bia-clinical-intro bia-apex-bia-intro bia-apex-panel-interactive rounded-[1.12rem] border border-white/[0.07] bg-[rgba(6,16,14,0.38)] px-5 py-4 backdrop-blur-xl md:rounded-[1.14rem] md:px-6 md:py-5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">Quadro clinico</p>
              <h3 className="mt-2 text-[1.15rem] font-semibold tracking-[-0.025em] text-white md:text-[1.28rem]">Analisi BIA avanzata</h3>
              <p className="mt-3 max-w-xl text-[13px] leading-[1.58] text-white/58 md:text-[14px] md:leading-[1.62]">
                Output clinico multidimensionale basato su bioimpedenza multi-frequenza.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Idratazione cellulare", "Massa magra", "Equilibrio metabolico", "Analisi segmentale"].map((label) => (
                  <span key={label} className="bia-apex-premium-badge rounded-full border px-3 py-1 text-[10px] tracking-wide">
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-white/42">Valori dimostrativi a scopo illustrativo.</p>
            </motion.div>

            <CompletionPanel inView={inView} />
          </div>

          <div className="bia-apex-right-metrics bia-apex-metric-rail bia-dash-rail min-h-0 min-w-0">
            <div className="bia-apex-metrics-grid">
              {METRICS.map((m, index) => (
                <AnalysisMetricCard key={m.key} m={m} index={index} gradientPrefix={uid} inView={inView} />
              ))}
            </div>
          </div>

          <div className="bia-apex-dashboard-foot">
            <div className="bia-apex-dashboard-foot__lead min-w-0 flex-1">
              <p className="bia-apex-dashboard-foot__bia text-[10px] font-semibold uppercase tracking-[0.32em] text-teal-200/55 md:text-[10.5px]">
                BIA
              </p>
              <p className="mt-2 text-[10.5px] leading-relaxed text-white/52 md:mt-2.5 md:text-[11px] md:leading-relaxed">
                Visualizzazione volumetrica e parametri di composizione a titolo esemplificativo.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <p className="max-w-[240px] text-[10.5px] leading-relaxed text-white/55 md:max-w-sm md:text-[11px]">
                Prenota in studio una misurazione BIA reale sulla tua composizione corporea.
              </p>
              <a
                href={WHATSAPP_BIA}
                target="_blank"
                rel="noopener noreferrer"
                className="bia-apex-cta bia-apex-cta--primary group/cta relative inline-flex items-center justify-center gap-2.5 self-start overflow-hidden rounded-full px-6 py-2.5 text-[13px] font-semibold tracking-wide text-white shadow-lg sm:self-center md:px-7 md:py-3 md:text-sm"
              >
                <span className="relative z-[2]">Prenota analisi</span>
                <ArrowUpRight
                  className="relative z-[2] h-4 w-4 shrink-0 opacity-90 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
