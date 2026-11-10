# Chemistry Lab

An interactive chemistry learning site: a complete periodic table, a 3D atom explorer, molecular Lewis diagrams, and a 3D **Chemistry Hypothesis Lab** where two substances are mixed in a virtual beaker.

## Features

- **118-element periodic table** coloured by family, type, orbital block, state of matter at a chosen temperature, Pauling electronegativity, atomic mass, or representative appearance.
- **Element explorer:** 3D atom, shell diagram, properties, Lewis dots, and a guided nucleus/shell/cloud view.
- **Molecular Lewis library** and an **electron configuration calculator**, plus an acid reference.
- **Chemistry Hypothesis Lab:** pick two substances, press Mix, and watch a 3D beaker (bubbles, flame, precipitate, gas, shaking for violent reactions) with the equation, what happens, why, and safety notes. Only documented textbook reactions are modelled; any other pair is reported as "not in the model" instead of an invented result.
- Arabic and English interface.

## Run locally

```sh
npm run serve
```

Open the printed address (default `http://127.0.0.1:8755`). File names are case-sensitive on most hosts: the folders are `css/`, `data/`, and `js/`. Three.js loads from a CDN for the 3D views.

## Data and limitations

Element data are adapted from [Chemistry-Ramzi-Lab](https://github.com/RamziIahaq); photographs carry source and licence attribution in the dataset. Appearance colours are representative approximations. The hypothesis lab is an educational simulation, not a lab procedure or safety tool; do not use it to plan real experiments.

## Licence

MIT. See `license`.
