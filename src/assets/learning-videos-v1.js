(function () {
  'use strict';
  var players = Array.from(document.querySelectorAll('[data-lesson-video]'));
  function close(root, restoreFocus) {
    root.querySelector('[data-video-player]').replaceChildren();
    root.querySelector('[data-video-poster]').hidden = false;
    root.querySelector('[data-video-close]').hidden = true;
    if (restoreFocus) root.querySelector('[data-video-load]').focus();
  }
  players.forEach(function (root) {
    var id = root.dataset.videoId;
    if (!/^[A-Za-z0-9_-]{11}$/.test(id || '')) return;
    var button = root.querySelector('[data-video-load]');
    button.hidden = false;
    button.addEventListener('click', function () {
      players.forEach(function (other) { close(other, false); });
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?playsinline=1&rel=0';
      frame.title = root.dataset.videoTitle;
      frame.allow = 'encrypted-media; fullscreen; picture-in-picture';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      root.querySelector('[data-video-player]').appendChild(frame);
      root.querySelector('[data-video-poster]').hidden = true;
      root.querySelector('[data-video-close]').hidden = false;
      frame.focus({ preventScroll: true });
    });
    root.querySelector('[data-video-close]').addEventListener('click', function () { close(root, true); });
  });
}());
