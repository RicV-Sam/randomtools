(function () {
  'use strict';
  var root = document.querySelector('[data-conversation]');
  if (!root) return;
  var key = 'spinnit.learn.first-conversation.v1';
  var steps = Array.from(root.querySelectorAll('[data-step]'));
  var ids = steps.map(function (step) { return step.dataset.step; });
  var practices = steps.filter(function (step) { return step.hasAttribute('data-practice'); });
  var checkpoints = steps.filter(function (step) { return step.hasAttribute('data-practice') || step.querySelector('[data-quiz]'); }).map(function (step) { return step.dataset.step; });
  var completed = new Set();
  var current = 0;
  var remember = root.querySelector('[data-remember]');
  var saveStatus = root.querySelector('[data-save-status]');
  var storageWarning = '';
  var position = root.querySelector('[data-position]');
  var audioPlayers = Array.from(root.querySelectorAll('audio'));

  function stopAudio(except, rewind) {
    audioPlayers.forEach(function (player) {
      if (player === except) return;
      player.pause();
      if (rewind && player.readyState > 0) player.currentTime = 0;
    });
  }

  // This pilot has its own record. Never change the existing course-progress key.
  try {
    var saved = window.localStorage.getItem(key);
    if (saved) {
      var data = JSON.parse(saved);
      if (!data || data.version !== 1 || !ids.includes(data.current) || !Array.isArray(data.completed)) throw new Error('Invalid progress');
      current = ids.indexOf(data.current);
      completed = new Set(data.completed.filter(function (id) { return checkpoints.includes(id); }));
      remember.checked = true;
    }
  } catch (error) {
    storageWarning = 'Saved progress could not be read. You can still use every lesson. Tick “Remember my place” to try saving again.';
  }

  function save() {
    if (remember.checked) {
      try {
        window.localStorage.setItem(key, JSON.stringify({ version: 1, current: ids[current], completed: Array.from(completed) }));
        storageWarning = '';
        saveStatus.textContent = 'Your place is saved on this device. You can close the page and come back.';
      } catch (error) {
        remember.checked = false;
        storageWarning = 'Your place could not be saved. Keep this tab open, or note the step below before leaving.';
        saveStatus.textContent = storageWarning;
      }
    } else {
      saveStatus.textContent = storageWarning || 'Your place is kept for this visit only. Tick the option above if you want to return later.';
    }
  }

  function updateSummary() {
    var box = root.querySelector('[data-summary]');
    box.replaceChildren();
    var count = practices.slice(0, 3).filter(function (step) { return completed.has(step.dataset.step); }).length;
    var p = document.createElement('p');
    p.textContent = 'You reported completing ' + count + ' of 3 guided tasks in ChatGPT. ' + (completed.has('own-task') ? 'You also reported completing the independent challenge.' : 'The independent challenge is still available to try.');
    box.appendChild(p);
    var remaining = practices.filter(function (step) { return !completed.has(step.dataset.step); });
    if (remaining.length) {
      var list = document.createElement('ul');
      remaining.forEach(function (step) {
        var item = document.createElement('li');
        var link = document.createElement('a');
        link.href = '#' + step.dataset.step;
        link.dataset.go = step.dataset.step;
        link.textContent = 'Practise: ' + step.querySelector('h2').textContent;
        item.appendChild(link);
        list.appendChild(item);
      });
      box.appendChild(list);
    }
  }

  function show(index, focus) {
    var next = Math.max(0, Math.min(index, steps.length - 1));
    if (next !== current) stopAudio(null, true);
    current = next;
    // Keep an existing deep link in sync without adding a history entry per step.
    // A plain lesson URL stays plain, preserving optional saved-place behaviour.
    if (ids.includes(window.location.hash.slice(1))) {
      try { window.history.replaceState(window.history.state, '', '#' + ids[current]); }
      catch (error) { /* The lesson remains usable when history access is restricted. */ }
    }
    root.classList.toggle('has-started', current > 0);
    steps.forEach(function (step, i) { step.hidden = i !== current; });
    position.hidden = false;
    position.textContent = 'Step ' + (current + 1) + ' of ' + steps.length + ' · ' + steps[current].querySelector('.learn-eyebrow').textContent;
    var activePart = current < 3 ? 'start-safely' : current < 5 ? 'follow-up' : current < 7 ? 'spot-invention' : 'own-task';
    var practiceForPart = { 'start-safely': 'first-message', 'follow-up': 'improve-message', 'spot-invention': 'check-message', 'own-task': 'own-task' };
    root.querySelectorAll('.conversation-path a').forEach(function (link) {
      if (link.dataset.go === activePart) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
      var label = link.querySelector('[data-practised]');
      if (label) label.hidden = !completed.has(practiceForPart[link.dataset.go]);
    });
    updateSummary();
    save();
    if (focus) {
      var title = steps[current].querySelector('h2');
      title.focus({ preventScroll: true });
      title.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  practices.forEach(function (step) {
    if (completed.has(step.dataset.step)) step.querySelectorAll('[data-task-check]').forEach(function (input) { input.checked = true; });
  });
  steps.forEach(function (step) {
    if (step.querySelector('[data-quiz]') && completed.has(step.dataset.step)) {
      step.querySelector('[data-feedback]').textContent = 'You previously completed this check on this device. Continue, or select an answer to practise again.';
    }
  });
  root.querySelectorAll('[data-enhanced]').forEach(function (el) { el.hidden = false; });
  root.classList.add('is-interactive');

  remember.addEventListener('change', function () {
    storageWarning = '';
    if (!remember.checked) {
      try { window.localStorage.removeItem(key); }
      catch (error) { storageWarning = 'We could not remove the saved record. Clear this site’s data in your browser to remove it. Your current lesson remains open.'; }
    }
    save();
  });

  root.addEventListener('change', function (event) {
    var input = event.target;
    var step = input.closest('[data-step]');
    if (input.matches('[data-task-check]')) {
      // Only the explicit Continue action records a completed practical checkpoint.
      if (!input.checked) {
        completed.delete(step.dataset.step);
        show(current, false);
      }
      step.querySelector('[data-step-status]').textContent = '';
      save();
    }
    if (input.matches('[data-quiz] input')) {
      var feedbackAudio = step.querySelector('[data-feedback-audio]');
      if (feedbackAudio) {
        feedbackAudio.querySelector('audio').pause();
        feedbackAudio.hidden = true;
      }
      completed.delete(step.dataset.step);
      step.querySelector('[data-feedback]').textContent = '';
      step.querySelector('[data-feedback]').removeAttribute('data-result');
      step.querySelector('[data-step-status]').textContent = '';
      save();
    }
    if (input.name === 'confidence') {
      var messages = {
        independent: 'Try the small task below on another day. If you can repeat the steps without help, that is a useful sign of growing independence.',
        supported: 'Using help is part of learning. Repeat the step where you needed a hint, then try a fresh task with less help.',
        repeat: 'Take one step at a time. Use the practice route above to repeat a lesson, or ask someone to sit with you while you control the device.'
      };
      root.querySelector('[data-reflection]').textContent = messages[input.value] || '';
    }
  });

  root.addEventListener('click', async function (event) {
    var go = event.target.closest('[data-go]');
    if (go && root.contains(go) && ids.includes(go.dataset.go)) {
      event.preventDefault();
      show(ids.indexOf(go.dataset.go), true);
      return;
    }
    var button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    var step = button.closest('[data-step]');
    if (button.hasAttribute('data-print')) { window.print(); return; }
    if (button.hasAttribute('data-check')) {
      var selected = step.querySelector('[data-quiz] input:checked');
      var feedback = step.querySelector('[data-feedback]');
      if (!selected) { feedback.textContent = 'Choose one answer, then select “Check my answer”.'; return; }
      var correct = selected.dataset.correct === 'true';
      feedback.textContent = step.querySelector('[data-explanation="' + selected.value + '"]').textContent + (correct ? ' Continue when you are ready.' : ' Try another answer when you are ready.');
      feedback.dataset.result = correct ? 'correct' : 'retry';
      var feedbackBlock = step.querySelector('[data-feedback-audio]');
      if (feedbackBlock && selected.dataset.feedbackSrc) {
        var feedbackPlayer = feedbackBlock.querySelector('audio');
        feedbackPlayer.pause();
        feedbackPlayer.src = selected.dataset.feedbackSrc;
        feedbackBlock.querySelector('[data-audio-status]').textContent = '';
        feedbackBlock.querySelector('[data-audio-retry]').hidden = true;
        feedbackBlock.hidden = false;
      }
      if (correct) completed.add(step.dataset.step);
      else completed.delete(step.dataset.step);
      step.querySelector('[data-step-status]').textContent = '';
      save();
    }
    if (button.hasAttribute('data-copy')) {
      var prompt = step.querySelector('[data-prompt]');
      var status = step.querySelector('[data-copy-status]');
      try {
        await navigator.clipboard.writeText(prompt.textContent);
        status.textContent = 'Copied. Paste it into the ChatGPT message box.';
      } catch (error) {
        var range = document.createRange();
        range.selectNodeContents(prompt);
        var selection = window.getSelection();
        if (selection) { selection.removeAllRanges(); selection.addRange(range); }
        status.textContent = 'Automatic copying is unavailable. The request is selected; use Copy in your browser, or type it yourself.';
      }
    }
    if (button.hasAttribute('data-back')) show(current - 1, true);
    if (button.hasAttribute('data-later')) show(current + 1, true);
    if (button.hasAttribute('data-next')) {
      var status = step.querySelector('[data-step-status]');
      if (step.querySelector('[data-quiz]') && !completed.has(step.dataset.step)) {
        status.textContent = 'Try the question and check your answer before continuing. You can read the explanations or choose another lesson above.';
        return;
      }
      if (step.hasAttribute('data-practice')) {
        if (!Array.from(step.querySelectorAll('[data-task-check]')).every(function (input) { return input.checked; })) {
          status.textContent = 'Tick the actions you have completed, or choose “Try this task later”. There is no need to tick anything you have not done.';
          return;
        }
        completed.add(step.dataset.step);
      }
      show(current === steps.length - 1 ? 0 : current + 1, true);
    }
  });

  // Keep deep links and the plain-page fallback useful without adding progress to URLs.
  function openHash() {
    var id = window.location.hash.slice(1);
    if (ids.includes(id)) show(ids.indexOf(id), true);
  }
  window.addEventListener('hashchange', openHash);
  window.addEventListener('beforeprint', function () {
    stopAudio(null, false);
    root.querySelectorAll('details').forEach(function (detail) { detail.dataset.wasOpen = String(detail.open); detail.open = true; });
  });
  window.addEventListener('afterprint', function () {
    root.querySelectorAll('details').forEach(function (detail) { detail.open = detail.dataset.wasOpen === 'true'; });
  });
  var requestedStep = ids.indexOf(window.location.hash.slice(1));
  show(requestedStep >= 0 ? requestedStep : current, requestedStep >= 0);
}());
