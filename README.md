# 🗳️ Val 2026: Bygg din egen regering

Ett interaktivt visualiseringsverktyg för det svenska valet. Hämta och analysera valresultat i realtid för **Riksdagsval**, **Regionval** och **Kommunval**. Verktyget låter dig utforska maktdelningen och bygga dina egna regerings- eller styrelsekonstellationer genom "Drag & Drop".

## ✨ Funktioner

- **Realtidsdata**: Hämtar och parsar valresultat från SVT i realtid.
- **Interaktiv regeringsbyggare**: Dra och släpp olika partier för att skapa dina egna regeringsblock (eller styren på kommunal/regional nivå).
- **Mandatkalkylator**: Räknar direkt ut om din konstellation uppnår majoritet (över 50% av mandaten).
- **Alla politiska nivåer**: 
  - 🇸🇪 **Riksdagsval**: Den nationella mandatfördelningen.
  - 🏥 **Regionval**: Statistik för alla 21 regioner.
  - 🏘️ **Kommunval**: Data för samtliga 290 kommuner i Sverige.
  - 📍 **Riksdagsvalkretsar**: Sök efter specifika valkretsar/län.
- **Röst- och mandatfördelning**: Visuell presentation av valresultatet genom blockstaplar, vågdiagram och "röstfördelnings-bars".
- **Småpartier**: Sammanställer automatiskt mindre partier (under 3%) under kategorin "Övrigt" för en renare översikt.

## 🛠️ Teknikstack

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Visualisering & UI**: 
  - [Chart.js](https://www.chartjs.org/) för snygga diagram ("Våg-grafen").
  - [Sortable.js](https://sortablejs.github.io/Sortable/) för drag-and-drop-funktionaliteten av pillren/partierna.
- **Backend / Proxy**: Node.js med Express (`server.js`) för att kringgå CORS-restriktioner när data hämtas direkt från SVT:s publika sidor.
- **Infrastruktur**: Förberett för serverless med Netlify Functions (`functions/`).

## 🚀 Kom igång (Lokalt)

Följ dessa steg för att köra projektet på din egen dator.

1. **Klona repot**
   ```bash
   git clone https://github.com/leumas05/val-2026-tracker.git
   cd val-2026-tracker
   ```

2. **Installera beroenden**  
   För att kunna köra proxyn och servern, installera nödvändiga npm-paket:
   ```bash
   npm install
   ```

3. **Starta applikationen**  
   Kör igång utvecklingsservern:
   ```bash
   npm start
   ```
   *Alternativt kör du `node server.js` direkt.*

4. **Öppna i webbläsaren**  
   Gå in på: [http://localhost:3000](http://localhost:3000)

## 📁 Projektstruktur

- `index.html` - Huvudfilen som innehåller all frontend-logik, DOM-manipulation och visualiseringar.
- `server.js` - Lokal Express-server som agerar proxy mot SVT för att hämta valdata (löser CORS-problem).
- `plats_map.js` - Innehåller mappning mellan kommun/region/valkrets och deras respektive ID/URL-strukturer.
- `functions/` - Serverlösa funktioner (anpassat för deploy via t.ex. Netlify).

## 🤝 Bidra

Har du idéer på förbättringar, hittat en bugg eller vill lägga till en ny funktion? Skapa gärna en *Pull Request* eller lägg in ett *Issue*.

## 📄 Licens

Detta projekt är skapat för utbildningssyfte och personligt bruk. All valdata som presenteras hämtas externt (SVT).

---

*Skapad av [S4m.dev](https://www.s4m.dev/)*
