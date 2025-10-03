"use client";
import { useEffect } from "react";

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
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Natuur in Nederland</h1>
      <p className="mt-4 text-zinc-600">Begin met het opbouwen van de pagina.</p>

      {/* Control size here */}
      <div className="flourish-wrapper sm:w-1/2 h-[300px]">
        <div
          className="flourish-embed flourish-scatter"
          data-src="visualisation/25431619"
          data-width="900"
          data-height="450"
          aria-label="Scatter"
        />
      </div>
    </main>
  );
}