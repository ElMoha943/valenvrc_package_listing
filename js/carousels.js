document.querySelectorAll('.projects-carousel-container, .reviews-carousel-container').forEach(container => {
  const carousel = container.querySelector('.projects-carousel, .reviews-carousel');
  const previous = container.querySelector('.carousel-nav-prev');
  const next = container.querySelector('.carousel-nav-next');

  function updateControls() {
    previous.disabled = carousel.scrollLeft <= 1;
    next.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1;
  }

  previous.hidden = false;
  next.hidden = false;
  previous.addEventListener('click', () => carousel.scrollBy({ left: -carousel.clientWidth * 0.85 }));
  next.addEventListener('click', () => carousel.scrollBy({ left: carousel.clientWidth * 0.85 }));
  carousel.addEventListener('scroll', updateControls, { passive: true });
  new ResizeObserver(updateControls).observe(carousel);
  updateControls();
});
