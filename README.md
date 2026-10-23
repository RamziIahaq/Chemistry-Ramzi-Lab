# ⚗️ Chemistry Lab
**An interactive periodic table, hi-res 3D atom explorer, and a real-time chemistry mixing lab — for fun and learning.**
![Chemistry Lab](https://ramz-isahaq-chimstry.netlify.app/)
=======
🔗 **Live:** https://ramz-isahaq-chimstry.netlify.app/

![Chemistry Lab](https://ramz-isahaq-chimstry.netlify.app/)
>>>>>>> 383738c (https://ramz-isahaq-chimstry.netlify.app/)

---

## What it does

- **Full periodic table** of all 118 elements, colour-coded by category. Hover any element for a big detail card (electron configuration, melting/boiling points, electronegativity, density, discoverer and more).
- **Hi-res 3D atom explorer** — click an element to open an interactive Bohr-style atom: an instanced nucleus of protons + neutrons, animated electron shells with valence highlighting, smart annotations, an electron-cloud view, plus a clean 2D shell diagram, full property sheet, and a real photo of the element.
- **Real-time reaction lab** — shift-click to select elements (they glow), then **drag them into the cauldron** (or hit **Mix**). The simulator predicts what happens:
  - curated **famous reactions** (table salt, water, thermite, alkali metals in water, the Haber process, rusting, burning magnesium, Xe + F…),
  - a **generic predictor** for everything else (oxidation-state formula crossing, electronegativity-based bond type, activity/reactivity-driven "violence"),
  - balanced **equations**, product names, a **drama meter**, hazard tags, and a fun fact.
- **Real thermodynamics** — each reaction shows **ΔH, ΔS and ΔG = ΔH − TΔS** from standard NIST/CODATA data, with an **energy-profile diagram** and a spontaneity verdict. Because ΔG depends on temperature, the slider genuinely changes the chemistry — you can watch ΔG flip sign at the **crossover temperature** (e.g. why the exothermic, entropy-losing Haber process is only favoured below ~190 °C). Pairs without tabulated data get a Pauling-electronegativity estimate, clearly flagged.
- **Smart hints** — a contextual **💡 Next** suggestion always tells you what to try: strike a spark, splash water, add a halogen, heat it past the crossover…
- **Heat it or freeze it** — a temperature slider from absolute zero to the surface of the Sun. Elements melt and boil live, some reactions only fire when hot, and near absolute zero everything freezes inert.
- **Reagents** — add **Air (O₂)**, splash **Water**, or strike a **Spark** to trigger combustion, explosions and rusting.
- **Particle FX + sound** — explosions flash the screen and shake it, fires and bubbles and smoke animate in the cauldron, all with synthesized Web-Audio effects (toggleable).
- **Discoveries** — every new compound you make is logged and saved across visits. How many can you find?
- **Colour overlays** — recolour the whole table by **state of matter at the current temperature**, electronegativity, or atomic mass.
<<<<<<< HEAD
=======
- **Arabic interface** — use the language button to switch the interface and element names between English and Arabic.
- **Electron configuration calculator** — calculate the orbital configuration for one or two atoms from their atomic numbers.
- **Acid reference** — browse common acids, formulas, and acid types in a separate table.
>>>>>>> 383738c (https://chemstry-ramzi.netlify.app)

## How to use

1. **Hover** an element → details. **Click** → 3D atom.
2. **Shift-click** (or ⌘/Ctrl-click) several elements → they're selected.
3. **Drag** them into the cauldron, or press **Mix it!**
4. Slide the **temperature**, add **Air / Water / Spark**, and watch.
<<<<<<< HEAD
=======
5. Use **Electron tool** to calculate orbital configurations, or **Acids** to open the acid reference table. The language button switches to Arabic.
>>>>>>> 383738c (https://chemstry-ramzi.netlify.app)

Try: `Na + Cl`, then `H + O` with a spark, then drop `K` into water. 💥

## Tech

Plain HTML/CSS/JavaScript — no build step, no framework. [Three.js](https://threejs.org/) (via CDN) powers the 3D atoms. Everything runs client-side and works offline once loaded.

```
index.html          markup + CDN includes
<<<<<<< HEAD
css/style.css       dark "lab bench" theme
js/reactions.js     the chemistry engine (curated DB + generic predictor)
js/atom.js          Three.js 3D atom + SVG fallback diagram
js/app.js           table, hover, modal, lab, FX, sound
data/elements.js    generated element dataset (window.ELEMENTS)
tools/build-data.js regenerates data/elements.js from the raw source
=======
CSS/style.css       dark "lab bench" theme
js/reactions.js     the chemistry engine (curated DB + generic predictor)
js/atom.js          Three.js 3D atom + SVG fallback diagram
js/app.js           table, hover, modal, lab, FX, sound
Data/elements.js    generated element dataset (window.ELEMENTS)
tools/build-data.js regenerates Data/elements.js from the raw source
tools/serve.mjs      local static server for npm run serve
>>>>>>> 383738c (https://ramz-isahaq-chimstry.netlify.app)
```

Regenerate the dataset: `npm run build-data`. Serve locally: `npm run serve` (or any static server) and open http://localhost:8754.

## Data & credits

<<<<<<< HEAD
Element data from the public-domain [RamziIahaq](<a href="https://github.com/RamziIahaq" target="_blank">
  GitHub
</a>); element photographs via Wikimedia Commons (CC BY 3.0, "Hi-Res Images of Chemical Elements").
=======
Element data from the public-domain [RamziIahaq](https://github.com/RamziIahaq); element photographs via Wikimedia Commons (CC BY 3.0, "Hi-Res Images of Chemical Elements").
>>>>>>> 383738c (https://chemstry-ramzi.netlify.app)

## ⚠️ Note

The thermodynamics (ΔH, ΔS, ΔG, crossover temperatures) uses **real standard-state data** and is quantitatively meaningful, but the model is still **simplified** — it assumes standard pressure/concentrations, picks a single product phase, and treats kinetics loosely (activation barriers are illustrative). It's built to teach and delight, not to replace a real thermochemistry table. Never mix chemicals for real without proper training and safety equipment.

## License

<<<<<<< HEAD
Ramzi 
=======
Ramzi 
>>>>>>> 383738c (https://ramz-isahaq-chimstry.netlify.app)
