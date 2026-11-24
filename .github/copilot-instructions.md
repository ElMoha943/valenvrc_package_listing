# ValenVRC website and VPM listing

The site is built to dist/ by build_site.py using the Python standard library. GitHub Actions and Docker both pass the index.json produced by VRChat's listing generator to the site builder. Website/index.html and Website/app.js also serve as inputs required by that generator.

- Edit page metadata, introductions, shared URLs, and commission content in data/site-config.json.
- Edit the catalog and portfolio in data/products.json and data/portfolio.json. Keep the order of each array.
- Edit VPM package inventory and release URLs in source.json. The site shows the first release URL for each package.
- Keep shared page markup in Website/components and page-specific markup in Website. Use WebP for local images under Website/assets.
- Render readable content and links into HTML. Use the scripts in Website/js to enhance navigation, package tools, product selection, and carousels.
- Preserve the dark theme and orange accents in Website/css/styles.css. Verify changes on desktop and mobile.
- Run python build_site.py --serve for a local preview with the checked-in VPM snapshot. Use docker compose up --build to test a freshly generated listing and Nginx. Verify the homepage, /portfolio, /packages, and /index.json.
