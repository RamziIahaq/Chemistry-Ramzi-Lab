/* ===========================================================================
   Chemistry Lab — main app
   Wires the periodic table, hover detail, 3D explorer modal, and the
   real-time mixing lab (tray, temperature, reagents, FX, sound, discoveries).
   =========================================================================== */
(function () {
  'use strict';
  var E = window.ELEMENTS || [];
  var BY = {}; E.forEach(function (e) { BY[e.symbol] = e; });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var language = localStorage.getItem('chemlab.language') === 'ar' ? 'ar' : 'en';
  var AR_NAMES = window.AR_ELEMENT_NAMES || {};
  var WORDS = {
    'Chemistry Lab':'مختبر الكيمياء','Interactive periodic table & chemistry hypothesis lab':'جدول دوري تفاعلي ومختبر فرضيات الكيمياء',
    'Search element, symbol or number…':'ابحث عن عنصر أو رمز أو رقم…','Colour':'التلوين','Category':'التصنيف الكيميائي','State at temperature':'الحالة عند درجة الحرارة','Electronegativity':'السالبية الكهربائية','Atomic mass':'الكتلة الذرية','Element type':'نوع العنصر','Orbital block':'الفئة المدارية','Element appearance':'المظهر الواقعي للعنصر','Orbital blocks':'الفئات المدارية','Metal':'فلز','Nonmetal':'لافلز','Unclassified':'غير مصنف','Silvery':'فضي','Gold':'ذهبي','Copper':'نحاسي','Observed':'مرصود','Inferred':'مستنتج','Predicted':'متوقع نظريًا','No assigned value':'لا توجد قيمة على مقياس باولنغ','Pauling scale 0.7–4.0':'مقياس باولنغ من 0.7 إلى 4.0','Lewis dot diagram':'تمثيل لويس النقطي','Show Lewis dots':'إظهار نقاط لويس','Hide Lewis dots':'إخفاء نقاط لويس','Lewis molecules':'جزيئات لويس','Molecular Lewis structures':'تمثيلات لويس للجزيئات','Choose a known molecule to inspect its bonds and lone pairs. Structures are schematic 2D Lewis models.':'اختر جزيئًا معروفًا لمعاينة الروابط والأزواج الحرة. الرسوم تخطيطية ثنائية الأبعاد.','Molecule':'الجزيء','Lewis structure':'تمثيل لويس','Educational 2D sketch; it does not show 3D geometry or electron density.':'رسم تعليمي ثنائي الأبعاد؛ لا يوضح الشكل الفراغي أو كثافة الإلكترونات.','View Lewis structure':'عرض تمثيل لويس',
    'Electron tool':'أداة التوزيع الإلكتروني','Acids':'الأحماض','How to use':'طريقة الاستخدام','Reaction Lab':'مختبر التفاعلات','Clear':'إفراغ','Empty the cauldron':'إفراغ وعاء التفاعل',
    'Shift-click elements to select,':'اضغط مع Shift لاختيار العناصر،','then drag them in — or hit Mix.':'ثم اسحبها إلى الوعاء أو اضغط «امزج».','🌡️ Temperature':'🌡️ درجة الحرارة','❄️ 0 K':'❄️ 0 كلفن','🧊 Dry ice':'🧊 الثلج الجاف','🏠 Room':'🏠 الغرفة','♨️ Boiling':'♨️ الغليان','🔥 Furnace':'🔥 الفرن','☀️ Sun':'☀️ الشمس',
    '🌬️ Air (O₂)':'🌬️ هواء (O₂)','💧 Water':'💧 ماء','⚡ Spark':'⚡ شرارة','Mix it! ⚗️':'امزج ⚗️','🏆 Discoveries ':'🏆 المركبات المكتشفة ',
    'Labels':'التسميات','Spin':'دوران','Cloud view':'عرض السحابة','drag to rotate · scroll to zoom':'اسحب للتدوير · مرر للتكبير','⚗️ How to use the Chemistry Lab':'⚗️ طريقة استخدام مختبر الكيمياء',
    'Electron configuration calculator':'حاسبة التوزيع الإلكتروني','Choose up to two elements. The calculator fills orbitals in Aufbau order and shows each atom separately.':'اختر عنصرًا أو عنصرين. تحسب الأداة التوزيع الإلكتروني حسب ترتيب ملء المدارات، وتعرض توزيع كل ذرة على حدة.',
    'Atom A':'الذرة الأولى','Atom B (optional)':'الذرة الثانية (اختياري)','Common acids':'الأحماض الشائعة','A reference table of common acids and their formulas.':'جدول مرجعي لأسماء الأحماض الشائعة وصيغها الكيميائية.',
    'Name':'الاسم','Formula':'الصيغة','Type':'النوع','Electron configuration':'التوزيع الإلكتروني','Electron shells':'الأغلفة الإلكترونية','Visual form':'الشكل البصري','Properties':'الخواص','What it looks like':'المظهر',
    'Atomic mass':'الكتلة الذرية','Period / Group':'الدورة / المجموعة','Block':'الفئة المدارية','State now':'الحالة الآن','Phase at STP':'الحالة القياسية','Melting point':'درجة الانصهار','Boiling point':'درجة الغليان','Density':'الكثافة',
    'Electron affinity':'الألفة الإلكترونية','1st ionisation':'طاقة التأين الأولى','Reactivity':'النشاط الكيميائي','Discovered by':'المكتشف','＋ Add to Lab':'＋ أضف إلى المختبر','✦ Select':'✦ اختر','✓ Selected':'✓ تم الاختيار',
    'Hover an element to see its details · click for the 3D atom':'مرر فوق العنصر لعرض تفاصيله · اضغط لعرض الذرة ثلاثية الأبعاد','Click to explore the atom in 3D →':'اضغط لاستكشاف الذرة ثلاثية الأبعاد ←',
    'Solid':'صلب','Liquid':'سائل','Gas':'غاز','Alkali metal':'فلز قلوي','Alkaline earth':'فلز قلوي ترابي','Transition metal':'فلز انتقالي','Post-transition':'فلز بعد انتقالي','Metalloid':'شبه فلز','Diatomic nonmetal':'لافلز ثنائي الذرة','Polyatomic nonmetal':'لافلز متعدد الذرات','Noble gas':'غاز نبيل','Lanthanide':'لانثانيد','Actinide':'أكتينيد','Unknown':'غير معروف',
    'Config':'التوزيع الإلكتروني','Explosive':'انفجاري','Exothermic':'طارد للحرارة','Effervescent':'متصاعد للفقاعات','Smoke':'دخان','No reaction':'لا يوجد تفاعل','Alloy':'سبيكة','Drama':'شدة التفاعل','Inert':'خامل','Gentle':'هادئ','Lively':'نشط','Vigorous':'قوي','Violent':'عنيف'
  };
  WORDS['Electronegativity (Pauling)']='السالبية الكهربائية (باولنغ)';
  WORDS['Observed']='مرصود/موصوف'; WORDS['Inferred']='مستنتج'; WORDS['Predicted']='متوقع نظريًا';
  WORDS['No assigned value']='لا توجد قيمة على مقياس باولنغ'; WORDS['Pauling scale 0.7–4.0']='مقياس باولنغ من 0.7 إلى 4.0';
  WORDS['Lewis molecules']='جزيئات لويس'; WORDS['Molecular Lewis structures']='تمثيلات لويس للجزيئات';
  WORDS['Choose a known molecule to inspect its bonds and lone pairs. Structures are schematic 2D Lewis models.']='اختر جزيئًا معروفًا لمعاينة الروابط والأزواج الحرة. الرسوم تخطيطية ثنائية الأبعاد.';
  WORDS['Molecule']='الجزيء'; WORDS['View Lewis structure']='عرض تمثيل لويس';
  WORDS['Educational 2D sketch; it does not show 3D geometry or electron density.']='رسم تعليمي ثنائي الأبعاد؛ لا يوضح الشكل الفراغي أو كثافة الإلكترونات.';
  function tr(s) { return language === 'ar' ? (WORDS[s] || s) : s; }
  function elementName(e) { return language === 'ar' ? (AR_NAMES[e.symbol] || e.name) : e.name; }

  var CAT = {
    'alkali metal': '#f87171', 'alkaline earth metal': '#fb923c', 'transition metal': '#fbbf24',
    'post-transition metal': '#4ade80', 'metalloid': '#2dd4bf', 'diatomic nonmetal': '#38bdf8',
    'polyatomic nonmetal': '#818cf8', 'noble gas': '#c084fc', 'lanthanide': '#f472b6',
    'actinide': '#fb7185', 'unknown': '#94a3b8'
  };
  var CAT_LABEL = {
    'alkali metal': 'Alkali metal', 'alkaline earth metal': 'Alkaline earth', 'transition metal': 'Transition metal',
    'post-transition metal': 'Post-transition', 'metalloid': 'Metalloid', 'diatomic nonmetal': 'Diatomic nonmetal',
    'polyatomic nonmetal': 'Polyatomic nonmetal', 'noble gas': 'Noble gas', 'lanthanide': 'Lanthanide',
    'actinide': 'Actinide', 'unknown': 'Unknown'
  };
  var TYPE_COLORS = { metal:'#60a5fa', nonmetal:'#34d399', metalloid:'#fbbf24', unknown:'#94a3b8' };
  var BLOCK_COLORS = { s:'#38bdf8', p:'#a78bfa', d:'#f59e0b', f:'#f472b6' };

  // ---- state ----
  var temp = 298;
  var colorMode = 'category';

  // ============================ Periodic table ============================
  var ptable = $('#ptable');
  var focusCard = document.createElement('div');
  focusCard.id = 'focus-card'; focusCard.className = 'empty';
  focusCard.innerHTML = '<div class="fc-body"><div>' + tr('Hover an element to see its details · click for the 3D atom') + '</div></div>';
  ptable.appendChild(focusCard);

  // lanthanide / actinide pointer cells
  addMarker(3, 6, '57–71'); addMarker(3, 7, '89–103');

  E.forEach(function (e) {
    var c = document.createElement('div');
    c.className = 'cell'; c.setAttribute('role', 'gridcell');
    c.dataset.sym = e.symbol;
    c.style.gridColumn = e.xpos; c.style.gridRow = e.ypos;
    c.innerHTML = '<span class="num">' + e.number + '</span>' +
      '<span class="sym">' + e.symbol + '</span>' +
      '<span class="nm">' + elementName(e) + '</span>' +
      '<span class="ms">' + (e.mass != null ? round(e.mass, 2) : '') + '</span>';
    c.addEventListener('mouseenter', function () { showFocus(e); });
    c.addEventListener('click', function () { openModal(e.symbol); });
    ptable.appendChild(c);
    e._cell = c;
  });
  colorTable();
  buildLegend();

  function addMarker(x, y, txt) {
    var m = document.createElement('div'); m.className = 'marker-cell'; m.textContent = txt;
    m.style.gridColumn = x; m.style.gridRow = y; ptable.appendChild(m);
  }

  function showFocus(e) {
    var col = CAT[e.category] || CAT.unknown;
    focusCard.className = '';
    focusCard.innerHTML =
      '<div class="fc-symbol" style="background:' + col + ';color:' + textOn(col) + '">' +
        '<span class="fc-num">' + e.number + '</span>' +
        '<span class="fc-sym">' + e.symbol + '</span>' +
        '<span class="fc-mass">' + (e.mass != null ? round(e.mass, 3) : '—') + ' u</span>' +
      '</div>' +
      '<div class="fc-body">' +
        '<div class="fc-name">' + elementName(e) + '</div>' +
        '<div class="fc-cat">' + tr(CAT_LABEL[e.category] || e.category) + ' · ' + (language === 'ar' ? 'الدورة ' : 'Period ') + e.period + ' · ' + (language === 'ar' ? 'المجموعة ' : 'Group ') + (e.group || '—') + '</div>' +
        '<div class="fc-grid">' +
          prop(tr('Config'), e.configSemantic || e.config || '—') +
          prop(language === 'ar' ? 'الحالة الآن' : 'State (now)', tr(Chem.stateAt(e.symbol, temp))) +
          prop(language === 'ar' ? 'ينصهر عند' : 'Melts', kc(e.melt)) +
          prop(language === 'ar' ? 'يغلي عند' : 'Boils', kc(e.boil)) +
          prop(tr('Electronegativity'), e.electronegativity != null ? e.electronegativity : '—') +
          prop(tr('Density'), e.density != null ? e.density + ' g/cm³' : '—') +
          prop(language === 'ar' ? 'اكتُشف بواسطة' : 'Discovered', (e.discoveredBy || '—')) +
          prop(tr('Block'), (e.block || '—') + '-block') +
        '</div>' +
        '<div class="fc-hint">' + tr('Click to explore the atom in 3D →') + '</div>' +
      '</div>';
  }
  function prop(k, v) { return '<div>' + k + ': <b>' + v + '</b></div>'; }

  function colorTable() {
    E.forEach(function (e) {
      var col = cellColor(e);
      e._cell.style.setProperty('--cell', col);
      e._cell.style.color = textOn(col);
      var ai=appearanceInfo(e), ms=$('.ms',e._cell);
      e._cell.classList.toggle('appearance-estimate', colorMode === 'appearance' && ai.status !== 'observed');
      e._cell.classList.toggle('appearance-predicted', colorMode === 'appearance' && ai.status === 'predicted');
      var hasPauling=e.number<100&&e.electronegativity!=null;
      e._cell.classList.toggle('electronegativity-missing',colorMode==='electronegativity'&&!hasPauling);
      if(ms) ms.textContent=colorMode==='electronegativity'?(!hasPauling?'—':Number(e.electronegativity).toFixed(1)):(e.mass!=null?round(e.mass,2):'');
      e._cell.title = colorMode === 'appearance' ? appearanceTooltip(e) : colorMode==='electronegativity' ? (e.name+' · '+e.symbol+' · '+(!hasPauling?(language==='ar'?'لا قيمة باولنغ معتمدة':'no assigned Pauling value'):e.electronegativity+' Pauling')) : (e.name + ' (' + e.symbol + ')');
    });
  }
  function cellColor(e) {
    if (colorMode === 'category') return CAT[e.category] || CAT.unknown;
    if (colorMode === 'type') return TYPE_COLORS[elementType(e)];
    if (colorMode === 'block') return BLOCK_COLORS[e.block] || '#64748b';
    if (colorMode === 'state') {
      var s = Chem.stateAt(e.symbol, temp);
      if (/Gas/.test(s)) return '#fb7185';
      if (/Liquid/.test(s)) return '#38bdf8';
      if (/Solid/.test(s)) return '#7c8aa5';
      return '#475569';
    }
    if (colorMode === 'electronegativity') {
      if (e.electronegativity == null || e.number>=100) return '#596273';
      var t = clamp((e.electronegativity - 0.7) / (3.98 - 0.7), 0, 1);
      return lerpHex('#3b82f6', '#ef4444', t);
    }
    if (colorMode === 'mass') {
      var tm = clamp(((e.mass || 1) - 1) / (294 - 1), 0, 1);
      return lerpHex('#22d3ee', '#db2777', tm);
    }
    if (colorMode === 'appearance') return appearanceColor(e);
    return CAT[e.category];
  }
  function elementType(e) {
    if (/metal/.test(e.category || '') && e.category !== 'metalloid') return 'metal';
    if (/nonmetal|noble gas/.test(e.category || '')) return 'nonmetal';
    if (e.category === 'metalloid') return 'metalloid';
    return 'unknown';
  }
  function appearanceColor(e) {
    return appearanceInfo(e).color;
  }
  function appearanceInfo(e) {
    // At room temperature: sample/surface colors, not flame or discharge colors.
    var exact={H:'#eef3f8',He:'#eef3f8',Li:'#c7ccd2',Be:'#c2c5c7',B:'#55483c',C:'#30343b',N:'#eef3f8',O:'#eef3f8',F:'#f3edcb',Ne:'#eef3f8',Na:'#c4c8cb',Mg:'#aeb3b8',Al:'#c6cbd0',Si:'#84909a',P:'#d5bd77',S:'#e4cf36',Cl:'#cbd48b',Ar:'#eef3f8',K:'#c5c9cd',Ca:'#c2c7ca',Sc:'#c7ccd0',Ti:'#c1c6cb',V:'#8793a4',Cr:'#bdc3c8',Mn:'#b9bdc0',Fe:'#a7a9ac',Co:'#65798b',Ni:'#adb0a7',Cu:'#b87333',Zn:'#b5bdc4',Ga:'#c4c9cd',Ge:'#a7a9a9',As:'#969995',Se:'#3c3b3e',Br:'#8b3a12',Kr:'#eef3f8',Rb:'#c0c4c7',Sr:'#c1c6ca',Y:'#c4c9ce',Zr:'#c7ccd0',Nb:'#98a4ad',Mo:'#9ea4aa',Tc:'#9fa4a8',Ru:'#c0c5c9',Rh:'#c7ccd0',Pd:'#c7cbd0',Ag:'#c0c0c0',Cd:'#aeb9c3',In:'#b7bcc1',Sn:'#c5c9cd',Sb:'#adb1b3',Te:'#8d9293',I:'#707078',Xe:'#eef3f8',Cs:'#d3c9a5',Ba:'#c0c5c8',La:'#c1c6ca',Ce:'#c7cbcf',Pr:'#c4c8c9',Nd:'#c5c9cc',Pm:'#babfc2',Sm:'#c1c6ca',Eu:'#c2c7ca',Gd:'#c3c8cc',Tb:'#c2c7cb',Dy:'#c2c6ca',Ho:'#c4c8cb',Er:'#c7cbcf',Tm:'#b9bec2',Yb:'#c3c7ca',Lu:'#c6cacf',Hf:'#929a9f',Ta:'#8493a1',W:'#abb0b4',Re:'#adb2b5',Os:'#a2adb7',Ir:'#c4c9cd',Pt:'#c9cbd0',Au:'#d4af37',Hg:'#c7cbd1',Tl:'#bdc3c7',Pb:'#858b90',Bi:'#c5c9cc',Po:'#b9bdc0',At:'#858b90',Rn:'#eef3f8',Fr:'#b9bec2',Ra:'#c2c7ca',Ac:'#bfc4c7',Th:'#a8adb0',Pa:'#c8cdd0',U:'#959b9e',Np:'#c4c8cb',Pu:'#aaafb2',Am:'#c3c7ca',Cm:'#c5c9cc',Bk:'#afb4b7',Cf:'#b8bdc0',Es:'#c3c7ca'};
    var a=(e.appearance||'').toLowerCase(), color=exact[e.symbol], status=color?'observed':'inferred';
    if (e.number>=100 || /unknown|probably|predicted|expected|presumed/.test(a)) status='predicted';
    if (e.symbol==='P') a+=' allotrope-dependent';
    if (e.symbol==='C') a='graphite is dark; diamond is colorless';
    if (e.symbol==='Br') a='red-brown liquid';
    if (e.symbol==='Hg') a='silvery liquid';
    if (/glow/.test(a)&&e.phase==='Gas') a=a.replace(/,?\s*(exhibiting|exhibits).*$/i,'; discharge glow is not its room-temperature color');
    if (e.number>=100) a='No macroscopic sample; representative surface color is a theoretical estimate.';
    var knownDescriptions={Ca:'Silvery-white metal at room conditions.',Sr:'Silvery metal; freshly cut surfaces can show a pale yellow tint.',Te:'Silvery-gray, brittle metalloid.',Ba:'Silvery-white metal; it tarnishes readily in air.',Eu:'Soft, silvery-white metal.',Yb:'Soft, silvery-white metal.',Fr:'Appearance is not directly observed; silvery color is a periodic-trend prediction.',Ac:'Silvery-white metal.',U:'Silvery-gray metal.'};
    if(knownDescriptions[e.symbol]) a=knownDescriptions[e.symbol];
    if(e.symbol==='Fr') status='predicted';
    if (!color) {
      if (/gold|yellow/.test(a)) color='#d4af37';
      else if (/copper|reddish|red-brown|brown-red/.test(a)) color='#a9633e';
      else if (/black/.test(a)) color='#383a3c';
      else if (/blue/.test(a)) color='#8799ad';
      else if (/green/.test(a)) color='#a7b581';
      else if (/pink|red/.test(a)) color='#b98686';
      else if (/colorless|colourless/.test(a)||e.phase==='Gas') color='#eef3f8';
      else if (/silvery|silver|gray|grey|metallic|white/.test(a)||/metal/.test(e.category)) color='#b9bec3';
      else if(e.category==='metalloid') color='#92999d';
      else color='#a1aab2';
    }
    if(e.number>=100) color='#aeb5bc';
    var description=e.number>=100||knownDescriptions[e.symbol]?a:(e.symbol==='C'||e.symbol==='Br'||e.symbol==='Hg'?a:(e.appearance||((e.phase==='Gas')?'typically colorless gas':'appearance not experimentally established')));
    if(/glow/i.test(e.appearance||'')&&e.phase==='Gas') description='Colorless gas at room conditions; discharge-tube glow excluded.';
    if(e.symbol==='Bi') description='Silvery metal; colorful iridescence is usually from a thin oxide surface layer.';
    return {color:color,status:status,appearance:description};
  }
  function appearanceTooltip(e) {
    var d=appearanceInfo(e), ar=language==='ar';
    var state=d.status==='observed'?(ar?'مظهر موصوف/مرصود':'described appearance'):d.status==='predicted'?(ar?'توقع نظري — لم تُرصد عينة':'theoretical prediction — no observed sample'):(ar?'تقدير تقريبي':'inferred estimate');
    return e.symbol+' · '+state+' · '+localizeAppearance(d.appearance,e,d);
  }
  function localizeAppearance(text,e,info) {
    if(language!=='ar') return text;
    // Use complete Arabic descriptions in the Arabic UI; raw source descriptions
    // vary in quality and often mix English terms into the Arabic sentence.
    if(e){
      var detail={
        H:'غاز عديم اللون',He:'غاز عديم اللون',Li:'فلز أبيض فضي',Be:'فلز رمادي فضي',B:'صلب أسود بني',C:'الغرافيت داكن والألماس عديم اللون',N:'غاز عديم اللون',O:'غاز عديم اللون',F:'غاز أصفر باهت',Ne:'غاز عديم اللون',Na:'فلز أبيض فضي',Mg:'فلز رمادي فضي',Al:'فلز فضي رمادي',Si:'بلوري رمادي عاكس يميل إلى الزرقة',P:'تختلف ألوانه باختلاف المتآصل',S:'بلورات صفراء',Cl:'غاز أصفر مخضر باهت',Ar:'غاز عديم اللون',K:'فلز فضي رمادي',Ca:'فلز أبيض فضي',V:'فلز أزرق فضي رمادي',Fe:'فلز رمادي',Co:'فلز رمادي مزرق',Ni:'فلز فضي يميل إلى الذهبي',Cu:'فلز أحمر برتقالي',Se:'تختلف ألوانه باختلاف المتآصل',Br:'سائل بني محمر',I:'صلب رمادي بنفسجي؛ وبخاره بنفسجي',Cs:'فلز فضي مائل إلى الذهبي',Te:'شبه فلز رمادي فضي هش',Au:'فلز أصفر ذهبي',Hg:'فلز سائل فضي',Bi:'فلز فضي؛ وقد تظهر ألوان التقزح بسبب أكسيد السطح',At:'المظهر غير معروف؛ يُتوقع أن يكون فلزيًا',Fr:'لم يُرصد مظهره؛ واللون الفضي توقع نظري',Po:'فلز فضي',U:'فلز رمادي فضي'
      };
      if(e.number>=100) return 'لون رمادي تمثيلي؛ لا توجد عينة مرئية كافية لتحديد مظهره.';
      if(info&&info.status==='predicted') return detail[e.symbol]||'مظهره غير محسوم؛ اللون المعروض تقدير نظري.';
      if(detail[e.symbol]) return detail[e.symbol];
      if(e.phase==='Gas') return 'غاز عديم اللون عند الظروف المحيطة.';
      if(e.category==='lanthanide'||e.category==='actinide') return 'فلز أبيض فضي؛ اللون المعروض تمثيلي.';
      if(e.category==='metalloid') return 'شبه فلز رمادي فضي.';
      if(/metal/i.test(e.category||'')) return 'فلز أبيض فضي أو رمادي؛ اللون المعروض تمثيلي.';
      return 'لون العينة المعروض تمثيلي عند الظروف المحيطة.';
    }
    var key=String(text).trim().toLowerCase().replace(/\s+/g,' ');
    var exact={
      'colorless gas':'غاز عديم اللون','typically colorless gas':'غاز عديم اللون عادةً','colorless gas, liquid or solid':'غاز عديم اللون؛ ويمكن أن يكون سائلًا أو صلبًا',
      'colorless gas at room conditions; discharge-tube glow excluded.':'غاز عديم اللون عند الظروف المحيطة؛ التوهج في أنبوب التفريغ غير مشمول.',
      'unknown, probably metallic':'المظهر غير معروف؛ يُتوقع أن يكون فلزيًا',
      'no macroscopic sample; representative surface color is a theoretical estimate.':'لا توجد عينة كبيرة قابلة للرؤية؛ لون السطح التمثيلي تقدير نظري.',
      'graphite is dark; diamond is colorless':'الغرافيت داكن، أما الألماس فعديم اللون.',
      'red-brown liquid':'سائل بني محمر','silvery liquid':'سائل فضي',
      'silvery metal; colorful iridescence is usually from a thin oxide surface layer.':'فلز فضي؛ ألوان التقزح تنتج غالبًا من طبقة أكسيد سطحية رقيقة.',
      'silvery-white metal at room conditions.':'فلز أبيض فضي عند الظروف المحيطة.',
      'silvery metal; freshly cut surfaces can show a pale yellow tint.':'فلز فضي؛ وقد يبدو سطحه المقطوع حديثًا مائلًا إلى الأصفر الباهت.',
      'soft, silvery-white metal.':'فلز لين أبيض فضي.','silvery-gray, brittle metalloid.':'شبه فلز رمادي فضي وهش.',
      'silvery-white metal; it tarnishes readily in air.':'فلز أبيض فضي يفقد لمعانه سريعًا في الهواء.',
      'appearance is not directly observed; silvery color is a periodic-trend prediction.':'لم يُرصد مظهره مباشرة؛ واللون الفضي توقع مبني على اتجاهات الجدول الدوري.',
      'silvery-gray metal.':'فلز رمادي فضي.','silvery-white metal.':'فلز أبيض فضي.',
      'crystalline, reflective with bluish-tinged faces':'بلوري عاكس ذو أوجه مائلة للزرقة',
      'lemon yellow sintered microcrystals':'بلورات دقيقة متلبدة صفراء ليمونية',
      'red-orange metallic luster':'بريق فلزي أحمر برتقالي',
      'grayish-white':'أبيض رمادي','lustrous metallic with a grayish tinge':'بريق فلزي مائل إلى الرمادي',
      'silvery white, tarnishing to dark gray in air':'أبيض فضي، ويفقد لمعانه ليصبح رماديًا داكنًا في الهواء'
    };
    if(exact[key]) return exact[key];
    var pairs=[['pale yellow-green gas','غاز أصفر مخضر باهت'],['lemon yellow','أصفر ليموني'],['red-orange','أحمر برتقالي'],['silvery-white','أبيض فضي'],['silvery white','أبيض فضي'],['silvery-gray','رمادي فضي'],['silvery gray','رمادي فضي'],['silvery-grey','رمادي فضي'],['silvery grey','رمادي فضي'],['white-gray','أبيض رمادي'],['blue-silver-grey','أزرق فضي رمادي'],['colorless','عديم اللون'],['colourless','عديم اللون'],['silvery','فضي'],['silver','فضي'],['metallic','فلزي'],['lustrous','لامع'],['luster','بريق'],['shiny','لامع'],['crystalline','بلوري'],['reflective','عاكس'],['bluish','مائل للزرقة'],['faces','أوجه'],['tinged','مائل'],['grayish','رمادي'],['dark','داكن'],['tarnishing','يفقد لمعانه'],['tarnish','يفقد لمعانه'],['oxidized','مؤكسد'],['microcrystals','بلورات دقيقة'],['sintered','متلبد'],['allotropes','متآصلات'],['allotrope','متآصل'],['colorful','ملون'],['iridescence','تقزح'],['thin','رقيقة'],['oxide','أكسيد'],['layer','طبقة'],['glows','يتوهج'],['purple','بنفسجي'],['often','غالبًا'],['hard','صلب'],['periodic','دوري'],['trend','اتجاه'],['prediction','توقع'],['gray','رمادي'],['grey','رمادي'],['white','أبيض'],['black','أسود'],['brown','بني'],['yellow','أصفر'],['scarlet','قرمزي'],['red','أحمر'],['violet','بنفسجي'],['blue','أزرق'],['green','أخضر'],['liquid','سائل'],['gas','غاز'],['solid','صلب'],['metal','فلز'],['waxy','شمعي'],['unknown','غير معروف'],['probably','على الأرجح'],['not pictured','غير موضح في الصورة']];
    pairs.forEach(function(p){var pattern=p[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&');text=text.replace(new RegExp('\\b'+pattern+'\\b','gi'),p[1]);});
    return text;
  }
  function buildLegend() {
    var leg = $('#legend');
    if (colorMode === 'category') {
      leg.innerHTML = Object.keys(CAT).map(function (k) {
        return '<span class="legend-item"><span class="legend-swatch" style="background:' + CAT[k] + '"></span>' + tr(CAT_LABEL[k] || k) + '</span>';
      }).join('');
    } else if (colorMode === 'type') {
      leg.innerHTML = swatch(TYPE_COLORS.metal, tr('Metal')) + swatch(TYPE_COLORS.nonmetal, tr('Nonmetal')) + swatch(TYPE_COLORS.metalloid, tr('Metalloid')) + swatch(TYPE_COLORS.unknown, tr('Unclassified'));
    } else if (colorMode === 'block') {
      leg.innerHTML = swatch(BLOCK_COLORS.s, 's') + swatch(BLOCK_COLORS.p, 'p') + swatch(BLOCK_COLORS.d, 'd') + swatch(BLOCK_COLORS.f, 'f') + '<span class="legend-item">' + tr('Orbital blocks') + '</span>';
    } else if (colorMode === 'appearance') {
      leg.innerHTML = swatch('#b9bec3', tr('Observed')) + '<span class="legend-item"><i class="legend-dash predicted"></i>'+tr('Predicted')+'</span><span class="legend-item">'+(language==='ar'?'لون العينة عند الظروف المحيطة، لا لون اللهب أو طيف التفريغ. مرر على العنصر لمعرفة وصفه.':'Representative sample at ambient conditions, not flame/discharge color. Hover a cell for its description.')+'</span>';
    } else if (colorMode === 'state') {
      leg.innerHTML = swatch('#7c8aa5', tr('Solid')) + swatch('#38bdf8', tr('Liquid')) + swatch('#fb7185', tr('Gas')) +
        '<span class="legend-item">' + (language === 'ar' ? 'عند ' : 'at ') + Chem.fmtT(temp) + (language === 'ar' ? ' — غيّر الحرارة لمشاهدة الانصهار والغليان' : ' — slide the temperature to watch elements melt &amp; boil') + '</span>';
    } else if (colorMode === 'electronegativity') {
      leg.innerHTML = '<span class="legend-item"><span class="en-gradient"></span>'+tr('Pauling scale 0.7–4.0')+'</span>'+swatch('#596273',tr('No assigned value'));
    } else {
      leg.innerHTML = swatch('#22d3ee', language === 'ar' ? 'خفيف' : 'Light') + swatch('#db2777', language === 'ar' ? 'ثقيل' : 'Heavy');
    }
  }
  function swatch(c, t) { return '<span class="legend-item"><span class="legend-swatch" style="background:' + c + '"></span>' + t + '</span>'; }

  // ============================ 3D modal ============================
  var modal = $('#modal'), atomCanvas = $('#atom-canvas'), dataPane = $('#data-pane');
  var viewer = null, modalSym = null;

  function openModal(sym) {
    var e = BY[sym]; if (!e) return;
    modalSym = sym;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    if (!viewer) viewer = new Atom.Viewer(atomCanvas);
    if (viewer.ok) { viewer.load(e); setTimeout(function () { viewer._resize(); }, 30); }
    else { atomCanvas.innerHTML = '<div style="position:absolute;inset:0;display:grid;place-items:center;color:#9aa6bd;padding:20px;text-align:center">3D view needs WebGL — see the shell diagram on the right.</div>'; }
    renderDataPane(e);
    syncAtomButtons();
  }
  function closeModal() { stopAtomLesson(); modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }

  // Orbital configuration tool: calculate from atomic number using the Aufbau order.
  var orbitalModal = $('#orbitals-modal'), acidsModal = $('#acids-modal'), moleculesModal = $('#molecules-modal');
  var orbitalSelectA = $('#orbital-a'), orbitalSelectB = $('#orbital-b');
  var orbitalOrder = ['1s','2s','2p','3s','3p','4s','3d','4p','5s','4d','5p','6s','4f','5d','6p','7s','5f','6d','7p'];
  var orbitalCaps = {s:2,p:6,d:10,f:14};
  var configExceptions = {24:'[Ar] 3d5 4s1',29:'[Ar] 3d10 4s1',41:'[Kr] 4d4 5s1',42:'[Kr] 4d5 5s1',44:'[Kr] 4d7 5s1',45:'[Kr] 4d8 5s1',46:'[Kr] 4d10',47:'[Kr] 4d10 5s1',78:'[Xe] 4f14 5d9 6s1',79:'[Xe] 4f14 5d10 6s1'};
  function calculateConfig(z) {
    var remaining = z, parts = [];
    orbitalOrder.forEach(function (orbital) { if (remaining <= 0) return; var cap = orbitalCaps[orbital.charAt(1)], count = Math.min(cap, remaining); if (count) { parts.push(orbital + count); remaining -= count; } });
    var plain = parts.join(' ');
    var reference = E.find(function (e) { return e.number === z; });
    // Preserve measured ground-state exceptions (for example Cr and Cu) from the project's element dataset.
    if (reference && reference.config && reference.config !== plain) return reference.config;
    return configExceptions[z] || plain;
  }
  function fillOrbitalSelects() {
    var oldA = orbitalSelectA.value || 'H', oldB = orbitalSelectB.value || '';
    var options = E.map(function (e) { return '<option value="' + e.symbol + '">' + e.number + ' · ' + e.symbol + ' · ' + elementName(e) + '</option>'; }).join('');
    orbitalSelectA.innerHTML = options;
    orbitalSelectB.innerHTML = '<option value="">—</option>' + options;
    orbitalSelectA.value = BY[oldA] ? oldA : 'H'; orbitalSelectB.value = BY[oldB] ? oldB : '';
    renderOrbitalResults();
  }
  function renderOrbitalResults() {
    var chosen = [orbitalSelectA.value, orbitalSelectB.value].filter(Boolean);
    $('#orbital-results').innerHTML = chosen.map(function (sym, index) {
      var e = BY[sym], shellCounts = e.shells || [];
      var shellLabel = language === 'ar' ? 'توزيع الأغلفة: ' : 'Shell distribution: ';
      return '<article class="orbital-card"><h3>' + (language === 'ar' ? 'الذرة ' + (index ? 'الثانية' : 'الأولى') : 'Atom ' + (index ? 'B' : 'A')) + ' · ' + elementName(e) + ' (' + e.symbol + ', Z=' + e.number + ')</h3>' +
        '<div class="orbital-config" dir="ltr">' + calculateConfig(e.number).replace(/(\d+)(?=\s|$)/g, '<sup>$1</sup>') + '</div>' +
        '<div class="orbital-shells">' + shellLabel + shellCounts.join(' · ') + (language === 'ar' ? ' إلكترونًا' : ' electrons') + '</div></article>';
    }).join('');
  }
  orbitalSelectA.addEventListener('change', renderOrbitalResults);
  orbitalSelectB.addEventListener('change', renderOrbitalResults);
  $('#orbitals-btn').addEventListener('click', function () { orbitalModal.classList.add('open'); orbitalModal.setAttribute('aria-hidden','false'); });
  $$('[data-close-tool]').forEach(function (b) { b.addEventListener('click', function () { orbitalModal.classList.remove('open'); orbitalModal.setAttribute('aria-hidden','true'); }); });
  function fillMolecules() {
    var select=$('#molecule-select'), old=select.value||'H2O';
    select.innerHTML=window.MoleculeLewis.list(language).map(function(m){return '<option value="'+m.formula+'">'+m.formula+' · '+m.name+'</option>';}).join('');
    select.value=window.MoleculeLewis.has(old)?old:'H2O';
    $('#molecule-structure').innerHTML=window.MoleculeLewis.render(select.value,language);
  }
  $('#molecules-btn').addEventListener('click',function(){fillMolecules();moleculesModal.classList.add('open');moleculesModal.setAttribute('aria-hidden','false');});
  $$('[data-close-molecules]').forEach(function(b){b.addEventListener('click',function(){moleculesModal.classList.remove('open');moleculesModal.setAttribute('aria-hidden','true');});});
  $('#molecule-select').addEventListener('change',function(){ $('#molecule-structure').innerHTML=window.MoleculeLewis.render(this.value,language); });

  var ACIDS = [
    ['Hydrochloric acid','HCl','Strong, monoprotic'],['Hydrobromic acid','HBr','Strong, monoprotic'],['Hydroiodic acid','HI','Strong, monoprotic'],['Hydrofluoric acid','HF','Weak, monoprotic'],
    ['Nitric acid','HNO₃','Strong, monoprotic'],['Sulfuric acid','H₂SO₄','Strong, diprotic'],['Sulfurous acid','H₂SO₃','Weak, diprotic'],['Phosphoric acid','H₃PO₄','Weak, triprotic'],
    ['Carbonic acid','H₂CO₃','Weak, diprotic'],['Acetic acid','CH₃COOH','Weak, monoprotic'],['Formic acid','HCOOH','Weak, monoprotic'],['Citric acid','C₆H₈O₇','Weak, triprotic'],
    ['Oxalic acid','H₂C₂O₄','Weak, diprotic'],['Boric acid','H₃BO₃','Weak'],['Perchloric acid','HClO₄','Strong, monoprotic']
  ];
  function renderAcids() {
    var namesAr = {'Hydrochloric acid':'حمض الهيدروكلوريك','Hydrobromic acid':'حمض الهيدروبروميك','Hydroiodic acid':'حمض الهيدرويوديك','Hydrofluoric acid':'حمض الهيدروفلوريك','Nitric acid':'حمض النيتريك','Sulfuric acid':'حمض الكبريتيك','Sulfurous acid':'حمض الكبريتوز','Phosphoric acid':'حمض الفوسفوريك','Carbonic acid':'حمض الكربونيك','Acetic acid':'حمض الأسيتيك','Formic acid':'حمض الفورميك','Citric acid':'حمض الستريك','Oxalic acid':'حمض الأكساليك','Boric acid':'حمض البوريك','Perchloric acid':'حمض البيركلوريك'};
    var kindsAr = {'Strong, monoprotic':'قوي، أحادي البروتون','Weak, monoprotic':'ضعيف، أحادي البروتون','Strong, diprotic':'قوي، ثنائي البروتون','Weak, diprotic':'ضعيف، ثنائي البروتون','Weak, triprotic':'ضعيف، ثلاثي البروتون','Weak':'ضعيف'};
    $('#acid-list').innerHTML = ACIDS.map(function (a) { return '<tr><td>' + (language === 'ar' ? namesAr[a[0]] : a[0]) + '</td><td>' + a[1] + '</td><td>' + (language === 'ar' ? kindsAr[a[2]] : a[2]) + '</td></tr>'; }).join('');
  }
  $('#acids-btn').addEventListener('click', function () { acidsModal.classList.add('open'); acidsModal.setAttribute('aria-hidden','false'); });
  $$('[data-close-acids]').forEach(function (b) { b.addEventListener('click', function () { acidsModal.classList.remove('open'); acidsModal.setAttribute('aria-hidden','true'); }); });
  fillOrbitalSelects(); renderAcids();

  function applyLanguage() {
    var ar = language === 'ar';
    window.CHEM_LANGUAGE = language;
    document.documentElement.lang = ar ? 'ar' : 'en';
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
    $('#lang-toggle').textContent = ar ? 'English' : 'عربي';
    $('#lang-toggle').title = ar ? 'Switch to English' : 'التبديل إلى العربية';
    $('.brand-text h1').textContent = tr('Chemistry Lab');
    $('.brand-text p').textContent = tr('Interactive periodic table & chemistry hypothesis lab');
    $('#search').placeholder = tr('Search element, symbol or number…');
    $('.select-wrap > span').textContent = tr('Colour');
    var colorLabels = {category:'Category',type:'Element type',block:'Orbital block',state:'State at temperature',electronegativity:'Electronegativity (Pauling)',mass:'Atomic mass',appearance:'Element appearance'};
    $$('#color-mode option').forEach(function (o) { o.textContent = tr(colorLabels[o.value]); });
    $('#orbitals-btn').textContent = tr('Electron tool'); $('#molecules-btn').textContent=tr('Lewis molecules'); $('#acids-btn').textContent = tr('Acids');
    $('#help-btn').title = tr('How to use');
    $('#ptable').setAttribute('aria-label', ar ? 'الجدول الدوري للعناصر' : 'Periodic table of elements');
    $('#orbitals-title').textContent = tr('Electron configuration calculator'); $('.tool-intro', orbitalModal).textContent = tr('Choose up to two elements. The calculator fills orbitals in Aufbau order and shows each atom separately.');
    $('#orbital-a-label').textContent = tr('Atom A'); $('#orbital-b-label').textContent = tr('Atom B (optional)');
    $('#acids-title').textContent = tr('Common acids'); $('.tool-intro', acidsModal).textContent = tr('A reference table of common acids and their formulas.');
    $('#molecules-title').textContent=tr('Molecular Lewis structures'); $('#molecules-intro').textContent=tr('Choose a known molecule to inspect its bonds and lone pairs. Structures are schematic 2D Lewis models.'); $('#molecule-picker-label').textContent=tr('Molecule');
    if(moleculesModal.classList.contains('open')) fillMolecules();
    $$('.acid-table th').forEach(function (th, i) { th.textContent = tr(['Name','Formula','Type'][i]); });
    $('#help h2').textContent = tr('⚗️ How to use the Chemistry Lab');
    $('#atom-toggle-labels').textContent = tr('Labels'); $('#atom-toggle-spin').textContent = tr('Spin'); $('#atom-toggle-cloud').textContent = tr('Cloud view');
    $('.atom-hint').textContent = ar ? 'اسحب للتدوير · مرر للتكبير' : 'drag to rotate · scroll to zoom';
    $('.footer-warn').textContent = ar ? 'محاكاة تعليمية: التفاعلات المعروضة حالات موثّقة في الكتب، وليست إجراء مخبرياً ولا بديلاً عن السلامة المخبرية. لا تخلط مواد كيميائية حقيقية دون تدريب مناسب.' : 'Educational simulation: reactions shown are documented textbook cases and are not a lab procedure or a substitute for lab safety. Never mix real chemicals without proper training.';
    $('#footer > span:first-child').innerHTML = ar ? 'بيانات العناصر من <a href="https://github.com/RamziIahaq" target="_blank" rel="noopener">Chemistry-Ramzi-Lab</a> · الصور من ويكيميديا كومنز.' : 'Element data from <a href="https://github.com/RamziIahaq" target="_blank" rel="noopener">Chemistry-Ramzi-Lab</a> · imagery via Wikimedia Commons.';
    var helpAr = ['مرر المؤشر فوق أي عنصر لعرض تفاصيله.','اضغط على عنصر لفتح مستكشف الذرة ثلاثي الأبعاد.','بدّل ألوان الجدول بين التصنيف الكيميائي ونوع العنصر والفئة المدارية والحالة والسالبية والكتلة والمظهر.','في وضع «الحالة عند درجة الحرارة» حرّك المقياس لترى العناصر تنصهر وتغلي.','استكشف تمثيل لويس للذرة أو افتح مكتبة الجزيئات لمعاينة الروابط والأزواج الحرة.','افتح «مختبر فرضيات الكيمياء»، اختر مادتين واضغط «امزج» لترى النتيجة ثلاثية الأبعاد مع التفسير.','جرّب الصوديوم مع الماء، ثم الخل مع بيكربونات الصوديوم، ثم الهيدروجين مع الأكسجين وأضف شرارة.'];
    var helpEn = ['Hover any element to see its details in the big card.','Click an element to open the 3D atom explorer with live electron shells.','Switch table colours between chemical family, element type, orbital block, state, electronegativity, mass and appearance.','In "State at temperature" mode, slide the temperature to watch elements melt and boil.','Open an element\'s Lewis dots, or the molecule library to inspect bonds and lone pairs.','Open the Chemistry hypothesis lab, pick two substances and press Mix to see the 3D result with an explanation.','Try sodium + water, then vinegar + baking soda, then hydrogen + oxygen and add a spark.'];
    var helpList = ar ? helpAr : helpEn;
    $$('.help-list li').forEach(function (li, i) { li.textContent = helpList[i] || ''; });
    $('.help-foot').textContent = ar ? 'المحاكاة تعليمية ولا تغني عن إجراءات السلامة في المختبر.' : 'The simulation is educational and does not replace lab safety procedures.';
    E.forEach(function (e) { var nm = e._cell && $('.nm', e._cell); if (nm) nm.textContent = elementName(e); });
    fillOrbitalSelects(); renderAcids(); colorTable(); buildLegend();
    if (modalSym) { renderDataPane(BY[modalSym]); if (viewer && viewer.ok) viewer.load(BY[modalSym]); }
    showFocus(BY['H']);
    if (window.HypoLab) window.HypoLab.setLang();
  }
  $('#lang-toggle').addEventListener('click', function () { language = language === 'en' ? 'ar' : 'en'; localStorage.setItem('chemlab.language', language); applyLanguage(); });

  function renderDataPane(e) {
    var col = CAT[e.category] || CAT.unknown;
    var hasPhoto = e.image && e.image.url && !/no image found/i.test(e.image.title || '');
    var img = '<div class="dp-section-title">' + tr('What it looks like') + '</div>' + (hasPhoto
      ? '<figure class="dp-image"><img loading="lazy" src="' + e.image.url + '" alt="' + elementName(e) + '" onerror="this.hidden=true;this.nextElementSibling.hidden=false"/><div class="dp-image-fallback" hidden>' + (language === 'ar' ? 'الصورة غير متاحة حاليًا' : 'Image unavailable right now') + '</div><figcaption>' + elementName(e) + (e.appearance ? ' — ' + localizeAppearance(e.appearance) : '') + '</figcaption></figure>'
      : '<div class="dp-image-fallback">' + (language === 'ar' ? 'لا تتوفر صورة موثقة لهذا العنصر حاليًا' : 'No verified photo is currently available for this element') + '</div>');
    var spectral = e.spectral && /^https?:/.test(e.spectral) ? '' : '';
    dataPane.innerHTML =
      '<div class="dp-title"><h2>' + elementName(e) + '</h2><span class="dp-sym">' + e.symbol + ' · Z = ' + e.number + '</span></div>' +
      '<div class="dp-cat"><span class="dot" style="background:' + col + '"></span>' + tr(CAT_LABEL[e.category] || e.category) + '</div>' +
      (e.summary ? '<p class="dp-summary">' + (language === 'ar' ? 'عنصر كيميائي عدده الذري ' + e.number + '، ورمزه ' + e.symbol + '. تُعرض المعلومات التفصيلية باللغة الإنجليزية في المصدر.' : clip(e.summary, 360) + (e.source ? ' <a href="' + e.source + '" target="_blank" rel="noopener">more →</a>' : '')) + '</p>' : '') +
      '<div class="dp-section-title">' + tr('Electron configuration') + '</div>' +
      '<div class="dp-config">' + (e.config || '—') + (e.configSemantic ? '  ·  ' + e.configSemantic : '') + '</div>' +
      '<div class="dp-section-title">' + tr('Electron shells') + '</div>' + Atom.bohrSVG(e) +
      '<section class="atom-lesson"><button id="atom-lesson-toggle" class="mini-btn" type="button" aria-expanded="false">' + tr('Visual form') + ' · ' + (language==='ar'?'عرض تفاعلي تدريجي':'guided interactive view') + '</button><div id="atom-lesson-panel" hidden>' + atomLessonMarkup(e) + '</div></section>' +
      '<section class="lewis-card"><div class="lewis-head"><div><div class="dp-section-title">' + tr('Lewis dot diagram') + '</div><p class="lewis-note">' + (language === 'ar' ? 'تمثيل مبسط لإلكترونات الغلاف الخارجي؛ لعناصر الفئة d وf قد تختلف إلكترونات التكافؤ بحسب حالة الأكسدة.' : 'A simplified outer-shell electron diagram. For d- and f-block elements, bonding electrons can vary with oxidation state.') + '</p></div><button id="lewis-toggle" class="mini-btn" type="button" aria-expanded="false">' + tr('Show Lewis dots') + '</button></div><div id="lewis-figure" hidden>' + lewisDiagram(e) + '</div></section>' +
      '<div class="dp-section-title">' + tr('Properties') + '</div>' +
      '<div class="dp-props">' +
        dp(tr('Atomic mass'), (e.mass != null ? e.mass + ' u' : '—')) +
        dp(tr('Category'), tr(CAT_LABEL[e.category] || e.category)) +
        dp(tr('Period / Group'), e.period + ' / ' + (e.group || '—')) +
        dp(tr('Block'), (e.block || '—') + '-block') +
        dp(tr('State now'), tr(Chem.stateAt(e.symbol, temp)) + ' (' + Chem.fmtT(temp) + ')') +
        dp(language === 'ar' ? 'الحالة القياسية' : 'Phase at STP', language === 'ar' ? ({Gas:'غاز',Liquid:'سائل',Solid:'صلب'}[e.phase] || e.phase || '—') : (e.phase || '—')) +
        dp(language === 'ar' ? 'درجة الانصهار' : 'Melting point', kc(e.melt)) +
        dp(language === 'ar' ? 'درجة الغليان' : 'Boiling point', kc(e.boil)) +
        dp(tr('Density'), e.density != null ? e.density + ' g/cm³' : '—') +
        dp(tr('Electronegativity'), e.electronegativity != null ? e.electronegativity + (language === 'ar' ? ' (مقياس باولنغ)' : ' (Pauling)') : '—') +
        dp(tr('Electron affinity'), e.electronAffinity != null ? e.electronAffinity + ' kJ/mol' : '—') +
        dp(language === 'ar' ? 'طاقة التأين الأولى' : '1st ionisation', e.ionization != null ? e.ionization + ' kJ/mol' : '—') +
        dp(tr('Reactivity'), reactBar(e.symbol)) +
        dp(tr('Discovered by'), e.discoveredBy || '—') +
      '</div>' +
      img;
    $('#lewis-toggle').addEventListener('click', function () { var box = $('#lewis-figure'); box.hidden = !box.hidden; this.setAttribute('aria-expanded', String(!box.hidden)); this.textContent = tr(box.hidden ? 'Show Lewis dots' : 'Hide Lewis dots'); });
    $('#atom-lesson-toggle').addEventListener('click',function(){var p=$('#atom-lesson-panel');p.hidden=!p.hidden;this.setAttribute('aria-expanded',String(!p.hidden));if(!p.hidden)startAtomLesson(e);else stopAtomLesson();});
  }
  var lessonTimer=null, lessonStep=0, lessonShellCount=0;
  function atomLessonMarkup(e){
    var shells=e.shells||[], cx=200,cy=177,parts='<defs><filter id="lesson-soft"><feGaussianBlur stdDeviation="5"/></filter></defs><rect x="1" y="1" width="398" height="378" rx="18" class="lesson-bg"/>',radii=[];lessonShellCount=shells.length;
    shells.forEach(function(count,s){var r=38+s*20;radii.push(r);var marks='';for(var k=0;k<count;k++){var a=2*Math.PI*k/count,ex=cx+r*Math.cos(a),ey=cy+r*Math.sin(a);marks+='<circle cx="'+ex.toFixed(1)+'" cy="'+ey.toFixed(1)+'" r="3.1" class="lesson-electron"/>';}
      parts+='<circle class="lesson-ring" data-shell="'+s+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'"/><g class="lesson-electron-orbit" data-shell="'+s+'" style="--orbit-time:'+Math.max(3,13-s*1.3)+'s">'+marks+'</g><text class="lesson-shell-label" data-shell="'+s+'" x="'+(cx-r*.72)+'" y="'+(cy-r*.72)+'">'+(language==='ar'?'الغلاف '+(s+1):'Shell '+(s+1))+' · '+count+' e⁻</text>';
      parts+='<circle class="lesson-cloud-ring" data-shell="'+s+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'"/>';for(var q=0;q<Math.max(12,count*3);q++){var aa=q*2.399963+ s*.73, rr=r+(Math.sin(q*7.1+s)*8);parts+='<circle class="lesson-cloud-dot" data-cloud-shell="'+s+'" cx="'+(cx+rr*Math.cos(aa)).toFixed(1)+'" cy="'+(cy+rr*Math.sin(aa)).toFixed(1)+'" r="'+(1.3+(q%3)*.45)+'"/>';}
    });
    parts+='<circle class="lesson-nucleus" cx="'+cx+'" cy="'+cy+'" r="22"/><text class="lesson-nucleus-count" x="'+cx+'" y="'+(cy-2)+'">'+e.number+' p⁺</text><text class="lesson-neutron-count" x="'+cx+'" y="'+(cy+13)+'">≈ '+Math.max(0,Math.round(e.mass||e.number)-e.number)+' n⁰</text><text class="lesson-stage-label" id="lesson-stage-label" x="200" y="355" text-anchor="middle">'+(language==='ar'?'١ · النواة':'1 · Nucleus')+'</text>';
    var intro=language==='ar'?'تسلسل تعليمي: النواة، ثم الأغلفة وإلكتروناتها، ثم تمثيل احتمالي مبسط.':'Teaching sequence: nucleus, electron shells, then a simplified probability cloud.';
    return '<p class="lesson-intro">'+intro+'</p><svg id="atom-lesson-svg" viewBox="0 0 400 380" data-stage="0" role="img" aria-label="'+(language==='ar'?'عرض بصري تدريجي للذرة':'Guided atom structure view')+'">'+parts+'</svg><div class="lesson-controls"><button id="lesson-prev" type="button">'+(language==='ar'?'السابق':'Previous')+'</button><button id="lesson-play" type="button">▶ '+(language==='ar'?'تشغيل':'Play')+'</button><button id="lesson-next" type="button">'+(language==='ar'?'التالي':'Next')+'</button><button id="lesson-reset" type="button">↺ '+(language==='ar'?'إعادة':'Reset')+'</button></div><p class="lesson-caveat">'+(language==='ar'?'الإلكترونات لا تسير في مسارات كوكبية ثابتة؛ الحركة هنا للتوضيح، والغيمة تمثل احتمالات مبسطة. عدد النيوترونات تقريبي، وأحجام الجسيمات والمسافات ليست بمقياس حقيقي.':'Electrons do not travel on fixed planetary tracks. Motion is illustrative; the cloud is simplified probability. Neutron counts are approximate; particle sizes and distances are not to scale.')+'</p>';
  }
  function startAtomLesson(e){lessonStep=0;drawAtomLesson(e);$('#lesson-next').onclick=function(){stopAtomLesson();$('#lesson-play').textContent='▶ '+(language==='ar'?'تشغيل':'Play');lessonStep=Math.min(lessonShellCount+2,lessonStep+1);drawAtomLesson(e);};$('#lesson-prev').onclick=function(){stopAtomLesson();$('#lesson-play').textContent='▶ '+(language==='ar'?'تشغيل':'Play');lessonStep=Math.max(0,lessonStep-1);drawAtomLesson(e);};$('#lesson-reset').onclick=function(){lessonStep=0;stopAtomLesson();drawAtomLesson(e);$('#lesson-play').textContent='▶ '+(language==='ar'?'تشغيل':'Play');};$('#lesson-play').onclick=function(){var self=this;if(lessonTimer){stopAtomLesson();self.textContent='▶ '+(language==='ar'?'تشغيل':'Play');}else{self.textContent='Ⅱ '+(language==='ar'?'إيقاف':'Pause');lessonTimer=setInterval(function(){if(lessonStep>=lessonShellCount+2){stopAtomLesson();self.textContent='▶ '+(language==='ar'?'تشغيل':'Play');return;}lessonStep++;drawAtomLesson(e);},1400);}};}
  function drawAtomLesson(e){var svg=$('#atom-lesson-svg');if(!svg)return;svg.dataset.stage=lessonStep;var total=lessonShellCount,full=lessonStep>=total+1,cloud=lessonStep===total+2;$$('.lesson-ring,.lesson-electron-orbit,.lesson-shell-label',svg).forEach(function(node){var s=Number(node.dataset.shell),visible=lessonStep>0&&(full||s<lessonStep);node.style.display=visible?'initial':'none';});$$('.lesson-electron-orbit',svg).forEach(function(node){node.classList.toggle('lesson-animate',full);});$$('.lesson-cloud-ring,.lesson-cloud-dot',svg).forEach(function(node){node.style.display=cloud?'initial':'none';});var labels=[];labels.push(language==='ar'?'١ · النواة':'1 · Nucleus');for(var i=0;i<total;i++)labels.push((i+2)+' · '+(language==='ar'?'إضافة الغلاف '+(i+1):'Add shell '+(i+1)));labels.push((total+2)+' · '+(language==='ar'?'حركة الإلكترونات':'Electrons in motion'));labels.push((total+3)+' · '+(language==='ar'?'سحابة احتمالية مبسطة':'Simplified probability cloud'));$('#lesson-stage-label').textContent=labels[Math.min(lessonStep,labels.length-1)];}
  function stopAtomLesson(){if(lessonTimer){clearInterval(lessonTimer);lessonTimer=null;}}
  function lewisDiagram(e) {
    var count = e.group === 18 ? (e.symbol === 'He' ? 2 : 8) : e.group >= 13 && e.group <= 17 ? e.group - 10 : (e.shells && e.shells.length ? e.shells[e.shells.length - 1] : 0);
    count = clamp(count || 0, 0, 8);
    var dots = '';
    for (var i = 0; i < count; i++) {
      var side = Math.floor(i / 2), paired = i % 2;
      var pos = [[50,18,50,27],[82,50,73,50],[50,82,50,73],[18,50,27,50]][side];
      var x = paired ? pos[2] : pos[0], y = paired ? pos[3] : pos[1];
      dots += '<circle cx="' + x + '" cy="' + y + '" r="2.5" fill="#5eead4" />';
    }
    return '<svg class="lewis-svg" viewBox="0 0 100 100" role="img" aria-label="' + (language === 'ar' ? 'تمثيل لويس لعنصر ' : 'Lewis dot diagram for ') + elementName(e) + '"><rect x="2" y="2" width="96" height="96" rx="14" fill="rgba(94,234,212,.06)" stroke="rgba(255,255,255,.14)"/><text x="50" y="57" text-anchor="middle" fill="#eef2fb" font-size="21" font-weight="700">' + e.symbol + '</text>' + dots + '</svg><p class="lewis-caption">' + (language === 'ar' ? 'إلكترونات الغلاف الخارجي: ' : 'Outer-shell electrons: ') + count + '</p>';
  }
  function dp(k, v) { return '<div class="dp-prop"><span>' + k + '</span><b>' + v + '</b></div>'; }
  function reactBar(sym) { var r = Chem.reactivity(sym); return '★'.repeat(Math.max(0, Math.round(r / 2))) + '☆'.repeat(5 - Math.max(0, Math.round(r / 2))); }

  function syncAtomButtons() {
    setPressed('#atom-toggle-labels', viewer && viewer.showLabels);
    setPressed('#atom-toggle-spin', viewer && viewer.spin);
    setPressed('#atom-toggle-cloud', viewer && viewer.cloud);
  }
  $('#atom-toggle-labels').addEventListener('click', function () { if (viewer) { viewer.setLabels(!viewer.showLabels); setPressed(this, viewer.showLabels); } });
  $('#atom-toggle-spin').addEventListener('click', function () { if (viewer) { viewer.setSpin(!viewer.spin); setPressed(this, viewer.spin); } });
  $('#atom-toggle-cloud').addEventListener('click', function () { if (viewer) { viewer.setCloud(!viewer.cloud); setPressed(this, viewer.cloud); } });
  $('#modal-prev').addEventListener('click', function () { navModal(-1); });
  $('#modal-next').addEventListener('click', function () { navModal(1); });
  function navModal(d) { var e = BY[modalSym]; if (!e) return; var n = e.number + d; if (n < 1) n = 118; if (n > 118) n = 1; var t = E.find(function (x) { return x.number === n; }); if (t) openModal(t.symbol); }
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', closeModal); });

  // ============================ Temperature (state-of-matter colouring) ============================
  var tempInput = $('#temp'), tempRead = $('#temp-readout'), tempBar = $('#temp-bar');
  function updateTemp() { tempRead.textContent = Chem.fmtT(temp); }
  tempInput.addEventListener('input', function () { temp = Number(this.value); updateTemp(); colorTable(); buildLegend(); });
  updateTemp();

  // ============================ Toolbar ============================
  $('#color-mode').addEventListener('change', function () { colorMode = this.value; tempBar.hidden = colorMode !== 'state'; colorTable(); buildLegend(); });
  $('#help-btn').addEventListener('click', function () { $('#help').classList.add('open'); });
  $$('[data-close-help]').forEach(function (b) { b.addEventListener('click', function () { $('#help').classList.remove('open'); }); });

  var search = $('#search');
  search.addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    if (!q) { E.forEach(function (e) { e._cell.classList.remove('dim', 'search-hit'); }); return; }
    E.forEach(function (e) {
      var hit = e.name.toLowerCase().indexOf(q) >= 0 || (AR_NAMES[e.symbol] || '').toLowerCase().indexOf(q) >= 0 || e.symbol.toLowerCase() === q || e.symbol.toLowerCase().indexOf(q) === 0 || String(e.number) === q;
      e._cell.classList.toggle('search-hit', hit); e._cell.classList.toggle('dim', !hit);
    });
  });

  // keyboard
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { if (modal.classList.contains('open')) closeModal(); else if ($('#help').classList.contains('open')) $('#help').classList.remove('open'); else if (orbitalModal.classList.contains('open')) orbitalModal.classList.remove('open'); else if (acidsModal.classList.contains('open')) acidsModal.classList.remove('open'); }
    if (modal.classList.contains('open')) { if (ev.key === 'ArrowRight') navModal(1); if (ev.key === 'ArrowLeft') navModal(-1); }
  });

  // ============================ helpers ============================
  function round(n, d) { var f = Math.pow(10, d); return Math.round(n * f) / f; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function kc(K) { return K == null ? '—' : Math.round(K - 273.15) + ' °C'; }
  function clip(s, n) { return s && s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s; }
  function setPressed(sel, on) { var el = typeof sel === 'string' ? $(sel) : sel; if (el) el.setAttribute('aria-pressed', !!on); }
  function flashBtn(btn, txt) { var o = btn.textContent; btn.textContent = txt; setTimeout(function () { btn.textContent = o; }, 900); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function textOn(hex) { var c = hex.replace('#', ''); if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2]; var r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16); var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255; return lum > 0.55 ? '#0b0f1a' : '#eef2fb'; }
  function lerpHex(a, b, t) {
    var ca = hx(a), cb = hx(b);
    var r = Math.round(ca[0] + (cb[0] - ca[0]) * t), g = Math.round(ca[1] + (cb[1] - ca[1]) * t), bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
    return '#' + [r, g, bl].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
  }
  function hx(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }

  // show H in focus card initially
  showFocus(BY['H']);
  applyLanguage();
})();
