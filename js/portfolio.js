/**
 * Portafolio · vista previa, enlace y mini tutorial.
 *
 * · Al pasar el cursor (o al enfocar con teclado) cada tarjeta muestra la
 *   captura real del sitio en una ventana flotante, al lado que quepa.
 * · Un clic en cualquier parte de la tarjeta abre el proyecto desplegado.
 * · La tarjeta del asistente de IA reproduce un mini tutorial: baja hasta el
 *   pie del sitio, hace clic en «super usuario», escribe las credenciales y
 *   muestra el panel de administración.
 */
(function () {
  'use strict';

  var cards = Array.prototype.slice.call(document.querySelectorAll('.pf-card'));
  if (!cards.length) return;

  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  var GAP = 16;
  var MARGIN = 12;

  function place(card) {
    if (!canHover.matches) return;
    var pop = card.querySelector('.pf-pop');
    if (!pop) return;

    var box = card.getBoundingClientRect();
    var popW = pop.offsetWidth || 360;
    var popH = pop.offsetHeight || 260;

    /* el lado se decide en cada apertura: la tarjeta puede haber cambiado
       de columna al redimensionar */
    var fitsRight = box.right + GAP + popW <= window.innerWidth - MARGIN;
    var fitsLeft = box.left - GAP - popW >= MARGIN;
    pop.setAttribute('data-side', fitsRight || !fitsLeft ? 'right' : 'left');

    var maxTop = Math.max(MARGIN, window.innerHeight - popH - MARGIN);
    var top = Math.min(Math.max(MARGIN, box.top), maxTop);
    pop.style.top = Math.round(top - box.top) + 'px';
  }

  function openProject(card) {
    var link = card.querySelector('.pf-btn');
    if (link) link.click();
  }

  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () { place(card); });
    card.addEventListener('focusin', function () { place(card); });

    card.addEventListener('click', function (event) {
      if (event.target.closest('a')) return;      // el botón ya abre el proyecto
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      openProject(card);
    });

    card.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      if (event.target.closest('a')) return;
      event.preventDefault();
      openProject(card);
    });
  });

  window.addEventListener('scroll', function () {
    if (!canHover.matches) return;
    var active = document.querySelector('.pf-card:hover');
    if (active) place(active);
  }, { passive: true });

  /* ---------------- mini tutorial del asistente de IA ---------------- */
  var tut = document.querySelector('.pf-preview-tut');
  if (!tut) return;

  var tutCard = tut.closest('.pf-card');
  var stepEl = tut.querySelector('[data-step]');
  var capEl = tut.querySelector('[data-cap]');
  var fieldUser = tut.querySelector('[data-field="user"]');
  var fieldPass = tut.querySelector('[data-field="pass"]');
  var tutBox = tut.querySelector('.pf-win-tut');
  var scrollBox = tut.querySelector('.tut-scroll');
  var pageWrap = tut.querySelector('[data-pagewrap]');
  var zoom = tut.querySelector('[data-zoom]');
  var pageImg = tut.querySelector('[data-page]');
  var hit = tut.querySelector('[data-hit]');
  var cursor = tut.querySelector('[data-cursor]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var STEPS = {
    scroll: ['1/5', 'Desliza hasta el pie de la página.'],
    target: ['2/5', 'Clic en «Iniciar sesión super usuario».'],
    click: ['2/5', 'Clic en «Iniciar sesión super usuario».'],
    user: ['3/5', 'Usuario: admin'],
    pass: ['4/5', 'Contraseña: 123'],
    submit: ['5/5', 'Clic en Ingresar.'],
    done: ['OK', 'Ya estás en el panel de administración.']
  };
  var runId = 0;
  var running = false;

  function render(phase) {
    var step = STEPS[phase] || STEPS.scroll;
    if (phase) tut.setAttribute('data-phase', phase);
    else tut.removeAttribute('data-phase');
    stepEl.textContent = step[0];
    capEl.textContent = step[1];
  }

  function resetTut() {
    render(null);
    fieldUser.querySelector('span').textContent = '';
    fieldPass.querySelector('span').textContent = '';
    fieldUser.classList.remove('is-typing');
    fieldPass.classList.remove('is-typing');
    pageWrap.style.transition = 'none';
    pageWrap.style.transform = 'translateY(0)';
    void pageWrap.offsetHeight;
    pageWrap.style.transition = '';
  }

  /* coordenadas del enlace del pie dentro de la captura de la página */
  function geometry() {
    var pageW = parseFloat(tutBox.getAttribute('data-page-w')) || 1440;
    var scale = scrollBox.clientWidth / pageW;
    var cx = parseFloat(tutBox.getAttribute('data-link-x')) * scale;
    var cyPage = parseFloat(tutBox.getAttribute('data-link-y')) * scale;
    var w = parseFloat(tutBox.getAttribute('data-link-w')) * scale;
    var h = parseFloat(tutBox.getAttribute('data-link-h')) * scale;
    var dist = Math.max(0, pageWrap.offsetHeight - scrollBox.clientHeight);
    return {
      dist: dist,
      cx: cx,
      cyPage: cyPage,
      cy: cyPage - dist,
      sx: cx - 28,
      sy: cyPage - dist + 24,
      hitLeft: cx - w / 2,
      hitTop: cyPage - h / 2,
      hitW: w,
      hitH: h
    };
  }

  function applyGeometry(g) {
    hit.style.left = g.hitLeft + 'px';
    hit.style.top = g.hitTop + 'px';
    hit.style.width = g.hitW + 'px';
    hit.style.height = g.hitH + 'px';
    zoom.style.transformOrigin = g.cx + 'px ' + g.cyPage + 'px';
    cursor.style.transform = 'translate(' + g.sx + 'px,' + g.sy + 'px)';
  }

  function pageReady() {
    if (pageImg.complete && pageImg.naturalWidth) return Promise.resolve(true);
    return new Promise(function (resolve) {
      var done = false;
      var finish = function (ok) {
        if (done) return;
        done = true;
        resolve(ok);
      };
      pageImg.addEventListener('load', function () { finish(true); }, { once: true });
      pageImg.addEventListener('error', function () { finish(false); }, { once: true });
      setTimeout(function () { finish(pageImg.naturalWidth > 0); }, 3000);
    });
  }

  function nextFrame() {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(resolve);
      });
    });
  }

  function wait(ms, id) {
    return new Promise(function (resolve) {
      setTimeout(function () { resolve(id === runId); }, reduced.matches ? 0 : ms);
    });
  }

  function typeInto(field, text, delay, id) {
    var out = field.querySelector('span');
    field.classList.add('is-typing');
    out.textContent = '';
    var i = 0;
    function step() {
      if (id !== runId || i >= text.length) {
        field.classList.remove('is-typing');
        return;
      }
      out.textContent += text.charAt(i);
      i++;
      wait(delay, id).then(function (ok) {
        if (!ok) {
          field.classList.remove('is-typing');
          return;
        }
        step();
      });
    }
    step();
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(id === runId);
      }, reduced.matches ? 0 : delay * text.length + 40);
    });
  }

  function isActive() {
    return running && (tutCard.classList.contains('is-open') ||
      tutCard.matches(':hover') ||
      tutCard.contains(document.activeElement));
  }

  async function play(id) {
    resetTut();
    if (!(await wait(240, id))) return;

    var hasPage = await pageReady();
    if (id !== runId) return;
    var g = geometry();

    if (hasPage && g.dist > 40) {
      applyGeometry(g);
      render('scroll');
      await nextFrame();
      if (id !== runId) return;
      pageWrap.style.transform = 'translateY(-' + Math.round(g.dist) + 'px)';
      if (!(await wait(1650, id))) return;
      render('target');
      cursor.style.transform = 'translate(' + g.cx + 'px,' + g.cy + 'px)';
      if (!(await wait(1150, id))) return;
      render('click');
      if (!(await wait(600, id))) return;
    }

    render('user');
    if (!(await wait(320, id))) return;
    if (!(await typeInto(fieldUser, 'admin', 130, id))) return;
    if (!(await wait(500, id))) return;
    render('pass');
    if (!(await typeInto(fieldPass, '•••', 160, id))) return;
    if (!(await wait(420, id))) return;
    render('submit');
    if (!(await wait(780, id))) return;
    render('done');
    if (!(await wait(2400, id))) return;

    if (reduced.matches) {
      running = false;
      return;
    }
    if (isActive()) {
      play(id);
      return;
    }
    running = false;
    resetTut();
  }

  function start() {
    if (running) return;
    running = true;
    runId++;
    play(runId);
  }

  function stop() {
    if (!running) return;
    running = false;
    runId++;
    resetTut();
  }

  tutCard.addEventListener('mouseenter', function () {
    if (canHover.matches) start();
  });
  tutCard.addEventListener('mouseleave', function () {
    if (canHover.matches) stop();
  });
  tutCard.addEventListener('focusin', start);
  tutCard.addEventListener('focusout', function (event) {
    if (tutCard.contains(event.relatedTarget)) return;
    stop();
  });
})();
