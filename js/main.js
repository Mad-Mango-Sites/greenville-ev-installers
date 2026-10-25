/* Greenville EV Installers: site script (plain JS, no dependencies).
   1) Mobile nav + dropdowns  2) Directory filters and sort (installers.html)  3) Charging cost calculator */
(function () {
  'use strict';
  var root = document.body.getAttribute('data-root') || '';

  /* ---------- 1. Navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  var subs = document.querySelectorAll('.sub-toggle');
  Array.prototype.forEach.call(subs, function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var li = btn.parentNode;
      var open = !li.classList.contains('open');
      Array.prototype.forEach.call(document.querySelectorAll('.has-sub.open'), function (o) {
        if (o !== li) { o.classList.remove('open'); o.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false'); }
      });
      li.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest || e.target.closest('.has-sub')) return;
    Array.prototype.forEach.call(document.querySelectorAll('.has-sub.open'), function (o) {
      o.classList.remove('open'); o.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    Array.prototype.forEach.call(document.querySelectorAll('.has-sub.open'), function (o) {
      o.classList.remove('open'); o.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- 2. Directory filters and sort ---------- */
  var list = document.getElementById('directory-list');
  if (list) { loadInstallers(initDirectory); }

  function loadInstallers(cb) {
    var embedded = document.getElementById('installers-data');
    function fallback() {
      try { cb(JSON.parse(embedded.textContent)); } catch (err) { cb(null); }
    }
    // file:// cannot fetch, so use the embedded copy there; online, fetch data/installers.json.
    if (location.protocol === 'file:' || !window.fetch) { fallback(); return; }
    fetch(root + 'data/installers.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { cb(data); })
      .catch(function () { fallback(); });
  }

  function initDirectory(data) {
    if (!data || !data.length) return;
    list.setAttribute('data-source', location.protocol === 'file:' ? 'embedded' : 'json');
    var bySlug = {};
    data.forEach(function (d) { bySlug[d.slug] = d; });
    var cards = Array.prototype.slice.call(list.querySelectorAll('li.icard'));
    var f = {
      town: document.getElementById('f-town'), job: document.getElementById('f-job'),
      brand: document.getElementById('f-brand'), hc: document.getElementById('f-hc'),
      prices: document.getElementById('f-prices'), sort: document.getElementById('f-sort')
    };
    var count = document.getElementById('results-count');
    var none = document.getElementById('no-results');
    var params = new URLSearchParams(location.search);
    function setIfValid(sel, v) {
      if (!v) return;
      for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].value === v) { sel.value = v; return; } }
    }
    setIfValid(f.town, params.get('town')); setIfValid(f.job, params.get('job'));
    setIfValid(f.brand, params.get('brand')); setIfValid(f.hc, params.get('hc')); setIfValid(f.sort, params.get('sort'));
    if (params.get('prices') === '1') f.prices.checked = true;

    function matches(d) {
      if (f.town.value && d.towns_listed.indexOf(f.town.value) === -1) return false;
      if (f.job.value && d.jobs.indexOf(f.job.value) === -1) return false;
      if (f.brand.value && d.brands.indexOf(f.brand.value) === -1) return false;
      if (f.hc.value === 'home' && d.commercial_only) return false;
      if (f.hc.value === 'business' && d.home_or_commercial.indexOf('business') === -1 && !d.commercial_only) return false;
      if (f.prices.checked && !d.publishes_prices) return false;
      return true;
    }
    function compare(a, b) {
      var s = f.sort.value;
      if (s === 'name') return a.name.localeCompare(b.name);
      if (s === 'reviews') {
        var ra = a.review_count_scored == null ? -1 : a.review_count_scored;
        var rb = b.review_count_scored == null ? -1 : b.review_count_scored;
        if (rb !== ra) return rb - ra;
      }
      return a.rank - b.rank;
    }
    function apply() {
      var shown = data.filter(matches).sort(compare);
      var order = {};
      shown.forEach(function (d, i) { order[d.slug] = i; });
      cards.sort(function (x, y) {
        var a = order[x.getAttribute('data-slug')], b = order[y.getAttribute('data-slug')];
        a = a === undefined ? 9999 : a; b = b === undefined ? 9999 : b;
        return a - b;
      });
      cards.forEach(function (c) {
        c.hidden = order[c.getAttribute('data-slug')] === undefined;
        list.appendChild(c);
      });
      count.textContent = shown.length + (shown.length === 1 ? ' installer' : ' installers');
      if (none) none.hidden = shown.length !== 0;
      var q = new URLSearchParams();
      ['town', 'job', 'brand', 'hc'].forEach(function (k) { if (f[k].value) q.set(k, f[k].value); });
      if (f.prices.checked) q.set('prices', '1');
      if (f.sort.value !== 'score') q.set('sort', f.sort.value);
      if (window.history && history.replaceState && location.protocol !== 'file:') {
        var qs = q.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
      }
    }
    ['town', 'job', 'brand', 'hc', 'sort'].forEach(function (k) { f[k].addEventListener('change', apply); });
    f.prices.addEventListener('change', apply);
    document.getElementById('f-reset').addEventListener('click', function () {
      f.town.value = ''; f.job.value = ''; f.brand.value = ''; f.hc.value = ''; f.prices.checked = false; f.sort.value = 'score';
      apply();
    });
    var ft = document.querySelector('.filters-toggle');
    if (ft) ft.addEventListener('click', function () {
      var box = ft.parentNode; var open = box.classList.toggle('open');
      ft.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    apply();
  }

  /* ---------- 3. Charging cost calculator ---------- */
  var form = document.getElementById('calc-form');
  if (form) initCalc();

  function initCalc() {
    var DAYS = 30.4;
    var el = function (id) { return document.getElementById(id); };
    var inputs = { miles: el('c-miles'), eff: el('c-eff'), gas: el('c-gas'), mpg: el('c-mpg') };
    var LIMITS = {
      miles: [0, 1000, 'miles per day'],
      gas: [0.5, 15, 'a gas price'],
      mpg: [5, 150, 'an MPG']
    };
    var EFF_LIMITS = { mikwh: [0.5, 10], kwh100: [10, 200] };
    var money = function (v) { return '$' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
    var num = function (v, d) { return v.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }); };
    function unit() { return form.querySelector('input[name="c-unit"]:checked').value; }
    function rate() { return parseFloat(form.querySelector('input[name="c-block"]:checked').value); }

    function check(key, lim, label, required) {
      var inp = inputs[key], msg = el(inp.id + '-msg'), raw = inp.value.trim();
      var out = { ok: false, empty: raw === '' };
      if (raw === '') {
        msg.textContent = required === 'quiet' ? '' : 'Enter ' + label + '.';
        inp.setAttribute('aria-invalid', required === 'quiet' ? 'false' : 'true');
        return out;
      }
      var v = Number(raw);
      if (!isFinite(v)) { msg.textContent = 'Enter a number.'; inp.setAttribute('aria-invalid', 'true'); return out; }
      if (v < lim[0] || v > lim[1]) {
        msg.textContent = 'Enter a value from ' + lim[0] + ' to ' + lim[1] + '.';
        inp.setAttribute('aria-invalid', 'true'); return out;
      }
      msg.textContent = ''; inp.setAttribute('aria-invalid', 'false');
      out.ok = true; out.v = v; return out;
    }

    var touched = {};
    function calc() {
      var u = unit();
      inputs.eff.min = EFF_LIMITS[u][0]; inputs.eff.max = EFF_LIMITS[u][1];
      var m = check('miles', LIMITS.miles, 'your miles per day', touched.miles ? 'show' : 'quiet');
      var e = check('eff', EFF_LIMITS[u], u === 'mikwh' ? "your car's miles per kWh" : "your car's kWh per 100 miles", touched.eff ? 'show' : 'quiet');
      var g = check('gas', LIMITS.gas, 'a gas price', 'show');
      var p = check('mpg', LIMITS.mpg, 'an MPG', 'show');
      var status = el('calc-status');
      var ids = ['r-miles', 'r-kwh', 'r-ev', 'r-gas', 'r-diff'];
      if (!(m.ok && e.ok && g.ok && p.ok)) {
        ids.forEach(function (id) { el(id).textContent = '—'; });
        status.textContent = (m.empty || e.empty) && g.ok && p.ok
          ? 'Enter your miles per day and your car\'s efficiency to see your estimate.'
          : 'Check the highlighted fields to see your estimate.';
        return null;
      }
      var milesMonth = m.v * DAYS;
      var kwh = u === 'mikwh' ? milesMonth / e.v : milesMonth * e.v / 100;
      var ev = kwh * rate() / 100;
      var gas = milesMonth / p.v * g.v;
      var diff = gas - ev;
      el('r-miles').textContent = num(milesMonth, 0) + ' mi';
      el('r-kwh').textContent = num(kwh, 1) + ' kWh';
      el('r-ev').textContent = money(ev);
      el('r-gas').textContent = money(gas);
      var d = Math.round(diff * 100) / 100;
      el('r-diff').textContent = d > 0 ? money(d) + ' less to charge at home'
        : d < 0 ? money(-d) + ' more to charge at home' : 'About the same';
      status.textContent = 'Estimate at ' + rate() + '¢/kWh, before fixed charges, riders and taxes.';
      return { milesMonth: milesMonth, kwh: kwh, ev: ev, gas: gas, diff: diff };
    }
    Object.keys(inputs).forEach(function (k) {
      inputs[k].addEventListener('input', function () { touched[k] = true; calc(); });
      inputs[k].addEventListener('blur', function () { touched[k] = true; calc(); });
    });
    Array.prototype.forEach.call(form.querySelectorAll('input[type=radio]'), function (r) { r.addEventListener('change', calc); });
    form.addEventListener('submit', function (e) { e.preventDefault(); touched.miles = touched.eff = true; calc(); });
    window.gvlCalc = calc;
    calc();
  }
})();
