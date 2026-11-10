/* ===========================================================================
   Chemistry Hypothesis Lab — pick two substances, mix them, watch a 3D beaker.
   Only documented textbook reactions are modelled; any other pair is reported
   honestly as "not in the model" instead of inventing a result.
   =========================================================================== */
(function () {
  'use strict';
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lang() {
    if (window.CHEM_LANGUAGE) return window.CHEM_LANGUAGE;
    try { return localStorage.getItem('chemlab.language') === 'ar' ? 'ar' : 'en'; } catch (e) { return 'en'; }
  }

  // id: [Arabic, English, formula, colour, state (s/l/g)]
  var S = {
    H2O: ['ماء', 'Water', 'H₂O', '#7fc4ff', 'l'], HCl: ['حمض الهيدروكلوريك', 'Hydrochloric acid', 'HCl', '#d8e6ff', 'l'],
    NaOH: ['هيدروكسيد الصوديوم', 'Sodium hydroxide', 'NaOH', '#d8e6ff', 'l'], AcOH: ['خل (حمض الإيثانويك)', 'Vinegar (ethanoic acid)', 'CH₃COOH', '#f1e4c8', 'l'],
    CuSO4: ['كبريتات النحاس II', 'Copper(II) sulfate', 'CuSO₄', '#2f7fe0', 'l'], AgNO3: ['نترات الفضة', 'Silver nitrate', 'AgNO₃', '#e9eef5', 'l'],
    NaCl: ['ملح الطعام', 'Table salt', 'NaCl', '#d8eaff', 'l'], NaOCl: ['مبيّض (هيبوكلوريت الصوديوم)', 'Bleach (sodium hypochlorite)', 'NaOCl', '#f4f1b8', 'l'],
    NH3: ['محلول الأمونيا', 'Ammonia solution', 'NH₃', '#e3f1ff', 'l'],
    Na: ['الصوديوم', 'Sodium', 'Na', '#c9ced4', 's'], K: ['البوتاسيوم', 'Potassium', 'K', '#c9ced4', 's'], Mg: ['المغنيسيوم', 'Magnesium', 'Mg', '#aeb3b8', 's'],
    Zn: ['الزنك', 'Zinc', 'Zn', '#b5bdc4', 's'], Fe: ['الحديد', 'Iron', 'Fe', '#8a8d91', 's'],
    NaHCO3: ['بيكربونات الصوديوم', 'Baking soda', 'NaHCO₃', '#f2f2f2', 's'], CaCO3: ['كربونات الكالسيوم (رخام)', 'Calcium carbonate (marble)', 'CaCO₃', '#eeeeee', 's'],
    H2: ['الهيدروجين', 'Hydrogen', 'H₂', '#cfe8ff', 'g'], O2: ['الأكسجين', 'Oxygen', 'O₂', '#bfd8ff', 'g']
  };
  var ORDER = ['H2O', 'HCl', 'NaOH', 'AcOH', 'NH3', 'NaOCl', 'CuSO4', 'AgNO3', 'NaCl', 'Na', 'K', 'Mg', 'Zn', 'Fe', 'NaHCO3', 'CaCO3', 'H2', 'O2'];

  // eq, liq (final liquid colour), bub 0-3, fire colour, ppt colour, gas colour, shake 0-1, danger 0-3, spark flag, then ar/en = [title, what, why, safety]
  var R = {
    'H2O+Na': { eq: '2Na + 2H₂O → 2NaOH + H₂↑', liq: '#dbeaff', bub: 3, fire: '#ffc94d', shake: .25, danger: 2,
      ar: ['الصوديوم + الماء', 'تنصهر قطعة الصوديوم إلى كرة لامعة تجري فوق الماء ويتصاعد الهيدروجين بفقاعات سريعة، ويصبح المحلول قاعدياً. قد يشتعل الهيدروجين بلهب أصفر.', 'الصوديوم فلز نشط جداً يفقد إلكتروناً بسهولة، فيختزل الماء إلى H₂ ويكوّن NaOH. التفاعل شديد الطرد للحرارة، والحرارة تصهر الصوديوم (يـنصهر عند نحو 98 °م) وقد تشعل الهيدروجين.', 'يتفاعل الصوديوم مع رطوبة الجلد، والمحلول الناتج كاوٍ. لا يُجرَّب إلا في مختبر مرخّص وبإشراف.'],
      en: ['Sodium + water', 'The sodium melts into a shiny ball that skates over the water while hydrogen bubbles off rapidly. The solution turns alkaline, and the hydrogen can ignite with a yellow flame.', 'Sodium is a very reactive metal that loses an electron easily, reducing water to H₂ and forming NaOH. The reaction is strongly exothermic; the heat melts the sodium (m.p. about 98 °C) and can ignite the hydrogen.', 'Sodium reacts with skin moisture and the product is caustic. Only for a licensed lab under supervision.'] },
    'H2O+K': { eq: '2K + 2H₂O → 2KOH + H₂↑', liq: '#dbeaff', bub: 3, fire: '#c77dff', shake: .7, danger: 3,
      ar: ['البوتاسيوم + الماء', 'أعنف من الصوديوم: ينصهر البوتاسيوم فوراً ويشتعل الهيدروجين بلهب بنفسجي فاتح، وقد يتناثر المعدن المنصهر بفرقعة.', 'البوتاسيوم تحت الصوديوم في المجموعة الأولى، فطاقة تأينه أقل (نحو 419 كج/مول مقابل 496)، فيفقد إلكتروناً أسرع ويطلق حرارة أكبر بوتيرة أسرع تكفي لإشعال الهيدروجين. اللون البنفسجي من أيونات البوتاسيوم في اللهب.', 'خطر تناثر وحروق وانفجار صغير. لا يُجرَّب خارج مختبر مرخّص.'],
      en: ['Potassium + water', 'More violent than sodium: potassium melts at once and the hydrogen burns with a lilac flame; molten metal may spatter with a pop.', 'Potassium sits below sodium in Group 1, so its ionisation energy is lower (about 419 vs 496 kJ/mol). It gives up an electron faster and releases heat quickly enough to ignite the hydrogen. The lilac colour comes from potassium ions in the flame.', 'Risk of spattering, burns and small explosions. Licensed labs only.'] },
    'HCl+NaOH': { eq: 'HCl + NaOH → NaCl + H₂O', liq: '#dfeaff', bub: 0, shake: 0, danger: 1,
      ar: ['حمض + قاعدة (تعادل)', 'لا يتغير شيء ظاهر للعين، لكن الإناء يسخن قليلاً ويصبح الخليط ماءً مالحاً قريباً من التعادل.', 'تفاعل تعادل: يتحد H⁺ من الحمض مع OH⁻ من القاعدة فيتكوّن الماء، ويبقى Na⁺ وCl⁻ في المحلول. ينطلق نحو 57 كج لكل مول ماء متكوّن.', 'كلاهما كاوٍ بتركيز عالٍ: نظارات وقفازات ضرورية.'],
      en: ['Acid + base (neutralisation)', 'Nothing dramatic is visible, but the vessel warms slightly and the mixture becomes salty water close to neutral.', 'H⁺ from the acid combines with OH⁻ from the base to form water, leaving Na⁺ and Cl⁻ in solution. About 57 kJ is released per mole of water formed.', 'Both are corrosive when concentrated: wear goggles and gloves.'] },
    'AcOH+NaHCO3': { eq: 'CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑', liq: '#f4ecd8', bub: 3, shake: 0, danger: 0,
      ar: ['الخل + بيكربونات الصوديوم', 'رغوة كثيفة وفوران من غاز ثاني أكسيد الكربون، ويبرد الخليط قليلاً.', 'يعطي الحمض الضعيف بروتوناً لأيون البيكربونات فيتكوّن حمض الكربونيك غير المستقر الذي يتفكك إلى ماء وCO₂. التفاعل ماص للحرارة قليلاً فتنخفض الحرارة.', 'آمن نسبياً، لكن لا تغلق الإناء بإحكام لأن الغاز يرفع الضغط.'],
      en: ['Vinegar + baking soda', 'Thick foam and fizzing of carbon dioxide; the mixture cools slightly.', 'The weak acid donates a proton to the bicarbonate ion, forming unstable carbonic acid that breaks down into water and CO₂. The reaction is slightly endothermic, so it gets colder.', 'Relatively safe, but never seal the container: the gas builds pressure.'] },
    'HCl+Mg': { eq: 'Mg + 2HCl → MgCl₂ + H₂↑', liq: '#e2ecf7', bub: 3, shake: .1, danger: 1,
      ar: ['المغنيسيوم + حمض الهيدروكلوريك', 'يذوب شريط المغنيسيوم تدريجياً مع فقاعات هيدروجين وتسخن المحلول.', 'المغنيسيوم أنشط من الهيدروجين في سلسلة النشاط فيحل محله من الحمض ويكوّن كلوريد المغنيسيوم. التفاعل طارد للحرارة.', 'الهيدروجين قابل للاشتعال: ابتعد عن اللهب.'],
      en: ['Magnesium + hydrochloric acid', 'The magnesium ribbon dissolves gradually with hydrogen bubbles and the solution warms.', 'Magnesium is more reactive than hydrogen, so it displaces it from the acid, forming magnesium chloride. The reaction is exothermic.', 'Hydrogen is flammable: keep flames away.'] },
    'CuSO4+Zn': { eq: 'Zn + CuSO₄ → ZnSO₄ + Cu', liq: '#e6f0f5', ppt: '#b0603a', shake: 0, danger: 0,
      ar: ['الزنك + كبريتات النحاس', 'يبهت اللون الأزرق تدريجياً وتتكوّن طبقة نحاسية بنية محمرّة على سطح الزنك.', 'الزنك أنشط من النحاس فيفقد إلكترونين ويدخل المحلول Zn²⁺، بينما تكتسب أيونات Cu²⁺ الزرقاء الإلكترونات وتترسب نحاساً فلزياً (تفاعل إحلال).', 'أملاح النحاس سامة للكائنات المائية؛ لا تُصرَّف في المجاري.'],
      en: ['Zinc + copper sulfate', 'The blue colour fades and a reddish-brown copper layer forms on the zinc.', 'Zinc is more reactive than copper: it loses two electrons into solution as Zn²⁺ while the blue Cu²⁺ ions gain electrons and deposit as copper metal (a displacement reaction).', 'Copper salts are toxic to aquatic life; never pour them down the drain.'] },
    'CuSO4+Fe': { eq: 'Fe + CuSO₄ → FeSO₄ + Cu', liq: '#bfe3c0', ppt: '#b0603a', shake: 0, danger: 0,
      ar: ['الحديد + كبريتات النحاس', 'يتحول الأزرق إلى أخضر باهت ويكتسي الحديد بطبقة نحاسية.', 'الحديد أنشط من النحاس فيحل محله في المحلول؛ يتكوّن Fe²⁺ ذو اللون الأخضر الباهت ويترسب النحاس.', 'أملاح النحاس سامة للكائنات المائية.'],
      en: ['Iron + copper sulfate', 'Blue turns pale green and the iron becomes coated with copper.', 'Iron is more reactive than copper and displaces it; pale-green Fe²⁺ forms and copper deposits.', 'Copper salts are toxic to aquatic life.'] },
    'AgNO3+NaCl': { eq: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃', liq: '#eef2f7', ppt: '#f4f6f8', shake: 0, danger: 1,
      ar: ['نترات الفضة + ملح الطعام', 'يتكوّن فوراً راسب أبيض متخثّر يجعل المحلول عكراً، ويسودّ الراسب ببطء في الضوء.', 'كلوريد الفضة شحيح الذوبان جداً، فتتحد Ag⁺ وCl⁻ وتترسبان بدل البقاء مذابتين. هذا اختبار كلاسيكي للكشف عن أيونات الكلوريد.', 'نترات الفضة تصبغ الجلد بالأسود وهي مؤكسِدة.'],
      en: ['Silver nitrate + table salt', 'A white curdy precipitate forms at once and clouds the solution; it slowly darkens in light.', 'Silver chloride is almost insoluble, so Ag⁺ and Cl⁻ precipitate instead of staying dissolved. A classic test for chloride ions.', 'Silver nitrate stains skin black and is an oxidiser.'] },
    'CaCO3+HCl': { eq: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑', liq: '#e6eef8', bub: 2, shake: 0, danger: 1,
      ar: ['الرخام + حمض الهيدروكلوريك', 'يتفتت الرخام مع فوران ثاني أكسيد الكربون.', 'الكربونات تتفاعل مع الأحماض فتنتج حمض الكربونيك غير المستقر الذي يتحلل إلى ماء وCO₂؛ ولهذا تُذيب الأمطار الحمضية الحجر الجيري.', 'الحمض مهيّج للعينين والجلد.'],
      en: ['Marble + hydrochloric acid', 'The marble crumbles while carbon dioxide fizzes off.', 'Carbonates react with acids to give unstable carbonic acid, which breaks down into water and CO₂; this is why acid rain dissolves limestone.', 'The acid irritates eyes and skin.'] },
    'H2+O2': { eq: '2H₂ + O₂ → 2H₂O', fire: '#9fd8ff', shake: 1, danger: 3, spark: true,
      ar: ['الهيدروجين + الأكسجين', 'عند الخلط في الحرارة العادية لا يحدث شيء ملحوظ. ثم اضغط «شرارة» ينفجر الخليط بفرقعة قوية ويتكوّن بخار الماء.', 'الخليط مستقر ظاهرياً لأن التفاعل يحتاج طاقة تنشيط. الشرارة تبدأ سلسلة تفاعلات تنتشر بسرعة هائلة. ينطلق نحو 484 كج لكل 2 مول هيدروجين (ماء بخاري).', 'خليط الهيدروجين والهواء ينفجر في نطاق تركيز واسع. لا تحاول ذلك.'],
      en: ['Hydrogen + oxygen', 'Mixed at room temperature, nothing noticeable happens. Press "Spark" and the mixture explodes with a loud bang, forming water vapour.', 'The mixture is only apparently stable because the reaction needs activation energy. A spark starts a chain reaction that spreads extremely fast. About 484 kJ is released per 2 mol of hydrogen (steam).', 'Hydrogen–air mixtures explode over a wide concentration range. Never attempt this.'] },
    'HCl+NaOCl': { eq: 'NaOCl + 2HCl → NaCl + H₂O + Cl₂↑', liq: '#e9efb0', gas: '#c9e265', shake: 0, danger: 3,
      ar: ['المبيّض + حمض', 'يتصاعد غاز أصفر مخضر خانق هو الكلور.', 'الحمض يحوّل أيون الهيبوكلوريت إلى كلور حر؛ ولهذا يُحذَّر دائماً من خلط المبيّضات بالمنظفات الحمضية.', 'الكلور سام للعينين والرئتين. عند حدوثه في الواقع: اخرج إلى الهواء الطلق واتصل بمركز السموم.'],
      en: ['Bleach + acid', 'A choking yellow-green gas, chlorine, bubbles off.', 'The acid converts hypochlorite ions into free chlorine, which is why bleach must never be mixed with acidic cleaners.', 'Chlorine is toxic to eyes and lungs. If it happens for real: get to fresh air and call poison control.'] },
    'NH3+NaOCl': { eq: 'NH₃ + NaOCl → NH₂Cl + NaOH', liq: '#eef3dc', gas: '#d9e8c4', shake: 0, danger: 3,
      ar: ['المبيّض + الأمونيا', 'لا يظهر تغيّر لافت، لكن تتكوّن أبخرة كلورامين سامة ذات رائحة نفّاذة.', 'تتفاعل الأمونيا مع الهيبوكلوريت فتتكوّن الكلورامينات، وهي مهيّجة وسامة للجهاز التنفسي.', 'لا تخلط منظفات الأمونيا بالمبيّض أبداً. عند التعرض: هواء نقي ومركز السموم.'],
      en: ['Bleach + ammonia', 'There is no striking change, but toxic chloramine fumes with a sharp smell form.', 'Ammonia reacts with hypochlorite to give chloramines, which irritate and poison the respiratory system.', 'Never mix ammonia cleaners with bleach. If exposed: fresh air and poison control.'] }
  };
  var NONE = {
    ar: ['لا تفاعل معرَّف في النموذج', 'هذا المزيج ليس ضمن التفاعلات الموثّقة في المختبر، لذلك لا نعرض له نتيجة مختلقة.', 'قد لا يتفاعل المزيجان في الظروف العادية، أو لا يكون تفاعلهما ضمن ما يغطيه النموذج. جرّب مزيجاً آخر.', 'لا تخلط مواد حقيقية لتختبر فرضيتك.'],
    en: ['No reaction defined in the model', 'This pair is not among the documented reactions in the lab, so no invented result is shown.', 'The pair may not react under ordinary conditions, or its reaction is outside what the model covers. Try another pair.', 'Do not mix real chemicals to test a hypothesis.']
  };
  var T = {
    ar: { btn: '🧪 مختبر فرضيات الكيمياء', title: 'مختبر فرضيات الكيمياء', a: 'المادة الأولى', b: 'المادة الثانية', mix: 'امزج', spark: '⚡ شرارة', reset: 'إعادة', close: 'إغلاق', pick: 'اختر مادتين مختلفتين ثم اضغط «امزج».', what: 'ماذا يحدث؟', why: 'لماذا؟', safe: 'السلامة', eq: 'المعادلة', dl: 'الخطورة', dn: ['هادئ', 'حذِر', 'خطِر', 'شديد الخطورة'], hint: 'اسحب للتدوير · مرر للتكبير', note: 'محاكاة تعليمية مبنية على تفاعلات موثّقة، وليست دليلاً للتجارب. المؤثرات توضيحية.', nogl: 'المتصفح لا يدعم WebGL؛ تظهر النتيجة نصياً في اللوحة.', same: 'اختر مادتين مختلفتين.' },
    en: { btn: '🧪 Chemistry hypothesis lab', title: 'Chemistry hypothesis lab', a: 'First substance', b: 'Second substance', mix: 'Mix', spark: '⚡ Spark', reset: 'Reset', close: 'Close', pick: 'Choose two different substances, then press Mix.', what: 'What happens?', why: 'Why?', safe: 'Safety', eq: 'Equation', dl: 'Hazard', dn: ['Calm', 'Caution', 'Dangerous', 'Extremely dangerous'], hint: 'drag to rotate · scroll to zoom', note: 'An educational simulation of documented reactions, not an experiment guide. Effects are illustrative.', nogl: 'WebGL is not supported; the result is shown as text in the panel.', same: 'Choose two different substances.' }
  };
  function t(k) { return T[lang()][k]; }
  function nm(id) { return S[id][lang() === 'ar' ? 0 : 1]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var root = document.getElementById('hypo-modal'), btn = document.getElementById('hypo-btn');
  if (!root || !btn) return;
  var A = 'H2O', B = 'Na', entry = null, scene3d = null, built = false;

  function build() {
    root.innerHTML =
      '<div class="modal-backdrop" data-hypo-close></div>' +
      '<section id="hypo-card" class="hypo-card" role="dialog" aria-modal="true" aria-labelledby="hypo-title">' +
        '<button class="modal-close" data-hypo-close id="hypo-x"></button>' +
        '<div class="hypo-stage"><div id="hypo-gl" class="hypo-gl"></div><div id="hypo-flash" class="hypo-flash"></div><span id="hypo-hint" class="hypo-hint"></span>' +
          '<div class="hypo-controls">' +
            '<label><span id="hypo-la"></span><select id="hypo-a"></select></label>' +
            '<label><span id="hypo-lb"></span><select id="hypo-b"></select></label>' +
            '<div class="hypo-actions"><button id="hypo-mix" class="hypo-go" type="button"></button><button id="hypo-spark" class="hypo-go spark" type="button" hidden></button><button id="hypo-reset" class="ghost-btn" type="button"></button></div>' +
          '</div></div>' +
        '<aside id="hypo-panel" class="hypo-panel" aria-live="polite"></aside>' +
      '</section>';
    [].forEach.call(root.querySelectorAll('[data-hypo-close]'), function (b) { b.addEventListener('click', close); });
    $('hypo-a').addEventListener('change', function () { A = this.value; clearResult(); });
    $('hypo-b').addEventListener('change', function () { B = this.value; clearResult(); });
    $('hypo-mix').addEventListener('click', mix);
    $('hypo-spark').addEventListener('click', function () { if (scene3d) scene3d.explode(); flash(); this.hidden = true; });
    $('hypo-reset').addEventListener('click', clearResult);
    built = true; initGL(); labels();
  }
  function $(id) { return document.getElementById(id); }
  function labels() {
    if (!built) return;
    var opts = ORDER.map(function (id) { return '<option value="' + id + '">' + esc(S[id][2] + ' · ' + nm(id)) + '</option>'; }).join('');
    $('hypo-a').innerHTML = opts; $('hypo-b').innerHTML = opts; $('hypo-a').value = A; $('hypo-b').value = B;
    $('hypo-la').textContent = t('a'); $('hypo-lb').textContent = t('b'); $('hypo-mix').textContent = t('mix');
    $('hypo-spark').textContent = t('spark'); $('hypo-reset').textContent = t('reset'); $('hypo-hint').textContent = t('hint');
    $('hypo-x').setAttribute('aria-label', t('close')); $('hypo-x').textContent = '✕';
    root.setAttribute('dir', lang() === 'ar' ? 'rtl' : 'ltr');
    renderPanel();
  }
  function key() { return [A, B].sort().join('+'); }
  function renderPanel() {
    var p = $('hypo-panel');
    if (!entry) { p.innerHTML = '<h2 id="hypo-title">' + t('title') + '</h2><p class="hypo-pick">' + t('pick') + '</p><p class="hypo-note">' + t('note') + '</p>'; return; }
    var x = entry.r || NONE, d = lang() === 'ar' ? x.ar : x.en, dn = entry.r ? entry.r.danger : 0, i, bar = '';
    for (i = 0; i < 4; i++) bar += '<i class="' + (i <= dn ? 'on d' + dn : '') + '"></i>';
    p.innerHTML = '<h2 id="hypo-title">' + esc(d[0]) + '</h2>' +
      (entry.r ? '<div class="hypo-eq" dir="ltr">' + esc(entry.r.eq) + '</div><div class="hypo-danger"><span>' + t('dl') + ': <b>' + t('dn')[dn] + '</b></span><span class="bar">' + bar + '</span></div>' : '') +
      '<h3>' + t('what') + '</h3><p>' + esc(d[1]) + '</p><h3>' + t('why') + '</h3><p>' + esc(d[2]) + '</p><h3>' + t('safe') + '</h3><p class="hypo-safe">' + esc(d[3]) + '</p><p class="hypo-note">' + t('note') + '</p>';
  }
  function clearResult() { entry = null; $('hypo-spark').hidden = true; if (scene3d) scene3d.setup(A, B); renderPanel(); }
  function mix() {
    if (A === B) { $('hypo-panel').innerHTML = '<h2 id="hypo-title">' + t('title') + '</h2><p class="hypo-pick">' + t('same') + '</p>'; return; }
    var r = R[key()] || null; entry = { r: r }; renderPanel();
    if (scene3d) { scene3d.setup(A, B); if (r) scene3d.run(r); }
    $('hypo-spark').hidden = !(r && r.spark);
    if (r && r.shake >= .6 && !r.spark) shakeCard();
  }
  function shakeCard() { if (RM) return; var c = $('hypo-card'); c.classList.remove('shaking'); void c.offsetWidth; c.classList.add('shaking'); }
  function flash() { if (RM) return; var f = $('hypo-flash'); f.style.transition = 'none'; f.style.opacity = '.9'; requestAnimationFrame(function () { f.style.transition = 'opacity .7s'; f.style.opacity = '0'; }); shakeCard(); }

  // ---------------------------------------------------------------- 3D scene
  function initGL() {
    var host = $('hypo-gl');
    if (!window.THREE) { host.innerHTML = '<p class="hypo-nogl">' + t('nogl') + '</p>'; return; }
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { host.innerHTML = '<p class="hypo-nogl">' + t('nogl') + '</p>'; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);
    var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1, .1, 100);
    cam.position.set(0, 2.6, 8); var controls = THREE.OrbitControls ? new THREE.OrbitControls(cam, renderer.domElement) : null;
    if (controls) { controls.target.set(0, 1.4, 0); controls.enablePan = false; controls.minDistance = 5; controls.maxDistance = 12; controls.maxPolarAngle = 1.6; controls.autoRotate = !RM; controls.autoRotateSpeed = .8; controls.enableDamping = true; }
    scene.add(new THREE.AmbientLight(0xffffff, .65));
    var sun = new THREE.DirectionalLight(0xffffff, .9); sun.position.set(4, 8, 5); scene.add(sun);
    var glow = new THREE.PointLight(0xffaa44, 0, 9); glow.position.set(0, 1.8, 0); scene.add(glow);
    var table = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, .2, 64), new THREE.MeshStandardMaterial({ color: 0x1a2438, roughness: .6, metalness: .3 })); table.position.y = -.1; scene.add(table);
    var glass = new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: .16, roughness: .05, side: THREE.DoubleSide, depthWrite: false });
    var beaker = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.2, 2.9, 48, 1, true), glass); beaker.position.y = 1.45; scene.add(beaker);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(1.35, .03, 8, 48), new THREE.MeshStandardMaterial({ color: 0xdff1ff, roughness: .2 })); rim.rotation.x = Math.PI / 2; rim.position.y = 2.9; scene.add(rim);
    var liquid = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.15, 1, 40), new THREE.MeshStandardMaterial({ color: 0x7fc4ff, transparent: true, opacity: .7, roughness: .2 })); liquid.visible = false; scene.add(liquid);
    var content = new THREE.Group(); scene.add(content);
    var sph = new THREE.SphereGeometry(1, 10, 8), ps = [], clock = new THREE.Clock(), shake = 0, raf = 0, level = 0, topY = 2.8, tint = new THREE.Color(), tintTo = null, job = null;

    function size() { var w = host.clientWidth || 400, h = host.clientHeight || 400; renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    if (window.ResizeObserver) new ResizeObserver(size).observe(host); else window.addEventListener('resize', size);

    function spawn(k, col, x, y, z, vx, vy, vz, life, s) {
      if (ps.length > 420) return;
      var m = new THREE.Mesh(sph, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .9 }));
      m.scale.setScalar(s); m.position.set(x, y, z); m.userData = { v: new THREE.Vector3(vx, vy, vz), life: life, max: life, k: k, s: s }; scene.add(m); ps.push(m);
    }
    function kill(i) { var m = ps[i]; scene.remove(m); m.material.dispose(); ps.splice(i, 1); }
    function wipe() { for (var i = ps.length - 1; i >= 0; i--) kill(i); }
    function rr(a, b) { return a + Math.random() * (b - a); }
    function disc(r) { var a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * r; return [Math.cos(a) * d, Math.sin(a) * d]; }

    function setup(a, b) {
      wipe(); job = null; tintTo = null; shake = 0; glow.intensity = 0;
      while (content.children.length) { var c = content.children.pop(); c.geometry.dispose(); c.material.dispose(); }
      var liqs = [a, b].filter(function (id) { return S[id][4] === 'l'; }), cols = liqs.map(function (id) { return new THREE.Color(S[id][3]); });
      level = liqs.length ? (liqs.length > 1 ? 1.9 : 1.5) : 0; liquid.visible = level > 0;
      if (level) { tint.copy(cols[0]); if (cols[1]) tint.lerp(cols[1], .5); liquid.scale.y = level; liquid.position.y = .1 + level / 2; liquid.material.color.copy(tint); }
      topY = level ? .1 + level : 2.8;
      [a, b].forEach(function (id, i) {
        var s = S[id]; if (s[4] === 's') {
          var m = new THREE.Mesh(s[2].length < 4 && /^(Na|K)$/.test(s[2]) ? new THREE.BoxGeometry(.5, .35, .5) : new THREE.DodecahedronGeometry(.32), new THREE.MeshStandardMaterial({ color: s[3], metalness: .7, roughness: .35 }));
          m.position.set(i ? .35 : -.35, .3, 0); m.userData.k = 'solid'; content.add(m);
        } else if (s[4] === 'g') {
          for (var q = 0; q < 14; q++) { var p = disc(1); spawn('still', s[3], p[0] * .9, rr(.3, 2.6), p[1] * .9, 0, 0, 0, 1e9, rr(.07, .13)); ps[ps.length - 1] && (ps[ps.length - 1].material.opacity = .22); }
        }
      });
    }
    function run(r) { job = { r: r, t: 0, dur: r.spark ? 0 : 4.5 }; if (r.liq && level) tintTo = new THREE.Color(r.liq); if (r.liq && !level) { level = 1.2; liquid.visible = true; liquid.scale.y = level; liquid.position.y = .1 + level / 2; topY = .1 + level; tint.set(r.liq); liquid.material.color.copy(tint); } if (!RM && r.shake && !r.spark) shake = Math.max(shake, r.shake * .35); }
    function explode() {
      var n; for (n = 0; n < 130; n++) { var d = [Math.random() - .5, Math.random() * .8, Math.random() - .5], l = Math.hypot(d[0], d[1], d[2]) || 1, sp = rr(3, 8); spawn('burst', n % 3 ? '#ffb347' : '#ffffff', 0, 1.6, 0, d[0] / l * sp, d[1] / l * sp + 1, d[2] / l * sp, rr(.5, 1.1), rr(.08, .22)); }
      glow.color.set('#ffb347'); glow.intensity = 3.5; if (!RM) shake = 1; ps.forEach(function (m) { if (m.userData.k === 'still') m.userData.life = 0; });
    }
    function update(dt) {
      var r = job && job.r;
      if (job && job.t < job.dur) {
        job.t += dt; var k = 1 - job.t / job.dur;
        if (r.bub && level) { var nb = r.bub * 60 * dt; while (nb-- > 0) { var p = disc(1); if (Math.random() < nb % 1 + .5) spawn('bub', '#eaf6ff', p[0], .25, p[1], rr(-.1, .1), rr(.9, 1.6), rr(-.1, .1), 9, rr(.04, .1)); } }
        if (r.fire && Math.random() < 14 * dt * (.4 + k)) { var f = disc(.5); spawn('fire', r.fire, f[0], topY, f[1], rr(-.3, .3), rr(1.5, 3), rr(-.3, .3), rr(.5, .9), rr(.12, .26)); glow.color.set(r.fire); glow.intensity = 1.6 * k + .3; }
        if (r.gas && Math.random() < 10 * dt) { var g = disc(.9); spawn('gas', r.gas, g[0], topY, g[1], rr(-.2, .2), rr(.4, .9), rr(-.2, .2), 3.2, rr(.25, .4)); }
        if (r.ppt && Math.random() < 22 * dt) { var s = disc(1); spawn('ppt', r.ppt, s[0], topY - .1, s[1], 0, -rr(.5, 1.1), 0, 1e9, rr(.04, .09)); }
        if (tintTo) tint.lerp(tintTo, Math.min(1, dt * .8)); liquid.material.color.copy(tint);
      } else if (glow.intensity > 0) glow.intensity = Math.max(0, glow.intensity - dt * 2);
      for (var i = ps.length - 1; i >= 0; i--) {
        var m = ps[i], u = m.userData; u.life -= dt; if (u.life <= 0) { kill(i); continue; }
        m.position.addScaledVector(u.v, dt);
        if (u.k === 'bub') { m.position.x += Math.sin(u.life * 6 + i) * .004; if (m.position.y > topY) kill(i); }
        else if (u.k === 'fire') { m.material.opacity = u.life / u.max; m.scale.setScalar(u.s * (.5 + u.life / u.max)); }
        else if (u.k === 'gas') { m.scale.setScalar(m.scale.x + dt * .35); m.material.opacity = .45 * u.life / u.max; }
        else if (u.k === 'burst') { u.v.y -= 5 * dt; m.material.opacity = Math.min(1, u.life * 1.6); }
        else if (u.k === 'ppt' && m.position.y <= .22) { m.position.y = .22; u.v.set(0, 0, 0); u.k = 'rest'; }
      }
      if (shake > .002) shake *= Math.pow(.04, dt); else shake = 0;
    }
    function tick() {
      raf = requestAnimationFrame(tick); var dt = Math.min(clock.getDelta(), .05); update(dt); if (controls) controls.update();
      var o = shake ? new THREE.Vector3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).multiplyScalar(shake * .5) : null;
      if (o) cam.position.add(o); renderer.render(scene, cam); if (o) cam.position.sub(o);
    }
    scene3d = { setup: setup, run: run, explode: explode, start: function () { size(); setup(A, B); if (!raf) { clock.getDelta(); tick(); } }, stop: function () { cancelAnimationFrame(raf); raf = 0; } };
  }

  // ---------------------------------------------------------------- open / close
  var lastFocus = null;
  function open() {
    if (!built) build();
    lastFocus = document.activeElement; root.classList.add('open'); root.setAttribute('aria-hidden', 'false'); labels();
    if (scene3d) scene3d.start(); $('hypo-mix').focus();
  }
  function close() {
    root.classList.remove('open'); root.setAttribute('aria-hidden', 'true'); if (scene3d) scene3d.stop();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  btn.addEventListener('click', open);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && root.classList.contains('open')) close(); });
  window.HypoLab = { open: open, close: close, setLang: function () { btn.textContent = t('btn'); if (built) { labels(); } } };
  window.HypoLab.setLang();
})();
