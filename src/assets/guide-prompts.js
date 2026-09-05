/* Optional conveniences: the full prompt library works without JavaScript. */
(() => {
  document.querySelectorAll('.guide-example[id^="prompt-"]').forEach(example => {
    const prompt = example.querySelector('blockquote');
    const label = example.querySelector('p');
    if (!prompt || !label) return;
    const actions = document.createElement('div');
    actions.className = 'guide-actions';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'learn-button guide-copy';
    copy.textContent = 'Copy prompt';
    copy.setAttribute('aria-label', `Copy prompt: ${label.textContent}`);
    const status = document.createElement('span');
    status.className = 'guide-copy-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(prompt.textContent.trim());
        status.textContent = 'Copied. Paste into your AI chat, then replace the bracketed details.';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(prompt);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = 'Automatic copying is unavailable. The prompt is selected; use your device’s Copy command.';
      }
    });
    actions.append(copy);
    example.append(actions, status);
  });
  const print = document.querySelector('.guide-print');
  if (print) {
    print.hidden = false;
    print.addEventListener('click', () => window.print());
  }
})();
