"use client";
import { useEffect, useCallback } from "react";
import { Particles } from "@/components/ui/shadcn-io/particles";
import { GradientText } from "@/components/ui/shadcn-io/gradient-text";
import { motion } from "motion/react";

// Add a global type instead of using 'any'
declare global {
  interface Window {
    Flourish?: {
      init?: () => void;
    };
  }
}

export default function HomePage() {
  useEffect(() => {
    if (!document.getElementById("flourish-script")) {
      const s = document.createElement("script");
      s.id = "flourish-script";
      s.src = "https://public.flourish.studio/resources/embed.js";
      s.async = true;
      s.onload = () => window.Flourish?.init?.(); // safe optional chain
      document.body.appendChild(s);
    } else {
      window.Flourish?.init?.(); // safe optional chain
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
    <main className="h-screen overflow-y-scroll overflow-x-hidden scroll-smooth snap-y snap-mandatory no-scrollbar">
      <section id="intro" className="snap-start relative min-h-screen flex flex-col justify-center">
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={160}       
          staticity={90}    
          color="#008000"
          size={1.25}
        />
        <div className="relative z-10 p-8 mx-auto max-w-5xl md:max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-bold">
            <GradientText text="Bomen&nbsp;" />
            in Amsterdam
          </h1>
          <p className="mt-6 text-base md:text-lg">
            De bomen van Amsterdam vormen een levend archief van keuzes, tradities en veranderingen. Met ruim 260.000 goed geregistreerde bomen krijgen we niet alleen inzicht in soorten en maten, maar ook in hoe de stad omgaat met haar groen.
          </p>
          <button
            onClick={() => scrollTo("sect-1")}
            className="mt-8 inline-flex items-center text-green-700 hover:text-green-900 hover:underline cursor-pointer font-bold text-md"
          >
            Dive in ↓
          </button>
        </div>
      </section>

      <div className="p-8 mx-auto max-w-5xl flex flex-col">
        {/* Section 1 */}
        <section id="sect-1" className="snap-start min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0">
          <motion.div
            className="md:w-2/5 w-full"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <h3 className="text-lg font-semibold">Hoe groot is het Amsterdamse bomenbestand?</h3>
            <p className="mt-2 text-sm leading-relaxed">
              De eerste vraag: hoe hoog zijn de bomen eigenlijk? De meeste bomen vallen in de middenklasse van 6 tot 15 meter, met pieken rond de 9–12 meter en 12–15 meter. Slechts een klein deel haalt de hoogste klassen van 24 meter en meer.
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
        <section id="sect-2" className="snap-start min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0">
          <motion.div
            className="md:w-2/5 w-full"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <h3 className="text-lg font-semibold">Wat verdelt de dikte van een stam over de leeftijd van een boom?</h3>
            <p className="mt-2 text-sm leading-relaxed">
              Hier zien we hoe de gemiddelde stamdiameter zich verhoudt tot het plantjaar. Oudere bomen hebben gemiddeld dikkere stammen.
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
        <section id="sect-3" className="snap-start min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0">
          <motion.div
            className="md:w-2/5 w-full"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <h3 className="text-lg font-semibold">Wanneer plantte de stad de meeste bomen?</h3>
            <p className="mt-2 text-sm leading-relaxed">
              De sunburst toont de zes jaren met de meeste aanplantingen. Sommige periodes waren echte plantgolven.
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
