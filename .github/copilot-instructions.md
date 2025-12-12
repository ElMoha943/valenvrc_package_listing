# ValenVRC Portfolio & VPM Package Listing - AI Coding Agent Instructions

## Project Overview

This is a full-featured portfolio website with integrated VRChat Package Manager (VPM) listing. It serves as:
1. **Personal Portfolio**: Showcasing products, commissions, and social links
2. **VPM Package Hub**: Distribution point for VRChat Creator Companion (VCC) packages
3. **Static Site**: Generated from templates and JSON configuration files

**Core Architecture**: 
- Template-driven static site with data-driven content management
- Dark premium theme with orange accent colors (#FF6B35)
- Build process transforms templates and `source.json` into deployable website
- GitHub Pages hosting with custom domain (valenvrc.com)

## File Structure

```
valenvrc_package_listing/
├── .github/
│   ├── copilot-instructions.md    # This file - AI agent guide
│   └── workflows/
│       └── build-listing.yml      # GitHub Actions deployment
├── Website/                        # Main website root
│   ├── css/
│   │   └── styles.css            # Dark theme styling, VPM cards, premium design
│   ├── js/
│   │   └── app.js                # Products, VPM search, modals, VCC deep links
│   ├── data/                      # Content configuration (JSON)
│   │   ├── products.json         # Product showcase data
│   │   └── site-config.json      # Site metadata, social links, services
│   ├── assets/                    # Images, icons (for future use)
│   ├── index.html                 # Main page with template syntax {{~ ~}}
│   └── discord.html               # Discord server redirect
├── data/                          # Original data for GitHub Actions
│   ├── products.json
│   └── site-config.json
├── .notes/                        # AI-generated documentation (gitignored)
├── source.json                    # VPM listing configuration
├── Dockerfile                     # Local development environment
├── docker-compose.yml             # Docker orchestration
├── nginx.conf                     # Web server config
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

#### **HTML Structure** (`Website/index.html`)
- **Template Syntax**: Scriban-like `{{~ ~}}` processed during build
  - `{{ listingInfo.Name }}` - Variables from source.json
  - `{{~ if condition ~}} ... {{~ end ~}}` - Conditionals
  - `{{~ for item in collection ~}} ... {{~ end ~}}` - Loops
- **Sections**:
  1. Header navigation (Products, VPM, Commissions, Stores, Docs, Discord)
  2. Hero section with gradient title
  3. Products showcase (thumbnail grid + detail panel)
  4. VPM Package Listing (header, search, package cards, modals)
  5. Commissions section (services grid)
  6. Footer (sitemap, social links)

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
  - Custom modals with backdrop blur
  - CSS custom properties for theming

#### **JavaScript** (`Website/js/app.js`)
- **Data Loading**:
  - Fetches `data/products.json` and `data/site-config.json`
  - Populates products showcase dynamically
  - Injects commission services from config
- **VPM Functionality**:
  - `PACKAGES` object populated via template at build time
  - Package search/filtering by name or ID
  - VCC deep link protocol: `vcc://vpm/addRepo?url=...`
  - Package info modal with dependencies, keywords, license
  - Copy URL to clipboard with visual feedback
- **Modals**: Help modal, package info modal (custom implementation, no Fluent UI)

#### **Data Configuration** (`Website/data/`)
- **`products.json`**: Product showcase entries
  ```json
  {
    "products": [
      {
        "id": "product-1",
        "name": "Product Name",
        "description": "...",
        "thumbnail": "path/to/image.jpg",
        "jinxxyLink": "https://...",
        "gumroadLink": "https://..."
      }
    ]
  }
  ```
- **`site-config.json`**: Site-wide settings
  - `site`: Name, tagline, description
  - `social`: Discord, Twitter, Instagram, YouTube, VRChat Group
  - `stores`: Jinxxy, Gumroad URLs
  - `commissions`: Services array, intro text, contact text

### 3. Build & Deployment

#### **GitHub Actions** (`.github/workflows/build-listing.yml`)
**Triggers**:
- Push to `main` when `source.json` changes
- Manual workflow dispatch

**Process**:
1. Checkout repository
2. Clone `vrchat-community/package-list-action` (Nuke build tool)
3. Run `BuildMultiPackageListing` target
4. Processes templates: `Website/` → processed HTML/JS
5. Generates `index.json` for VCC
6. Deploys to GitHub Pages

**Requirements**: 
- Pages source = "GitHub Actions" (not branch)
- Custom domain DNS: valenvrc.com → GitHub Pages

#### **Docker Development** (`Dockerfile`, `docker-compose.yml`)
**Purpose**: Local testing with full template processing

**Multi-stage build**:
1. **Builder stage** (dotnet SDK 8.0):
   - Clones package-list-action
   - Copies source.json and Website/
   - Runs Nuke build: `./build.sh BuildMultiPackageListing`
   - Outputs to `/workspace/Website` (overwrites with processed files)
2. **Server stage** (nginx alpine):
   - Copies processed Website/ to nginx html root
   - Serves on port 8080

**Commands**:
```bash
docker-compose up -d --build  # Build and start
docker-compose logs -f        # View logs
docker-compose down          # Stop and remove
```

**Access**: http://localhost:8080

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
4. Verify at https://valenvrc.com

### Adding New Product
1. Edit `Website/data/products.json`:
   ```json
   {
     "id": "unique-id",
     "name": "Product Name",
     "description": "Description text",
     "thumbnail": "assets/thumb.jpg",
     "jinxxyLink": "https://...",
     "gumroadLink": "https://..."
   }
   ```
2. Test locally with Docker or push to deploy
3. Thumbnail should be placed in `Website/assets/`

### Updating Site Configuration
1. Edit `Website/data/site-config.json`
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

### Template System
- **Syntax**: Scriban-like (not Handlebars/Mustache)
- **Cannot run raw**: Templates must be processed by Nuke build
- **Variables available**:
  - `listingInfo`: From source.json (Name, Description, Author, etc.)
  - `packages`: Array of package objects (Name, DisplayName, Description, Version, Type, etc.)
- **Common patterns**:
  ```
  {{~ if condition; ~}} ... {{~ end; ~}}
  {{~ for item in items ~}} ... {{~ end ~}}
  {{ variable }}
  ```

### Data-Driven Content
- **All editable content in JSON files** (`Website/data/`)
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

1. **Template syntax showing raw**: Build didn't run or Docker not processing correctly
   - Fix: Ensure Dockerfile copies files before build runs
   - Check: `/workspace/Website` should contain processed HTML

2. **Products not loading**: JSON fetch path wrong or CORS issue
   - Fix: Paths are relative to index.html location
   - Check: Browser console for 404 errors on data/*.json

3. **VPM section blank**: Templates not processed or JavaScript errors
   - Fix: Check browser console for JS errors
   - Verify: `PACKAGES` object populated in app.js

4. **Styles not applying**: CSS path wrong or file not copied
   - Fix: Check `<link href="css/styles.css">` path
   - Verify: Docker copied css folder to nginx

5. **Docker build fails**: Usually path issues with Nuke build
   - Fix: Ensure `--list-publish-directory` matches copy path
   - Check: Build logs for specific error

6. **Forgetting to update `url` in source.json**: VCC can't find listing
   - Fix: Must match `https://valenvrc.com/index.json`

7. **Pages not deploying**: GitHub Actions source not configured
   - Fix: Settings → Pages → Source = "GitHub Actions"

## Repository Context

- **Owner**: valenvrc (ElMoha943)
- **Purpose**: Personal portfolio + VPM package distribution
- **Template origin**: `vrchat-community/template-package-listing` (heavily customized)
- **Live URLs**:
  - Website: https://valenvrc.com
  - VPM Listing: https://valenvrc.com/index.json
  - Discord: https://discord.gg/6AcpahXKQu
- **Packages distributed**: 4 VRChat utility packages (common, mirror, whitelistedtp, russianroullette)
- **Design style**: Dark premium theme with orange accents, futuristic metallic aesthetic
