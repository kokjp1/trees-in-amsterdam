"use client";
import { useEffect, useCallback } from "react";

export default function HomePage() {
  useEffect(() => {
    if (!document.getElementById("flourish-script")) {
      const s = document.createElement("script");
      s.id = "flourish-script";
      s.src = "https://public.flourish.studio/resources/embed.js";
      s.async = true;
      s.onload = () => (window as any).Flourish?.init();
      document.body.appendChild(s);
    } else {
      (window as any).Flourish?.init();
    }

    // Optional: prevent body from showing second scrollbar
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
      <div className="p-8 mx-auto max-w-5xl flex flex-col">
      {/* Intro */}
      <section id="intro" className="snap-start min-h-screen flex flex-col pt-20 md:pt-28">
        <div className="md:max-w-2xl">
            <h1 className="text-2xl font-semibold">Natuur in Nederland</h1>
            <p className="mt-4 text-zinc-600">Begin met het opbouwen van de pagina.</p>
            <button
              onClick={() => scrollTo("sect-1")}
              className="mt-6 inline-flex items-center text-xs font-medium text-blue-600 hover:underline"
            >
              Start ↓
            </button>
        </div>
      </section>

      {/* Section 1 */}
      <section
        id="sect-1"
        className="snap-start min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0"
      >
        <div className="md:w-2/5 w-full">
          <h3 className="text-lg font-semibold">Hoe groot is het Amsterdamse bomenbestand?</h3>
          <p className="mt-2 text-sm leading-relaxed">
            De eerste vraag: hoe hoog zijn de bomen eigenlijk? De meeste bomen vallen in de middenklasse van 6 tot 15 meter, met pieken
            rond de 9–12 meter en 12–15 meter. Slechts een klein deel haalt de hoogste klassen van 24 meter en meer.
          </p>
          <button
            onClick={() => scrollTo("sect-2")}
            className="mt-4 inline-flex items-center text-xs font-medium text-blue-600 hover:underline"
          >
            Volgende ↓
          </button>
        </div>
        <div className="md:w-3/5 w-full flex items-center">
          <div className="flourish-wrapper w-full md:h-[500px] h-[250px]">
            <div
              className="flourish-embed flourish-chart !w-full"
              data-src="visualisation/25447580"
              data-width="100%"
              data-height="450"
              aria-label="Columns"
            />
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section
        id="sect-2"
        className="snap-start min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0"
      >
        <div className="md:w-2/5 w-full">
          <h3 className="text-lg font-semibold">Wat verdelt de dikte van een stam over de leeftijd van een boom?</h3>
          <p className="mt-2 text-sm leading-relaxed">
            Hier zien we hoe de gemiddelde stamdiameter zich verhoudt tot het plantjaar. Oudere bomen hebben gemiddeld dikkere stammen.
          </p>
          <button
            onClick={() => scrollTo("sect-3")}
            className="mt-4 inline-flex items-center text-xs font-medium text-blue-600 hover:underline"
          >
            Volgende ↓
          </button>
        </div>
        <div className="md:w-3/5 w-full flex items-center">
          <div className="flourish-wrapper w-full md:h-[500px] h-[250px]">
            <div
              className="flourish-embed flourish-scatter !w-full"
              data-src="visualisation/25431619"
              data-width="100%"
              data-height="450"
              aria-label="Scatter"
            />
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section
        id="sect-3"
        className="snap-start min-h-screen flex flex-col md:flex-row md:items-center gap-8 pt-16 md:pt-0"
      >
        <div className="md:w-2/5 w-full">
          <h3 className="text-lg font-semibold">Wanneer plantte de stad de meeste bomen?</h3>
          <p className="mt-2 text-sm leading-relaxed">
            De sunburst toont de zes jaren met de meeste aanplantingen. Sommige periodes waren echte plantgolven.
          </p>
          <button
            onClick={() => scrollTo("intro")}
            className="mt-4 inline-flex items-center text-xs font-medium text-blue-600 hover:underline"
          >
            Terug omhoog ↑
          </button>
        </div>
        <div className="md:w-3/5 w-full flex items-center">
            <div className="flourish-wrapper w-full md:h-[600px] h-[250px]">
              <div
                className="flourish-embed flourish-hierarchy !w-full"
                data-src="visualisation/25429918"
                data-width="100%"
                data-height="450"
                aria-label="Sunburst"
              />
            </div>
        </div>
      </section>
      </div>
    </main>
  );
}