// FIX: scrollen op touchpad is veel gevoeliger dan een mouse scrollwheel moet een limit instellen

"use client";

import { useEffect, useCallback, useState } from "react";
import { motion } from "motion/react";
import { Particles } from "@/components/ui/shadcn-io/particles";
import { GradientText } from "@/components/ui/shadcn-io/gradient-text";
import { Button } from "@/components/ui/button";

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
  type SectionId = "intro" | "sect-1" | "sect-2" | "sect-3" | "sect-4";
  const [activeSection, setActiveSection] = useState<SectionId>("intro");

  // Helper to narrow arbitrary string to SectionId
  const isSectionId = (id: string): id is SectionId =>
    ["intro", "sect-1", "sect-2", "sect-3", "sect-4"].includes(id);

  // Color map per section
  const sectionShadowColors: Record<SectionId, string> = {
    intro: "#9fe0a1",
    "sect-1": "#f2e272",
    "sect-2": "#d18f56",
    "sect-3": "#9dc3eb",
    "sect-4": "#9fe0a1",
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
        const top = Math.max(r.top, mainRect.top);
        const bottom = Math.min(r.bottom, mainRect.bottom);
        const visible = Math.max(0, bottom - top);
        const denom = Math.min(vh, r.height);
        const ratio = denom > 0 ? visible / denom : 0;

        if (ratio > bestRatio && isSectionId(sec.id)) {
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

  // Graph navigation (triple cross) only on graph sections (typed – no any)
  const graphSections = ["sect-1", "sect-2", "sect-3"] as const;
  type GraphSection = typeof graphSections[number];
  const isGraphSection = (s: SectionId): s is GraphSection =>
    (graphSections as readonly string[]).includes(s);
  const showGraphNav = isGraphSection(activeSection);

  const [showSources, setShowSources] = useState(false); // NEW

  // Optional: close on ESC
  useEffect(() => {
    if (!showSources) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSources(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSources]);

  return (
    <main
      data-scroll-root="true"
      className="
      relative h-screen overflow-y-scroll overflow-x-hidden
      scroll-smooth snap-y snap-mandatory no-scrollbar
    "
      // Inset vignette die soepel van kleur wisselt
      style={{
        boxShadow: `
        inset 0 0 1000px 0px ${currentShadowColor}
      `,
        transition: "box-shadow 400ms cubic-bezier(0.22, 0.8, 0.3, 1)",
        backgroundColor: "transparent",
      }}
    >
      {/* Left side triple-cross nav (Amsterdam flag style) */}
      <motion.nav
        initial={{ opacity: 0, x: -12 }}
        animate={showGraphNav ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
        transition={{ duration: 0.3 }}
        aria-label="Navigatie secties"
        style={{ pointerEvents: showGraphNav ? "auto" : "none" }}
        className="hidden md:flex flex-col fixed left-4 top-1/2 -translate-y-1/2 z-50"
      >
        {graphSections.map((id, idx) => {
          const active = activeSection === id;
          // Active = thick red rotated plus, inactive = black
          const color = active ? "#d60000" : "#000000";
          return (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              aria-current={active ? "true" : "false"}
              aria-label={`Ga naar grafiek sectie ${idx + 1}`}
              className={`
              group relative w-16 h-16 rounded-lg flex items-center justify-center
              transition               
`}
            >
              {/* Rotated plus (forms an X visually) */}
              <span
                className={`
                relative block w-10 h-10 rotate-45
                ${active ? "scale-110" : "opacity-70 group-hover:opacity-90"}
                transition
              `}
                aria-hidden="true"
              >
                {/* Horizontal bar */}
                <span
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span
                    className="block rounded-sm"
                    style={{
                      backgroundColor: color,
                      width: "100%",
                      height: "26%",
                    }}
                  />
                </span>
                {/* Vertical bar */}
                <span
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span
                    className="block rounded-sm"
                    style={{
                      backgroundColor: color,
                      height: "100%",
                      width: "26%",
                    }}
                  />
                </span>
              </span>
            </button>
          );
        })}
      </motion.nav>

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
          <h1 className="text-2xl md:text-3xl font-bold">
            Hoe groeide en ontstond de bomenpopulatie van Amsterdam in samenstelling tussen 1930 en 2025?
          </h1>
          <p className="mt-6 text-base md:text-lg">
            Het amsterdamse bomenbestand is ontzettend uitgebreid en divers. Er staan talloze verschillende soorten en subsoorten door de hele stad.
            Maar hoe is deze populatie door de jaren heen ontstaan? En zijn er bepaalde dingen die opvallen als we de bomen populatie van Amsterdam onder
            de loep nemen? Deze pagina brengt een eeuw aan stadsnatuur in beeld.
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
            className="mt-8 inline-flex items-center text-green-700 hover:text-green-900 hover:underline cursor-pointer font-bold md:text-base text-sm"
          >
            Scroll naar beneden en ontdek het Amsterdamse bomenbestand ↓
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
              🌿 De boomsoorten van vandaag: hoe is het verdeeld in Amsterdam?
            </h3>
            <p className="mt-2 text-md leading-relaxed">
              Om de bomenpopulatie van Amsterdam te begrijpen, is het belangrijk om te kijken naar de huidige samenstelling. Deze <u>treemap</u> is opgedeeld
              in drie delen gebasseerd op de hoeveelheid bomen per soort in 2025. Uit deze visualisatie blijkt overduidelijk dat er een paar soorten de
              bomenpopulatie van Amsterdam domineren. Het gaat hier om de Iep, Linde en Esdoorn. Verder zijn er nog een aantal soorten die een flinke bijdrage leveren aan de populatie zoals de Plataan, Eik, Populier en Es. Er is een logische verklaring voor de dominatie van deze 3 boomsoorten: Ze kunnen ontzettend goed tegen natte en droge weersomstandigheden en kunnen in veel soorten grond overleven
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
              🍂 Hoe zien de bomen eruit ten opzichte van hun aanplant jaar?
            </h3>
            <div className="mt-2 text-md leading-relaxed space-y-3">
              <p>
                Dit <u>scatterplot</u> toont drie dingen:
              </p>
              <ul className="my-3 list-disc list-inside">
                <li>Stamdiameter (hoger = dikker)</li>
                <li>Aanlegjaar (links = ouder)</li>
                <li>Hoogteklasse (donkerder = hoger)</li>
              </ul>
              <p>
                Deze drie variabelen vormen samen een interessant diagram. Als je door je wimpers kijkt valt iets belangrijks op: hoe ouder de boom, hoe dikker en hoger. De stamdiameter zegt iets over de leeftijd van een boom — vergelijkbaar met jaarringen bij hout.
              </p>
            </div>
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
          className="snap-start relative min-h-screen flex flex-col gap-10 pt-32"
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

          {/* Wide text block now ABOVE the graphs */}
          <motion.div
            className="w-full max-w-5xl"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.35 }}
          >
            <h3 className="text-xl md:text-2xl font-semibold">
              🌳 De reuzen van de bomen populatie: hoe acht soorten Amsterdam opvulden
            </h3>
            <p className="mt-4 text-md leading-relaxed">
              Deze lijn­grafiek toont hoe de reuzen van de bomenpopulatie van Amsterdam groeide tussen 1930 en 2025.
              Een klein aantal soorten is verantwoordelijk voor het grootste deel van de totale groei. Hun succes is geen toeval: zoals eerder benoemd zijn ze robuust en goed bestand tegen stedelijke omstandigheden.
              Vanaf de jaren zeventig sloten de es en de esdoorn zich bij de koplopers.
              Deze interactieve kaart breidt de eerdere lijn­grafiek uit door de groei ruimtelijk te tonen. Elke stip vertegenwoordigt een boom uit de top 8 meest aangeplante soorten.
              Door de tijdlijn te verplaatsen/de animatie af te spelen, zie je hoe de stad massaal gevuld wordt. De binnenstad vol met iepen en lindes, terwijl de aanplant van de Es, Esdoorn en Eik bijvoorbeeld meer plaatsvind verder van het centrum.
            </p>
            <p className="mt-4 text-xs">
              💡Tip: klik op &quot;Log&quot; boven de grafiek om een duidelijker beeld te krijgen van het begin
            </p>
            <button
              onClick={() => scrollTo("intro")}
              className="mt-8 inline-flex items-center text-green-700 hover:text-green-900 hover:underline cursor-pointer font-bold text-sm"
            >
              Verder ↓
            </button>
          </motion.div>

          {/* TWO graphs side-by-side (stack on small screens) */}
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Graph A (original) */}
            <motion.div
              className="flourish-wrapper md:h-[460px] h-[300px]"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.4 }}
            >
              <div
                className="flourish-embed flourish-hierarchy !w-full"
                data-src="visualisation/25497588"
                data-width="100%"
                data-height="450"
                aria-label="Sunburst"
              />
            </motion.div>

            {/* Graph B (new) – replace data-src with your second Flourish visual ID */}
            <motion.div
              className="flourish-wrapper md:h-[460px] h-[300px]"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
              viewport={{ once: true, amount: 0.4 }}
            >
              <div
                className="flourish-embed flourish-chart !w-full"
                data-src="visualisation/25527747"  /* TODO: vervang met juiste tweede grafiek ID */
                data-width="100%"
                data-height="450"
                aria-label="Columns"
              />
            </motion.div>
          </div>
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
            <h3 className="text-xl md:text-2xl font-semibold">✨ Tot slot</h3>
            <p className="mt-4 text-md md:text-lg leading-relaxed">
              De Amsterdamse bomenpopulatie vertelt het verhaal van bijna een eeuw aan stedelijke vergroening.
              Samen schetsen deze visualisaties een kwantitatief, maar ook historisch beeld.</p>

            {/* Removed inline sources list; now opened via floating button */}
            <p className="mt-6 text-sm text-green-800">
              Bronnen raadplegen? Klik op de Bronnen knop rechtsonder.
            </p>
          </div>
        </section>
      </div>
      <div className="mt-12 border-t pt-6" aria-labelledby="credits-heading">
        <h2 id="credits-heading" className="text-lg font-semibold">Credits</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm leading-snug">
          <li>
            TAKKEN & BOMEN VECTORS: FREEPIK (https://www.freepik.com/)
          </li>
          <li>
            GRAFIEKEN EMBEDS: FLOURISH.STUDIO (https://flourish.studio/)
          </li>
          <li>
            FONTS: INTER (https://fonts.google.com/specimen/Inter)
          </li>
          <li>
            CODE MEDEGESCHREVEN MET CHATGPT-5
          </li>
        </ul>
        <p className="mt-4 text-xs text-neutral-500">
          Laatste controle: {new Date().getFullYear()} – Bij gebruik van deze visualisaties, vermeld alstublieft de bronnen.
        </p>
      </div>

      {/* Floating Bronnen button (shadcn Button) */}
      <Button
        type="button"
        onClick={() => setShowSources(true)}
        variant="default"
        size="sm"
        className="fixed z-[90] bottom-6 right-6 rounded-full shadow-lg shadow-green-800/30
                   hover:shadow-green-800/40 transition will-change-transform
                   bg-green-700 hover:bg-green-800 active:scale-95"
        aria-haspopup="dialog"
        aria-expanded={showSources ? 'true' : 'false'}
        aria-controls="sources-dialog"
      >
        Bronnen
      </Button>

      {/* Modal / dialog */}
      {showSources && (
        <div
          id="sources-dialog-wrapper"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSources(false)}
            aria-hidden="true"
          />
          <motion.div
            id="sources-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sources-heading"
            initial={{ y: 50, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 0.8, 0.3, 1] }}
            className="relative w-full sm:max-w-lg max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-xl
                       bg-background text-foreground shadow-xl border p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h4 id="sources-heading" className="text-lg font-semibold">Bronnen / Sources</h4>
              <Button
                onClick={() => setShowSources(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Sluit bronnen"
              >
                ✕
              </Button>
            </div>
            <ul className="mt-4 list-disc pl-6 space-y-2 text-sm leading-snug">
              <li>
                bomen — Amsterdam Datapunt API Documentatie. (z.d.).{' '}
                <a className="text-blue-600 underline" href="https://api.data.amsterdam.nl/v1/docs/datasets/bomen.html" target="_blank" rel="noopener noreferrer">
                  https://api.data.amsterdam.nl/v1/docs/datasets/bomen.html
                </a>
              </li>
              <li>
                De bomenkaart van gemeente Amsterdam. (z.d.).{' '}
                <a className="text-blue-600 underline" href="https://bomen.amsterdam.nl/" target="_blank" rel="noopener noreferrer">
                  https://bomen.amsterdam.nl/
                </a>
              </li>
              <li>
                Freepik (illustraties) - {' '}
                <a className="text-blue-600 underline" href="http://www.freepik.com/" target="_blank" rel="noopener noreferrer">
                  http://www.freepik.com/
                </a>
              </li>
              <li>
                OpenAI. 2025. ChatGPT sep-2025 [Large language model].{' '}
                <a className="text-blue-600 underline" href="chat.openai.com/chat" target="_blank" rel="noopener noreferrer">
                  chat.openai.com/chat
                </a>
              </li>
              <li>
                Van Marion, C. (2023, 12 april). Bomen in Amsterdam. BomenCampus.{' '}
                <a className="text-blue-600 underline" href="https://bomencampus.nl/bomen-in-amsterdam/" target="_blank" rel="noopener noreferrer">
                  https://bomencampus.nl/bomen-in-amsterdam/
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Samengesteld: September 2025
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSources(false)}
              >
                Sluiten
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

// OVERIGE CREDITS:

//  TAKKEN & BOMEN VECTORS: FREEPIK (https://www.freepik.com/)
//  GRAFIEKEN EMBEDS: FLOURISH.STUDIO (https://flourish.studio/)
//  FONTS: INTER (https://fonts.google.com/specimen/Inter)
//  CODE MEDEGESCHREVEN MET CHATGPT-5

//  BEVINDINGEN BEVESTIGEN: MEEST VOORKOMENDE BOOMSOORTEN
//  - https://bomencampus.nl/bomen-in-amsterdam/?utm_source=chatgpt.com
//  - https://bomenbieb.nl/geslachten/ulmus-iep/?_sfm_geslacht=457