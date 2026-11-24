// Portfolio Page JavaScript

let portfolioData = null;

// Load portfolio data
async function loadPortfolioData() {
  try {
    const response = await fetch('data/portfolio.json');
    portfolioData = await response.json();
    
    initPortfolio();
  } catch (error) {
    console.error('Error loading portfolio data:', error);
  }
}

// Initialize portfolio sections
function initPortfolio() {
  renderWorkedFor();
  renderPersonalProjects();
  renderOthers();
  renderReviews();
  initCarousels();
}

// Render Worked For section
function renderWorkedFor() {
  const container = document.getElementById('worked-for-content');
  if (!container || !portfolioData.workedFor) return;
  
  portfolioData.workedFor.forEach(brand => {
    const brandSection = document.createElement('div');
    brandSection.className = 'brand-section';
    
    brandSection.innerHTML = `
      <div class="brand-info">
        <img loading="lazy" decoding="async" src="${brand.logo}" alt="" class="brand-logo" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%232a2a2a%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23888%22 font-family=%22Arial%22 font-size=%2214%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ELogo%3C/text%3E%3C/svg%3E'">
        <h3 class="brand-name">${brand.name}</h3>
      </div>
      <div class="projects-carousel-container">
        <button type="button" class="carousel-nav carousel-nav-prev" aria-label="Previous projects" aria-controls="carousel-${brand.id}" disabled>‹</button>
        <div class="projects-carousel" id="carousel-${brand.id}">
          ${brand.projects.map(project => `
            <a href="${project.url}" target="_blank" class="project-card">
              <div class="project-image">
                <img loading="lazy" decoding="async" src="${project.image}" alt="" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%232a2a2a%22 width=%22300%22 height=%22200%22/%3E%3Ctext fill=%22%23888%22 font-family=%22Arial%22 font-size=%2218%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage%3C/text%3E%3C/svg%3E'">
              </div>
              <div class="project-info">
                <h4>${project.name}</h4>
              </div>
            </a>
          `).join('')}
        </div>
        <button type="button" class="carousel-nav carousel-nav-next" aria-label="Next projects" aria-controls="carousel-${brand.id}" disabled>›</button>
      </div>
    `;
    
    container.appendChild(brandSection);
  });
}

// Render Personal Projects
function renderPersonalProjects() {
  const container = document.getElementById('personal-projects-grid');
  if (!container || !portfolioData.personalProjects) return;
  
  portfolioData.personalProjects.forEach(project => {
    const card = document.createElement('a');
    card.href = project.url;
    card.target = '_blank';
    card.className = 'personal-project-card';
    
    card.innerHTML = `
      <div class="personal-project-image">
        <img loading="lazy" decoding="async" src="${project.image}" alt="" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%232a2a2a%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23888%22 font-family=%22Arial%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage%3C/text%3E%3C/svg%3E'">
      </div>
      <div class="personal-project-info">
        <h3>${project.name}</h3>
        ${project.description ? `<p>${project.description}</p>` : ''}
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Render Others section
function renderOthers() {
  const container = document.getElementById('others-grid');
  if (!container || !portfolioData.others) return;
  
  portfolioData.others.forEach(project => {
    const card = document.createElement('a');
    card.href = project.url;
    card.target = '_blank';
    card.className = 'other-project-card';
    
    card.innerHTML = `
      <img loading="lazy" decoding="async" src="${project.image}" alt="Project" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%232a2a2a%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23888%22 font-family=%22Arial%22 font-size=%2216%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage%3C/text%3E%3C/svg%3E'">
    `;
    
    container.appendChild(card);
  });
}

// Render Reviews carousel
function renderReviews() {
  const carousel = document.getElementById('reviews-carousel');
  if (!carousel || !portfolioData.reviews) return;
  
  portfolioData.reviews.forEach(review => {
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    
    reviewCard.innerHTML = `
      <div class="review-quote">
        <svg class="quote-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
        <p class="review-text">${review.text}</p>
      </div>
      <div class="review-author">
        ${review.image ? `
          <img loading="lazy" decoding="async" src="${review.image}" alt="" class="review-avatar" onerror="this.style.display='none'">
        ` : ''}
        <span class="review-name">${review.author}</span>
      </div>
    `;
    
    carousel.appendChild(reviewCard);
  });
}

// Keep the controls in sync with scrolling and layout changes.
function initCarousels() {
  document.querySelectorAll('.projects-carousel-container, .reviews-carousel-container').forEach(container => {
    const carousel = container.querySelector('.projects-carousel, .reviews-carousel');
    const previous = container.querySelector('.carousel-nav-prev');
    const next = container.querySelector('.carousel-nav-next');

    function updateControls() {
      previous.disabled = carousel.scrollLeft <= 1;
      next.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1;
    }

    previous.addEventListener('click', () => carousel.scrollBy({ left: -carousel.clientWidth * 0.85 }));
    next.addEventListener('click', () => carousel.scrollBy({ left: carousel.clientWidth * 0.85 }));
    carousel.addEventListener('scroll', updateControls, { passive: true });
    new ResizeObserver(updateControls).observe(carousel);
    updateControls();
  });
}

document.addEventListener('DOMContentLoaded', loadPortfolioData);
