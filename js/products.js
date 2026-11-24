const thumbnails = document.getElementById('productThumbnails');
const details = document.getElementById('productDetails');

function selectProduct(thumbnail) {
  const current = thumbnails.querySelector('[aria-current="true"]');
  if (current === thumbnail) return;

  current?.setAttribute('aria-current', 'false');
  thumbnail.setAttribute('aria-current', 'true');
  for (const panel of details.children) panel.hidden = '#' + panel.id !== thumbnail.hash;
}

thumbnails.addEventListener('click', event => {
  const thumbnail = event.target.closest('.product-thumbnail');
  if (!thumbnail || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  selectProduct(thumbnail);
});

function selectLinkedProduct() {
  const linked = Array.from(thumbnails.querySelectorAll('.product-thumbnail'))
    .find(thumbnail => thumbnail.hash === window.location.hash);
  if (linked) selectProduct(linked);
}

selectLinkedProduct();
window.addEventListener('hashchange', selectLinkedProduct);
