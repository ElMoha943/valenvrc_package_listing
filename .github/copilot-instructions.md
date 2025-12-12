# ValenVRC Portfolio & VPM Package Listing - AI Coding Agent Instructions

## Project Overview

This is a full-featured portfolio website with integrated VRChat Package Manager (VPM) listing. It serves as:
1. **Personal Portfolio**: Showcasing products, commissions, portfolio projects, and social links
2. **VPM Package Hub**: Distribution point for VRChat Creator Companion (VCC) packages
3. **Static Site**: Client-side data loading with Nuke-generated VPM index

**Core Architecture**: 
- Client-side data-driven content management (no server-side rendering)
- Dark premium theme with orange accent colors (#FF6B35)
- Nuke build generates `index.json` from `source.json` for VCC compatibility
- GitHub Pages hosting with custom domain (valenvrc.com)

## File Structure

```
valenvrc_package_listing/
├── .github/
│   ├── copilot-instructions.md    # This file - AI agent guide
│   └── workflows/
│       └── build-listing.yml      # GitHub Actions deployment (Nuke build)
├── Website/                        # Main website root
│   ├── css/
│   │   └── styles.css            # Dark theme, VPM cards, portfolio styles
│   ├── js/
│   │   ├── app.js                # Main page: products, VPM, commissions
│   │   └── portfolio.js          # Portfolio page: projects, reviews
│   ├── data/                      # Content configuration (copied during build)
│   │   ├── products.json         # Product showcase data
│   │   ├── site-config.json      # Site metadata, social links, services
│   │   └── portfolio.json        # Portfolio projects and reviews
│   ├── assets/                    # Images, icons, webp files
│   ├── index.html                 # Main page
│   ├── portfolio.html             # Portfolio showcase page
│   └── discord.html               # Discord server redirect
├── data/                          # Source data files
│   ├── products.json              # Product definitions with features
│   ├── site-config.json           # Site configuration
│   └── portfolio.json             # Portfolio content
├── source.json                    # VPM listing configuration
├── Dockerfile                     # Local development environment
├── docker-compose.yml             # Docker orchestration
├── nginx.conf                     # Web server config (clean URLs, cache control)
├── .dockerignore
├── .gitignore
└── README.md
```

## Key Components

### 1. Source Configuration - `source.json`
- **VPM package listing metadata** and package inventory
- Contains:
  - `name`, `id`, `url`: Listing identification
  - `author`: Creator info with Discord link
  - `description`: Listing description
  - `githubRepos`: Array for auto-tracked GitHub packages (currently empty)
  - `packages`: Manual package entries with release URLs
- **Package structure**:
  ```json
  {
    "name": "com.valenvrc.packagename",
    "releases": [
      "https://github.com/.../1.1.0/package.zip",  // Newest first
      "https://github.com/.../1.0.0/package.zip"
    ]
  }
  ```
- **URL must match**: Line 3 `url` field = `https://valenvrc.com/index.json`

### 2. Website - Portfolio + VPM Listing

#### **HTML Structure**
- **`Website/index.html`**: Main landing page
  - Header navigation (Products, Portfolio, VPM, Commissions, Stores, Docs, Discord)
  - Hero section with gradient title
  - Products showcase (2-column grid with features)
  - VPM Package Listing (search, package cards, modals)
  - Commissions section (services grid)
  - Footer (sitemap, social links)

- **`Website/portfolio.html`**: Portfolio showcase page
  - Worked For: Brand logo + scrolling project carousel (3+ cards visible)
  - Personal Projects: Large project cards with descriptions
  - Others: Small image-only project cards
  - Reviews: Scrolling quote carousel with author info

#### **Styling** (`Website/css/styles.css`)
- **Color Palette**:
  - `--primary-bg: #0a0a0a` - Deep black
  - `--secondary-bg: #1a1a1a` - Dark gray
  - `--tertiary-bg: #2a2a2a` - Medium gray
  - `--accent-orange: #FF6B35` - Primary accent
  - `--accent-orange-hover: #FF8C42` - Hover state
  - `--metallic-*`: Gradient grays for depth
- **Design System**:
  - Dark premium aesthetic with metallic accents
  - Smooth hover animations (transform, box-shadow)
  - Responsive grid layouts
  - Custom modals and carousels
  - CSS custom properties for theming

#### **JavaScript**
- **Data Loading** (`app.js` and `portfolio.js`):
  - Fetches `data/products.json`, `data/site-config.json`, `data/portfolio.json`
  - Populates products showcase dynamically
  - Renders portfolio projects and reviews
  - Injects commission services from config
- **VPM Functionality** (`app.js`):
  - Loads `source.json` client-side to display packages
  - Package search/filtering by name or ID
  - VCC deep link protocol: `vcc://vpm/addRepo?url=...`
  - Package info modal with dependencies, keywords, license
  - Copy URL to clipboard with visual feedback
- **Modals & Carousels**: Custom implementation, no external UI libraries

#### **Data Configuration** (`data/`)
- **`products.json`**: Product showcase entries with features
  ```json
  {
    "products": [
      {
        "id": "product-1",
        "name": "Product Name",
        "description": "...",
        "thumbnail": "path/to/image.jpg",
        "jinxxyLink": "https://...",
        "gumroadLink": "https://...",
        "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]
      }
    ]
  }
  ```
- **`site-config.json`**: Site-wide settings
  - `site`: Name, tagline, description
  - `social`: Discord, Twitter, Instagram, YouTube, VRChat Group
  - `stores`: Jinxxy, Gumroad URLs
  - `commissions`: Services array, intro text, contact text
  
- **`portfolio.json`**: Portfolio content
  - `workedFor`: Brands with project carousels
  - `personalProjects`: Large project cards
  - `others`: Small project thumbnails
  - `reviews`: Client testimonials

### 3. Build & Deployment

#### **GitHub Actions** (`.github/workflows/build-listing.yml`)
**Triggers**:
- Push to `main`
- Manual workflow dispatch

**Process**:
1. Checkout repository
2. Prepare data files: Copy `data/*.json` → `Website/data/`
3. Checkout `vrchat-community/package-list-action` into `ci/` directory
4. Run Nuke build: `ci/build.sh BuildMultiPackageListing --root ci --list-publish-directory Website`
5. Generates `index.json` from `source.json` for VCC
6. Deploy to `production` branch with `peaceiris/actions-gh-pages@v3`

**Key Settings**:
- `listPublishDirectory: Website`
- `pathToCi: ci`
- CNAME preserved: valenvrc.com
- Deploys to `production` branch (GitHub Pages source)

#### **Docker Development** (`Dockerfile`, `docker-compose.yml`)
**Purpose**: Local testing matching production build

**Multi-stage build**:
1. **Builder stage** (dotnet SDK 8.0):
   - Copies source.json, Website/, and data/
   - Prepares data files: Copies `data/*.json` → `Website/data/`
   - Clones package-list-action into `ci/`
   - Runs Nuke build: `ci/build.sh BuildMultiPackageListing --root /github/workspace/ci --list-publish-directory /github/workspace/Website`
   - Generates `index.json` in Website/
2. **Server stage** (nginx alpine):
   - Copies built Website/ to nginx html root
   - Serves on port 8080

**Commands**:
```bash
docker-compose up -d --build  # Build and start
docker-compose logs -f        # View logs
docker-compose down          # Stop and remove
```

**Access**: 
- http://localhost:8080 - Main page
- http://localhost:8080/portfolio - Portfolio page
- http://localhost:8080/index.json - VPM listing

### 4. Discord Redirect (`Website/discord.html`)
- Standalone page with meta refresh + JS redirect
- Target: https://discord.gg/6AcpahXKQu
- Styled with dark theme + orange spinner
- Fallback link if redirect fails

## Development Workflows

### Adding New Package Release
1. Edit `source.json` - prepend new release URL to `releases` array
2. Commit and push to `main`
3. GitHub Actions builds automatically
4. Verify at https://valenvrc.com/index.json

### Adding New Product
1. Edit `data/products.json`:
   ```json
   {
     "id": "unique-id",
     "name": "Product Name",
     "description": "Description text",
     "thumbnail": "assets/thumb.jpg",
     "jinxxyLink": "https://...",
     "gumroadLink": "https://...",
     "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]
   }
   ```
2. Test locally with Docker or push to deploy
3. Thumbnail should be placed in `Website/assets/`

### Updating Site Configuration
1. Edit `data/site-config.json`
2. Modify social links, commission services, store URLs, etc.
3. Changes reflected immediately (no build required for data)

### Styling Changes
1. Edit `Website/css/styles.css`
2. Maintain CSS custom property usage for consistency
3. Test responsive design at different breakpoints

### Testing Locally
1. Run `docker-compose up -d --build`
2. Visit http://localhost:8080
3. Check browser console for errors
4. Test VPM search, modals, product switching
5. Verify template data populates correctly

## Project-Specific Conventions

### Data-Driven Content
- **All editable content in JSON files** (`data/`)
- Avoid hardcoding content in HTML/JS
- Products, services, links all configurable via JSON
- Makes non-technical updates easy

### Color System
- **Primary accent**: Orange (#FF6B35) for CTAs, links, highlights
- **Backgrounds**: Layered blacks/grays (0a→1a→2a) for depth
- **Text hierarchy**: White → Light gray → Medium gray → Muted gray
- **Metallic grays**: Used for borders, secondary elements

### VCC Deep Linking
- Protocol: `vcc://vpm/addRepo?url=<encoded_listing_url>`
- Only works if VCC installed
- Used for "Add to VCC" buttons
- Listing URL: `https://valenvrc.com/index.json`

## External Dependencies

- **VRChat Package List Action**: `vrchat-community/package-list-action` (Nuke/C# build tool)
- **Fluent UI Web Components**: Loaded from CDN but only for theme switching
- **Docker**: For local development (dotnet SDK 8.0 + nginx alpine)
- **GitHub Pages**: Production hosting
- **Custom Domain**: valenvrc.com (DNS configured)

## Common Pitfalls

1. **Products not loading**: JSON fetch path wrong or CORS issue
   - Fix: Paths are relative to index.html location
   - Check: Browser console for 404 errors on data/*.json

2. **VPM section blank**: Client-side loading failed or JavaScript errors
   - Fix: Check browser console for JS errors
   - Verify: `source.json` fetched successfully

3. **Styles not applying**: CSS path wrong or file not copied
   - Fix: Check `<link href="css/styles.css">` path
   - Verify: Docker copied css folder to nginx

4. **Docker build fails**: Usually path issues with Nuke build
   - Fix: Ensure `--root` and `--list-publish-directory` paths are correct
   - Check: Build logs for specific error

5. **Forgetting to update `url` in source.json**: VCC can't find listing
   - Fix: Must match `https://valenvrc.com/index.json`

6. **Pages not deploying**: GitHub Pages source not configured
   - Fix: Settings → Pages → Source = Deploy from a branch → production

7. **index.json not generated**: Nuke build failed
   - Fix: Check GitHub Actions logs for build errors
   - Verify: `ci/build.sh` runs successfully

8. **Data files missing locally**: Docker not copying data folder
   - Fix: Ensure Dockerfile copies `data/` and runs preparation step

## Repository Context

- **Owner**: valenvrc (ElMoha943)
- **Purpose**: Personal portfolio + VPM package distribution
- **Template origin**: `vrchat-community/template-package-listing` (heavily customized)
- **Live URLs**:
  - Website: https://valenvrc.com
  - Portfolio: https://valenvrc.com/portfolio
  - VPM Listing: https://valenvrc.com/index.json
  - Discord: https://discord.gg/6AcpahXKQu
- **Packages distributed**: 4 VRChat utility packages (common, mirror, whitelistedtp, russianroullette)
- **Design style**: Dark premium theme with orange accents, futuristic metallic aesthetic
- **Design style**: Dark premium theme with orange accents, futuristic metallic aesthetic
