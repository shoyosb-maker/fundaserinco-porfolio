/**
 * Comportamiento base del documento.
 * · Ajusta los tokens de altura al alto real de la barra fija: la barra crece
 *   en tableta (el nombre ocupa dos lineas), y los capitulos deben reservar
 *   ese espacio para que el titulo no quede debajo.
 * · Aparece el contenido de los paneles al entrar en pantalla.
 * La navegacion entre capitulos la manejan deck.js y sequence.js; aqui no se
 * toca el scroll.
 */
(function () {
  'use strict';

  var bar = document.querySelector('.topbar');
  var root = document.documentElement;

  function syncBarMetrics() {
    if (!bar) return;
    var h = Math.round(bar.getBoundingClientRect().height);
    if (!h) return;
    root.style.setProperty('--bar-h', h + 'px');
    root.style.setProperty('--seq-head-top', Math.max(96, h + 40) + 'px');
  }

  syncBarMetrics();
  window.addEventListener('resize', syncBarMetrics);
  window.addEventListener('orientationchange', syncBarMetrics);
  window.addEventListener('load', syncBarMetrics);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncBarMetrics);

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (!items.length) return;

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach(function (el) { observer.observe(el); });
})();