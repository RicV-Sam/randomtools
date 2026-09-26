(function () {
  'use strict';
  var players = Array.from(document.querySelectorAll('[data-narration] audio'));
  var speedControls = Array.from(document.querySelectorAll('[data-audio-speed]'));
  var rate = 1;
  function pauseOthers(active) {
    players.forEach(function (player) { if (player !== active) player.pause(); });
  }
  speedControls.forEach(function (select) {
    select.closest('label').hidden = false;
    select.addEventListener('change', function () {
      rate = Number(select.value);
      speedControls.forEach(function (other) { other.value = select.value; });
      players.forEach(function (player) { player.playbackRate = rate; });
    });
  });
  players.forEach(function (player) {
    var block = player.closest('[data-narration]');
    var status = block.querySelector('[data-audio-status]');
    var retry = block.querySelector('[data-audio-retry]');
    player.addEventListener('play', function () {
      if (player.closest('[hidden]')) { player.pause(); return; }
      pauseOthers(player);
      player.playbackRate = rate;
      status.textContent = '';
      retry.hidden = true;
    });
    player.addEventListener('error', function () {
      player.pause();
      status.textContent = 'Audio could not load. You can keep reading the lesson or written feedback, or try loading the audio again.';
      retry.hidden = false;
    });
    player.addEventListener('loadedmetadata', function () {
      if (block.dataset.retrying === 'true') {
        status.textContent = 'Audio is ready. Press play to listen.';
        retry.hidden = true;
        delete block.dataset.retrying;
      }
    });
    retry.addEventListener('click', function () {
      block.dataset.retrying = 'true';
      status.textContent = 'Loading audio. Use the play control when it is ready.';
      player.pause();
      player.preload = 'metadata';
      player.load();
    });
  });
  // Keep listening available while the learner practises in another tab.
  window.addEventListener('pagehide', function () { pauseOthers(null); });
  window.addEventListener('beforeprint', function () { pauseOthers(null); });
}());
