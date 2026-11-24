const menuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.getElementById('main-nav');
const dropdowns = mainNav.querySelectorAll('.nav-dropdown');

function setMenuOpen(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.textContent = open ? '✕' : '☰';
  mainNav.classList.toggle('mobile-menu-open', open);
}

function closeDropdowns(except) {
  dropdowns.forEach(dropdown => {
    if (dropdown !== except) dropdown.open = false;
  });
}

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'false';
  setMenuOpen(open);
  if (!open) closeDropdowns();
});

document.addEventListener('click', event => {
  const summary = event.target.closest('.nav-dropdown > summary');
  if (summary) {
    closeDropdowns(summary.parentElement);
  } else if (event.target.closest('a') || !event.target.closest('.site-header')) {
    closeDropdowns();
    setMenuOpen(false);
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;

  const openDropdown = mainNav.querySelector('.nav-dropdown[open]');
  if (openDropdown) {
    if (openDropdown.contains(document.activeElement)) {
      openDropdown.querySelector('summary').focus();
    }
    openDropdown.open = false;
  } else if (menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

menuToggle.closest('.site-header').classList.add('menu-ready');
