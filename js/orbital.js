/**
 * Ecosistema orbital.
 * Los siete frentes de Fundaserinco giran alrededor de un mismo contrato.
 * Al elegir un frente se lee su ficha y corre la transición en video que va
 * del frente anterior al elegido (assets/video/orbital/A-B.mp4), tomada del
 * proyecto orbital. Los videos se piden sólo cuando se usan y se guardan en
 * memoria: el capítulo no descarga 42 archivos al abrir la página.
 */
(function () {
  'use strict';

  var orbit = document.getElementById('ecoOrbit');
  var media = document.querySelector('.eco-media');
  if (!orbit || !media) return;

  var nodes = Array.prototype.slice.call(orbit.querySelectorAll('.eco-node'));
  var codeEl = document.getElementById('ecoCode');
  var nameEl = document.getElementById('ecoName');
  var descEl = document.getElementById('ecoDesc');
  var tagsEl = document.getElementById('ecoTags');
  var scopeEl = document.getElementById('ecoScope');
  var verifEl = document.getElementById('ecoVerif');
  var spanEl = document.getElementById('ecoSpan');
  var moreEl = document.getElementById('ecoMore');
  if (!nodes.length || !codeEl) return;

  /* índice 1..7 = orden de las disciplinas en el proyecto orbital */
  var DATA = [
    {
      code: 'CIV-01 · NSR-10 / AIS-100',
      name: 'Ingeniería civil',
      desc: 'Infraestructura segura: diseño estructural, estudios de suelos, obra civil e interventoría, con memorias de cálculo y pruebas de resistencia al cierre.',
      tags: ['Estructuras', 'Geotecnia', 'Interventoría'],
      scope: 'Obra nueva · reforzamiento',
      verif: 'Compresión de cilindros',
      span: '3 – 16 semanas',
      href: 'servicios/ingenieria-civil.html'
    },
    {
      code: 'SEC-02 · ONVIF / IP-PoE / NFPA',
      name: 'Seguridad electrónica',
      desc: 'CCTV con analítica, control de acceso biométrico, alarmas y monitoreo remoto. Cada dispositivo se prueba y se firma en acta antes de entregar.',
      tags: ['CCTV', 'Acceso', 'Perimetría'],
      scope: 'Sedes · perímetros · bodegas',
      verif: 'Retención y latencia',
      span: '4 – 8 semanas',
      href: 'servicios/seguridad-electronica.html'
    },
    {
      code: 'TEL-03 · TIA-568 / ISO 11801',
      name: 'Telecomunicaciones',
      desc: 'Cableado estructurado Cat 6/6A, fibra óptica, WiFi empresarial y telefonía IP. Sin certificado por punto no hay red entregada.',
      tags: ['Cat 6A', 'Fibra', 'WiFi'],
      scope: 'Racks · sites · nuevas sedes',
      verif: 'Fluke DSX / OTDR',
      span: '3 – 8 semanas',
      href: 'servicios/telecomunicaciones.html'
    },
    {
      code: 'PWR-04 · RETIE / NTC 2050',
      name: 'Energía y RETIE',
      desc: 'Instalaciones eléctricas, tableros, subestaciones y puesta a tierra con certificación RETIE ante organismo acreditado ONAC.',
      tags: ['RETIE', 'Tableros', 'SPT'],
      scope: 'Media y baja tensión',
      verif: 'Dictamen ONAC',
      span: '4 – 12 semanas',
      href: 'servicios/energia-retie.html'
    },
    {
      code: 'DEV-05 · REST API / CI-CD / OWASP',
      name: 'Tecnología y software',
      desc: 'Landing pages, web apps con roles, sistemas de gestión, APIs y asistentes de IA. Se entrega el código, las pruebas y el despliegue automatizado.',
      tags: ['Web apps', 'IA', 'Cloud'],
      scope: 'Producto digital · plataforma',
      verif: 'Core Web Vitals / OWASP',
      span: '2 – 11 semanas',
      href: 'servicios/tecnologia-software.html'
    },
    {
      code: 'EPC-06 · EPC / PMI / llave en mano',
      name: 'Proyectos integrales',
      desc: 'Coordinación de todas las especialidades bajo un plan único: cronograma, riesgos, procura y una sola acta de entrega con el dossier completo.',
      tags: ['EPC', 'PMI', 'Llave en mano'],
      scope: 'Multidisciplinario',
      verif: 'Comisionamiento (Cx)',
      span: '12 – 26 semanas',
      href: 'servicios/proyectos-integrales.html'
    },
    {
      code: 'ATH-07 · Estándar FIFA / DMX',
      name: 'Instalaciones deportivas',
      desc: 'Canchas sintéticas, cerramientos, alumbrado deportivo y dotación. La superficie se mide: drenaje, planimetría, rebote y luxometría.',
      tags: ['Canchas', 'Iluminación', 'Dotación'],
      scope: 'Escenarios y recintos',
      verif: 'Drenaje y luxometría',
      span: '7 – 12 semanas',
      href: 'servicios/instalaciones-deportivas.html'
    }
  ];

  var BASE = 'assets/video/orbital/';
  var current = 1;
  var videos = {};
  var playing = null;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function paint(index) {
    var item = DATA[index - 1];
    if (!item) return;
    codeEl.textContent = item.code;
    nameEl.textContent = item.name;
    descEl.textContent = item.desc;
    scopeEl.textContent = item.scope;
    verifEl.textContent = item.verif;
    spanEl.textContent = item.span;
    if (moreEl && item.href) {
      moreEl.href = item.href;
      moreEl.setAttribute('aria-label', 'Ver la ficha de ' + item.name);
    }

    tagsEl.innerHTML = '';
    item.tags.forEach(function (tag) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = tag;
      tagsEl.appendChild(chip);
    });

    nodes.forEach(function (node) {
      var on = parseInt(node.getAttribute('data-idx'), 10) + 1 === index;
      node.classList.toggle('is-on', on);
      node.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function stopVideo() {
    if (!playing) return;
    playing.pause();
    playing.classList.remove('is-active');
  }

  function playTransition(from, to) {
    if (reducedMotion.matches || from === to) return;
    var key = from + '-' + to;

    var video = videos[key];
    if (!video) {
      video = document.createElement('video');
      video.className = 'eco-video';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.setAttribute('aria-hidden', 'true');
      video.src = BASE + key + '.mp4';
      videos[key] = video;
      media.appendChild(video);
    }

    stopVideo();
    playing = video;
    video.currentTime = 0;
    video.classList.add('is-active');
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        video.classList.remove('is-active');
        playing = null;
      });
    }
  }

  videoEndCleanup();
  function videoEndCleanup() {
    /* la transición se queda en su último fotograma hasta la siguiente elección */
    media.addEventListener('ended', function (event) {
      if (event.target && event.target.classList) event.target.classList.remove('is-active');
      if (playing === event.target) playing = null;
    }, true);
  }

  nodes.forEach(function (node) {
    node.addEventListener('click', function () {
      var next = parseInt(node.getAttribute('data-idx'), 10) + 1;
      if (next === current) {
        paint(current);
        return;
      }
      playTransition(current, next);
      current = next;
      paint(current);
    });
  });

  paint(current);
})();
