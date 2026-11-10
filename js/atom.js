/* ===========================================================================
   Chemistry Lab — 3D atom explorer (Three.js)
   Builds an interactive Bohr-style atom: an instanced nucleus of protons +
   neutrons, animated electron shells, orbit rings, and HTML annotation labels
   projected from 3D. Falls back gracefully if WebGL/THREE is unavailable.
   =========================================================================== */
(function () {
  'use strict';

  var SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
  var hasTHREE = typeof window.THREE !== 'undefined';

  function AtomViewer(container) {
    this.container = container;
    this.ok = hasTHREE;
    this.labels = [];           // { anchor:Object3D, dom:HTMLElement, kind }
    this.shellGroups = [];
    this.electrons = [];
    this.raf = null;
    this.spin = true;
    this.showLabels = true;
    this.cloud = false;
    this.t = 0;
    if (this.ok) this._initGL();
  }

  AtomViewer.prototype._initGL = function () {
    var c = this.container;
    var w = c.clientWidth || 600, h = c.clientHeight || 400;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 4000);
    camera.position.set(0, 18, 90);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    c.appendChild(renderer.domElement);

    // label overlay
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';
    c.appendChild(overlay);
    this.overlay = overlay;

    var controls = null;
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 18;
      controls.maxDistance = 600;
      controls.enablePan = false;
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    var key = new THREE.PointLight(0xbfe6ff, 1.1, 0, 1.2); key.position.set(60, 80, 90); scene.add(key);
    var rim = new THREE.PointLight(0x818cf8, 0.7, 0, 1.5); rim.position.set(-80, -40, -60); scene.add(rim);

    // starfield-ish faint dots for depth
    var pg = new THREE.BufferGeometry();
    var pn = 240, pa = new Float32Array(pn * 3);
    for (var i = 0; i < pn; i++) {
      var r = 600 + Math.random() * 1200, th = Math.random() * 6.28, ph = Math.acos(2 * Math.random() - 1);
      pa[i * 3] = r * Math.sin(ph) * Math.cos(th); pa[i * 3 + 1] = r * Math.cos(ph); pa[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    pg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x33405e, size: 2, sizeAttenuation: false })));

    this.scene = scene; this.camera = camera; this.renderer = renderer; this.controls = controls;
    this.root = new THREE.Group(); scene.add(this.root);

    var self = this;
    this._onResize = function () { self._resize(); };
    window.addEventListener('resize', this._onResize);
    this._animate();
  };

  AtomViewer.prototype._resize = function () {
    if (!this.ok) return;
    var w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  AtomViewer.prototype.load = function (e) {
    this.element = e;
    if (!this.ok) return;
    this._clearAtom();
    var Z = e.number;
    var N = e.mass ? Math.max(0, Math.round(e.mass) - Z) : Z;
    var shells = (e.shells && e.shells.length) ? e.shells : [Math.min(2, Z)];

    // ---- nucleus (instanced) ----
    var nucleusR = Math.max(3.2, Math.cbrt(Z + N) * 1.45);
    this.nucleusR = nucleusR;
    this._buildNucleus(Z, N, nucleusR);

    // ---- shells ----
    var spacing = Math.max(7, nucleusR * 1.7);
    var baseR = nucleusR + spacing * 0.9;
    this.outerR = baseR + spacing * (shells.length - 1);
    var accent = new THREE.Color(e.color || '#5eead4');

    for (var s = 0; s < shells.length; s++) {
      var R = baseR + spacing * s;
      var tilt = (s * 0.5) % Math.PI; // vary plane per shell for 3D depth
      var grp = new THREE.Group();
      grp.rotation.x = 1.1 + Math.sin(s) * 0.5;
      grp.rotation.y = tilt;
      grp.userData.speed = 0.5 / (s + 1.4);
      this.root.add(grp);
      this.shellGroups.push(grp);

      // orbit ring
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(R, 0.12, 8, 96),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: s === shells.length - 1 ? 0.32 : 0.16 })
      );
      grp.add(ring);
      grp.userData.ring = ring;

      // electrons
      var count = shells[s];
      var isValence = (s === shells.length - 1);
      var eMat = new THREE.MeshStandardMaterial({
        color: isValence ? 0xfde68a : 0x5eead4, emissive: isValence ? 0xfbbf24 : 0x14b8a6,
        emissiveIntensity: 0.9, roughness: 0.3, metalness: 0.1
      });
      for (var k = 0; k < count; k++) {
        var ang = (k / count) * Math.PI * 2;
        var em = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), eMat);
        em.position.set(Math.cos(ang) * R, 0, Math.sin(ang) * R);
        em.userData = { R: R, ang: ang };
        grp.add(em);
        this.electrons.push(em);
      }

      // shell label
      var anchor = new THREE.Object3D();
      anchor.position.set(0, R, 0);
      grp.add(anchor);
      var arabic = window.CHEM_LANGUAGE === 'ar';
      this._addLabel(anchor,
        (arabic ? 'الغلاف ' : 'Shell ') + (s + 1) + ' (' + (SHELL_NAMES[s] || s + 1) + ') · ' + count + ' e⁻' + (isValence ? (arabic ? ' — تكافؤ' : ' — valence') : ''),
        isValence ? 'valence' : 'shell');
    }

    // nucleus label
    var nAnchor = new THREE.Object3D();
    nAnchor.position.set(0, -nucleusR - 2, 0);
    this.root.add(nAnchor);
    this._addLabel(nAnchor, (window.CHEM_LANGUAGE === 'ar' ? 'النواة · ' : 'Nucleus · ') + Z + ' p⁺' + (N ? ' · ' + N + ' n⁰' : ''), 'nucleus');

    // electron cloud (hidden unless cloud view)
    this._buildCloud(shells, baseR, spacing);

    // frame camera
    var fit = this.outerR * 2.4;
    this.camera.position.set(0, this.outerR * 0.5, fit);
    if (this.controls) { this.controls.target.set(0, 0, 0); this.controls.update(); }
    this._applyCloud();
  };

  AtomViewer.prototype._buildNucleus = function (Z, N, R) {
    var positions = packSphere(Z + N, R * 0.92);
    var pGeo = new THREE.SphereGeometry(R * 0.9 / Math.cbrt(Z + N + 1) + 0.7, 12, 12);
    var protonMat = new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0x7a1f1f, emissiveIntensity: 0.5, roughness: 0.5 });
    var neutronMat = new THREE.MeshStandardMaterial({ color: 0x9fb2cc, emissive: 0x2a3346, emissiveIntensity: 0.4, roughness: 0.6 });
    var pCount = Z, nCount = N;
    var pIM = new THREE.InstancedMesh(pGeo, protonMat, Math.max(1, pCount));
    var nIM = new THREE.InstancedMesh(pGeo, neutronMat, Math.max(1, nCount));
    var dummy = new THREE.Object3D();
    var pi = 0, ni = 0;
    for (var i = 0; i < positions.length; i++) {
      dummy.position.copy(positions[i]); dummy.updateMatrix();
      // interleave protons & neutrons
      if (i % 2 === 0 && pi < pCount) { pIM.setMatrixAt(pi++, dummy.matrix); }
      else if (ni < nCount) { nIM.setMatrixAt(ni++, dummy.matrix); }
      else if (pi < pCount) { pIM.setMatrixAt(pi++, dummy.matrix); }
    }
    pIM.count = pi; nIM.count = ni;
    pIM.instanceMatrix.needsUpdate = true; nIM.instanceMatrix.needsUpdate = true;
    this.root.add(pIM); this.root.add(nIM);
    this.nucleus = [pIM, nIM];
  };

  AtomViewer.prototype._buildCloud = function (shells, baseR, spacing) {
    var total = 0; shells.forEach(function (c) { total += c; });
    var pts = total * 60;
    var arr = new Float32Array(pts * 3);
    var idx = 0;
    for (var s = 0; s < shells.length; s++) {
      var R = baseR + spacing * s;
      var n = shells[s] * 60;
      for (var k = 0; k < n; k++) {
        var u = Math.random(), v = Math.random();
        var th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
        var rr = R + (Math.random() - 0.5) * spacing * 0.7;
        arr[idx++] = rr * Math.sin(ph) * Math.cos(th);
        arr[idx++] = rr * Math.cos(ph);
        arr[idx++] = rr * Math.sin(ph) * Math.sin(th);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr.subarray(0, idx), 3));
    var m = new THREE.PointsMaterial({ color: 0x7de3d0, size: 1.4, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    this.cloudPts = new THREE.Points(g, m);
    this.cloudPts.visible = false;
    this.root.add(this.cloudPts);
  };

  AtomViewer.prototype._addLabel = function (anchor, text, kind) {
    var d = document.createElement('div');
    d.className = 'atom-label' + (kind === 'valence' ? ' valence' : kind === 'nucleus' ? ' nucleus' : '');
    d.textContent = text;
    this.overlay.appendChild(d);
    this.labels.push({ anchor: anchor, dom: d, kind: kind });
  };

  AtomViewer.prototype._applyCloud = function () {
    var cloud = this.cloud;
    if (this.cloudPts) this.cloudPts.visible = cloud;
    this.electrons.forEach(function (e) { e.visible = !cloud; });
    this.shellGroups.forEach(function (g) { if (g.userData.ring) g.userData.ring.visible = !cloud; });
  };

  AtomViewer.prototype._animate = function () {
    var self = this;
    this.raf = requestAnimationFrame(function () { self._animate(); });
    if (!this.ok) return;
    this.t += 0.016;
    if (this.spin) {
      for (var i = 0; i < this.shellGroups.length; i++) {
        var g = this.shellGroups[i];
        if (!this.cloud) g.rotation.z += g.userData.speed * 0.02;
      }
      this.root.rotation.y += 0.0016;
      if (this.cloudPts && this.cloud) this.cloudPts.rotation.y += 0.004;
    }
    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this._positionLabels();
  };

  AtomViewer.prototype._positionLabels = function () {
    if (!this.showLabels) return;
    var w = this.container.clientWidth, h = this.container.clientHeight;
    var v = new THREE.Vector3();
    for (var i = 0; i < this.labels.length; i++) {
      var L = this.labels[i];
      L.anchor.getWorldPosition(v);
      v.project(this.camera);
      var behind = v.z > 1;
      var x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      L.dom.style.left = x + 'px';
      L.dom.style.top = y + 'px';
      L.dom.style.opacity = behind ? '0' : '1';
    }
  };

  AtomViewer.prototype.setSpin = function (b) { this.spin = b; };
  AtomViewer.prototype.setLabels = function (b) {
    this.showLabels = b;
    this.labels.forEach(function (L) { L.dom.style.display = b ? '' : 'none'; });
  };
  AtomViewer.prototype.setCloud = function (b) { this.cloud = b; this._applyCloud(); };

  AtomViewer.prototype._clearAtom = function () {
    // remove labels
    this.labels.forEach(function (L) { if (L.dom.parentNode) L.dom.parentNode.removeChild(L.dom); });
    this.labels = []; this.shellGroups = []; this.electrons = []; this.cloudPts = null; this.nucleus = null;
    // dispose root children
    var root = this.root;
    for (var i = root.children.length - 1; i >= 0; i--) {
      disposeObj(root.children[i]); root.remove(root.children[i]);
    }
    root.rotation.set(0, 0, 0);
  };

  AtomViewer.prototype.dispose = function () {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    if (!this.ok) return;
    this._clearAtom();
    if (this.controls) this.controls.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
  };

  // ---- helpers ----
  function disposeObj(o) {
    o.traverse && o.traverse(function (c) {
      if (c.geometry) c.geometry.dispose();
      if (c.material) { if (Array.isArray(c.material)) c.material.forEach(function (m) { m.dispose(); }); else c.material.dispose(); }
    });
  }
  // deterministic-ish even packing of n points in a sphere of radius R (sunflower spiral)
  function packSphere(n, R) {
    var out = [];
    if (n <= 1) { out.push(new THREE.Vector3(0, 0, 0)); return out; }
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2;
      var rad = Math.sqrt(Math.max(0, 1 - y * y));
      var theta = golden * i;
      // shrink toward centre in shells to fill volume, not just surface
      var rr = R * Math.cbrt((i + 0.5) / n);
      out.push(new THREE.Vector3(Math.cos(theta) * rad * rr, y * rr, Math.sin(theta) * rad * rr));
    }
    return out;
  }

  // build a clean 2D Bohr SVG (always works, even without WebGL)
  function bohrSVG(e) {
    var shells = (e.shells && e.shells.length) ? e.shells : [Math.min(2, e.number)];
    var W = 320, H = 320, cx = W / 2, cy = H / 2;
    var maxR = 140, step = maxR / (shells.length + 0.5);
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="dp-shells-svg" xmlns="http://www.w3.org/2000/svg">';
    var accent = e.color || '#5eead4';
    // shells
    for (var s = 0; s < shells.length; s++) {
      var R = step * (s + 1);
      svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R.toFixed(1) + '" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1"/>';
      var count = shells[s];
      var valence = (s === shells.length - 1);
      for (var k = 0; k < count; k++) {
        var a = (k / count) * Math.PI * 2 - Math.PI / 2;
        var x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        svg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5" fill="' + (valence ? '#fde68a' : '#5eead4') + '"/>';
      }
    }
    // nucleus
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="16" fill="' + accent + '"/>';
    svg += '<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="14" font-weight="800" fill="#0b0f1a">' + e.symbol + '</text>';
    svg += '</svg>';
    return svg;
  }

  window.Atom = { Viewer: AtomViewer, bohrSVG: bohrSVG, hasTHREE: hasTHREE };
})();
