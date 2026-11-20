/**
 * Estimador de inversión · Portafolio Fundaserinco
 * Rango = línea de trabajo × escala + módulos adicionales.
 * Sin dependencias: sólo DOM y aritmética.
 */
(function () {
  'use strict';

  var SERVICIOS = {
    civil:      { n: 'Ingeniería civil',        min: 1800000, max: 2700000, mensual: 380000, nota: 'Diseño estructural y obra' },
    seguridad:  { n: 'Seguridad electrónica',   min: 1200000, max: 2200000, mensual: 290000, nota: 'CCTV, acceso y monitoreo' },
    telecom:    { n: 'Telecomunicaciones',      min: 900000,  max: 1800000, mensual: 250000, nota: 'Cableado certificado y WiFi' },
    energia:    { n: 'Energía y RETIE',         min: 1400000, max: 2400000, mensual: 320000, nota: 'Instalación y certificación' },
    software:   { n: 'Tecnología y software',   min: 3900000, max: 8900000, mensual: 390000, nota: 'Landing, web app o plataforma' },
    integrales: { n: 'Proyectos integrales',    min: 4200000, max: 7000000, mensual: 690000, nota: 'Gerencia EPC llave en mano' },
    deportivas: { n: 'Instalaciones deportivas', min: 3800000, max: 6500000, mensual: 450000, nota: 'Cancha, cerramiento y luz' }
  };

  var ESCALA = {
    p: { label: 'escala pequeña',  factor: 0.6 },
    m: { label: 'escala mediana',  factor: 1 },
    g: { label: 'escala grande',   factor: 2.2 }
  };

  var ADDONS = {
    auto:     { label: 'Automatizaciones',       precio: 1450000, mensual: 0 },
    ia:       { label: 'Funciones de IA',        precio: 9000000, mensual: 690000 },
    dash:     { label: 'Dashboard de control',   precio: 1850000, mensual: 0 },
    integra:  { label: 'Integraciones y pagos',  precio: 1200000, mensual: 0 },
    soporte:  { label: 'Soporte mensual',        precio: 0,       mensual: 300000 }
  };

  var USD_RATE = 3400;
  var WA = '573046814396';

  var selServicio = document.getElementById('calcServicio');
  var escalaBox = document.getElementById('calcEscala');
  var titleEl = document.getElementById('crTitle');
  var totalEl = document.getElementById('crTotal');
  var usdEl = document.getElementById('crUsd');
  var linesEl = document.getElementById('crLines');
  var monthlyEl = document.getElementById('crMonthly');
  var ctaEl = document.getElementById('crCta');
  if (!selServicio || !escalaBox || !totalEl) return;

  var toggles = {
    auto: document.getElementById('addAuto'),
    ia: document.getElementById('addIa'),
    dash: document.getElementById('addDash'),
    integra: document.getElementById('addIntegra'),
    soporte: document.getElementById('addSoporte')
  };

  var state = { servicio: 'civil', escala: 'm', auto: false, ia: false, dash: false, integra: false, soporte: false };

  /* un plan preselecciona la línea de software con la escala y los módulos que
     lo describen, para que el botón del plan no lleve a un cálculo ajeno */
  var PRESETS = {
    esencial:     { nombre: 'Esencial',     escala: 'p', auto: true,  ia: false, dash: false, integra: false, soporte: false },
    intermedio:   { nombre: 'Intermedio',   escala: 'm', auto: true,  ia: false, dash: true,  integra: false, soporte: false },
    elite:        { nombre: 'Élite',        escala: 'g', auto: true,  ia: false, dash: true,  integra: true,  soporte: false },
    'ia-aplicada': { nombre: 'IA aplicada a funciones', escala: 'g', auto: true, ia: true, dash: true, integra: true, soporte: true }
  };
  PRESETS.agentico = PRESETS['ia-aplicada'];
  var presetEl = document.getElementById('crPreset');

  var nf = new Intl.NumberFormat('es-CO');

  function money(value) {
    return '$' + nf.format(Math.round(value / 1000) * 1000);
  }

  function usd(value) {
    var v = value / USD_RATE;
    var txt = Math.abs(v - Math.round(v)) < 0.5 ? nf.format(Math.round(v)) : nf.format(Math.round(v * 100) / 100);
    return 'USD ' + txt;
  }

  function render() {
    var servicio = SERVICIOS[state.servicio];
    var escala = ESCALA[state.escala];

    var min = servicio.min * escala.factor;
    var max = servicio.max * escala.factor;
    var mensual = servicio.mensual;

    var extras = 0;
    Object.keys(ADDONS).forEach(function (key) {
      if (!state[key]) return;
      extras += ADDONS[key].precio;
      mensual += ADDONS[key].mensual;
    });

    var totalMin = min + extras;
    var totalMax = max + extras;

    titleEl.textContent = servicio.n + ' · ' + escala.label;
    totalEl.textContent = money(totalMin) + ' – ' + money(totalMax);
    usdEl.textContent = usd(totalMin) + ' – ' + usd(totalMax);

    var html = '<li><span>' + servicio.nota + '</span><b>' + money(min) + ' – ' + money(max) + '</b></li>';
    Object.keys(ADDONS).forEach(function (key) {
      if (!state[key] || !ADDONS[key].precio) return;
      html += '<li><span>' + ADDONS[key].label + '</span><b>' + money(ADDONS[key].precio) + '</b></li>';
    });
    if (!extras) html += '<li><span>Sin módulos adicionales</span><b>—</b></li>';
    linesEl.innerHTML = html;

    monthlyEl.innerHTML = 'Mantenimiento estimado: <strong>' + money(mensual) + ' / mes</strong>' +
      (state.soporte ? ' · incluye bolsa de horas de soporte' : '');

    var texto = 'Hola, quiero cotizar ' + servicio.n.toLowerCase() + ' (' + escala.label + ')' +
      (state.auto ? ', con automatizaciones' : '') +
      (state.ia ? ', con funciones de IA' : '') +
      (state.dash ? ', con dashboard de control' : '') +
      (state.integra ? ', con integraciones y pagos' : '') +
      (state.soporte ? ', con soporte mensual' : '') +
      '. Rango estimado en el portafolio: ' + money(totalMin) + ' – ' + money(totalMax) + '.';
    ctaEl.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(texto);
    ctaEl.setAttribute('target', '_blank');
    ctaEl.setAttribute('rel', 'noopener');

    Array.prototype.forEach.call(escalaBox.querySelectorAll('.scale-btn'), function (btn) {
      var on = btn.getAttribute('data-scale') === state.escala;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    Object.keys(toggles).forEach(function (key) {
      var btn = toggles[key];
      if (!btn) return;
      btn.classList.toggle('is-on', !!state[key]);
      btn.setAttribute('aria-pressed', state[key] ? 'true' : 'false');
    });
  }

  selServicio.addEventListener('change', function () {
    state.servicio = selServicio.value;
    clearPreset();
    syncHash();
    render();
  });

  escalaBox.addEventListener('click', function (event) {
    var btn = event.target.closest('.scale-btn');
    if (!btn) return;
    state.escala = btn.getAttribute('data-scale');
    clearPreset();
    syncHash();
    render();
  });

  Object.keys(toggles).forEach(function (key) {
    var btn = toggles[key];
    if (!btn) return;
    btn.addEventListener('click', function () {
      state[key] = !state[key];
      clearPreset();
      syncHash();
      render();
    });
  });

  function clearPreset() {
    if (!presetEl) return;
    presetEl.hidden = true;
    presetEl.textContent = '';
  }

  /* el estado viaja en el ancla (#e=civil-m-ia) para poder compartir el
     cálculo por enlace sin backend */
  function syncHash() {
    try {
      var parts = [state.servicio, state.escala];
      ['auto', 'ia', 'dash', 'integra', 'soporte'].forEach(function (key) {
        if (state[key]) parts.push(key);
      });
      window.history.replaceState(null, '', window.location.pathname + window.location.search + '#e=' + parts.join('-'));
    } catch (e) {}
  }

  function readStateHash() {
    var raw = window.location.hash || '';
    if (raw.indexOf('#e=') !== 0) return false;
    var parts = raw.slice(3).split('-');
    if (SERVICIOS[parts[0]]) state.servicio = parts[0];
    if (ESCALA[parts[1]]) state.escala = parts[1];
    ['auto', 'ia', 'dash', 'integra', 'soporte'].forEach(function (key) {
      state[key] = parts.indexOf(key) > -1;
    });
    selServicio.value = state.servicio;
    return true;
  }

  var copyEl = document.getElementById('crCopy');
  var copiedEl = document.getElementById('crCopied');
  if (copyEl) {
    copyEl.addEventListener('click', function () {
      var done = function () {
        if (!copiedEl) return;
        copiedEl.hidden = false;
        window.setTimeout(function () { copiedEl.hidden = true; }, 2600);
      };
      var text = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(field);
      }
    });
  }

  /* los botones «Cotizar este plan» dejan el cálculo armado con ese plan.
     También se acepta por URL (?plan=elite) para que el enlace del plan
     abra el estimador ya preseleccionado. */
  function applyPreset(name) {
    var preset = PRESETS[name];
    if (!preset) return;

    state.servicio = 'software';
    state.escala = preset.escala;
    state.auto = preset.auto;
    state.ia = preset.ia;
    state.dash = preset.dash;
    state.integra = preset.integra;
    state.soporte = preset.soporte;
    selServicio.value = 'software';
    render();

    if (presetEl) {
      presetEl.hidden = false;
      presetEl.textContent = 'Preseleccionado desde el plan ' + preset.nombre +
        (preset.ia ? ' · incluye funciones de IA' : '') + '. Ajusta la escala o los módulos si tu caso es distinto.';
    }
  }

  document.addEventListener('click', function (event) {
    var btn = event.target.closest ? event.target.closest('[data-plan]') : null;
    if (!btn) return;
    applyPreset(btn.getAttribute('data-plan'));
  });

  /* el plan llega por el ancla (#plan-elite) o por la consulta (?plan=elite):
     el ancla no se pierde con las redirecciones del servidor */
  var planParam = null;
  try {
    var planMatch = /plan-([a-z-]+)/.exec(window.location.hash || '');
    planParam = planMatch ? planMatch[1] : new URLSearchParams(window.location.search).get('plan');
  } catch (e) {}
  if (planParam) applyPreset(planParam);
  else readStateHash();

  render();
})();
