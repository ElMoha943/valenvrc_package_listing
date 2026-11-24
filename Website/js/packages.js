const urlField = document.getElementById('vpm-url');
const copyButton = document.getElementById('vpm-copy');
const search = document.getElementById('vpm-search');
const empty = document.getElementById('vpm-search-empty');
const cards = Array.from(document.querySelectorAll('.vpm-package-card'), card => {
  const fields = card.querySelectorAll('.vpm-package-name, .vpm-package-id, .vpm-package-description');
  const text = [card.dataset.packageId, ...Array.from(fields, field => field.textContent)];
  return { card, text: text.join(' ').toLowerCase() };
});

let copyFeedback;
copyButton.hidden = false;
copyButton.addEventListener('click', async () => {
  clearTimeout(copyFeedback);
  try {
    await navigator.clipboard.writeText(urlField.value);
    copyButton.textContent = 'Copied!';
  } catch {
    urlField.select();
    copyButton.textContent = 'Copy URL manually';
  }
  copyFeedback = setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
});

search.parentElement.hidden = false;
search.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  for (const { card, text } of cards) card.hidden = !text.includes(query);
  empty.hidden = cards.some(({ card }) => !card.hidden);
});

if (typeof HTMLDialogElement !== 'undefined' && HTMLDialogElement.prototype.showModal) {
  document.querySelectorAll('[data-dialog]').forEach(button => {
    const dialog = document.getElementById(button.dataset.dialog);
    button.hidden = false;
    button.addEventListener('click', () => dialog.showModal());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  });
}
