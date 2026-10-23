(function () {
  'use strict';

  var molecules = {
    H2: {
      names: { en: 'Hydrogen', ar: 'الهيدروجين' },
      atoms: [{ label: 'H', x: 130, y: 110 }, { label: 'H', x: 230, y: 110 }],
      bonds: [[0, 1, 1]]
    },
    H2O: {
      names: { en: 'Water', ar: 'الماء' },
      atoms: [
        { label: 'H', x: 115, y: 70 },
        { label: 'O', x: 180, y: 125, pairs: 2 },
        { label: 'H', x: 245, y: 70 }
      ],
      bonds: [[0, 1, 1], [1, 2, 1]]
    },
    CO2: {
      names: { en: 'Carbon dioxide', ar: 'ثاني أكسيد الكربون' },
      atoms: [
        { label: 'O', x: 85, y: 110, pairs: 2 },
        { label: 'C', x: 180, y: 110 },
        { label: 'O', x: 275, y: 110, pairs: 2 }
      ],
      bonds: [[0, 1, 2], [1, 2, 2]]
    },
    NH3: {
      names: { en: 'Ammonia', ar: 'الأمونيا' },
      atoms: [
        { label: 'N', x: 180, y: 115, pairs: 1 },
        { label: 'H', x: 180, y: 45 },
        { label: 'H', x: 120, y: 165 },
        { label: 'H', x: 240, y: 165 }
      ],
      bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]]
    },
    CH4: {
      names: { en: 'Methane', ar: 'الميثان' },
      atoms: [
        { label: 'C', x: 180, y: 110 },
        { label: 'H', x: 180, y: 40 },
        { label: 'H', x: 110, y: 110 },
        { label: 'H', x: 250, y: 110 },
        { label: 'H', x: 180, y: 180 }
      ],
      bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]
    },
    HCl: {
      names: { en: 'Hydrogen chloride', ar: 'كلوريد الهيدروجين' },
      atoms: [{ label: 'H', x: 130, y: 110 }, { label: 'Cl', x: 230, y: 110, pairs: 3 }],
      bonds: [[0, 1, 1]]
    },
    O2: {
      names: { en: 'Oxygen', ar: 'الأكسجين' },
      atoms: [{ label: 'O', x: 130, y: 110, pairs: 2 }, { label: 'O', x: 230, y: 110, pairs: 2 }],
      bonds: [[0, 1, 2]]
    },
    N2: {
      names: { en: 'Nitrogen', ar: 'النيتروجين' },
      atoms: [{ label: 'N', x: 130, y: 110, pairs: 1 }, { label: 'N', x: 230, y: 110, pairs: 1 }],
      bonds: [[0, 1, 3]]
    },
    H2S: {
      names: { en: 'Hydrogen sulfide', ar: 'كبريتيد الهيدروجين' },
      atoms: [
        { label: 'H', x: 115, y: 70 },
        { label: 'S', x: 180, y: 125, pairs: 2 },
        { label: 'H', x: 245, y: 70 }
      ],
      bonds: [[0, 1, 1], [1, 2, 1]]
    }
  };

  function list(language) {
    var lang = language === 'ar' ? 'ar' : 'en';
    return Object.keys(molecules).map(function (formula) {
      return { formula: formula, name: molecules[formula].names[lang] };
    });
  }

  function has(formula) {
    return Object.prototype.hasOwnProperty.call(molecules, formula);
  }

  function render(formula, language) {
    var molecule = molecules[formula];
    if (!molecule) return '';

    var lang = language === 'ar' ? 'ar' : 'en';
    var name = molecule.names[lang];
    var bonds = molecule.bonds.map(function (bond) {
      var a = molecule.atoms[bond[0]], b = molecule.atoms[bond[1]];
      var dx = b.x - a.x, dy = b.y - a.y;
      var length = Math.sqrt(dx * dx + dy * dy);
      var ox = -dy / length * 4, oy = dx / length * 4;
      var lines = '';
      for (var i = 0; i < bond[2]; i++) {
        var offset = (i - (bond[2] - 1) / 2) * 6;
        lines += '<line class="bond-line" x1="' + (a.x + ox * offset / 4) + '" y1="' + (a.y + oy * offset / 4) +
          '" x2="' + (b.x + ox * offset / 4) + '" y2="' + (b.y + oy * offset / 4) + '"/>';
      }
      return lines;
    }).join('');

    var atoms = molecule.atoms.map(function (atom, index) {
      var pairs = '';
      for (var i = 0; i < (atom.pairs || 0); i++) {
        var angle = Math.atan2(atom.y - 110, atom.x - 180) + (i - ((atom.pairs || 0) - 1) / 2) * 0.8;
        var px = atom.x + Math.cos(angle) * 26, py = atom.y + Math.sin(angle) * 26;
        var tx = -Math.sin(angle) * 4, ty = Math.cos(angle) * 4;
        pairs += '<circle class="lone-dot" cx="' + (px - tx) + '" cy="' + (py - ty) + '" r="2.5"/>' +
          '<circle class="lone-dot" cx="' + (px + tx) + '" cy="' + (py + ty) + '" r="2.5"/>';
      }
      return pairs + '<g><circle class="atom-pill" cx="' + atom.x + '" cy="' + atom.y + '" r="24"/>' +
        '<text class="atom-label-svg" x="' + atom.x + '" y="' + (atom.y + 6) + '">' + atom.label + '</text></g>';
    }).join('');
    var caption = lang === 'ar'
      ? 'رسم تعليمي مبسط ثنائي الأبعاد؛ لا يوضح الشكل الفراغي أو كثافة الإلكترونات.'
      : 'Educational 2D sketch; it does not show 3D geometry or electron density.';

    return '<article class="molecule-diagram" dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '">' +
      '<div class="molecule-formula">' + formula + ' · ' + name + '</div>' +
      '<svg viewBox="0 0 360 220" role="img" aria-label="' + formula + ' Lewis structure">' +
      '<rect class="molecule-svg-bg" x="1" y="1" width="358" height="218" rx="14"/>' + bonds + atoms +
      '</svg><p class="molecule-disclaimer">' + caption + '</p></article>';
  }

  window.MoleculeLewis = { list: list, has: has, render: render };
})();
