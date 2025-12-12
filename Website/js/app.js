import { baseLayerLuminance, StandardLuminance } from 'https://unpkg.com/@fluentui/web-components';

// VPM data
let LISTING_URL = "https://valenvrc.com/index.json";
let vpmListingData = null;
let vpmPackages = [];

// Load site configuration and products
let siteConfig = {};
let productsData = [];

const loadData = async () => {
  try {
    const [configResponse, productsResponse] = await Promise.all([
      fetch('data/site-config.json'),
      fetch('data/products.json')
    ]);
    siteConfig = await configResponse.json();
    const productsJson = await productsResponse.json();
    productsData = productsJson.products || [];
  } catch (error) {
    console.warn('Could not load data files:', error);
    // Fallback to defaults
    siteConfig = {
      commissions: {
        services: ['World Setups', 'Custom Scripts', 'Optimization', 'Light Baking', 'Interactive Elements', 'Udon Programming']
      }
    };
  }
};

// Load VPM listing data
const loadVPMData = async () => {
  try {
    const response = await fetch('source.json');
    vpmListingData = await response.json();
    LISTING_URL = vpmListingData.url || "https://valenvrc.com/index.json";
    
    // Parse packages from the listing
    if (vpmListingData.packages) {
      vpmPackages = vpmListingData.packages.map(pkg => {
        // Get the latest release URL
        const latestRelease = pkg.releases && pkg.releases.length > 0 ? pkg.releases[0] : null;
        
        return {
          id: pkg.name,
          name: pkg.name,
          displayName: pkg.name.split('.').pop().replace(/([A-Z])/g, ' $1').trim(),
          description: `VRChat package: ${pkg.name}`,
          version: latestRelease ? 'Latest' : 'N/A',
          type: 'Tool',
          zipUrl: latestRelease,
          author: vpmListingData.author || {},
          dependencies: [],
          keywords: [],
          license: ''
        };
      });
    }
    
    return true;
  } catch (error) {
    console.error('Could not load VPM data:', error);
    return false;
  }
};

// Render VPM Packages
const renderVPMPackages = () => {
  const gridContainer = document.getElementById('vpmPackagesGrid');
  if (!gridContainer) {
    console.error('VPM packages grid container not found');
    return;
  }
  
  gridContainer.innerHTML = '';
  
  vpmPackages.forEach(pkg => {
    const card = document.createElement('div');
    card.className = 'vpm-package-card';
    card.dataset.packageId = pkg.id;
    
    card.innerHTML = `
      <div class="vpm-package-header">
        <div class="vpm-package-type">${pkg.type}</div>
        <div class="vpm-package-version">${pkg.version}</div>
      </div>
      <h3 class="vpm-package-name">${pkg.displayName}</h3>
      <p class="vpm-package-id">${pkg.id}</p>
      <p class="vpm-package-description">${pkg.description}</p>
      <div class="vpm-package-actions">
        <button class="vpm-package-btn vpm-package-btn-primary vpm-package-btn-download" data-package-id="${pkg.id}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 11L4 7h2.5V2h3v5H12l-4 4z" fill="currentColor"/>
            <path d="M2 13v1h12v-1H2z" fill="currentColor"/>
          </svg>
          Download
        </button>
        <button class="vpm-package-btn vpm-package-btn-secondary vpm-package-btn-info" data-package-id="${pkg.id}">
          Info
        </button>
      </div>
    `;
    
    gridContainer.appendChild(card);
  });
  
  console.log(`Rendered ${vpmPackages.length} packages`);
  
  // Setup event listeners after rendering
  setupPackageDownloadButtons();
  setupPackageInfoButtons();
  setupPackageSearch();
};

// Setup download buttons
const setupPackageDownloadButtons = () => {
  const downloadButtons = document.querySelectorAll('.vpm-package-btn-download');
  downloadButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const packageId = e.currentTarget.dataset.packageId;
      const packageInfo = vpmPackages.find(p => p.id === packageId);
      
      if (packageInfo && packageInfo.zipUrl) {
        window.open(packageInfo.zipUrl, '_blank');
      } else {
        console.error(`No download URL for package ${packageId}`);
      }
    });
  });
};

// Setup package search
const setupPackageSearch = () => {
  const searchInput = document.getElementById('vpmSearchInput');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', ({ target: { value = '' }}) => {
    const cards = document.querySelectorAll('.vpm-package-card');
    const query = value.toLowerCase();
    
    cards.forEach(card => {
      const packageId = card.dataset.packageId;
      const pkg = vpmPackages.find(p => p.id === packageId);
      
      if (!pkg) {
        card.style.display = 'none';
        return;
      }
      
      const matches = 
        pkg.id.toLowerCase().includes(query) ||
        pkg.displayName.toLowerCase().includes(query) ||
        (pkg.description && pkg.description.toLowerCase().includes(query));
      
      card.style.display = matches ? 'flex' : 'none';
    });
  });
};

// Setup package info buttons
const setupPackageInfoButtons = () => {
  const packageInfoButtons = document.querySelectorAll('.vpm-package-btn-info');
  packageInfoButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const packageId = e.currentTarget.dataset.packageId;
      const packageInfo = vpmPackages.find(p => p.id === packageId);
      
      if (!packageInfo) {
        console.error(`Package ${packageId} not found`);
        return;
      }

      const vpmPackageModal = document.getElementById('vpmPackageModal');
      document.getElementById('vpmPackageModalName').textContent = packageInfo.displayName;
      document.getElementById('vpmPackageModalId').textContent = packageId;
      document.getElementById('vpmPackageModalVersion').textContent = packageInfo.version;
      document.getElementById('vpmPackageModalDescription').textContent = packageInfo.description;
      
      const authorLink = document.getElementById('vpmPackageModalAuthor');
      authorLink.textContent = packageInfo.author.name || 'Unknown';
      authorLink.href = packageInfo.author.url || '#';

      // Dependencies
      const depsSection = document.getElementById('vpmPackageModalDepsSection');
      const depsList = document.getElementById('vpmPackageModalDependencies');
      depsList.innerHTML = '';
      const deps = packageInfo.dependencies || [];
      if (deps.length > 0) {
        depsSection.style.display = 'block';
        deps.forEach(dep => {
          const li = document.createElement('li');
          li.textContent = dep;
          depsList.appendChild(li);
        });
      } else {
        depsSection.style.display = 'none';
      }

      // Keywords
      const keywordsSection = document.getElementById('vpmPackageModalKeywordsSection');
      const keywordsContainer = document.getElementById('vpmPackageModalKeywords');
      keywordsContainer.innerHTML = '';
      if (packageInfo.keywords && packageInfo.keywords.length > 0) {
        keywordsSection.style.display = 'block';
        packageInfo.keywords.forEach(keyword => {
          const span = document.createElement('span');
          span.className = 'vpm-keyword';
          span.textContent = keyword;
          keywordsContainer.appendChild(span);
        });
      } else {
        keywordsSection.style.display = 'none';
      }

      // License
      const licenseSection = document.getElementById('vpmPackageModalLicenseSection');
      const licenseLink = document.getElementById('vpmPackageModalLicense');
      if (packageInfo.license) {
        licenseSection.style.display = 'block';
        licenseLink.textContent = packageInfo.license;
        licenseLink.href = '#';
      } else {
        licenseSection.style.display = 'none';
      }

      vpmPackageModal.style.display = 'flex';
    });
  });
};

const setTheme = () => {
  const isDarkTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDarkTheme()) {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.DarkMode);
  } else {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.LightMode);
  }
}

(() => {
  setTheme();

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    setTheme();
  });

  const packageGrid = document.getElementById('packageGrid');

  // VPM Help Modal
  const vpmHelpBtn = document.getElementById('vpmHelpBtn');
  const vpmHelpModal = document.getElementById('vpmHelpModal');
  const vpmModalClose = document.getElementById('vpmModalClose');
  const vpmModalOverlay = document.getElementById('vpmModalOverlay');

  if (vpmHelpBtn && vpmHelpModal) {
    vpmHelpBtn.addEventListener('click', () => {
      vpmHelpModal.style.display = 'flex';
    });
  }

  if (vpmModalClose) {
    vpmModalClose.addEventListener('click', () => {
      vpmHelpModal.style.display = 'none';
    });
  }

  if (vpmModalOverlay) {
    vpmModalOverlay.addEventListener('click', () => {
      vpmHelpModal.style.display = 'none';
    });
  }

  // VPM Add to VCC Button
  const vpmAddBtn = document.getElementById('vpmAddBtn');
  if (vpmAddBtn) {
    vpmAddBtn.addEventListener('click', () => {
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
    });
  }

  // VPM Copy URL Button
  const vpmCopyBtn = document.getElementById('vpmCopyBtn');
  const vpmUrlField = document.getElementById('vpmUrlField');
  if (vpmCopyBtn && vpmUrlField) {
    vpmCopyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(vpmUrlField.value).then(() => {
        vpmCopyBtn.textContent = 'Copied!';
        setTimeout(() => {
          vpmCopyBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M8 2C6.89543 2 6 2.89543 6 4V14C6 15.1046 6.89543 16 8 16H14C15.1046 16 16 15.1046 16 14V4C16 2.89543 15.1046 2 14 2H8ZM7 4C7 3.44772 7.44772 3 8 3H14C14.5523 3 15 3.44772 15 4V14C15 14.5523 14.5523 15 14 15H8C7.44772 15 7 14.5523 7 14V4ZM4 6.00001C4 5.25973 4.4022 4.61339 5 4.26758V14.5C5 15.8807 6.11929 17 7.5 17H13.7324C13.3866 17.5978 12.7403 18 12 18H7.5C5.567 18 4 16.433 4 14.5V6.00001Z"/>
            </svg>
            Copy
          `;
        }, 2000);
      });
    });
  }

  // Package Info Modal
  const vpmPackageModal = document.getElementById('vpmPackageModal');
  const vpmPackageModalClose = document.getElementById('vpmPackageModalClose');
  const vpmPackageModalOverlay = document.getElementById('vpmPackageModalOverlay');

  if (vpmPackageModalClose) {
    vpmPackageModalClose.addEventListener('click', () => {
      vpmPackageModal.style.display = 'none';
    });
  }

  if (vpmPackageModalOverlay) {
    vpmPackageModalOverlay.addEventListener('click', () => {
      vpmPackageModal.style.display = 'none';
    });
  }

  // Package Download Buttons
  const downloadButtons = document.querySelectorAll('.vpm-package-btn-download');
  downloadButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const url = e.currentTarget.dataset.packageUrl;
      if (url) {
        window.open(url, '_blank');
      }
    });
  });

  // Initialize products showcase
  const initProducts = () => {
    const thumbnailsContainer = document.getElementById('productThumbnails');
    const detailsContainer = document.getElementById('productDetails');
    
    if (!thumbnailsContainer || productsData.length === 0) return;

    // Create thumbnails
    productsData.forEach((product, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'product-thumbnail';
      thumbnail.dataset.productId = product.id;
      
      const img = document.createElement('img');
      img.src = product.thumbnail;
      img.alt = product.name;
      img.onerror = () => {
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
      };
      
      thumbnail.appendChild(img);
      thumbnailsContainer.appendChild(thumbnail);

      thumbnail.addEventListener('click', () => {
        // Remove active class from all thumbnails
        document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
        
        // Display product details
        detailsContainer.innerHTML = `
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            ${product.features ? `
              <div class="product-features">
                <h4 class="product-features-title">Features:</h4>
                <div class="product-features-grid">
                  ${product.features.map(feature => `
                    <div class="product-feature-item">
                      <div class="product-feature-icon">✓</div>
                      <div class="product-feature-name">${feature}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            <div class="product-buttons">
              ${product.jinxxyLink ? `<a href="${product.jinxxyLink}" target="_blank" class="product-btn jinxxy"><img src="assets/JinxxyIcon.webp" alt="Jinxxy">Get on Jinxxy</a>` : ''}
              ${product.gumroadLink ? `<a href="${product.gumroadLink}" target="_blank" class="product-btn gumroad"><img src="assets/Gumroad_Icon.webp" alt="Gumroad">Get on Gumroad</a>` : ''}
            </div>
          </div>
        `;
      });

      // Auto-select first product
      if (index === 0) {
        thumbnail.click();
      }
    });
  };

  // Initialize commissions services
  const initCommissions = () => {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid || !siteConfig.commissions) return;

    siteConfig.commissions.services.forEach(service => {
      const serviceCard = document.createElement('div');
      serviceCard.className = 'service-card';
      serviceCard.innerHTML = `
        <div class="service-icon">✓</div>
        <div class="service-name">${service}</div>
      `;
      servicesGrid.appendChild(serviceCard);
    });
  };

  // Load data and initialize
  Promise.all([loadData(), loadVPMData()]).then(() => {
    initProducts();
    initCommissions();
    renderVPMPackages();
  });
})();