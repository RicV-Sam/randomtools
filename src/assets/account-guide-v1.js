(function () {
  'use strict';
  var dialog = document.querySelector('[data-picture-dialog]');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var image = dialog.querySelector('[data-full-picture]');
  var zoom = dialog.querySelector('[data-picture-zoom]');
  var opener;
  document.querySelectorAll('[data-picture-help]').forEach(function (hint) {
    hint.textContent = 'Use Close picture to return here.';
  });
  document.querySelectorAll('[data-enlarge]').forEach(function (link) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', function (event) {
      // Preserve normal browser shortcuts for opening a link by choice.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      dialog.querySelector('h2').textContent = link.dataset.pictureTitle;
      image.classList.remove('is-actual-size');
      zoom.setAttribute('aria-pressed', 'false');
      zoom.textContent = 'Show actual size';
      dialog.showModal();
      dialog.querySelector('.account-picture-scroll').scrollTo(0, 0);
    });
  });
  dialog.querySelector('[data-picture-close]').addEventListener('click', function () { dialog.close(); });
  zoom.addEventListener('click', function () {
    var actual = image.classList.toggle('is-actual-size');
    zoom.setAttribute('aria-pressed', String(actual));
    zoom.textContent = actual ? 'Fit picture to screen' : 'Show actual size';
  });
  dialog.addEventListener('close', function () {
    if (opener) opener.focus({ preventScroll: true });
  });
}());
