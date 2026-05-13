"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useRef } from "react";

/** Lettura floating — angoli, ultra leggera. */
const FLOAT_READINGS = [
  { corner: "tl" as const, key: "Hydration", value: "78%", coord: "H₂O · 0.18" },
  { corner: "bl" as const, key: "Muscle", value: "24.2kg", coord: "FFM · 0.09" },
  { corner: "tr" as const, key: "BMR", value: "1420", coord: "EE · 1.42" },
  { corner: "br" as const, key: "Balance", value: "88/100", coord: "IDX · 0.88" }
];

function HologramAmbientHud({ inView, reduced }: { inView: boolean; reduced: boolean }) {
  return (
    <div className="bia-holo-float-layer">
      {FLOAT_READINGS.map((r, i) => (
        <motion.div
          key={r.corner}
          className={`bia-holo-float bia-holo-float--${r.corner}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{
            duration: reduced ? 0.35 : 1.15,
            delay: reduced ? 0 : 0.14 + i * 0.06,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <span className="bia-holo-float__pulse" aria-hidden />
          <span className="bia-holo-float__hair" aria-hidden />
          <div className="bia-holo-float__stack">
            <span className="bia-holo-float__coord">{r.coord}</span>
            <span className="bia-holo-float__key">{r.key}</span>
            <span className="bia-holo-float__val">{r.value}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** Marker e coordinate quasi invisibili — periferia del campo. */
function HologramNanoLayer() {
  return (
    <div className="bia-holo-nano" aria-hidden>
      <span className="bia-holo-nano__dot bia-holo-nano__dot--1" />
      <span className="bia-holo-nano__dot bia-holo-nano__dot--2" />
      <span className="bia-holo-nano__dot bia-holo-nano__dot--3" />
      <span className="bia-holo-nano__tick bia-holo-nano__tick--1" />
      <span className="bia-holo-nano__tick bia-holo-nano__tick--2" />
      <span className="bia-holo-nano__coord bia-holo-nano__coord--l">X −012 · Y +044</span>
      <span className="bia-holo-nano__coord bia-holo-nano__coord--r">Z +008 · W −003</span>
    </div>
  );
}

function HologramDecorArt() {
  const gid = useId().replace(/:/g, "");
  const gradId = `biaHoloEdge-${gid}`;

  return (
    <div className="bia-hologram-void-decor pointer-events-none" aria-hidden>
      <div className="bia-holo-scan-streaks" />
      <svg className="bia-hologram-void-edge-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(140,200,190,0)" />
            <stop offset="50%" stopColor="rgba(140,200,190,0.06)" />
            <stop offset="100%" stopColor="rgba(140,200,190,0)" />
          </linearGradient>
        </defs>
        <line x1="0" y1="3.5" x2="100" y2="3.5" stroke={`url(#${gradId})`} strokeWidth="0.06" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="96.5" x2="100" y2="96.5" stroke={`url(#${gradId})`} strokeWidth="0.06" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="bia-holo-cine-scanlines" />
      <div className="bia-holo-mote-field" />
      <HologramNanoLayer />
    </div>
  );
}

export function BiaHologramVideo({
  prefersReducedMotion,
  hudInView = false
}: {
  prefersReducedMotion: boolean;
  hudInView?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rm = prefersReducedMotion ? "bia-hologram-void--reduced" : "";

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (prefersReducedMotion) {
      v.pause();
      v.currentTime = 0;
      return;
    }
    v.playbackRate = 0.8;
    const p = v.play();
    if (p) void p.catch(() => {});
  }, [prefersReducedMotion]);

  return (
    <div
      className={`bia-hologram-viewport bia-hologram-void relative isolate flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[inherit] ${rm}`}
    >
      <div className="bia-hologram-void-canvas absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="bia-hologram-void-techgrid pointer-events-none" aria-hidden />
        <div className="bia-hologram-void-noise pointer-events-none" aria-hidden />
        <div className="bia-hologram-void-volumetric-fog pointer-events-none" aria-hidden />
        <div className="bia-hologram-void-vignette pointer-events-none" aria-hidden />
        <div className="bia-hologram-void-field-bloom pointer-events-none" aria-hidden />
        <div className="bia-hologram-void-depth pointer-events-none" aria-hidden />
        <div className="bia-hologram-void-stage">
          <div className="bia-hologram-void-video-wrap">
            <div className="bia-hologram-void-back-bloom pointer-events-none" aria-hidden />
            <div className="bia-hologram-void-centre-halo pointer-events-none" aria-hidden />
            <div className="bia-hologram-void-foot-glow pointer-events-none" aria-hidden />
            <div className="bia-hologram-void-video-shell">
              <video
                ref={videoRef}
                className="bia-hologram-video-void"
                src="/videos/hologram.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-label="Scansione volumetrica olografica BIA"
              />
            </div>
          </div>
          <div className="bia-hologram-void-dust pointer-events-none" aria-hidden />
        </div>
        <div className="bia-hologram-void-scanHaze pointer-events-none" aria-hidden />
        <div className="bia-hologram-void-scanSweep pointer-events-none" aria-hidden />
        <div className="bia-hologram-void-sheen bia-hologram-void-sheen--rim pointer-events-none" aria-hidden />
      </div>

      <div className="bia-hologram-void-cornerFrame pointer-events-none" aria-hidden>
        <span className="bia-hologram-void-corner bia-hologram-void-corner--tl" />
        <span className="bia-hologram-void-corner bia-hologram-void-corner--tr" />
        <span className="bia-hologram-void-corner bia-hologram-void-corner--bl" />
        <span className="bia-hologram-void-corner bia-hologram-void-corner--br" />
      </div>

      <HologramDecorArt />
      <HologramAmbientHud inView={hudInView} reduced={Boolean(prefersReducedMotion)} />
    </div>
  );
}
