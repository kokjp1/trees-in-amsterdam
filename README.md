# Natuur in Nederland Onepager (React + Next.js + shadcn/ui + Flourish)

## Installatie-instructies

### 1. Vereisten
- Node.js 18+ en npm of pnpm geïnstalleerd
- Git (optioneel, voor versiebeheer)

### 2. Project opzetten
```bash
# Maak een nieuwe Next.js app
npx create-next-app@latest natuur-onepager --typescript --tailwind

cd natuur-onepager

# Installeer shadcn/ui
npx shadcn-ui@latest init

# Voeg componenten toe die je nodig hebt (bv. button, card, separator)
npx shadcn-ui@latest add button card separator

# Installeer extra dependencies (optioneel)
npm install class-variance-authority tailwind-variants lucide-react

# Start development server
npm run dev
```

### 3. Structuur toevoegen
- Maak mappen aan volgens de aanbevolen structuur:
  - `components/core`
  - `components/charts`
  - `components/scenes`
  - `content/copy`
  - `content/metadata`
  - `data/raw`
  - `data/processed`
  - `lib`
  - `hooks`
  - `styles`
  - `public/images`
  - `public/exports`
  - `scripts`

### 4. Data voorbereiden
- Plaats ruwe NDFF / data.amsterdam exports in `/data/raw/`
- Schrijf scripts in `/scripts/` om ze om te zetten naar `/data/processed/`

### 5. Flourish embeds
- Gebruik `components/charts/FlourishEmbed.tsx` als wrapper
- Voorzie elke chart van:
  - Titel
  - Ondertitel
  - Bron
  - Print fallback (`/public/exports/`)

### 6. Print / PDF versie
- Voeg `styles/print.css` toe om interactieve elementen te vervangen door statische PNG/SVG bij export.

### 7. Starten en testen
```bash
npm run dev      # Dev server starten
npm run build    # Productiebouw
npm run start    # Productie server draaien
```

---

## Deadline
Prototype online + PDF in Miro: **9 oktober, 15:00**
