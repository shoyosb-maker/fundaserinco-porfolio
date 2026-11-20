/**
 * Filtros del portafolio · Portafolio Fundaserinco
 * Un criterio: tipo de proyecto. Las tarjetas ocultas se sacan del flujo para
 * que la retícula se reacomode, y el contador anuncia el resultado.
 */
(function () {
  'use strict';

  var box = document.querySelector('[data-pf-filters]');
  var grid = document.querySelector('.pf-grid');
  var counter = document.querySelector('[data-pf-count]');
  if (!box || !grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.pf-card'));
  if (!cards.length) return;

  var state = { cat: 'all' };

  function apply() {
    var shown = 0;
    cards.forEach(function (card) {
      var visible = state.cat === 'all' || card.getAttribute('data-cat') === state.cat;
      card.hidden = !visible;
      card.classList.toggle('is-filtered-out', !visible);
      if (visible) shown++;
    });
    if (counter) counter.textContent = shown + ' de ' + cards.length + ' proyectos';
    grid.classList.toggle('is-empty', shown === 0);
  }

  function pick(btn) {
    state.cat = btn.getAttribute('data-filter-cat') || 'all';
    Array.prototype.forEach.call(box.querySelectorAll('.pf-chip'), function (b) {
      var on = b.getAttribute('data-filter-cat') === state.cat;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    apply();
  }

  box.addEventListener('click', function (event) {
    var btn = event.target.closest ? event.target.closest('.pf-chip') : null;
    if (btn) pick(btn);
  });

  /* atajo: si llega con #portafolio-3d desde un enlace, arranca filtrado */
  var atajo = /^portafolio-(3d|ia|web|datos)$/.exec((window.location.hash || '').replace('#', ''));
  if (atajo) {
    var target = box.querySelector('[data-filter-cat="' + atajo[1] + '"]');
    if (target) target.click();
  }

  apply();
})();
