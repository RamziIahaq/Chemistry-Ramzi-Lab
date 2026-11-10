/* ===========================================================================
   Chemistry Lab — reaction engine
   A hybrid simulator: a curated database of famous reactions + a generic
   predictor (oxidation-state formula crossing, electronegativity bond type,
   reactivity/activity-series "violence") so ANY combination says something
   sensible. Educational, deliberately simplified — not real thermodynamics.
   =========================================================================== */
(function () {
  'use strict';

  // ---- Element index (built from window.ELEMENTS) ------------------------
  var BY_SYMBOL = {};
  (window.ELEMENTS || []).forEach(function (e) { BY_SYMBOL[e.symbol] = e; });
  function el(sym) { return BY_SYMBOL[sym]; }

  // ---- Common oxidation state used for simple binary compounds -----------
  var OX = {
    H: 1, He: 0, Li: 1, Be: 2, B: 3, C: 4, N: -3, O: -2, F: -1, Ne: 0,
    Na: 1, Mg: 2, Al: 3, Si: 4, P: -3, S: -2, Cl: -1, Ar: 0,
    K: 1, Ca: 2, Sc: 3, Ti: 4, V: 5, Cr: 3, Mn: 2, Fe: 3, Co: 2, Ni: 2, Cu: 2, Zn: 2,
    Ga: 3, Ge: 4, As: -3, Se: -2, Br: -1, Kr: 0,
    Rb: 1, Sr: 2, Y: 3, Zr: 4, Nb: 5, Mo: 6, Tc: 7, Ru: 3, Rh: 3, Pd: 2, Ag: 1, Cd: 2,
    In: 3, Sn: 4, Sb: -3, Te: -2, I: -1, Xe: 0,
    Cs: 1, Ba: 2, La: 3, Hf: 4, Ta: 5, W: 6, Re: 4, Os: 4, Ir: 3, Pt: 2, Au: 3, Hg: 2,
    Tl: 1, Pb: 2, Bi: 3, Po: -2, At: -1, Rn: 0, Fr: 1, Ra: 2, Ac: 3,
    Ce: 3, Pr: 3, Nd: 3, Pm: 3, Sm: 3, Eu: 3, Gd: 3, Tb: 3, Dy: 3, Ho: 3, Er: 3, Tm: 3, Yb: 3, Lu: 3,
    Th: 4, Pa: 5, U: 6, Np: 5, Pu: 4, Am: 3, Cm: 3, Bk: 3, Cf: 3, Es: 3, Fm: 3, Md: 3, No: 2, Lr: 3
  };
  // Variable-valence metals that take a roman numeral in their compound name
  var VARIABLE = { Fe: 1, Cu: 1, Co: 1, Cr: 1, Mn: 1, Sn: 1, Pb: 1, Ti: 1, V: 1, Ni: 1, Au: 1, Hg: 1, Pt: 1, U: 1 };

  // ---- Reactivity (0 calm … 10 violent), drives "explodes / fizzes" ------
  var REACT = {
    Li: 6, Na: 7, K: 8, Rb: 9, Cs: 10, Fr: 10,
    Be: 2, Mg: 4, Ca: 6, Sr: 7, Ba: 8, Ra: 8,
    F: 10, Cl: 8, Br: 6, I: 4, At: 3,
    O: 6, H: 5, P: 7, S: 4, N: 1, C: 3, Se: 4,
    Al: 5, Zn: 4, Fe: 3, Sn: 2, Pb: 2, Ni: 2, Cu: 1, Ag: 1, Hg: 1, Ti: 2,
    Au: 0, Pt: 0, Ir: 0, Pd: 1,
    He: 0, Ne: 0, Ar: 0, Kr: 0, Xe: 1, Rn: 1
  };
  function reactivity(sym) {
    if (REACT[sym] != null) return REACT[sym];
    var e = el(sym); if (!e) return 2;
    if (e.category === 'noble gas') return 0;
    if (e.category === 'alkali metal') return 7;
    if (e.category === 'alkaline earth metal') return 6;
    if (/nonmetal/.test(e.category)) return 4;
    return 2;
  }

  var METAL_CATS = { 'alkali metal': 1, 'alkaline earth metal': 1, 'transition metal': 1,
    'post-transition metal': 1, 'lanthanide': 1, 'actinide': 1 };
  function isMetal(sym) { var e = el(sym); return !!(e && METAL_CATS[e.category]); }
  function isNonmetal(sym) { var e = el(sym); return !!(e && /nonmetal/.test(e.category)); }
  function isNoble(sym) { var e = el(sym); return !!(e && e.category === 'noble gas'); }
  function isMetalloid(sym) { var e = el(sym); return !!(e && e.category === 'metalloid'); }
  function isSuperheavy(sym) { var e = el(sym); return !!(e && e.number >= 104); }
  var DIATOMIC = { H: 1, N: 1, O: 1, F: 1, Cl: 1, Br: 1, I: 1 };

  // ---- Thermodynamics: standard enthalpy of formation ΔHf° (kJ/mol) and
  //      standard molar entropy S° (J/mol·K) at 298 K (NIST/CODATA values).
  //      Elements in their standard state have ΔHf° = 0. -----------------------
  var dHf = {
    'H2O(l)': -285.8, 'H2O(g)': -241.8, 'CO2': -393.5, 'CO': -110.5, 'NaCl': -411.2,
    'NH3': -45.9, 'CH4': -74.6, 'SiO2': -910.7, 'CaO': -634.9, 'MgO': -601.6,
    'Al2O3': -1675.7, 'Fe2O3': -824.2, 'HCl': -92.3, 'H2S': -20.6, 'SO2': -296.8,
    'KCl': -436.7, 'KOH': -424.8, 'NaOH': -425.6, 'LiOH': -487.5, 'CsOH': -417.0,
    'KBr': -393.8, 'NaBr': -361.1, 'NaF': -576.6, 'KF': -567.3, 'CuO': -157.3,
    'ZnO': -350.5, 'TiO2': -944.0, 'CaF2': -1228.0, 'XeF2': -163.0, 'Li2O': -597.9,
    'CaCl2': -795.4, 'MgCl2': -641.3, 'AlCl3': -704.2, 'FeCl3': -399.5, 'PbO': -217.3,
    'PbS': -100.4, 'FeS': -100.0, 'NO': 91.3, 'NO2': 33.2, 'CaCO3': -1207.6, 'O3': 142.7
  };
  var S0 = {
    // elements (standard state)
    'H2': 130.7, 'O2': 205.2, 'N2': 191.6, 'Cl2': 223.1, 'F2': 202.8, 'Br2': 152.2, 'I2': 116.1,
    'C': 5.7, 'Na': 51.3, 'K': 64.7, 'Li': 29.1, 'Cs': 85.2, 'Ca': 41.6, 'Mg': 32.7, 'Al': 28.3,
    'Fe': 27.3, 'Cu': 33.2, 'Zn': 41.6, 'Si': 18.8, 'S': 32.1, 'Ti': 30.7, 'Au': 47.4, 'Hg': 75.9,
    'Xe': 169.7, 'Pb': 64.8, 'Ni': 29.9, 'Sn': 51.2, 'Ag': 42.6,
    // compounds
    'H2O(l)': 69.9, 'H2O(g)': 188.8, 'CO2': 213.8, 'CO': 197.7, 'NaCl': 72.1, 'NH3': 192.8,
    'CH4': 186.3, 'SiO2': 41.5, 'CaO': 38.1, 'MgO': 27.0, 'Al2O3': 50.9, 'Fe2O3': 87.4,
    'HCl': 186.9, 'H2S': 205.8, 'SO2': 248.2, 'KCl': 82.6, 'KOH': 78.9, 'NaOH': 64.5,
    'LiOH': 42.8, 'CsOH': 98.0, 'KBr': 95.9, 'CuO': 42.6, 'ZnO': 43.7, 'TiO2': 50.6,
    'CaF2': 68.5, 'XeF2': 115.0, 'Li2O': 37.6, 'NO': 210.8, 'NO2': 240.1, 'O3': 238.9,
    'CaCO3': 91.7, 'CaCl2': 104.6, 'MgCl2': 89.6
  };
  function getHf(f) {
    if (dHf[f] != null) return dHf[f];
    if (BY_SYMBOL[f]) return 0;                       // bare element = standard state
    if (/^(H2|N2|O2|F2|Cl2|Br2|I2)$/.test(f)) return 0;
    return null;
  }
  function getS(f) { return S0[f] != null ? S0[f] : null; }

  // Compute ΔH, ΔS, ΔG(T) for a balanced reaction { r:[[species,coef]...], p:[...] }
  function thermo(bal, T) {
    if (!bal) return null;
    var dH = 0, dS = 0, ok = true;
    function add(list, sign) {
      list.forEach(function (pair) {
        var h = getHf(pair[0]), s = getS(pair[0]);
        if (h == null || s == null) ok = false;
        dH += sign * pair[1] * (h || 0);
        dS += sign * pair[1] * (s || 0);
      });
    }
    add(bal.p, 1); add(bal.r, -1);
    if (!ok) return null;
    var dG = dH - T * dS / 1000;                       // kJ (dS is J/K)
    var crossover = dS !== 0 ? dH / (dS / 1000) : null; // Kelvin where ΔG = 0
    return { dH: Math.round(dH * 10) / 10, dS: Math.round(dS * 10) / 10, dG: Math.round(dG), T: T, spontaneous: dG < 0, crossover: crossover, estimated: false };
  }

  // ---- Nomenclature helpers ----------------------------------------------
  var ROOT = { O: 'ox', Cl: 'chlor', F: 'fluor', Br: 'brom', I: 'iod', S: 'sulf', N: 'nitr',
    P: 'phosph', H: 'hydr', Se: 'selen', Te: 'tellur', As: 'arsen', C: 'carb', Si: 'silic', B: 'bor' };
  var PREFIX = ['', 'mono', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca'];
  var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  function anionName(sym) {
    var r = ROOT[sym]; if (!r) { var e = el(sym); r = e ? e.name.toLowerCase().replace(/(ine|gen|on|ium|ur|ese|ese)$/, '') : sym.toLowerCase(); }
    return r + 'ide';
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function sub(n) { return n > 1 ? '<sub>' + n + '</sub>' : ''; }

  // crossed binary formula from oxidation magnitudes
  function crossFormula(cat, an) {
    var c = Math.abs(OX[cat]); var a = Math.abs(OX[an]);
    if (!c || !a) return null;
    var g = gcd(c, a);
    return { ncat: a / g, nan: c / g };
  }

  // ---- Formula / equation formatting -------------------------------------
  function fForm(map) { // {sym:count} -> HTML
    return Object.keys(map).map(function (s) { return s + sub(map[s]); }).join('');
  }

  // ---- State of matter at temperature T (Kelvin) -------------------------
  function stateAt(sym, T) {
    var e = el(sym); if (!e) return '—';
    if (e.melt == null && e.boil == null) return e.phase || '—';
    if (e.boil != null && T >= e.boil) return T > 5000 ? 'Gas (ionising)' : 'Gas';
    if (e.melt != null && T >= e.melt) return 'Liquid';
    if (e.melt != null && T < e.melt) return 'Solid';
    // only boil known
    if (e.boil != null) return T >= e.boil ? 'Gas' : (e.phase || 'Liquid');
    return e.phase || '—';
  }

  // =========================================================================
  //  CURATED REACTIONS — the greatest hits, for accuracy & delight.
  //  Each rule: { set:[symbols], needs?, ...result }. `set` is order-free.
  //  needs: { water, air, ignite, minTemp }  (ignite = spark OR T>=autoignite)
  // =========================================================================
  var CURATED = [
    // --- Water & salt classics ---
    { set: ['H', 'O'], needs: { ignite: true }, emoji: '💥', title: 'Combustion → Water',
      eq: '2 H₂ + O₂ → 2 H₂O', products: [{ f: 'H2O', n: 'Water' }], hazard: 4,
      effects: { explosion: true, fire: true, light: true, color: '#bfe6ff' }, shake: true,
      desc: 'Hydrogen and oxygen do nothing until a spark arrives — then they combine in a sharp <b>explosion</b>, releasing huge energy and leaving only pure water.',
      fact: 'Liquid-hydrogen/liquid-oxygen rocket engines use this net reaction; the exact simulated mixture and conditions are simplified.' },
    { set: ['H', 'O'], emoji: '🫧', title: 'Hydrogen + Oxygen (no spark)',
      products: [], hazard: 2, effects: { gas: true }, hint: '⚡ Strike a Spark — then H₂ and O₂ detonate into water.',
      desc: 'Mixed cold, H₂ and O₂ just sit together as a colourless gas mixture. They need a <b>spark</b> or heat to react — try the ⚡ button!',
      fact: 'A hydrogen–oxygen mixture can be hazardous; the model does not represent concentration or confinement.' },
    { set: ['Na', 'Cl'], needs: { ignite: true }, emoji: '🧂', title: 'Sodium + Chlorine → Table Salt',
      eq: '2 Na + Cl₂ → 2 NaCl', products: [{ f: 'NaCl', n: 'Sodium chloride (table salt)' }], hazard: 4,
      effects: { fire: true, light: true, smoke: true, color: '#fff2c4' },
      desc: 'After initiation, sodium reacts vigorously with chlorine in a bright yellow light, forming solid sodium chloride. The solid product does not make the reactants safe to handle.',
      fact: 'The equation is balanced for 2 Na atoms and 1 Cl₂ molecule.' },
    { set: ['Na', 'Cl'], emoji: '🧪', title: 'Sodium + Chlorine mixture', products: [], hazard: 1, effects: {},
      hint: 'A reaction may need initiation; use the simulated spark to show the idealized salt-forming reaction.',
      desc: 'At this model setting the mixture is shown before an initiated reaction. The simulator does not model surface condition, quantities, or reaction rate.',
      fact: 'Real observations depend on the setup and physical form of the reactants.' },
    { set: ['Na'], needs: { water: true }, emoji: '🔥', title: 'Sodium in Water',
      eq: '2 Na + 2 H₂O → 2 NaOH + H₂↑', products: [{ f: 'NaOH', n: 'Sodium hydroxide' }, { f: 'H2', n: 'Hydrogen' }], hazard: 4,
      effects: { fire: true, conditionalFire: true, bubbles: true, light: true, color: '#ffd27f' },
      desc: 'Sodium reacts vigorously with water, producing hydrogen and heat. Hydrogen can ignite, but the model cannot determine whether a particular amount would pop or explode.',
      fact: 'The violence of alkali-metal reactions with water depends on the metal, amount, surface and setup.' },
    { set: ['K'], needs: { water: true }, emoji: '🔥', title: 'Potassium in Water',
      eq: '2 K + 2 H₂O → 2 KOH + H₂↑', products: [{ f: 'KOH', n: 'Potassium hydroxide' }, { f: 'H2', n: 'Hydrogen' }], hazard: 4,
      effects: { fire: true, conditionalFire: true, bubbles: true, light: true, color: '#d9b3ff' },
      desc: 'Potassium reacts rapidly with water and releases hydrogen and heat. Hydrogen may ignite; the exact visible effects depend on quantities and setup.',
      fact: 'The simulator uses a qualitative effect; it does not predict flame size, pressure or sound level.' },
    { set: ['Li'], needs: { water: true }, emoji: '🫧', title: 'Lithium in Water',
      eq: '2 Li + 2 H₂O → 2 LiOH + H₂↑', products: [{ f: 'LiOH', n: 'Lithium hydroxide' }, { f: 'H2', n: 'Hydrogen' }], hazard: 3,
      effects: { bubbles: true, gas: true }, desc: 'Lithium reacts with water to form lithium hydroxide and hydrogen. The visible rate and heat release depend on amount and conditions.',
      fact: 'This qualitative animation does not model temperature rise or hydrogen ignition.' },
    { set: ['Cs'], needs: { water: true }, emoji: '🧨', title: 'Caesium in Water',
      eq: '2 Cs + 2 H₂O → 2 CsOH + H₂↑', products: [{ f: 'CsOH', n: 'Caesium hydroxide' }, { f: 'H2', n: 'Hydrogen' }], hazard: 5,
      effects: { explosion: true, fire: true, light: true, bubbles: true, color: '#cfe0ff' }, shake: true,
      desc: 'Caesium reacts extremely vigorously with water; under some conditions the released heat and hydrogen ignition can produce an explosive event.',
      fact: 'The model signals a possible violent outcome; it does not represent real quantities, containment or experimental conditions.' },

    // --- Combustion / oxides ---
    { set: ['C'], needs: { air: true, ignite: true }, emoji: '🔥', title: 'Burning Carbon',
      eq: 'C + O₂ → CO₂', products: [{ f: 'CO2', n: 'Carbon dioxide' }], hazard: 2,
      effects: { fire: true, light: true, color: '#ff9a3c' },
      desc: 'Carbon glows red-hot and burns in air to invisible carbon dioxide — the reaction behind every campfire, candle and coal plant.',
      fact: 'Starve it of oxygen and you get carbon monoxide (CO) instead — silent and deadly.' },
    { set: ['Mg'], needs: { air: true, ignite: true }, emoji: '✨', title: 'Burning Magnesium',
      eq: '2 Mg + O₂ → 2 MgO', products: [{ f: 'MgO', n: 'Magnesium oxide' }], hazard: 3,
      effects: { fire: true, light: true, smoke: true, color: '#ffffff' },
      desc: 'Magnesium burns with a <b>blinding white</b> light so bright it can damage your eyes, leaving a soft white ash of magnesium oxide.',
      fact: 'Old camera flashbulbs and fireworks use magnesium for exactly this dazzle. Water makes it worse!' },
    { set: ['Fe'], needs: { air: true, water: true }, emoji: '🟤', title: 'Rusting Iron',
      eq: '4 Fe + 3 O₂ + 2x H₂O → 2 Fe₂O₃·xH₂O', products: [{ f: 'Fe2O3·xH2O', n: 'Hydrated iron(III) oxide (rust)' }], hazard: 1,
      effects: { color: '#b5651d', smoke: false },
      desc: 'With both oxygen and water present, iron corrodes slowly into hydrated iron oxides and oxyhydroxides (rust). The exact composition varies; time is compressed for this display.',
      fact: 'The x in Fe₂O₃·xH₂O represents variable water content, not a single fixed rust compound.' },
    { set: ['Fe', 'O'], needs: { ignite: true }, emoji: '🟤', title: 'Iron + Oxygen → Iron(III) oxide',
      eq: '4 Fe + 3 O₂ → 2 Fe₂O₃', products: [{ f: 'Fe2O3', n: 'Iron(III) oxide' }], hazard: 1,
      effects: { color: '#b5651d', fire: true, light: true }, desc: 'After strong initiation, iron combines with oxygen to form iron(III) oxide. This dry high-temperature oxide is not the same thing as ordinary hydrated rust.',
      fact: 'Fine steel wool oxidizes much faster than a solid iron block because it exposes more surface area.' },
    { set: ['Fe', 'O'], emoji: '🧪', title: 'Iron + Oxygen mixture', products: [], hazard: 0, effects: {},
      hint: 'At room temperature the model waits; use the spark or high heat to show rapid oxidation.',
      desc: 'No fast visible reaction is shown at room temperature. Ordinary rusting needs moisture and time; this pair alone does not instantly make rust.',
      fact: 'Surface oxide layers and humidity affect real iron corrosion.' },
    { set: ['Al', 'Fe', 'O'], needs: { ignite: true }, emoji: '🌋', title: 'Thermite! (idealized)',
      eq: '2 Al + Fe₂O₃ → 2 Fe + Al₂O₃', products: [{ f: 'Fe', n: 'Molten iron' }, { f: 'Al2O3', n: 'Aluminium oxide' }], hazard: 5,
      effects: { explosion: false, fire: true, light: true, smoke: true, color: '#ffcf66' }, shake: true,
      desc: 'This idealized aluminothermic equation uses iron oxide as the reactant. The element picker stands in for that oxide precursor; the simulator skips its preparation and shows no explosive detonation.',
      fact: 'The strongly exothermic reaction can produce molten iron, but the model does not calculate temperature, quantities, or yield.' },
    { set: ['Al', 'Fe', 'O'], emoji: '🧪', title: 'Thermite mixture before ignition', products: [], hazard: 0, effects: {},
      hint: 'The idealized thermite pathway needs an iron-oxide precursor and an initiating source; those details are simplified here.',
      desc: 'The selected elements alone are not a prepared thermite mixture. This display only models the balanced aluminothermic equation after initiation.',
      fact: 'The oxide precursor is represented implicitly, not prepared by the simulator.' },
    { set: ['Ca', 'O'], needs: { ignite: true }, emoji: '🔆', title: 'Calcium + Oxygen → Quicklime',
      eq: '2 Ca + O₂ → 2 CaO', products: [{ f: 'CaO', n: 'Calcium oxide (quicklime)' }], hazard: 2,
      effects: { fire: true, light: true, color: '#fff0d0' },
      desc: 'Once initiated, calcium oxidizes to calcium oxide. The model shows an emission glow; the white limelight effect comes from heating quicklime, not its ordinary room-temperature appearance.',
      fact: 'Add water to quicklime and it hisses, swells and gets hot enough to boil — "slaking" lime.' },
    { set: ['Ca', 'O'], emoji: '🧪', title: 'Calcium + Oxygen mixture', products: [], hazard: 0, effects: {},
      hint: 'Use the simulated spark or high heat to initiate oxidation.',
      desc: 'At room temperature the model shows no rapid visible reaction. No reaction rate is calculated.',
      fact: 'The balanced product after oxidation is calcium oxide, CaO.' },

    // --- Acids / hydrides / nonmetal pairs ---
    { set: ['H', 'Cl'], needs: { ignite: true }, emoji: '🌫️', title: 'Hydrogen + Chlorine',
      eq: 'H₂ + Cl₂ → 2 HCl', products: [{ f: 'HCl', n: 'Hydrogen chloride' }], hazard: 4,
      effects: { light: true, color: '#e8ffd6' },
      desc: 'Light can initiate a rapid chain reaction between hydrogen and chlorine, forming hydrogen chloride gas. The response depends strongly on the mixture and conditions.',
      fact: 'This light-triggered blast is a classic demonstration of a photochemical chain reaction.' },
    { set: ['H', 'Cl'], emoji: '🌫️', title: 'Hydrogen + Chlorine mixture', products: [], hazard: 1, effects: {},
      hint: 'A spark is used here as a simplified stand-in for light initiation.',
      desc: 'Without an initiating source, this model keeps the gases as a mixture. No product yield or reaction rate is calculated.',
      fact: 'The simulator does not calculate concentration, pressure, or photochemical kinetics.' },
    { set: ['H', 'S'], needs: { minTemp: 600 }, emoji: '🥚', title: 'Hydrogen + Sulfur',
      eq: 'H₂ + S → H₂S', products: [{ f: 'H2S', n: 'Hydrogen sulfide' }], hazard: 3,
      effects: { gas: true, color: '#e6e29a' },
      desc: 'Forms hydrogen sulfide — the unmistakable stench of <b>rotten eggs</b>. Toxic in any real amount, and it deadens your sense of smell, which is what makes it dangerous.',
      fact: 'Your nose can detect H₂S at just a few parts per billion — but not for long.' },
    { set: ['H', 'S'], emoji: '🧪', title: 'Hydrogen + Sulfur mixture', products: [], hazard: 0, effects: {},
      hint: 'Raise the model temperature to at least 600 K to show the idealized synthesis.',
      desc: 'At room temperature the simulator leaves hydrogen and sulfur unreacted; actual synthesis needs suitable conditions and is not determined by temperature alone.',
      fact: 'This simplified model omits catalysts, pressure, and reaction kinetics.' },
    { set: ['N', 'H'], needs: { minTemp: 600 }, emoji: '🌾', title: 'Haber Process → Ammonia',
      eq: 'N₂ + 3 H₂ → 2 NH₃', products: [{ f: 'NH3', n: 'Ammonia' }], hazard: 2,
      effects: { gas: true, color: '#cfe' },
      desc: 'Under high heat and pressure, inert nitrogen finally bonds with hydrogen to make ammonia — the reaction that <b>feeds half the planet</b> through fertiliser.',
      fact: 'The Haber–Bosch process is often called the most important invention of the 20th century.' },
    { set: ['N', 'H'], emoji: '🥶', title: 'Nitrogen + Hydrogen (too cold)',
      products: [], hazard: 0, effects: { gas: true }, hint: '🔥 Heat past ~330 °C (with pressure) — that\'s the Haber process for ammonia.',
      desc: 'Nitrogen is famously unreactive — its triple bond is one of the strongest in chemistry. Nothing happens until you crank the heat past ~600 K (and add pressure).',
      fact: 'That same inertness is why we can breathe 78% nitrogen with no ill effect.' },
    { set: ['C', 'H'], needs: { minTemp: 1200 }, emoji: '⛽', title: 'Idealized methane synthesis',
      eq: 'C + 2 H₂ → CH₄', products: [{ f: 'CH4', n: 'Methane' }], hazard: 2,
      effects: { gas: true }, desc: 'This is a balanced net equation for methane formation, shown as an idealized high-temperature model. The simulator does not establish a practical route or yield.',
      fact: 'Methane is the simplest alkane and a major component of natural gas.' },
    { set: ['C', 'H'], emoji: '🧪', title: 'Carbon + Hydrogen mixture', products: [], hazard: 0, effects: {},
      hint: 'This idealized net reaction is enabled at 1200 K; real synthesis needs a defined process.',
      desc: 'Carbon and hydrogen remain a mixture in the room-temperature model. A favorable product formula alone does not specify a viable reaction pathway.',
      fact: 'Catalysts, phase, pressure and kinetics are not simulated.' },
    { set: ['Si', 'O'], needs: { ignite: true }, emoji: '🪟', title: 'Silicon + Oxygen → Silica',
      eq: 'Si + O₂ → SiO₂', products: [{ f: 'SiO2', n: 'Silicon dioxide (silica)' }], hazard: 1,
      effects: { fire: true, light: true, color: '#dfefff' }, desc: 'When initiated, silicon oxidizes to silicon dioxide. Quartz and other silica forms are used in glass and electronics; the reaction conditions are simplified here.',
      fact: 'Pure molten silica is drawn into the optical fibres carrying this very web page.' },
    { set: ['Si', 'O'], emoji: '🧪', title: 'Silicon + Oxygen mixture', products: [], hazard: 0, effects: {},
      hint: 'Use the simulated spark to initiate the idealized oxidation.',
      desc: 'No oxidation is shown before initiation; the model does not represent a native oxide layer or reaction rate.',
      fact: 'Actual silicon surfaces may already carry a thin oxide layer.' },
    { set: ['S', 'O'], needs: { ignite: true }, emoji: '🌋', title: 'Burning Sulfur',
      eq: 'S + O₂ → SO₂', products: [{ f: 'SO2', n: 'Sulfur dioxide' }], hazard: 3,
      effects: { fire: true, smoke: true, color: '#6fa3ff' },
      desc: 'Sulfur burns with an eerie <b>blue</b> flame to choking sulfur dioxide — the sharp smell of a struck match and of volcanoes.',
      fact: 'SO₂ in the air becomes acid rain; volcanoes pump out millions of tonnes of it.' },

    // --- Noble / unreactive ---
    { set: ['Au', 'O'], emoji: '✨', title: 'Gold + Oxygen → Nothing',
      products: [], hazard: 0, effects: {}, desc: 'Gold simply refuses to rust or tarnish — that\'s why it stays shiny for thousands of years. It will not bond with oxygen at any sensible temperature.',
      fact: 'Gold pulled from Egyptian tombs gleams as if it were buried yesterday.' },

    // --- Amalgam / alloy specials ---
    { set: ['Hg', 'Au'], emoji: '🥄', title: 'Gold dissolves in Mercury',
      products: [{ f: 'AuHg', n: 'Gold amalgam' }], hazard: 2, effects: { color: '#cfcfcf' },
      desc: 'Gold dissolves into liquid mercury like sugar into tea, forming a soft <b>amalgam</b>. Heat it and the mercury boils away, leaving the gold behind.',
      fact: 'This is how gilders once coated domes in gold — and how a lot of them got mercury poisoning.' }
  ];

  // Build a lookup key from a list of symbols (order-free, unique)
  function keyOf(arr) { return arr.slice().sort().join('+'); }
  var CURATED_INDEX = {};
  CURATED.forEach(function (r) { (CURATED_INDEX[keyOf(r.set)] = CURATED_INDEX[keyOf(r.set)] || []).push(r); });

  // Machine-readable balanced equations for thermodynamics, keyed by a product
  // formula that appears in the matching reaction's products.
  var THERMO_BAL = {
    'NaCl': { r: [['Na', 2], ['Cl2', 1]], p: [['NaCl', 2]] },
    'H2O': { r: [['H2', 2], ['O2', 1]], p: [['H2O(g)', 2]] },
    'NaOH': { r: [['Na', 2], ['H2O(l)', 2]], p: [['NaOH', 2], ['H2', 1]] },
    'KOH': { r: [['K', 2], ['H2O(l)', 2]], p: [['KOH', 2], ['H2', 1]] },
    'LiOH': { r: [['Li', 2], ['H2O(l)', 2]], p: [['LiOH', 2], ['H2', 1]] },
    'CsOH': { r: [['Cs', 2], ['H2O(l)', 2]], p: [['CsOH', 2], ['H2', 1]] },
    'CO2': { r: [['C', 1], ['O2', 1]], p: [['CO2', 1]] },
    'MgO': { r: [['Mg', 2], ['O2', 1]], p: [['MgO', 2]] },
    'Fe2O3': { r: [['Fe', 4], ['O2', 3]], p: [['Fe2O3', 2]] },
    'Al2O3': { r: [['Al', 2], ['Fe2O3', 1]], p: [['Fe', 2], ['Al2O3', 1]] },
    'CaO': { r: [['Ca', 2], ['O2', 1]], p: [['CaO', 2]] },
    'HCl': { r: [['H2', 1], ['Cl2', 1]], p: [['HCl', 2]] },
    'H2S': { r: [['H2', 1], ['S', 1]], p: [['H2S', 1]] },
    'NH3': { r: [['N2', 1], ['H2', 3]], p: [['NH3', 2]] },
    'CH4': { r: [['C', 1], ['H2', 2]], p: [['CH4', 1]] },
    'SiO2': { r: [['Si', 1], ['O2', 1]], p: [['SiO2', 1]] },
    'SO2': { r: [['S', 1], ['O2', 1]], p: [['SO2', 1]] },
    'XeF2': { r: [['Xe', 1], ['F2', 1]], p: [['XeF2', 1]] },
    'KBr': { r: [['K', 2], ['Br2', 1]], p: [['KBr', 2]] },
    'CuO': { r: [['Cu', 2], ['O2', 1]], p: [['CuO', 2]] },
    'ZnO': { r: [['Zn', 2], ['O2', 1]], p: [['ZnO', 2]] },
    'TiO2': { r: [['Ti', 1], ['O2', 1]], p: [['TiO2', 1]] },
    'CaF2': { r: [['Ca', 1], ['F2', 1]], p: [['CaF2', 1]] },
    'Li2O': { r: [['Li', 4], ['O2', 1]], p: [['Li2O', 2]] },
    'KCl': { r: [['K', 2], ['Cl2', 1]], p: [['KCl', 2]] },
    'CaCl2': { r: [['Ca', 1], ['Cl2', 1]], p: [['CaCl2', 1]] },
    'MgCl2': { r: [['Mg', 1], ['Cl2', 1]], p: [['MgCl2', 1]] }
  };

  // famous compound names recognised from a predicted formula
  var KNOWN_FORMULA = {
    'H2O': 'Water', 'CO2': 'Carbon dioxide', 'NaCl': 'Sodium chloride (table salt)',
    'NH3': 'Ammonia', 'CH4': 'Methane', 'SiO2': 'Silica', 'CaO': 'Quicklime',
    'Al2O3': 'Alumina', 'Fe2O3': 'Rust', 'H2S': 'Hydrogen sulfide', 'SO2': 'Sulfur dioxide',
    'HCl': 'Hydrogen chloride', 'KCl': 'Potassium chloride', 'MgO': 'Magnesia',
    'CaF2': 'Fluorite', 'TiO2': 'Titanium white', 'CuO': 'Copper(II) oxide',
    'ZnO': 'Zinc white', 'PbS': 'Galena', 'FeS': 'Iron sulfide', 'CaCl2': 'Calcium chloride'
  };

  // =========================================================================
  //  GENERIC BINARY PREDICTOR
  // =========================================================================
  function predictBinary(a, b, ctx) {
    var ea = el(a), eb = el(b);
    // order: cation (more metallic / lower EN) first
    var cat, an;
    if (OX[a] > 0 && OX[b] < 0) { cat = a; an = b; }
    else if (OX[b] > 0 && OX[a] < 0) { cat = b; an = a; }
    else {
      // fall back to electronegativity: lower EN is the cation
      var na = ea.electronegativity || 2, nb = eb.electronegativity || 2;
      if (na <= nb) { cat = a; an = b; } else { cat = b; an = a; }
    }
    var cross = crossFormula(cat, an);
    var enA = ea.electronegativity, enB = eb.electronegativity;
    var enDiff = (enA != null && enB != null) ? Math.abs(enA - enB) : 1.0;
    // Two metals do not automatically form an alloy just by being selected.
    if (isMetal(a) && isMetal(b)) {
      return {
        kind: 'alloy', emoji: '🔗', title: ea.name + ' + ' + eb.name,
        products: [], hazard: 0, effects: {}, estimate: true, alloyPossible: true,
        desc: 'These metals do not form a compound merely by being brought together. An alloy may form under suitable conditions, but miscibility and temperature matter; this model cannot determine that from element names alone.',
        fact: 'Steel is an iron-based alloy containing carbon; bronze is mainly copper and tin.'
      };
    }

    if (!cross) {
      return genericMixture([a, b], ctx);
    }

    var map = {}; map[cat] = cross.ncat; map[an] = cross.nan;
    var name = nameBinary(cat, an, cross);
    var known = KNOWN_FORMULA[cat + (cross.ncat > 1 ? cross.ncat : '') + an + (cross.nan > 1 ? cross.nan : '')];

    // Rough bond classification based on electronegativity difference.
    var bondWord = enDiff > 1.7 ? 'ionic' : (enDiff < 0.5 ? 'covalent (nonpolar)' : 'polar covalent');

    // Formula crossing alone cannot establish that these elements react.
    var hazard = 1, effects = {}, emoji = '⚗️';

    var fHtml = fForm(map);
    var displayName = known || name;
    return {
      kind: 'reaction', emoji: emoji, title: ea.name + ' + ' + eb.name,
      products: [{ f: cat + (cross.ncat > 1 ? cross.ncat : '') + an + (cross.nan > 1 ? cross.nan : ''), n: displayName }],
      hazard: hazard, effects: effects, estimate: true,
      equation: el(cat).symbol + ' + ' + el(an).symbol + ' → ' + fHtml,
      desc: 'A simplified charge-crossing model suggests <b>' + fHtml + '</b> (' + displayName + ') as a possible product with mostly <b>' + bondWord + '</b> bonding. Whether these elements react, and how quickly, depends on conditions and is not established by this estimate.',
      fact: bondFact(bondWord, enDiff),
      outcome: 'uncertain'
    };
  }

  function nameBinary(cat, an, cross) {
    var ec = el(cat);
    var prefixCovalent = isNonmetal(cat) || isMetalloid(cat);
    if (prefixCovalent && (isNonmetal(an) || isMetalloid(an))) {
      // covalent prefix naming
      var p1 = cross.ncat > 1 ? PREFIX[cross.ncat] : '';
      var p2 = PREFIX[cross.nan] || (cross.nan + '-');
      var anN = anionName(an);
      // elide a/o before a vowel (mono+oxide -> monoxide, tetra+oxide -> tetroxide)
      if (/^[aeiou]/.test(anN)) p2 = p2.replace(/[ao]$/, '');
      return cap(p1 + ec.name.toLowerCase()) + ' ' + p2 + anN;
    }
    // ionic
    var roman = VARIABLE[cat] ? '(' + ROMAN[Math.abs(OX[cat])] + ')' : '';
    return ec.name + (roman ? ' ' + roman : '') + ' ' + anionName(an);
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function bondFact(bondWord, d) {
    if (bondWord === 'ionic') return 'A big electronegativity gap (' + d.toFixed(1) + ') means one atom yanks an electron clean off the other — an ionic bond.';
    if (bondWord.indexOf('nonpolar') >= 0) return 'With nearly equal electronegativities, the atoms share electrons evenly — a nonpolar covalent bond.';
    return 'A moderate electronegativity gap (' + d.toFixed(1) + ') means electrons are shared unequally — a polar covalent bond.';
  }

  // mixture of 3+ or unclassifiable
  function genericMixture(syms, ctx) {
    // most reactive pair
    var best = null;
    for (var i = 0; i < syms.length; i++) for (var j = i + 1; j < syms.length; j++) {
      var sc = reactivity(syms[i]) + reactivity(syms[j]);
      if (!best || sc > best.sc) best = { a: syms[i], b: syms[j], sc: sc };
    }
    var names = syms.map(function (s) { return el(s) ? el(s).name : s; });
    var emoji = '⚗️';
    var effects = {};
    return {
      kind: 'mixture', emoji: emoji, title: 'Complex mixture',
      products: [], hazard: 0, effects: effects, estimate: true,
      desc: 'A jumble of <b>' + names.join(', ') + '</b>. Many products are possible — based on a simple activity score, the pair most likely to merit further investigation is <b>' +
        (el(best.a) ? el(best.a).name : best.a) + '</b> and <b>' + (el(best.b) ? el(best.b).name : best.b) +
        '</b>, which may be worth checking in a more detailed model. Try just two elements for a more focused estimate.',
      fact: 'Real mixtures get complicated fast — this is where chemists reach for equations and a fume hood.'
    };
  }

  // single element on its own
  function describeElement(sym, ctx) {
    var e = el(sym);
    if (!e) return null;
    if (isSuperheavy(sym)) {
      return { kind: 'unstable', emoji: '☢️', title: e.name + ' — fleeting & synthetic', products: [], hazard: 3,
        effects: { light: true }, desc: '<b>' + e.name + '</b> is a synthetic superheavy element. Only a handful of atoms have ever existed, surviving for <b>fractions of a second</b> before radioactively decaying — far too briefly to do any chemistry.',
        fact: 'Element ' + e.number + ' has to be slammed together one atom at a time in a particle accelerator.' };
    }
    var st = stateAt(sym, ctx.temp);
    if (isNoble(sym)) {
      return { kind: 'inert', emoji: '🎈', title: e.name + ' — a noble gas', products: [], hazard: 0, effects: { gas: true },
        desc: '<b>' + e.name + '</b> sits there serenely. With a full outer electron shell it has no reason to bond — it is <b>chemically inert</b>. Currently a <b>' + st.toLowerCase() + '</b>.',
        fact: e.symbol === 'He' ? 'Helium is so unreactive it has never formed a stable compound at all.' : 'Noble gases were once called the "inert gases" — until chemists bullied xenon into reacting in 1962.' };
    }
    var diat = DIATOMIC[sym];
    return { kind: 'element', emoji: '🔬', title: e.name + ' (' + e.symbol + ')', products: [], hazard: Math.min(3, Math.round(reactivity(sym) / 3)),
      effects: reactivity(sym) >= 8 ? { fire: false, gas: true } : {},
      desc: 'Pure <b>' + e.name + '</b>' + (diat ? ' exists as diatomic ' + e.symbol + '<sub>2</sub> molecules' : '') + '. At <b>' + fmtT(ctx.temp) + '</b> it is a <b>' + st.toLowerCase() + '</b>. ' +
        (reactivity(sym) >= 7 ? 'It\'s highly reactive — add a partner element, water or air to see fireworks.' : 'Add another element to the cauldron to make it react.'),
      fact: e.appearance ? ('Appearance: ' + e.appearance + '.') : 'Atomic number ' + e.number + ', ' + (e.mass ? e.mass + ' u.' : '') };
  }

  function fmtT(T) { return Math.round(T - 273.15) + ' °C'; }

  // =========================================================================
  //  MAIN ENTRY
  //  symbols: array of selected element symbols (may repeat -> deduped here)
  //  ctx: { temp:Kelvin, water:bool, air:bool, spark:bool }
  // =========================================================================
  function simulate(symbols, ctx) {
    ctx = ctx || {}; ctx.temp = ctx.temp == null ? 298 : ctx.temp;
    var uniq = []; var seen = {};
    symbols.forEach(function (s) { if (!seen[s]) { seen[s] = 1; uniq.push(s); } });

    // Frozen-solid guard: extreme cold suppresses chemistry
    if (ctx.temp <= 20 && uniq.length > 1) {
      return finish({
        kind: 'no-reaction', emoji: '🧊', title: 'Frozen solid',
        products: [], hazard: 0, effects: {},
        desc: 'At <b>' + fmtT(ctx.temp) + '</b> (near absolute zero) everything is frozen rock-solid and atoms barely move — no reaction can get going. <b>Warm it up</b> to react.',
        fact: 'Near absolute zero, even gases like oxygen become pale-blue liquids and then solids.'
      }, uniq, ctx);
    }

    if (uniq.length === 0) return null;

    var ignite = ctx.spark || ctx.temp >= 700;
    var ctx2 = { temp: ctx.temp, water: ctx.water, air: ctx.air, spark: ctx.spark, ignite: ignite };

    // 1) curated match (try the selected set; also try set + nothing)
    var k = keyOf(uniq);
    var rules = CURATED_INDEX[k] || [];
    var matched = pickRule(rules, ctx2);
    if (matched) return finish(fromRule(matched), uniq, ctx);

    // 2) single element specials (water/air driven) e.g. Na + water
    if (uniq.length === 1) {
      var single = uniq[0];
      // metal + water
      if (ctx.water && (el(single) && (el(single).category === 'alkali metal' || el(single).category === 'alkaline earth metal'))) {
        // generic alkali/alkaline-earth-in-water if not curated
        var r = reactivity(single);
        return finish({
          kind: 'reaction', emoji: r >= 7 ? '💥' : '🫧', title: el(single).name + ' in Water',
          products: [{ f: el(single).symbol + 'OH', n: el(single).name + ' hydroxide' }, { f: 'H2', n: 'Hydrogen' }],
          hazard: Math.min(5, Math.round(r / 2) + 1), effects: { bubbles: true, gas: true },
          desc: '<b>' + el(single).name + '</b> is predicted to react with water, releasing hydrogen gas and forming a hydroxide. The model does not assume ignition or an explosion because the amount and setup are unknown.',
          fact: 'The further down the periodic table, the more violent the metal-and-water reaction.'
        }, uniq, ctx);
      }
      // fuel + air + ignite -> combustion to oxide
      if (ctx.air && ignite && OX[single] > 0 && !isNoble(single)) {
        var oxRule = CURATED_INDEX[keyOf([single, 'O'])];
        if (oxRule) { var m2 = pickRule(oxRule, ctx2); if (m2) return finish(fromRule(m2), uniq, ctx); }
        return finish(combustionToOxide(single, ctx), uniq, ctx);
      }
      return finish(describeElement(single, ctx), uniq, ctx);
    }

    // 3) air adds oxygen as a partner for combustion of a single chosen fuel
    if (uniq.length === 1 && ctx.air) { /* handled above */ }

    // 4) two elements -> binary predictor (respect noble gas inertness)
    if (uniq.length === 2) {
      if (isNoble(uniq[0]) || isNoble(uniq[1])) {
        var noble = isNoble(uniq[0]) ? uniq[0] : uniq[1];
        var other = isNoble(uniq[0]) ? uniq[1] : uniq[0];
        // Xe + F is the famous exception
        if (noble === 'Xe' && other === 'F') {
          return finish({ kind: 'reaction', emoji: '❄️', title: 'Xenon + Fluorine', products: [{ f: 'XeF2', n: 'Xenon difluoride' }],
            hazard: 3, effects: { color: '#dff' }, equation: 'Xe + F₂ → XeF₂',
            desc: 'The reaction that broke the rules in 1962: fluorine is so ferociously electron-hungry it forces even a <b>noble gas</b> to bond, making colourless XeF₂ crystals.',
            fact: 'Before this, every textbook said the noble gases simply could not form compounds.' }, uniq, ctx);
        }
        return finish({ kind: 'inert', emoji: '🎈', title: el(noble).name + ' won\'t react', products: [], hazard: 0, effects: { gas: true },
          desc: '<b>' + el(noble).name + '</b> is a noble gas with a full outer shell — it ignores <b>' + (el(other) ? el(other).name : other) + '</b> entirely. No reaction.',
          fact: 'This aloofness is why noble gases fill light bulbs, balloons and welding shrouds.' }, uniq, ctx);
      }
      if (isSuperheavy(uniq[0]) || isSuperheavy(uniq[1])) {
        return finish(describeElement(isSuperheavy(uniq[0]) ? uniq[0] : uniq[1], ctx), uniq, ctx);
      }
      return finish(predictBinary(uniq[0], uniq[1], ctx2), uniq, ctx);
    }

    // 5) three+ -> try curated, else mixture
    return finish(genericMixture(uniq, ctx2), uniq, ctx);
  }

  function combustionToOxide(sym, ctx) {
    var cross = crossFormula(sym, 'O');
    if (!cross) return describeElement(sym, ctx);
    var map = {}; map[sym] = cross.ncat; map.O = cross.nan;
    var name = nameBinary(sym, 'O', cross);
    var r = reactivity(sym);
    return { kind: 'reaction', emoji: '🔥', title: 'Burning ' + el(sym).name, products: [{ f: sym + (cross.ncat > 1 ? cross.ncat : '') + 'O' + (cross.nan > 1 ? cross.nan : ''), n: name }],
      hazard: Math.min(5, Math.round(r / 2) + 1), effects: { fire: true, light: true, color: el(sym).color || '#ff9a3c' }, shake: r >= 8,
      equation: el(sym).symbol + ' + O₂ → ' + fForm(map),
      desc: '<b>' + el(sym).name + '</b> burns in air, combining with oxygen to form <b>' + name + '</b>.',
      fact: 'Combustion is just very fast oxidation — the same reaction as rusting, only in a hurry.' };
  }

  function pickRule(rules, ctx2) {
    // prefer a rule whose needs are satisfied; among those, the most specific
    var ok = rules.filter(function (r) { return needsMet(r.needs, ctx2); });
    if (ok.length) {
      ok.sort(function (a, b) { return needCount(b.needs) - needCount(a.needs); });
      return ok[0];
    }
    // none satisfied: if a rule has needs but they aren't met, fall through (so the
    // "no spark" variant or generic path can speak). Only auto-pick a needless rule.
    var free = rules.filter(function (r) { return !r.needs || Object.keys(r.needs).length === 0; });
    return free[0] || null;
  }
  function needsMet(needs, ctx2) {
    if (!needs) return true;
    if (needs.water && !ctx2.water) return false;
    if (needs.air && !ctx2.air) return false;
    if (needs.ignite && !ctx2.ignite) return false;
    if (needs.minTemp && ctx2.temp < needs.minTemp) return false;
    return true;
  }
  function needCount(n) { return n ? Object.keys(n).length : 0; }

  function fromRule(r) {
    return {
      kind: r.products && r.products.length ? 'reaction' : (r.kind || 'no-reaction'),
      emoji: r.emoji, title: r.title,
      products: (r.products || []).map(function (p) { return { f: p.f, n: p.n }; }),
      hazard: r.hazard || 0, effects: r.effects || {}, shake: !!r.shake,
      equation: r.eq ? r.eq : null, desc: r.desc, fact: r.fact, hint: r.hint || null
    };
  }

  // attach state-of-matter + discovery info, normalise
  function finish(res, uniq, ctx) {
    if (!res) return null;
    res.inputs = uniq.slice();
    res.temp = ctx.temp;
    // Only curated, condition-aware reactions count as discoveries. A guessed
    // charge-balanced formula is not evidence that a compound was made.
    res.discovered = null;
    if (!res.estimate && res.kind === 'reaction' && res.products && res.products.length) {
      var p = res.products[0];
      if (p && p.f && /[A-Za-z].*[A-Za-z]/.test(p.f)) res.discovered = { f: p.f, n: p.n };
    }
    if (!res.equation && res.products && res.products.length) {
      res.equation = uniq.join(' + ') + ' → ' + res.products.map(function (p) { return formatFormula(p.f); }).join(' + ');
    }
    // thermodynamics: prefer tabulated balanced data, else the Pauling estimate
    var realThermo = null;
    if (res.products && res.products.length) {
      for (var i = 0; i < res.products.length && !realThermo; i++) {
        if (THERMO_BAL[res.products[i].f]) realThermo = thermo(THERMO_BAL[res.products[i].f], ctx.temp);
      }
    }
    res.thermo = realThermo || null;
    if (!res.hint) res.hint = computeHint(uniq, ctx, res);
    return res;
  }

  // ---- contextual "what to do next" hints --------------------------------
  function computeHint(uniq, ctx, res) {
    var n = uniq.length;
    var has = function (s) { return uniq.indexOf(s) >= 0; };
    // thermodynamic steering: if a reaction isn't favoured at this T, say which way to go
    if (res.thermo && !res.thermo.estimated && res.thermo.crossover != null && res.kind === 'reaction') {
      var cC = Math.round(res.thermo.crossover - 273.15);
      if (cC > -270 && cC < 5700) {
        if (!res.thermo.spontaneous) return (res.thermo.dS > 0 ? '🔥 Heat above ' : '❄️ Cool below ') + cC + ' °C to make ΔG favour the products.';
        return '🌡️ Slide past ' + cC + ' °C to watch ΔG flip sign and the reaction reverse.';
      }
    }
    if (n === 1) {
      var e = el(uniq[0]);
      if (!e) return null;
      if (isNoble(uniq[0])) return 'Noble gases barely react — open it in 3D to explore instead.';
      if (isSuperheavy(uniq[0])) return 'Too short-lived for chemistry — but worth a look in 3D.';
      if (e.category === 'alkali metal') return ctx.water ? 'Now try a halogen — Cl or Br — to model salt formation.' : '💧 Add Water to model a reaction, or try a halogen (Cl, Br) for a salt-forming example.';
      if (e.category === 'alkaline earth metal') return '🌬️ Add Air then ⚡ Spark to burn it, or splash 💧 Water.';
      if (has('H') || has('C') || has('S') || has('P')) return '🌬️ Add Air, then ⚡ Spark to burn it.';
      if (['F', 'Cl', 'Br', 'I'].indexOf(uniq[0]) >= 0) return 'Add a metal — Na, K, Ca or Fe — to forge a salt.';
      if (isMetal(uniq[0])) return '🌬️ Add Air to oxidise it, or a nonmetal (O, Cl, S) partner.';
      return 'Add a second element to react — or open it in 3D.';
    }
    if (res.kind === 'alloy') return 'Two metals do not form a compound just by being selected. Add a nonmetal to explore a possible reaction.';
    if (res.kind === 'inert') return 'This combination has no reaction represented here. Try a different partner or inspect the element details.';
    if (res.kind === 'no-reaction') return res.hint || 'Nothing yet — add ⚡ Spark, 🌬️ Air, 💧 Water, or more heat.';
    if (res.kind === 'mixture') return 'Lots going on — try just two elements for a clean prediction.';
    if (res.kind === 'reaction') return 'Nice! Change the temperature, or drop in another element.';
    return null;
  }

  // turn "Fe2O3" into "Fe<sub>2</sub>O<sub>3</sub>"
  function formatFormula(f) {
    return String(f).replace(/([A-Za-z\)\]])(\d+)/g, function (_, a, n) { return a + '<sub>' + n + '</sub>'; });
  }

  // ---- public API ---------------------------------------------------------
  window.Chem = {
    simulate: simulate,
    stateAt: stateAt,
    reactivity: reactivity,
    isMetal: isMetal, isNonmetal: isNonmetal, isNoble: isNoble,
    formatFormula: formatFormula,
    fmtT: fmtT, thermo: thermo
  };
})();
