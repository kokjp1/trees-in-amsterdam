"use client";

import { useEffect, useCallback, useState } from "react";
import { Particles } from "@/components/ui/shadcn-io/particles";
import { GradientText } from "@/components/ui/shadcn-io/gradient-text";
import { motion } from "motion/react";

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

  return (
    <main
      className="
        relative h-screen overflow-y-scroll overflow-x-hidden
        scroll-smooth snap-y snap-mandatory no-scrollbar
        bg-[radial-gradient(circle_at_center,#fff_0%,#fff_20%,#fff_35%,#e4f5ea_100%)]
        transition-colors
      "
    >     {/* Intro */}
      <section
        id="intro"
        data-watch="true"
        className="snap-start relative min-h-screen flex flex-col justify-center"
      >
        <Particles
          className="absolute inset-0"
          quantity={50}
          ease={160}
          staticity={90}
          color="#008000"
        />
        <div className="relative z-10 p-8 mx-auto max-w-5xl md:max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-bold">
            <GradientText text="Bomen&nbsp;" />
            in Amsterdam
          </h1>
          <p className="mt-6 text-base md:text-lg">
            {/* De bomen van Amsterdam vormen een levend archief van keuzes, tradities en veranderingen. Met ruim 260.000 goed geregistreerde bomen krijgen we niet alleen inzicht in soorten en maten, maar ook in hoe de stad omgaat met haar groen. */}
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
          </p>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
            <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-green-200 p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-800">
                <CountUp end={263459} duration={2} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-green-700 font-medium">
                Geregistreerde bomen
              </div>
            </div>
            <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-green-200 p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-800">
                <CountUp end={1646} duration={1.8} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-green-700 font-medium">
                Unieke (sub)soorten
              </div>
            </div>
            <div className="rounded-lg bg-white/60 backdrop-blur-sm border border-green-200 p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-800">
                <CountUp end={39815} duration={1.6} /> iepen
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
            Klim de boom in ↓
          </button>
        </div>
      </section>

      <div className="p-8 mx-auto max-w-5xl flex flex-col">
        {/* Section 1 */}
        <section
          id="sect-1"
          data-watch="true"
          className="snap-start min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0"
        >
          <motion.div
            className="md:w-2/5 w-full"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <h3 className="text-lg font-semibold">
              {/* Hoe groot is het Amsterdamse bomenbestand? */}
              Column chart over de hoogtes van bomen
              </h3>
            <p className="mt-2 text-sm leading-relaxed">
              {/* De eerste vraag: hoe hoog zijn de bomen eigenlijk? De meeste bomen vallen in de middenklasse van 6 tot 15 meter, met pieken rond de 9–12 meter en 12–15 meter. Slechts een klein deel haalt de hoogste klassen van 24 meter en meer. */}
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
            <button
              onClick={() => scrollTo("sect-2")}
              className="mt-8 inline-flex items-center text-green-700 hover:text-green-900 hover:underline cursor-pointer font-bold text-sm"
            >
              Volgende ↓
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
                data-src="visualisation/25447580"
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
            className="snap-start min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0"
        >
          <motion.div
            className="md:w-2/5 w-full"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <h3 className="text-lg font-semibold">
              {/* Wat verdelt de dikte van een stam over de leeftijd van een boom? */}
              Scatterplot over Stamdiameter
              </h3>
            <p className="mt-2 text-sm leading-relaxed">
              {/* Hier zien we hoe de gemiddelde stamdiameter zich verhoudt tot het plantjaar. Oudere bomen hebben gemiddeld dikkere stammen. */}
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
            <button
              onClick={() => scrollTo("sect-3")}
              className="mt-8 inline-flex items-center text-green-700 hover:text-green-900 hover:underline cursor-pointer font-bold text-sm"
            >
              Volgende ↓
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
                className="flourish-embed flourish-scatter !w-full"
                data-src="visualisation/25431619"
                data-width="100%"
                data-height="450"
                aria-label="Scatter"
              />
            </div>
          </motion.div>
        </section>

        {/* Section 3 */}
        <section
          id="sect-3"
          data-watch="true"
          className="snap-start min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0"
        >
          <motion.div
            className="md:w-2/5 w-full"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <h3 className="text-lg font-semibold">
              {/* Wanneer plantte de stad de meeste bomen? */}
              Sunburst Diagram over aanleggingen
              </h3>
            <p className="mt-2 text-sm leading-relaxed">
              De sunburst toont de zes jaren met de meeste aanplantingen. Sommige periodes waren echte plantgolven.
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
            <button
              onClick={() => scrollTo("intro")}
              className="mt-8 inline-flex items-center text-green-700 hover:text-green-900 hover:underline cursor-pointer font-bold text-sm"
            >
              Terug omhoog ↑
            </button>
          </motion.div>
          <motion.div
            className="md:w-3/5 w-full flex items-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <div className="flourish-wrapper w-full md:h-[600px] h-[250px]">
              <div
                className="flourish-embed flourish-hierarchy !w-full"
                data-src="visualisation/25429918"
                data-width="100%"
                data-height="450"
                aria-label="Sunburst"
              />
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
