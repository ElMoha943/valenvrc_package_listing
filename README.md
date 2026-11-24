# ValenVRC website and VPM listing

This repository builds the ValenVRC storefront, portfolio, and free VRChat packages at [valenvrc.com](https://valenvrc.com/). The site ships as static HTML, CSS, JavaScript, and WebP images.

## Edit the site

| To update | Edit |
| --- | --- |
| Site name, page titles, descriptions, introductions, share images, store links, social links, and commission services | [data/site-config.json](data/site-config.json) |
| Products, thumbnails, descriptions, features, and purchase links | [data/products.json](data/products.json) |
| Client projects, personal projects, gallery images, and reviews | [data/portfolio.json](data/portfolio.json) |
| VPM packages and release ZIP URLs | [source.json](source.json) |
| Shared page markup | [Website/components](Website/components) |
| Page sections and styles | [Website](Website) and [Website/css/styles.css](Website/css/styles.css) |

The JSON arrays control display order. Give new products and projects unique IDs. Put images under [Website/assets](Website/assets) and use paths relative to Website, such as assets/projects/my-world.webp. Use a static WebP for project images and a square WebP up to 360 × 360 pixels for product thumbnails. Animated WebP works for product previews.

The packages page uses the first ZIP URL in each package's release list. The build adds version details and descriptions when the generated VPM index includes that release.

## Build and preview

Use Python 3.10 or later. The site builder uses the standard library.

    python build_site.py --serve

Open [http://127.0.0.1:8080](http://127.0.0.1:8080/). If that port is in use, pass `--port 8081`. Stop and restart the command to rebuild after edits. Run `python build_site.py` on its own to generate the site without starting a server. Both commands replace the contents of `dist/`.

For an offline preview, the builder uses the checked-in Website/index.json snapshot. To generate a fresh VPM index and serve the resulting site through Nginx, run the Docker build.

    docker compose up --build

The [GitHub Actions workflow](.github/workflows/build-listing.yml) runs VRChat's package listing generator, passes its index.json into the site build, and publishes dist/ to the production branch. The published feed remains at [valenvrc.com/index.json](https://valenvrc.com/index.json).
