/**
 * Fichas de servicio · Fundaserinco
 * Interacción común a las siete fichas: progreso de lectura, índice flotante
 * con seguimiento de sección, aparición de bloques, acordeón de preguntas,
 * pestañas de niveles, línea de fases y estimadores rápidos.
 * Sin dependencias. Todo responde a prefers-reduced-motion.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var nf = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });

  function num(value) {
    var n = Number(value);
    return isFinite(n) ? n : 0;
  }

  function money(value) {
    return '$' + nf.format(Math.round(num(value) / 1000) * 1000);
  }

  /* ---------------- progreso de lectura ---------------- */

  var bar = document.createElement('div');
  bar.className = 'rd-bar';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var ticking = false;
  function paintBar() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = 'scaleX(' + pct.toFixed(4) + ')';
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(paintBar);
  }, { passive: true });
  paintBar();

  /* ---------------- índice flotante ---------------- */

  var heads = Array.prototype.slice.call(document.querySelectorAll('main h2'))
    .filter(function (h) {
      /* las bandas de presentación y el cierre no entran en el índice */
      return !h.closest('.proc-head') && !h.closest('.plan-cta-band') && !h.closest('.demo-copy');
    });
  var toc = document.querySelector('[data-det-toc]');
  if (toc && heads.length > 2) {
    /* el índice se cuelga del body: dentro de <main> el z-index queda atrapado
       por el contexto de apilamiento y el pie lo tapaba */
    if (toc.parentNode !== document.body) document.body.appendChild(toc);
    toc.classList.add('is-live');
    var list = document.createElement('ol');
    list.className = 'toc-list';
    heads.forEach(function (h, i) {
      if (!h.id) h.id = 'sec-' + i;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      var clone = h.cloneNode(true);
      var num = clone.querySelector('.n');
      if (num) num.remove();
      a.textContent = clone.textContent.trim();
      a.addEventListener('click', function (event) {
        event.preventDefault();
        closeToc();
        h.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + h.id);
      });
      li.appendChild(a);
      list.appendChild(li);
    });
    toc.appendChild(list);

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toc-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span class="toc-dots" aria-hidden="true"><i></i><i></i><i></i></span>Índice';
    toc.appendChild(toggle);

    function closeToc() {
      toc.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function () {
      var open = toc.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeToc();
    });
    document.addEventListener('click', function (event) {
      if (!toc.contains(event.target)) closeToc();
    });

    var links = Array.prototype.slice.call(list.querySelectorAll('a'));
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
          });
        });
      }, { rootMargin: '-72px 0px -60% 0px', threshold: 0 });
      heads.forEach(function (h) { spy.observe(h); });
    }
  }

  /* ---------------- aparición de bloques ---------------- */

  var reveals = document.querySelectorAll(
    '.blk > *, .proc-card, .side-card, .plan-facts, .plan-hero .scene-actions');
  if (reduced.matches || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('reveal-in'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-in');
        revealObs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    Array.prototype.forEach.call(reveals, function (el, i) {
      el.classList.add('reveal-pending');
      el.style.setProperty('--i', String(i % 6));
      revealObs.observe(el);
    });

    // Al entrar con un ancla (o saltar con el índice) el scroll puede ocurrir
    // antes de observar: se revela lo que ya quedó por encima del pliegue.
    function revealAbove() {
      Array.prototype.forEach.call(reveals, function (el) {
        if (el.classList.contains('reveal-in')) return;
        if (el.getBoundingClientRect().bottom <= 0) el.classList.add('reveal-in');
      });
    }
    revealAbove();
    window.addEventListener('load', function () {
      requestAnimationFrame(revealAbove);
      setTimeout(revealAbove, 300);
    });
    window.addEventListener('hashchange', function () { setTimeout(revealAbove, 400); });
  }

  /* ---------------- línea de fases ---------------- */

  var phases = document.querySelector('.phases');
  if (phases && 'IntersectionObserver' in window && !reduced.matches) {
    var phaseObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          phases.classList.add('is-drawn');
          phaseObs.disconnect();
        }
      });
    }, { threshold: 0.35 });
    phaseObs.observe(phases);
  } else if (phases) {
    phases.classList.add('is-drawn');
  }

  /* ---------------- pestañas de niveles ---------------- */

  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(box.querySelectorAll('[role="tabpanel"]'));
    if (!tabs.length || tabs.length !== panels.length) return;

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        tab.classList.toggle('is-on', on);
      });
      panels.forEach(function (panel, i) {
        panel.hidden = i !== index;
        panel.classList.toggle('is-on', i === index);
      });
      if (focus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        select(next, true);
      });
    });
    select(0, false);
  });

  /* ---------------- acordeón de preguntas ----------------
     La apertura y el cierre los anima el CSS (grid-template-rows), así que el
     <details> funciona incluso sin JavaScript. */

  /* ---------------- estimadores rápidos ---------------- */

  var CALCS = {
    /* m³ de concreto y muestras de cilindros para control de calidad */
    civil: function (v) {
      var area = num(v.area), pisos = num(v.pisos);
      var vol = area * pisos * 0.25;
      var muestras = Math.max(1, Math.ceil(vol / 50));
      return {
        main: nf.format(Math.round(vol)) + ' m³ de concreto',
        note: 'Equivale a ' + nf.format(muestras) + ' muestra(s) de cilindros para control de resistencia (1 por cada 50 m³ o fracción) y ' +
          nf.format(Math.round(area * pisos)) + ' m² de área construida.'
      };
    },

    /* almacenamiento de grabación según cámaras, resolución y días */
    seguridad: function (v) {
      var camaras = num(v.camaras), dias = num(v.dias);
      var mbps = Number(v.resolucion) || 4;
      var gb = mbps * 86400 * dias / 8 / 1000;
      var totalGb = gb * camaras;
      var tb = totalGb / 1000;
      return {
        main: (tb >= 1 ? nf.format(Math.round(tb * 10) / 10) + ' TB' : nf.format(Math.round(totalGb)) + ' GB'),
        note: 'Con ' + nf.format(camaras) + ' cámara(s) a ' + mbps + ' Mbps y ' + nf.format(dias) + ' días de retención: ' +
          nf.format(Math.round(gb)) + ' GB por cámara. Deja 20 % libre para reindexado y picos de movimiento.'
      };
    },

    /* cable y certificaciones para una red de datos */
    telecom: function (v) {
      var puntos = num(v.puntos), prom = num(v.metros);
      var cable = puntos * prom * 1.15;
      var bobinas = Math.ceil(cable / 305);
      return {
        main: nf.format(Math.round(cable)) + ' m de cable',
        note: 'Para ' + nf.format(puntos) + ' punto(s) con tirada promedio de ' + nf.format(prom) + ' m, con 15 % de reserva: ' +
          nf.format(bobinas) + ' bobina(s) de 305 m. Cada punto se entrega con su certificado de longitud, atenuación y NEXT.'
      };
    },

    /* corriente y calibre aproximado a partir de la carga */
    energia: function (v) {
      var kw = num(v.carga), sistema = v.sistema || 'tri';
      var fp = 0.9;
      var amp = sistema === 'tri' ? (kw * 1000) / (Math.sqrt(3) * 220 * fp) : (kw * 1000) / (220 * fp);
      var calibres = [
        { awg: '12 AWG', a: 20 }, { awg: '10 AWG', a: 30 }, { awg: '8 AWG', a: 40 },
        { awg: '6 AWG', a: 55 }, { awg: '4 AWG', a: 70 }, { awg: '2 AWG', a: 95 },
        { awg: '1/0 AWG', a: 130 }, { awg: '2/0 AWG', a: 150 }, { awg: '3/0 AWG', a: 175 },
        { awg: '4/0 AWG', a: 205 }, { awg: '300 kcmil', a: 240 }, { awg: '350 kcmil', a: 280 }
      ];
      var pick = calibres[calibres.length - 1];
      for (var i = 0; i < calibres.length; i++) {
        if (calibres[i].a >= amp) { pick = calibres[i]; break; }
      }
      return {
        main: nf.format(Math.round(amp)) + ' A',
        note: 'Carga de ' + nf.format(kw) + ' kW en ' + (sistema === 'tri' ? 'trifásico 220 V' : 'monofásico 220 V') +
          ' con factor de potencia 0,9. Conductor de cobre sugerido: ' + pick.awg +
          ' (THHN en tubería, 30 °C). La protección y el calibre final los define el cálculo certificado.'
      };
    },

    /* plazo y rango estimado según módulos del producto digital */
    software: function (v) {
      var mods = 0;
      ['auth', 'catalogo', 'pagos', 'dashboard', 'ia'].forEach(function (k) { if (v[k]) mods++; });
      var semanas = 2 + mods * 1.7;
      var minimo = 2 + mods * 1.2;
      return {
        main: nf.format(Math.round(semanas)) + ' semanas aprox.',
        note: 'Con ' + mods + ' módulo(s) seleccionado(s) el rango de inversión se mueve entre ' +
          nf.format(Math.round(minimo)) + ' y ' + nf.format(Math.round(semanas + 3)) +
          ' semanas de trabajo. El detalle por componente está en los planes de TI.'
      };
    },

    /* cronograma cuando varias especialidades corren en paralelo */
    integrales: function (v) {
      var frentes = num(v.frentes), base = num(v.base);
      var factor = 1 + (frentes - 1) * 0.28;
      var total = base * factor;
      return {
        main: nf.format(Math.round(total)) + ' semanas',
        note: frentes + ' frente(s) sobre una base de ' + nf.format(base) +
          ' semanas. El paralelismo reduce el plazo frente a ejecutarlos en serie, pero suma coordinación: ' +
          nf.format(Math.round(base * frentes)) + ' semanas si se hicieran uno tras otro.'
      };
    },

    /* luminarias necesarias para alcanzar un nivel de iluminación */
    deportivas: function (v) {
      var largo = num(v.largo), ancho = num(v.ancho), lux = num(v.lux);
      var area = largo * ancho;
      var lumenes = 48000, cu = 0.78, mf = 0.8;
      var unidades = Math.ceil((lux * area) / (lumenes * cu * mf));
      return {
        main: nf.format(unidades) + ' luminarias LED',
        note: 'Para ' + nf.format(Math.round(area)) + ' m² a ' + nf.format(lux) + ' lux, con proyectores de 48.000 lm, ' +
          'coeficiente de utilización 0,78 y factor de mantenimiento 0,80. La altura y la uniformidad se confirman con el cálculo luminotécnico.'
      };
    },

    /* inversión de un plan: base + flujos extra + add-ons marcados */
    plan: function (v, box) {
      var base = num(box.getAttribute('data-base'));
      var unit = num(box.getAttribute('data-unit'));
      var month = num(box.getAttribute('data-month'));
      var flows = num(v.flows);
      var addons = 0;
      var addonMonth = 0;
      var chosen = [];

      Array.prototype.forEach.call(box.querySelectorAll('[data-price]'), function (el) {
        if (!el.checked) return;
        addons += num(el.getAttribute('data-price'));
        addonMonth += num(el.getAttribute('data-month'));
        chosen.push(el.getAttribute('data-label'));
      });

      var total = base + flows * unit + addons;
      var mensual = month + addonMonth;
      var detalle = 'Plan base ' + money(base);
      if (flows) detalle += ' + ' + flows + ' flujo(s) de ' + money(unit) + ' = ' + money(flows * unit);
      if (chosen.length) detalle += ' + ' + chosen.length + ' add-on(s) = ' + money(addons);

      return {
        main: money(total),
        note: detalle + '. Mantenimiento estimado con lo seleccionado: ' + money(mensual) + ' / mes' +
          (chosen.length ? ' (' + chosen.join(', ') + ')' : '') + '.'
      };
    }
  };

  Array.prototype.forEach.call(document.querySelectorAll('[data-calc]'), function (box) {
    var kind = box.getAttribute('data-calc');
    var compute = CALCS[kind];
    if (!compute) return;

    var inputs = Array.prototype.slice.call(box.querySelectorAll('[data-in]'));
    var mainEl = box.querySelector('[data-out="main"]');
    var noteEl = box.querySelector('[data-out="note"]');

    function read() {
      var values = {};
      inputs.forEach(function (input) {
        var key = input.getAttribute('data-in');
        if (input.type === 'checkbox') values[key] = input.checked;
        else if (input.type === 'range' || input.type === 'number') values[key] = Number(input.value);
        else values[key] = input.value;
      });
      return values;
    }

    function render() {
      var values = read();
      var out = compute(values, box);
      if (mainEl) mainEl.textContent = out.main;
      if (noteEl) noteEl.textContent = out.note;
      inputs.forEach(function (input) {
        if (input.type !== 'range') return;
        var label = input.parentNode.querySelector('output');
        if (label) label.textContent = input.value + (input.getAttribute('data-unit') || '');
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', render);
      input.addEventListener('change', render);
    });
    render();
  });
})();
