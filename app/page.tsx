"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Activity, Brain, Leaf } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type ServiceIconKey = "nutrition" | "body" | "balance";

const services: { icon: ServiceIconKey; title: string; description: string }[] = [
  {
    icon: "nutrition",
    title: "Consiglio alimentare",
    description:
      "Linee guida pratiche e personalizzate per migliorare alimentazione, energia e benessere quotidiano."
  },
  {
    icon: "body",
    title: "Esame composizione corporea",
    description:
      "Valutazione professionale di massa magra, massa grassa e idratazione per impostare obiettivi precisi."
  },
  {
    icon: "balance",
    title: "Nutrizione chetogenica e intuitive eating",
    description:
      "Approccio clinico e flessibile per scegliere il metodo nutrizionale piu adatto al tuo stile di vita."
  }
];

const reasons = [
  "Personalizzazione totale",
  "Risultati reali e duraturi",
  "Monitoraggio preciso",
  "Educazione alimentare"
];

const clientResults = [
  {
    title: "Forma e costanza",
    subtitle: "-4 kg in 2 mesi",
    image: "/images/forma-costanza.jpg"
  },
  {
    title: "Energia e sonno",
    subtitle: "+qualità del riposo in 6 settimane",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Equilibrio alimentare",
    subtitle: "digestione e benessere quotidiano",
    image:
      "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Ricomposizione",
    subtitle: "-5% massa grassa · 3 mesi",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Abitudini sostenibili",
    subtitle: "percorso concluso con successo",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Benessere quotidiano",
    subtitle: "-3 kg · più energia",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80"
  }
];

const testimonials: { id: string; text: string; time: string }[] = [
  {
    id: "t1",
    text: "Comunque sei meglio di un lifting 😂",
    time: "09:41"
  },
  {
    id: "t2",
    text: "Ho cambiato faccia e ho gli occhi che si illuminano ✨",
    time: "10:03"
  },
  {
    id: "t3",
    text: "Sto riprendendo la mia autostima 💪",
    time: "11:27"
  },
  {
    id: "t4",
    text: "Non ci credevo… ma è successo davvero",
    time: "14:52"
  },
  {
    id: "t5",
    text: "Grazie mille per tutto ❤️",
    time: "18:16"
  }
];

const beforeAfterCase = {
  before:
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80",
  after:
    "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=1200&q=80"
};

const iconClass =
  "h-8 w-8 shrink-0 text-brand-primary [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.9))_drop-shadow(0_0_14px_rgba(255,255,255,0.45))]";

function ServiceIcon({ type }: { type: ServiceIconKey }) {
  const stroke = 2.75;

  if (type === "nutrition") {
    return <Leaf className={iconClass} strokeWidth={stroke} aria-hidden />;
  }

  if (type === "body") {
    return <Activity className={iconClass} strokeWidth={stroke} aria-hidden />;
  }

  return <Brain className={iconClass} strokeWidth={stroke} aria-hidden />;
}

const heroEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

function CursorFollowGlow() {
  useEffect(() => {
    const root = document.documentElement;
    let rafId = 0;
    let mx = 0;
    let my = 0;

    const flush = () => {
      rafId = 0;
      root.style.setProperty("--cursor-x", `${mx}px`);
      root.style.setProperty("--cursor-y", `${my}px`);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(flush);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <div className="cursor-follow-glow" aria-hidden />;
}

function CustomCursor() {
  useEffect(() => {
    const cursor = document.getElementById("cursor");
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;
    let clickTimeoutId: number | null = null;

    const move = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    const onPress = () => {
      cursor.classList.remove("is-loading");
      void cursor.offsetWidth;
      cursor.classList.add("is-loading");
      if (clickTimeoutId) window.clearTimeout(clickTimeoutId);
      clickTimeoutId = window.setTimeout(() => {
        cursor.classList.remove("is-loading");
        clickTimeoutId = null;
      }, 650);
    };
    const onBlur = () => {
      cursor.classList.remove("is-loading");
      if (clickTimeoutId) {
        window.clearTimeout(clickTimeoutId);
        clickTimeoutId = null;
      }
    };

    const animate = () => {
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;

      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", onPress);
    window.addEventListener("blur", onBlur);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", onPress);
      window.removeEventListener("blur", onBlur);
      if (clickTimeoutId) window.clearTimeout(clickTimeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}

function BeforeAfterSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const sliderX = useMotionValue(50);
  const smoothX = useSpring(sliderX, {
    stiffness: prefersReducedMotion ? 520 : 320,
    damping: prefersReducedMotion ? 90 : 38,
    mass: 0.3
  });

  const beforeClip = useTransform(smoothX, (value) => `inset(0 ${100 - value}% 0 0)`);
  const handleLeft = useTransform(smoothX, (value) => `${value}%`);

  const updateFromClientX = (clientX: number) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const clamped = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    sliderX.set((clamped / rect.width) * 100);
  };

  return (
    <div
      ref={sliderRef}
      className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/20 bg-white/5 shadow-[0_20px_54px_rgba(0,0,0,0.24)] md:aspect-[16/10]"
      onPointerDown={(event) => {
        isDraggingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        updateFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (!isDraggingRef.current) return;
        updateFromClientX(event.clientX);
      }}
      onPointerUp={(event) => {
        isDraggingRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerLeave={() => {
        isDraggingRef.current = false;
      }}
      style={{ touchAction: "none" }}
      aria-label="Confronto prima e dopo trascinabile"
      data-cursor="interactive"
    >
      <Image
        src={beforeAfterCase.after}
        alt="Risultato dopo il percorso nutrizionale"
        fill
        sizes="(min-width: 1024px) 960px, 100vw"
        className="object-cover"
      />
      <motion.div className="absolute inset-0" style={{ clipPath: beforeClip }}>
        <Image
          src={beforeAfterCase.before}
          alt="Situazione prima del percorso nutrizionale"
          fill
          sizes="(min-width: 1024px) 960px, 100vw"
          className="object-cover"
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark/35 via-transparent to-transparent" />

      <span className="absolute left-5 top-5 rounded-full bg-brand-dark/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
        Prima
      </span>
      <span className="absolute right-5 top-5 rounded-full bg-brand-dark/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
        Dopo
      </span>

      <motion.div
        className="pointer-events-none absolute bottom-0 top-0 w-px bg-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_18px_rgba(255,255,255,0.55)]"
        style={{ left: handleLeft }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/85 shadow-[0_10px_28px_rgba(0,0,0,0.25)]"
        style={{ left: handleLeft }}
      >
        <span className="absolute inset-0 flex items-center justify-center text-base font-semibold text-brand-dark">
          ↔
        </span>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const updateCardGlow = (event: React.MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--y", `${event.clientY - rect.top}px`);
  };

  const resetCardGlow = (event: React.MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;
    card.style.setProperty("--x", "50%");
    card.style.setProperty("--y", "50%");
  };

  useEffect(() => {
    if (!pageRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true
            }
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((container) => {
        const items = container.querySelectorAll(":scope > *");
        if (!items.length) return;
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: container,
              start: "top 86%",
              once: true
            }
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((layer) => {
        const amount = Number(layer.dataset.parallax ?? -8);
        gsap.to(layer, {
          yPercent: amount,
          ease: "none",
          scrollTrigger: {
            trigger: layer,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2
          }
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const nearPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 24;
      setShowScrollIndicator(!nearPageEnd);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main ref={pageRef} className="page-surface min-h-screen text-brand-canvas">
      <CustomCursor />
      <CursorFollowGlow />
      <nav className="navbar z-[70]">
        <div className="navbar-inner">
          <div className="logo">
            <span className="brand block text-sm font-semibold tracking-[0.12em] text-white">PROFORMA</span>
            <span className="sub block text-xs font-medium tracking-[0.08em] text-white/80">Nutrizione</span>
          </div>
          <div className="navbar-links flex items-center gap-5 text-xs font-medium uppercase tracking-[0.1em] text-white/90 md:gap-7">
            <a href="#services" className="transition hover:text-white">
              Servizi
            </a>
            <a href="#risultati" className="transition hover:text-white">
              Risultati
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contatti
            </a>
          </div>
        </div>
      </nav>
      <section data-reveal className="hero relative min-h-screen overflow-hidden px-5 pb-20 pt-[52px] md:px-12 md:pb-24 md:pt-[52px] lg:px-16 lg:pb-28 lg:pt-[52px]">
        <div className="hero-glow" aria-hidden />
        <div
          data-parallax="-10"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,252,248,0.06)_0%,transparent_32%)]"
        />
        <div
          data-parallax="-14"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_42%_at_50%_32%,rgba(255,252,248,0.07),transparent_68%)]"
        />

        <div
          data-parallax="-18"
          className="pointer-events-none absolute left-1/2 top-[40%] h-[min(88vh,680px)] w-[min(94vw,540px)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_52%_48%_at_50%_44%,rgba(255,252,248,0.14),rgba(255,252,248,0.04)_45%,transparent_72%)] blur-[2.75rem]"
          aria-hidden
        />
        <div className="pointer-events-none absolute left-10 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-green-300/10 blur-3xl" />
        <div className="pointer-events-none absolute right-6 top-24 h-40 w-40 animate-[float_6s_ease-in-out_infinite] rounded-full bg-white/10 blur-3xl md:right-12 md:top-20" />

        <div className="relative z-10 mx-auto min-h-screen max-w-5xl text-center">
          <div className="flex min-h-[calc(100vh-52px)] flex-col items-center justify-start pt-4 text-center md:items-start md:pt-6 md:text-left lg:min-h-screen lg:justify-start lg:pt-16 lg:translate-y-0">
          <motion.p
            className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white md:mb-6 md:text-[11px] md:tracking-[0.38em]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.05, ease: heroEase }}
          >
            Nutrizione
          </motion.p>

          <div className="mb-5 h-px w-16 bg-white/60 md:mb-6 md:w-full md:max-w-[4.5rem]" />

          <motion.h1
            className="hero-title mb-3 max-w-[18ch] cursor-pointer break-words text-4xl font-semibold leading-tight text-white md:text-6xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease: heroEase }}
            whileHover={{
              scale: 1.06,
              y: -4,
              textShadow: "0 16px 34px rgba(0, 0, 0, 0.28), 0 4px 12px rgba(0, 0, 0, 0.14)"
            }}
            whileTap={{ scale: 1.03 }}
            data-cursor="interactive"
          >
            Dott.ssa Valentina Trunfio
          </motion.h1>

          <motion.p
            className="mx-auto mb-4 max-w-2xl text-lg font-medium text-white/90 md:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease: heroEase }}
          >
            Consulente nutrizionale
          </motion.p>

          <motion.p
            className="mb-6 max-w-[600px] text-sm font-normal leading-[1.65] text-white md:text-[1.0625rem] md:leading-[1.75]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: heroEase }}
          >
            Percorsi personalizzati per risultati reali e duraturi.
          </motion.p>

          <motion.div
            className="mt-3 w-full md:w-auto"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.6, ease: heroEase }}
          >
            <a
              href="#contact"
              className="inline-flex rounded-full border border-white/40 px-10 py-4 text-white tracking-wide transition-all duration-300 hover:bg-white hover:text-green-900"
            >
              PRENOTA CONSULENZA
            </a>
          </motion.div>
          </div>
        </div>
        <a
          href="#services"
          className={`scroll-indicator ${showScrollIndicator ? "" : "is-hidden"}`}
          aria-label="Scorri alla sezione successiva"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7">
            <path
              d="M12 6v12m0 0-5-5m5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </section>

      <section id="services" data-reveal className="px-5 py-20 md:px-12 md:py-28 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-6xl space-y-10 md:space-y-14">
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">Services</h2>
          <div data-stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
            {services.map((service, index) => (
              <motion.article
                key={service.title}
                className="card group cursor-pointer rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/40 md:p-8 lg:p-9"
                initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.2, margin: "0px 0px -12% 0px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.13,
                  ease: [0.22, 1, 0.36, 1]
                }}
                onMouseMove={updateCardGlow}
                onMouseLeave={resetCardGlow}
                style={{
                  willChange: "transform, opacity, filter",
                  transform: "translateZ(0)",
                  "--x": "50%",
                  "--y": "50%"
                } as React.CSSProperties}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at var(--x) var(--y), rgba(63,175,122,0.2), transparent 40%)"
                  }}
                  aria-hidden
                />
                <div className="relative z-10">
                <div
                  className="mb-7 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-white to-brand-light text-brand-primary shadow-[0_12px_28px_rgba(30,70,52,0.16),0_0_0_1px_rgba(30,70,52,0.12),0_0_36px_rgba(200,220,205,0.65),0_0_56px_rgba(255,255,255,0.35),inset_0_1px_0_rgba(255,255,255,0.98)] ring-2 ring-brand-primary/22 transition duration-300 ease-out group-hover:scale-110 group-hover:shadow-[0_16px_38px_rgba(30,70,52,0.22),0_0_0_1px_rgba(30,70,52,0.14),0_0_48px_rgba(200,220,205,0.75),0_0_72px_rgba(255,255,255,0.4),inset_0_1px_0_rgba(255,255,255,1)]"
                  aria-hidden
                >
                  <ServiceIcon type={service.icon} />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-brand-dark md:text-2xl">{service.title}</h3>
                <p className="mt-3 text-sm font-normal leading-relaxed text-brand-dark md:mt-4 md:text-base">
                  {service.description}
                </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" data-reveal className="px-5 py-20 md:px-12 md:py-28 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-6xl space-y-10 md:space-y-14">
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">Perché scegliermi</h2>
          <div data-stagger className="mt-8 grid grid-cols-1 gap-5 md:mt-10 md:grid-cols-2 md:gap-6">
            {reasons.map((text, i) => (
              <motion.div
                key={text}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/20 bg-white/10 px-6 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-white/40"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-transparent to-green-500/20 opacity-0 transition duration-300 group-hover:opacity-100"
                  aria-hidden
                />
                <p className="relative text-white font-medium tracking-wide">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="risultati" data-reveal className="px-5 py-20 md:px-12 md:py-28 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-6xl space-y-10 md:space-y-14">
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">Risultati</h2>
          <p className="max-w-2xl text-sm font-normal leading-relaxed text-white md:text-lg">
            Alcuni esempi di percorsi: ogni risultato nasce da un piano personalizzato e un follow-up costante.
          </p>
          <BeforeAfterSlider />
          <div data-stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
            {clientResults.map((item, index) => (
              <article
                key={item.title}
                className="card group aspect-[3/4] bg-brand-dark/5 shadow-[0_8px_28px_rgba(30,70,52,0.08)] ring-1 ring-brand-primary/10"
                onMouseMove={updateCardGlow}
                onMouseLeave={resetCardGlow}
                style={{ "--x": "50%", "--y": "50%" } as React.CSSProperties}
              >
                <Image
                  src={item.image}
                  alt={`Risultato cliente — ${item.title}: ${item.subtitle}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  priority={index === 0}
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.06] group-hover:brightness-[1.08]"
                />
                <div
                  className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at var(--x) var(--y), rgba(63,175,122,0.2), transparent 40%)"
                  }}
                  aria-hidden
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/35 to-brand-dark/10" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                  <p className="text-base font-medium tracking-tight text-white md:text-xl">{item.title}</p>
                  <p className="mt-1.5 text-xs font-semibold tracking-wide text-white md:mt-2 md:text-[0.9375rem]">
                    {item.subtitle}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="testimonials"
        data-reveal
        className="px-5 py-20 md:px-12 md:py-28 lg:px-20 lg:py-32"
        aria-labelledby="testimonials-heading"
      >
        <div className="mx-auto max-w-lg space-y-8 md:max-w-xl md:space-y-10">
          <h2
            id="testimonials-heading"
            className="text-2xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl"
          >
            Testimonials
          </h2>

          <div
            className="panel-hover overflow-hidden rounded-[1.35rem] border border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.12)]"
            role="region"
            aria-label="Messaggi di ringraziamento, stile conversazione"
          >
            <div
              className="max-h-[min(72vh,560px)] space-y-1.5 overflow-y-auto bg-[#d6dfd8] px-3 py-4 md:space-y-2 md:px-4 md:py-5"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(31,92,69,0.08) 1px, transparent 0)",
                backgroundSize: "22px 22px"
              }}
            >
              {testimonials.map((msg, index) => {
                const fromLeft = index % 2 === 0;
                return (
                  <motion.div
                    key={msg.id}
                    className={`flex w-full ${fromLeft ? "justify-start" : "justify-end"}`}
                    initial={{ opacity: 0, x: fromLeft ? -36 : 36, y: 14 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.35, margin: "0px 0px -8% 0px" }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.09,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <blockquote
                      className={`max-w-[92%] bg-white px-3 pb-2 pt-2.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.06),0_2px_12px_rgba(30,70,52,0.08)] md:max-w-[82%] md:px-4 md:pb-2.5 md:pt-3 ${
                        fromLeft
                          ? "rounded-2xl rounded-bl-sm rounded-br-2xl rounded-tl-2xl rounded-tr-2xl"
                          : "rounded-2xl rounded-bl-2xl rounded-br-sm rounded-tl-2xl rounded-tr-2xl"
                      }`}
                    >
                      <p className="text-sm font-normal leading-snug text-[#1f2c24] md:text-base">
                        {msg.text}
                      </p>
                      <p
                        className="mt-1.5 text-right text-[11px] font-medium tabular-nums text-brand-primary/45 md:text-xs"
                        aria-label={`Inviato alle ${msg.time}`}
                      >
                        {msg.time}
                      </p>
                    </blockquote>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-sm font-medium leading-relaxed text-white/90">
            Messaggi reali dalle persone seguite nel percorso.
          </p>
        </div>
      </section>

      <section id="contact" data-reveal className="px-5 py-20 md:px-12 md:py-28 lg:px-20 lg:py-32">
        <div className="panel-hover mx-auto grid max-w-6xl gap-8 rounded-[2rem] border border-brand-accent/20 bg-white/[0.04] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.2)] md:grid-cols-2 md:gap-12 md:p-10 lg:p-14">
          <div className="space-y-6 md:space-y-7">
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">Contatti</h2>
            <p className="max-w-xl text-sm font-normal leading-relaxed text-white md:text-lg">
              Contattami per iniziare un percorso nutrizionale personalizzato, concreto e sostenibile.
            </p>
            <a
              href="#"
              className="inline-flex w-full justify-center rounded-full bg-brand-primary px-7 py-3 text-sm font-semibold text-brand-canvas transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [transition-property:background-color,box-shadow,transform] hover:scale-105 hover:bg-[#2c6a4e] hover:text-brand-canvas hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.18),0_0_36px_rgba(42,120,90,0.45)] active:scale-[0.97] md:w-auto"
            >
              Prenota la tua consulenza
            </a>
          </div>

          <div className="space-y-5 text-left md:space-y-6">
            <div className="panel-hover rounded-3xl border border-brand-accent/30 bg-white/[0.04] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.1)] md:p-6">
              <p id="contact-phone-label" className="text-xs uppercase tracking-[0.12em] text-brand-accent">
                Phone numbers
              </p>
              <ul className="mt-2 flex list-none flex-col gap-1 p-0" aria-labelledby="contact-phone-label">
                <li>
                  <a
                    href="tel:+393331234567"
                    className="cursor-pointer break-all text-base font-semibold text-white underline decoration-transparent underline-offset-4 transition hover:text-brand-accent hover:decoration-brand-accent md:text-lg"
                    aria-label="Chiama il cellulare +39 333 123 4567"
                  >
                    +39 333 123 4567
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+390212345678"
                    className="cursor-pointer break-all text-base font-semibold text-white underline decoration-transparent underline-offset-4 transition hover:text-brand-accent hover:decoration-brand-accent md:text-lg"
                    aria-label="Chiama la sede +39 02 1234 5678"
                  >
                    +39 02 1234 5678
                  </a>
                </li>
              </ul>
            </div>
            <div className="panel-hover rounded-3xl border border-brand-accent/30 bg-white/[0.04] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.1)] md:p-6">
              <p id="contact-instagram-label" className="text-xs uppercase tracking-[0.12em] text-brand-accent">
                Instagram
              </p>
              <a
                href="https://www.instagram.com/dott.ssa_valentina_trunfio/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block cursor-pointer break-all text-base font-semibold text-white underline decoration-transparent underline-offset-4 transition hover:text-brand-accent hover:decoration-brand-accent md:text-lg"
                aria-label="Apri il profilo Instagram @valentinatrunfio.nutrizione in una nuova scheda"
              >
                @valentinatrunfio.nutrizione
              </a>
            </div>
            <div className="panel-hover rounded-3xl border border-brand-accent/30 bg-white/[0.04] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.1)] md:p-6">
              <p id="contact-email-label" className="text-xs uppercase tracking-[0.12em] text-brand-accent">
                Email
              </p>
              <a
                href="mailto:info@valentinatrunfio.it"
                className="mt-2 inline-block cursor-pointer break-all text-base font-semibold text-white underline decoration-transparent underline-offset-4 transition hover:text-brand-accent hover:decoration-brand-accent md:text-lg"
                aria-label="Invia email a info@valentinatrunfio.it"
              >
                info@valentinatrunfio.it
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
