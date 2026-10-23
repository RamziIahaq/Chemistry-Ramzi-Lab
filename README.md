# Chemistry Lab

An interactive chemistry learning space with a complete periodic table, an element explorer, a qualitative reaction lab, and atomic and molecular Lewis diagrams.

## Features

- **118-element periodic table:** switch between chemical family, type, orbital block, phase at the selected temperature, Pauling electronegativity, atomic mass, and representative appearance.
- **Representative appearance view:** every element has a display color. The swatch describes the room-condition sample/surface where available; elements with no observed bulk sample are marked with a dashed treatment and labeled as theoretical predictions. Colors are illustrative screen colors, not measured RGB values. Allotropy, oxidation, surface finish, temperature, and lighting can change an element's appearance. Gas discharge glow is not treated as the gas's room-condition color.
- **Pauling electronegativity view:** values use the dataset's Pauling scale and are shown in the cells. Elements without an assigned Pauling value are shown with a distinct no-data pattern, not as zero.
- **Element explorer:** 3D atom view, shell diagram, properties, source image when available, and atomic Lewis dots. The guided visual form reveals the nucleus, electron shells, animated shell model, and probability cloud in stages. Neutron counts are approximate; shell paths are a teaching model, not literal electron orbits. Transition-metal valence diagrams are identified as simplified.
- **Molecular Lewis library:** inspect clean schematic structures, bond order, and lone pairs for 16 common molecules, including H2O, CO2, NH3, CH4, HCl, H2S, SO2, O2, N2, and HCN. Supported molecular products from the reaction lab can open their Lewis diagram inline. The drawings are 2D teaching diagrams, not molecular geometry or electron-density models.
- **Reaction lab:** curated examples, temperature and reagent controls, contextual initiation requirements for selected reactions, and qualitative visual effects. Uncurated binary combinations are presented as estimates rather than confirmed reactions. Reaction intensity is a visual cue, not a safety rating or quantitative measurement. The model does not calculate reaction rates, yield, quantities, concentration, pressure, or surface conditions. Generated audio and visual effects are illustrative simulations, not recordings or predictions of the sound or intensity of a specific real experiment.
- **Thermodynamics:** selected reactions show available standard-state ΔH, ΔS, and ΔG information. A standard-state ΔG sign does not predict reaction speed, and the lab does not have sufficient data for every reaction.
- **Arabic and English interface**, electron-configuration calculator, acid reference, discoveries, and adjustable temperature.

## Run locallylors and label the uncertainty rather than implying a sample has been observed.

This is an educational model, not a lab procedure or safety tool. Do not use it to plan or perform real chemical experiments.

## License

MIT. See `LICENSE`.

No build step is required. Install Node.js, then run:

```sh
npm run serve
```

Open the address printed by the server (default `http://127.0.0.1:8755`). Set the `PORT` environment variable to choose another port. Three.js is loaded from a CDN for the 3D view; all other application code runs locally in the browser.

## Data and limitations

Element data are adapted from [Chemistry-Ramzi-Lab](https://github.com/RamziIahaq). Element photographs include source and license attribution in the dataset. Appearance colors are representative approximations. For synthetic superheavy elements, the periodic-table cells intentionally show estimated co
