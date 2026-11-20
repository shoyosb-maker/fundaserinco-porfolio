/**
 * Pantalla de carga: reproduce la intro de marca mientras el documento termina
 * de cargar. Al acabar (y con la página lista) se desvanece y avisa al hero
 * para que su escena arranque justo después, sin perderse detrás del overlay.
 */
(function () {
  'use strict';

  var html = document.documentElement;
  var loader = document.getElementById('pageLoader');
  var video = document.getElementById('pageLoaderVideo');
  if (!loader) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var conn = navigator.connection;
  var lightMode = reducedMotion.matches || !!(conn && (conn.saveData || /2g/.test(conn.effectiveType || '')));

  var MIN_MS = 3000;   // el video de la pantalla de carga dura 3 s
  var MAX_MS = 4500;   // tope: la página nunca queda atrapada en la carga
  var FADE_MS = 500;   // acompaña la transición CSS del overlay

  var startedAt = Date.now();
  var pageReady = document.readyState === 'complete';
  var videoDone = false;
  var finished = false;
  var maxTimer = 0;

  /* la barra sigue el tiempo real del video; sin JS la anima el CSS */
  var bar = loader.querySelector('.pl-bar span');
  if (bar) bar.style.animation = 'none';

  function paintProgress() {
    if (!bar || !video || !video.duration) return;
    var p = Math.min(1, Math.max(0, video.currentTime / video.duration));
    bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
  }

  html.classList.add('is-loading');

  function finish() {
    if (finished) return;
    finished = true;
    window.clearTimeout(maxTimer);
    loader.classList.add('is-done');
    html.classList.remove('is-loading');
    window.setTimeout(function () {
      if (video && video.pause) video.pause();
      if (loader.parentNode) loader.parentNode.removeChild(loader);
      window.__loaderDone = true;
      document.dispatchEvent(new CustomEvent('loaderdone'));
    }, FADE_MS);
  }

  function tryFinish() {
    if (!pageReady || !videoDone) return;
    var wait = Math.max(0, MIN_MS - (Date.now() - startedAt));
    window.setTimeout(finish, wait);
  }

  /* sin movimiento o con datos ahorrados: se queda el último frame, quieto */
  function freeze() {
    videoDone = true;
    if (bar) bar.style.transform = 'scaleX(1)';
    if (video) {
      try { video.pause(); } catch (e) {}
      var showEnd = function () {
        try { video.currentTime = Math.max(0, (video.duration || 3) - 0.05); } catch (e) {}
      };
      if (video.readyState >= 1) showEnd();
      else video.addEventListener('loadedmetadata', showEnd, { once: true });
    }
    tryFinish();
  }

  function startVideo() {
    if (!video) {
      videoDone = true;
      tryFinish();
      return;
    }
    video.muted = true;
    var promise = video.play();
    if (promise && promise.catch) promise.catch(freeze);   // autoplay bloqueado
    video.addEventListener('timeupdate', paintProgress);
    video.addEventListener('loadedmetadata', paintProgress);
    video.addEventListener('ended', function () {
      videoDone = true;
      paintProgress();
      tryFinish();
    });
    video.addEventListener('error', freeze);
    /* por si el navegador no dispara ni 'ended' ni 'error' */
    window.setTimeout(function () {
      if (videoDone) return;
      videoDone = true;
      tryFinish();
    }, MAX_MS - 600);
  }

  if (lightMode) freeze();
  else startVideo();

  if (pageReady) tryFinish();
  else {
    window.addEventListener('load', function () {
      pageReady = true;
      tryFinish();
    });
  }

  maxTimer = window.setTimeout(finish, MAX_MS);

  /* si la preferencia cambia en caliente, no debe quedar la página bloqueada */
  var onMotion = function (event) {
    if (!event.matches) return;
    freeze();
  };
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotion);
  else if (reducedMotion.addListener) reducedMotion.addListener(onMotion);
})();
