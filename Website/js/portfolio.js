// Portfolio Page JavaScript

let portfolioData = null;
let siteConfig = null;

// Load portfolio data and site config
async function loadPortfolioData() {
  try {
    const [portfolioResponse, configResponse] = await Promise.all([
      fetch('data/portfolio.json'),
      fetch('data/site-config.json')
    ]);
    
    portfolioData = await portfolioResponse.json();
    siteConfig = await configResponse.json();
    
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
  populateFooterSocial();
  initCarousels();
  initDropdowns();
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
        <img src="${brand.logo}" alt="${brand.name}" class="brand-logo" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%232a2a2a%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23888%22 font-family=%22Arial%22 font-size=%2214%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ELogo%3C/text%3E%3C/svg%3E'">
        <h3 class="brand-name">${brand.name}</h3>
      </div>
      <div class="projects-carousel-container">
        <button class="carousel-nav carousel-nav-prev" data-brand="${brand.id}">‹</button>
        <div class="projects-carousel" id="carousel-${brand.id}">
          ${brand.projects.map(project => `
            <a href="${project.url}" target="_blank" class="project-card">
              <div class="project-image">
                <img src="${project.image}" alt="${project.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%232a2a2a%22 width=%22300%22 height=%22200%22/%3E%3Ctext fill=%22%23888%22 font-family=%22Arial%22 font-size=%2218%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage%3C/text%3E%3C/svg%3E'">
              </div>
              <div class="project-info">
                <h4>${project.name}</h4>
              </div>
            </a>
          `).join('')}
        </div>
        <button class="carousel-nav carousel-nav-next" data-brand="${brand.id}">›</button>
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
        <img src="${project.image}" alt="${project.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%232a2a2a%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23888%22 font-family=%22Arial%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage%3C/text%3E%3C/svg%3E'">
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
      <img src="${project.image}" alt="Project" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%232a2a2a%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23888%22 font-family=%22Arial%22 font-size=%2216%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage%3C/text%3E%3C/svg%3E'">
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
          <img src="${review.image}" alt="${review.author}" class="review-avatar" onerror="this.style.display='none'">
        ` : ''}
        <span class="review-name">${review.author}</span>
      </div>
    `;
    
    carousel.appendChild(reviewCard);
  });
}

// Initialize carousels for project sections
function initCarousels() {
  // Projects carousels
  portfolioData.workedFor.forEach(brand => {
    const carousel = document.getElementById(`carousel-${brand.id}`);
    const prevBtn = document.querySelector(`[data-brand="${brand.id}"].carousel-nav-prev`);
    const nextBtn = document.querySelector(`[data-brand="${brand.id}"].carousel-nav-next`);
    
    if (carousel && prevBtn && nextBtn) {
      let scrollPosition = 0;
      
      prevBtn.addEventListener('click', () => {
        const scrollAmount = carousel.offsetWidth * 0.8;
        scrollPosition = Math.max(0, scrollPosition - scrollAmount);
        carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      });
      
      nextBtn.addEventListener('click', () => {
        const scrollAmount = carousel.offsetWidth * 0.8;
        const maxScroll = carousel.scrollWidth - carousel.offsetWidth;
        scrollPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
        carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      });
      
      carousel.addEventListener('scroll', () => {
        scrollPosition = carousel.scrollLeft;
      });
    }
  });
  
  // Reviews carousel
  const reviewsCarousel = document.getElementById('reviews-carousel');
  const reviewsPrev = document.getElementById('reviews-prev');
  const reviewsNext = document.getElementById('reviews-next');
  
  if (reviewsCarousel && reviewsPrev && reviewsNext) {
    let reviewScrollPosition = 0;
    
    reviewsPrev.addEventListener('click', () => {
      const scrollAmount = reviewsCarousel.offsetWidth * 0.9;
      reviewScrollPosition = Math.max(0, reviewScrollPosition - scrollAmount);
      reviewsCarousel.scrollTo({ left: reviewScrollPosition, behavior: 'smooth' });
    });
    
    reviewsNext.addEventListener('click', () => {
      const scrollAmount = reviewsCarousel.offsetWidth * 0.9;
      const maxScroll = reviewsCarousel.scrollWidth - reviewsCarousel.offsetWidth;
      reviewScrollPosition = Math.min(maxScroll, reviewScrollPosition + scrollAmount);
      reviewsCarousel.scrollTo({ left: reviewScrollPosition, behavior: 'smooth' });
    });
    
    reviewsCarousel.addEventListener('scroll', () => {
      reviewScrollPosition = reviewsCarousel.scrollLeft;
    });
  }
}

// Populate footer social links
function populateFooterSocial() {
  const container = document.getElementById('footer-social-links');
  if (!container || !siteConfig?.social) return;
  
  const social = siteConfig.social;
  
  if (social.discord) {
    const link = document.createElement('a');
    link.href = social.discord;
    link.target = '_blank';
    link.textContent = 'Discord';
    container.appendChild(link);
  }
  
  if (social.twitter) {
    const link = document.createElement('a');
    link.href = social.twitter;
    link.target = '_blank';
    link.textContent = 'Twitter';
    container.appendChild(link);
  }
  
  if (social.vrchat) {
    const link = document.createElement('a');
    link.href = social.vrchat;
    link.target = '_blank';
    link.textContent = 'VRChat';
    container.appendChild(link);
  }
}

// Initialize dropdown menus
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  
  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector('.nav-store-dropdown');
    const content = dropdown.querySelector('.nav-dropdown-content');
    
    if (button && content) {
      button.addEventListener('mouseenter', () => {
        content.style.display = 'block';
      });
      
      dropdown.addEventListener('mouseleave', () => {
        content.style.display = 'none';
      });
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadPortfolioData);
