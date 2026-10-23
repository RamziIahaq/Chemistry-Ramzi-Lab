(function () {
  'use strict';
  // Canonical 2D Lewis sketches (connectivity, bond order and lone-pair count).
  // They are teaching diagrams; geometry and electron density are not to scale.
  var defs = {
    H2O:{en:'Water',ar:'الماء',atoms:[['O',150,112,2],['H',76,112,0],['H',224,112,0]],bonds:[[0,1,1],[0,2,1]],noteEn:'Two O–H single bonds and two lone pairs on oxygen; the molecule is bent.',noteAr:'رابطتان أحاديتان O–H وزوجان حران على الأكسجين؛ شكل الجزيء منحني.'},
    CO2:{en:'Carbon dioxide',ar:'ثاني أكسيد الكربون',atoms:[['O',68,112,2],['C',150,112,0],['O',232,112,2]],bonds:[[0,1,2],[1,2,2]],noteEn:'O=C=O has two C=O double bonds; each oxygen has two lone pairs.',noteAr:'الصيغة O=C=O فيها رابطتان مزدوجتان C=O؛ ولكل أكسجين زوجان حران.'},
    NH3:{en:'Ammonia',ar:'الأمونيا',atoms:[['N',150,112,1],['H',78,158,0],['H',222,158,0],['H',150,38,0]],bonds:[[0,1,1],[0,2,1],[0,3,1]],noteEn:'Three N–H single bonds and one lone pair on nitrogen; trigonal pyramidal.',noteAr:'ثلاث روابط أحادية N–H وزوج حر واحد على النيتروجين؛ الشكل هرمي ثلاثي.'},
    CH4:{en:'Methane',ar:'الميثان',atoms:[['C',150,112,0],['H',72,112,0],['H',228,112,0],['H',150,38,0],['H',150,186,0]],bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]],noteEn:'Four C–H single bonds; the 2D sketch represents a tetrahedral molecule.',noteAr:'أربع روابط أحادية C–H؛ والرسم المسطح يمثّل جزيئًا رباعي السطوح.'},
    HCl:{en:'Hydrogen chloride',ar:'كلوريد الهيدروجين',atoms:[['H',84,112,0],['Cl',190,112,3]],bonds:[[0,1,1]],noteEn:'One H–Cl single bond; chlorine has three lone pairs.',noteAr:'رابطة أحادية H–Cl؛ وعلى الكلور ثلاثة أزواج حرة.'},
    HF:{en:'Hydrogen fluoride',ar:'فلوريد الهيدروجين',atoms:[['H',84,112,0],['F',190,112,3]],bonds:[[0,1,1]],noteEn:'One H–F single bond; fluorine has three lone pairs.',noteAr:'رابطة أحادية H–F؛ وعلى الفلور ثلاثة أزواج حرة.'},
    H2S:{en:'Hydrogen sulfide',ar:'كبريتيد الهيدروجين',atoms:[['S',150,112,2],['H',76,112,0],['H',224,112,0]],bonds:[[0,1,1],[0,2,1]],noteEn:'Two S–H single bonds and two lone pairs on sulfur.',noteAr:'رابطتان أحاديتان S–H وزوجان حران على الكبريت.'},
    SO2:{en:'Sulfur dioxide',ar:'ثاني أكسيد الكبريت',atoms:[['O',70,130,2],['S',150,100,1],['O',230,130,2]],bonds:[[0,1,2],[1,2,2]],noteEn:'A common resonance sketch uses two S=O double bonds; real bonding is delocalized.',noteAr:'يُستخدم غالبًا رسم رنيني برابطتين مزدوجتين S=O؛ الترابط الحقيقي غير متمركز.'},
    O2:{en:'Oxygen',ar:'الأكسجين',atoms:[['O',106,112,2],['O',194,112,2]],bonds:[[0,1,2]],noteEn:'O=O double bond; each oxygen has two lone pairs.',noteAr:'رابطة مزدوجة O=O؛ ولكل ذرة أكسجين زوجان حران.'},
    N2:{en:'Nitrogen',ar:'النيتروجين',atoms:[['N',106,112,1],['N',194,112,1]],bonds:[[0,1,3]],noteEn:'N≡N triple bond; each nitrogen has one lone pair.',noteAr:'رابطة ثلاثية N≡N؛ ولكل ذرة نيتروجين زوج حر واحد.'},
    H2:{en:'Hydrogen',ar:'الهيدروجين',atoms:[['H',106,112,0],['H',194,112,0]],bonds:[[0,1,1]],noteEn:'One shared electron pair forms the H–H single bond.',noteAr:'زوج إلكتروني مشترك واحد يكوّن الرابطة الأحادية H–H.'},
    F2:{en:'Fluorine',ar:'الفلور',atoms:[['F',106,112,3],['F',194,112,3]],bonds:[[0,1,1]],noteEn:'One F–F single bond; each fluorine has three lone pairs.',noteAr:'رابطة أحادية F–F؛ ولكل ذرة فلور ثلاثة أزواج حرة.'},
    Cl2:{en:'Chlorine',ar:'الكلور',atoms:[['Cl',106,112,3],['Cl',194,112,3]],bonds:[[0,1,1]],noteEn:'One Cl–Cl single bond; each chlorine has three lone pairs.',noteAr:'رابطة أحادية Cl–Cl؛ ولكل ذرة كلور ثلاثة أزواج حرة.'},
    HCN:{en:'Hydrogen cyanide',ar:'سيانيد الهيدروجين',atoms:[['H',55,112,0],['C',126,112,0],['N',222,112,1]],bonds:[[0,1,1],[1,2,3]],noteEn:'H–C≡N: one C–H single bond, one C≡N triple bond and one lone pair on nitrogen.',noteAr:'H–C≡N: رابطة C–H أحادية وC≡N ثلاثية وزوج حر على النيتروجين.'},
    H2O2:{en:'Hydrogen peroxide',ar:'فوق أكسيد الهيدروجين',atoms:[['H',48,112,0],['O',112,112,2],['O',188,112,2],['H',252,112,0]],bonds:[[0,1,1],[1,2,1],[2,3,1]],noteEn:'H–O–O–H with single bonds; each oxygen has two lone pairs.',noteAr:'H–O–O–H بروابط أحادية؛ ولكل ذرة أكسجين زوجان حران.'},
    CO:{en:'Carbon monoxide',ar:'أحادي أكسيد الكربون',atoms:[['C',105,112,1],['O',195,112,1]],bonds:[[0,1,3]],noteEn:'A compact Lewis form shows a C≡O triple bond and one lone pair on each atom; formal charges are often shown C⁻ and O⁺.',noteAr:'يُعرض غالبًا برابطة ثلاثية C≡O وزوج حر على كل ذرة؛ وتُكتب الشحنات الشكلية C⁻ وO⁺.'}
  };
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function render(formula, lang) {
    var d=defs[formula]; if(!d) return '';
    var ar=lang==='ar', pair='';
    function atomPoint(i){return d.atoms[i];}
    d.bonds.forEach(function(b){
      var a=atomPoint(b[0]),z=atomPoint(b[1]),dx=z[1]-a[1],dy=z[2]-a[2],len=Math.sqrt(dx*dx+dy*dy)||1,ox=-dy/len*4,oy=dx/len*4;
      for(var k=0;k<b[2];k++){var offset=(k-(b[2]-1)/2)*7;pair+='<line x1="'+(a[1]+ox*offset/4)+'" y1="'+(a[2]+oy*offset/4)+'" x2="'+(z[1]+ox*offset/4)+'" y2="'+(z[2]+oy*offset/4)+'" class="bond-line"/>';}
    });
    d.atoms.forEach(function(a,index){
      var x=a[1],y=a[2],n=a[3],all=[[-1,0],[0,-1],[1,0],[0,1]],used=[];
      d.bonds.forEach(function(b){if(b[0]===index||b[1]===index){var other=atomPoint(b[0]===index?b[1]:b[0]),dx=other[1]-x,dy=other[2]-y,len=Math.sqrt(dx*dx+dy*dy)||1;used.push([dx/len,dy/len]);}});
      var directions=all.map(function(v){return {v:v,score:used.reduce(function(sum,u){return sum+Math.max(0,v[0]*u[0]+v[1]*u[1]);},0)};}).sort(function(a,b){return a.score-b.score;}).map(function(o){return o.v;});
      for(var p=0;p<n;p++){var v=directions[p%directions.length],cx=x+v[0]*29,cy=y+v[1]*29,tx=-v[1]*3.4,ty=v[0]*3.4;pair+='<circle cx="'+(cx-tx)+'" cy="'+(cy-ty)+'" r="2.8" class="lone-dot"/><circle cx="'+(cx+tx)+'" cy="'+(cy+ty)+'" r="2.8" class="lone-dot"/>';}
      pair+='<rect x="'+(x-19)+'" y="'+(y-21)+'" width="38" height="42" rx="12" class="atom-pill"/><text x="'+x+'" y="'+(y+7)+'" class="atom-label-svg">'+escapeHtml(a[0])+'</text>';
    });
    return '<article class="molecule-diagram"><div class="molecule-formula">'+escapeHtml(formula)+'</div><svg viewBox="0 0 300 224" role="img" aria-label="'+escapeHtml((ar?d.ar:d.en)+' Lewis structure')+'"><rect x="5" y="5" width="290" height="214" rx="18" class="molecule-svg-bg"/>'+pair+'</svg><p class="molecule-caption">'+escapeHtml(ar?d.noteAr:d.noteEn)+'</p><p class="molecule-disclaimer">'+(ar?'رسم تعليمي ثنائي الأبعاد؛ لا يوضح الشكل الفراغي أو كثافة الإلكترونات.':'Educational 2D sketch; it does not show 3D geometry or electron density.')+'</p></article>';
  }
  window.MoleculeLewis={has:function(f){return !!defs[f];},render:render,list:function(lang){return Object.keys(defs).map(function(f){return {formula:f,name:lang==='ar'?defs[f].ar:defs[f].en};});}};
})();
