/* Si la carpeta llega sin barra final (/planes), los enlaces relativos
   resolverian contra la raiz del dominio. Normalizamos antes de pintar. */
(function () {
  var p = location.pathname.replace(/\/index(\.html?)?$/i, '/');
  if (/\/$/.test(p)) return;
  location.replace(location.origin + p + '/' + location.search + location.hash);
})();
