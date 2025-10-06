"use client";

import { useEffect, useCallback, useState } from "react";
import { motion } from "motion/react";
import { Particles } from "@/components/ui/shadcn-io/particles";
import { GradientText } from "@/components/ui/shadcn-io/gradient-text";

declare global {
  interface Window {
    Flourish?: { init?: () => void };
  }
}

// Add simple CountUp component
function CountUp({ end, duration = 1.5 }: { end: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const total = duration * 1000;
    const animate = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / total, 1);
      setVal(Math.round(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return <span>{val.toLocaleString("nl-NL")}</span>;
}

export default function HomePage() {
  useEffect(() => {
    if (!document.getElementById("flourish-script")) {
      const s = document.createElement("script");
      s.id = "flourish-script";
      s.src = "https://public.flourish.studio/resources/embed.js";
      s.async = true;
      s.onload = () => window.Flourish?.init?.();
      document.body.appendChild(s);
    } else {
      window.Flourish?.init?.();
    }
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Track which sections have been entered (fires once per section)
  const [entered, setEntered] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[data-watch='true']");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.id;
            setEntered((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
          }
        });
      },
      { threshold: 0.35 } // trigger early in the snap
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // ---- NEW: Active section -> dynamic shadow color on <main> ----
  const [activeSection, setActiveSection] = useState<string>("intro");

  // Color map per section (exact per jouw lijst)
  const sectionShadowColors: Record<string, string> = {
    intro: "#9fe0a1", // Roze
    "sect-1": "#f2e272", // Donkergroen
    "sect-2": "#d18f56", // Oranje
    "sect-3": "#9dc3eb", // Blauw
    "sect-4": "#9fe0a1", // Lichtgroen
  };
  // 9dc3eb blauw
  // Oranje d18f56
  // f2e272 lichtgeel
  // Bepaal welke section het meest zichtbaar is binnen de scrollcontainer (<main>)
  useEffect(() => {
    const main = document.querySelector<HTMLDivElement>("main[data-scroll-root='true']");
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-watch='true']"));
    if (!main || sections.length === 0) return;

    const computeActive = () => {
      let bestId = activeSection;
      let bestRatio = 0;

      const vh = main.clientHeight;

      sections.forEach((sec) => {
        const r = sec.getBoundingClientRect();
        const mainRect = main.getBoundingClientRect();

        // Intersectie binnen de main-viewport
        const top = Math.max(r.top, mainRect.top);
        const bottom = Math.min(r.bottom, mainRect.bottom);
        const visible = Math.max(0, bottom - top);
        const denom = Math.min(vh, r.height);
        const ratio = denom > 0 ? visible / denom : 0;

        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = sec.id;
        }
      });

      if (bestId !== activeSection) setActiveSection(bestId);
    };

    // Init & on scroll (passive)
    computeActive();
    const onScroll = () => computeActive();
    main.addEventListener("scroll", onScroll, { passive: true });

    // Recompute on resize (layout shifts)
    const onResize = () => computeActive();
    window.addEventListener("resize", onResize);

    return () => {
      main.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [activeSection]);

  // Shared variants for tree growth
  type CubicBezier = [number, number, number, number];
  const baseEase: CubicBezier = [0.22, 0.8, 0.3, 1];
  const treeVariants = {
    hidden: { scaleY: 0, opacity: 0, y: 24 },
    visible: (custom: number) => ({
      scaleY: 1,
      opacity: 1,
      y: 0,
      transition: { duration: custom, ease: baseEase },
    }),
  };

  const currentShadowColor =
    sectionShadowColors[activeSection] ?? sectionShadowColors["intro"];

  return (
    <main
      data-scroll-root="true"
      className="
        relative h-screen overflow-y-scroll overflow-x-hidden
        scroll-smooth snap-y snap-mandatory no-scrollbar
      "
      // Inset vignette die soepel van kleur wisselt
      style={{
        // Gebruik 2 lagen voor iets meer 'gradient' gevoel aan de randen
        // (zelfde kleur, verschillende blur/spread levert al een zachte falloff op)
        boxShadow: `
          inset 0 0 1000px 0px ${currentShadowColor}
        `,
        transition: "box-shadow 400ms cubic-bezier(0.22, 0.8, 0.3, 1)",
        backgroundColor: "transparent",
      }}
    >
      {/* Intro */}
      <section
        id="intro"
        data-watch="true"
        className="snap-start relative min-h-screen flex flex-col justify-center"
      >
        <Particles
          className="absolute inset-0"
          quantity={50}
          ease={160}
          staticity={20}
          color="#008000"
        />
        <div className="relative z-10 p-8 mx-auto max-w-5xl md:max-w-5xl">
          <GradientText text="Een eeuw aan aanplant:&nbsp;" className="text-2xl font-bold" />
          <h1 className="text-4xl md:text-3xl font-bold">
            Hoe de boompopulatie van Amsterdam groeide en veranderd is
          </h1>
          <p className="mt-6 text-base md:text-lg">
            De Amsterdamse bomen vertellen een verhaal van groei, verjonging en verandering.
            Van de eerste stadsaanplantingen tot hedendaagse vergroening: elke periode liet een eigen stempel achter.
            Deze visualisatie brengt een eeuw aan stadsnatuur in beeld — hoe duizenden bomen samen het groene karakter van Amsterdam vormen.
          </p>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
            <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-green-200 p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-800">
                <CountUp end={263459} duration={1} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-green-700 font-medium">
                Geregistreerde bomen
              </div>
            </div>
            <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-green-200 p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-800">
                <CountUp end={1646} duration={1.2} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-green-700 font-medium">
                Unieke (sub)soorten
              </div>
            </div>
            <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-green-200 p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-800">
                <CountUp end={39815} duration={1.4} /> iepen
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-green-700 font-medium">
                Meest aangelegde boom
              </div>
            </div>
          </div>

          <button
            onClick={() => scrollTo("sect-1")}
            className="mt-8 inline-flex items-center text-green-700 hover:text-green-900 hover:underline cursor-pointer font-bold text-md"
          >
            Scroll naar beneden en ontdek hoe het Amsterdamse bomenbestand tot stand kwam. ↓
          </button>
        </div>
      </section>

      <div className="p-8 mx-auto max-w-5xl flex flex-col">
        {/* Section 1 */}
        <section
          id="sect-1"
          data-watch="true"
          className="snap-start relative min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0"
        >
          {/* Decorative branch (left with bounce) */}
          <motion.img
            src="/branch.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none hidden sm:block absolute left-0 top-[10%] -translate-x-3/3 h-[20vh] w-auto opacity-80 origin-left"
            initial={{ y: -12, rotate: -2, scaleY: 1 }}
            whileInView={{ y: [-12, 8, -4, 0], rotate: [-2, 1, -0.5, 0], scaleY: [1, 0.95, 1.02, 1] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.6 }}
          />
          {/* Tree 1: triggers as soon as section is entered */}
          <motion.img
            src="/tree.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute bottom-0 left-[28%] -translate-x-1/2 h-[10vh] w-auto origin-bottom z-[2]"
            variants={treeVariants}
            initial="hidden"
            animate={entered["sect-1"] ? "visible" : "hidden"}
            custom={0.9} // duration
            style={{ transformOrigin: "bottom center" }}
          />
          <motion.div
            className="md:w-2/5 w-full"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <h3 className="text-lg font-semibold">
              🌿 De boomsoorten van vandaag: wie domineren Amsterdam?
            </h3>
            <p className="mt-2 text-md leading-relaxed">
              Anno 2025 wordt het straatbeeld bepaald door een beperkt aantal soorten.
              De Iep, Linde en Esdoorn vormen samen de kern van het stedelijke bomenbestand, terwijl tientallen kleinere soorten slechts op de achtergrond voorkomen.
              Deze verdeling laat zien hoe sterk enkele robuuste stadsbomen de groene identiteit van Amsterdam dragen.
            </p>
            <button
              onClick={() => scrollTo("sect-2")}
              className="text-left mt-8 inline-flex items-center text-green-700 hover:text-green-900 hover:underline cursor-pointer font-bold text-sm"
            >
              Bekijk hoe deze populatie zich door de jaren heen ontwikkelde ↓
            </button>
          </motion.div>
          <motion.div
            className="md:w-3/5 w-full flex items-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <div className="flourish-wrapper w-full md:h-[500px] h-[250px]">
              <div
                className="flourish-embed flourish-chart !w-full"
                data-src="visualisation/25497732"
                data-width="100%"
                data-height="450"
                aria-label="Columns"
              />
            </div>
          </motion.div>
        </section>

        {/* Section 2 */}
        <section
          id="sect-2"
          data-watch="true"
          className="snap-start relative min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0"
        >
          {/* Decorative branch (right with bounce) */}
          <motion.img
            src="/branch2.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none hidden sm:block absolute right-0 top-[38%] translate-x-3/3 h-[28vh] w-auto opacity-80 origin-right"
            initial={{ y: -14, rotate: 2, scaleY: 1 }}
            whileInView={{ y: [-14, 10, -5, 0], rotate: [2, -1, 0.6, 0], scaleY: [1, 0.94, 1.03, 1] }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.6 }}
          />
          {/* Tree 2 */}
          <motion.img
            src="/tree2.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[15vh] w-auto origin-bottom z-[2]"
            variants={treeVariants}
            initial="hidden"
            animate={entered["sect-2"] ? "visible" : "hidden"}
            custom={0.95}
            style={{ transformOrigin: "bottom center" }}
          />

          <motion.div
            className="md:w-3/5 w-full flex items-center"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <div className="flourish-wrapper w-full md:h-[500px] h-[250px]">
              <div
                className="flourish-embed flourish-scatter !w-full"
                data-src="visualisation/25431619"
                data-width="100%"
                data-height="450"
                aria-label="Scatter"
              />
            </div>
          </motion.div>
          <motion.div
            className="md:w-2/5 w-full"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <h3 className="text-lg font-semibold">
              {/* Wat verdelt de dikte van een stam over de leeftijd van een boom? */}
              🍂 Hoe veranderden bomen door de tijd?
            </h3>
            <p className="mt-2 text-md leading-relaxed">
              Elk punt staat voor een gemiddelde aanplant per jaar met stamdiameter op de verticale as en jaartal op de horizontale.
              De trend laat zien dat bomen door de decennia kleiner zijn geworden: jonger aangeplant, dichter op elkaar en aangepast aan een veranderende stedelijke omgeving.
              De kleur toont de hoogteklasse: van lage sierbomen tot hoge laanbomen.
            </p>
            <button
              onClick={() => scrollTo("sect-3")}
              className="text-left mt-8 inline-flex items-center text-green-700 hover:text-green-900 hover:underline cursor-pointer font-bold text-sm"
            >
              Zie vervolgens hoe de aanplant van soorten zich historisch ontwikkelde ↓
            </button>
          </motion.div>
        </section>

        {/* Section 3 */}
        <section
          id="sect-3"
          data-watch="true"
          className="snap-start relative min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0"
        >
          {/* Decorative branch (left again with bounce) */}
          <motion.img
            src="/branch3.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none hidden sm:block absolute left-0 top-[55%] -translate-x-1/3 h-[20vh] w-auto opacity-80 scale-x-[-1] origin-left z-[5]"
            initial={{ y: -10, rotate: -1.5, scaleY: 1 }}
            whileInView={{ y: [-10, 7, -3, 0], rotate: [-1.5, 0.8, -0.4, 0], scaleY: [1, 0.96, 1.02, 1] }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.55 }}
          />
          {/* Tree 3 */}
          <motion.img
            src="/tree3.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute bottom-0 left-[72%] -translate-x-1/2 h-[20vh] w-auto origin-bottom z-[2]"
            variants={treeVariants}
            initial="hidden"
            animate={entered["sect-3"] ? "visible" : "hidden"}
            custom={1.0}
            style={{ transformOrigin: "bottom center" }}
          />
          <motion.div
            className="md:w-2/5 w-full"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <h3 className="text-lg font-semibold">
              {/* Wanneer plantte de stad de meeste bomen? */}
              🌳 Van Iep tot Esdoorn: hoe Amsterdam groeide met zijn bomen
            </h3>
            <p className="mt-2 text-md leading-relaxed">
              Deze grafiek toont de groei van de acht meest aangeplante boomsoorten tussen 1930 en 2025.
              De Iep en Linde domineren al sinds de wederopbouw, terwijl de Esdoorn en Plataan vooral na 1970 sterk toenemen.
              Samen vormen ze het skelet van het huidige stadsbos — een levend archief van bijna een eeuw stedelijke vergroening.
            </p>
            <button
              onClick={() => scrollTo("intro")}
              className="mt-8 inline-flex items-center text-green-700 hover:text-green-900 hover:underline cursor-pointer font-bold text-sm"
            >
              Verder ↓
            </button>
          </motion.div>
          <motion.div
            className="md:w-3/5 w-full flex items-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <div className="flourish-wrapper w-full md:h-[500px] h-[250px]">
              <div
                className="flourish-embed flourish-hierarchy !w-full"
                data-src="visualisation/25497588"
                data-width="100%"
                data-height="450"
                aria-label="Sunburst"
              />
            </div>
          </motion.div>
        </section>

        {/* Section 4 / Finale */}
        <section
          id="sect-4"
          data-watch="true"
          className="snap-start relative min-h-screen flex flex-col justify-center gap-8 pt-16 md:pt-0"
        >
          {/* Re-use ORIGINAL branch sizes/positions + bounce, all visible together */}
          <motion.img
            src="/branch.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none hidden sm:block absolute left-0 top-[10%] -translate-x-3/3 h-[20vh] w-auto opacity-80 origin-left"
            initial={{ y: -12, rotate: -2, scaleY: 1 }}
            animate={
              entered["sect-4"]
                ? { y: [-12, 8, -4, 0], rotate: [-2, 1, -0.5, 0], scaleY: [1, 0.95, 1.02, 1] }
                : {}
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.img
            src="/branch2.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none hidden sm:block absolute right-0 top-[28%] translate-x-3/3 h-[28vh] w-auto opacity-80 origin-right"
            initial={{ y: -14, rotate: 2, scaleY: 1 }}
            animate={
              entered["sect-4"]
                ? { y: [-14, 10, -5, 0], rotate: [2, -1, 0.6, 0], scaleY: [1, 0.94, 1.03, 1] }
                : {}
            }
            transition={{ duration: 0.85, ease: "easeOut" }}
          />
          <motion.img
            src="/branch3.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none hidden sm:block absolute left-0 top-[60%] -translate-x-1/3 h-[20vh] w-auto opacity-80 scale-x-[-1] origin-left z-[5]"
            initial={{ y: -10, rotate: -1.5, scaleY: 1 }}
            animate={
              entered["sect-4"]
                ? { y: [-10, 7, -3, 0], rotate: [-1.5, 0.8, -0.4, 0], scaleY: [1, 0.96, 1.02, 1] }
                : {}
            }
            transition={{ duration: 0.75, ease: "easeOut" }}
          />

          {/* Trees with SAME positions & sizes as their original sections, re-animating growth */}
          <motion.img
            src="/tree.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute bottom-0 left-[28%] -translate-x-1/2 h-[10vh] w-auto origin-bottom z-[2]"
            variants={treeVariants}
            initial="hidden"
            animate={entered["sect-4"] ? "visible" : "hidden"}
            custom={0.9}
            style={{ transformOrigin: "bottom center" }}
          />
          <motion.img
            src="/tree2.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[15vh] w-auto origin-bottom z-[2]"
            variants={treeVariants}
            initial="hidden"
            animate={entered["sect-4"] ? "visible" : "hidden"}
            custom={0.95}
            style={{ transformOrigin: "bottom center" }}
          />
          <motion.img
            src="/tree3.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute bottom-0 left-[72%] -translate-x-1/2 h-[20vh] w-auto origin-bottom z-[2]"
            variants={treeVariants}
            initial="hidden"
            animate={entered["sect-4"] ? "visible" : "hidden"}
            custom={1.0}
            style={{ transformOrigin: "bottom center" }}
          />

          <div className="relative z-10 max-w-5xl px-8">
            <h3 className="text-xl md:text-2xl font-semibold">🌱 Tot slot</h3>
            <p className="mt-4 text-md md:text-lg leading-relaxed">
              Een eeuw aan aanplant laat zien hoe dynamisch stedelijke natuur kan zijn.
              Amsterdam veranderde niet alleen in bebouwing, maar ook in groenstructuur: nieuwe soorten, jongere bomen, andere hoogtes.
              Deze visualisatie bundelt die ontwikkeling in één groeiend verhaal — van wortel tot kruin.
              Dank voor het meeklimmen.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
