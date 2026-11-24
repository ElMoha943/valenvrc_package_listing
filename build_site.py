"""Build the ValenVRC HTML pages and copy the files served by the web host."""

import argparse
from functools import cache
from html import escape
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
from shutil import copy2, copytree, rmtree
from string import Template
from urllib.parse import quote


ROOT = Path(__file__).resolve().parent
WEBSITE = ROOT / "Website"
OUTPUT = ROOT / "dist"
STORES = {"jinxxy": ("Jinxxy", "assets/JinxxyIcon.webp"), "gumroad": ("Gumroad", "assets/Gumroad_Icon.webp")}
HOME_LINKS = {"products": "Products", "vpm-listing": "VPM Listing", "commissions": "Commissions"}
PAGE_LINKS = {"portfolio": "Portfolio", "packages": "Packages"}
PAGE_FILES = {"home": "index", "portfolio": "portfolio", "packages": "packages"}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def render(path, **values):
    return Template((WEBSITE / path).read_text(encoding="utf-8")).substitute(values).rstrip()


@cache
def image_size(path):
    with (WEBSITE / path).open("rb") as image:
        header = image.read(30)
    if header[8:12] == b"WEBP":
        chunk = header[12:16]
        if chunk == b"VP8X":
            return tuple(int.from_bytes(header[i:i + 3], "little") + 1 for i in (24, 27))
        if chunk == b"VP8L":
            dimensions = int.from_bytes(header[21:25], "little")
            return (dimensions & 0x3fff) + 1, ((dimensions >> 14) & 0x3fff) + 1
        if chunk == b"VP8 ":
            return tuple(int.from_bytes(header[i:i + 2], "little") & 0x3fff for i in (26, 28))
    raise ValueError(f"Invalid WebP image: {path}")


def image_tag(path, alt="", *, css="", eager=False):
    width, height = image_size(path)
    loading = "" if eager else ' loading="lazy"'
    classes = f' class="{css}"' if css else ""
    return (f'<img src="/{quote(path)}" alt="{escape(alt)}" width="{width}" height="{height}"'
            f'{classes}{loading} decoding="async">')


def external_link(url, label, css=""):
    classes = f' class="{css}"' if css else ""
    return f'<a href="{escape(url)}" target="_blank" rel="noopener"{classes}>{label}</a>'


def site_chrome(config, page):
    site, links, social = (config[key] for key in ("site", "links", "social"))
    site_name = escape(site["name"])
    home_path = config["pages"]["home"]["path"]
    home_links = {home_path + "#" + key: label for key, label in HOME_LINKS.items()}
    page_links = {config["pages"][key]["path"]: label for key, label in PAGE_LINKS.items()}

    def internal_link(url, label, css=""):
        current = ' aria-current="page"' if url == page["path"] else ""
        active = " active" if current else ""
        classes = f' class="{css}{active}"' if css else ""
        return f'<a href="{escape(url)}"{classes}{current}>{escape(label)}</a>'

    header = render(
        "components/header.html", site_name=site_name, home_path=escape(home_path), docs_url=escape(links["docs"]),
        discord_path=escape(links["discord"]),
        home_links="\n            ".join(internal_link(url, label, "dropdown-item") for url, label in home_links.items()),
        page_links="\n        ".join(internal_link(url, label, "nav-link") for url, label in page_links.items()),
        store_links="\n            ".join(external_link(links["stores"][key], image_tag(icon) + f"<span>{label}</span>", "dropdown-item")
                                           for key, (label, icon) in STORES.items()),
    )
    sitemap = [internal_link(url, label) for url, label in (home_links | page_links).items()]
    sitemap.append(external_link(links["docs"], "Documentation"))
    sections = {
        "Sitemap": sitemap,
        "Stores": [external_link(links["stores"][key], f"{label} Store") for key, (label, _) in STORES.items()],
        "Social Media": [external_link(social[key], label) for key, label in (
            ("discord", "Discord Server"), ("twitter", "Twitter / X"), ("instagram", "Instagram"),
            ("youtube", "YouTube"), ("vrchat", "VRChat Group"))],
        "Legal": [external_link(links["tos"], "Terms of Service")],
    }
    footer_sections = []
    for heading, items in sections.items():
        entries = "\n".join(f"          <li>{item}</li>" for item in items)
        footer_sections.append(f'''<div class="footer-section">
        <h2>{heading}</h2>
        <ul class="footer-links">
{entries}
        </ul>
      </div>''')
    footer = render("components/footer.html", site_name=site_name, copyright_year=site["copyrightYear"],
                    footer_sections="\n      ".join(footer_sections))
    return header, footer


def product_details(product, panel_id, hidden):
    features = product.get("features", [])
    feature_list = "" if not features else ('<div class="product-features"><h4 class="product-features-title">Features</h4>'
        '<ul class="product-features-grid">' + "".join(
            f'<li class="product-feature-item"><span class="product-feature-icon" aria-hidden="true">✓</span>'
            f'<span class="product-feature-name">{escape(feature)}</span></li>' for feature in features
        ) + "</ul></div>")
    buttons = "\n              ".join(
        external_link(product[f"{key}Link"], image_tag(icon) + f"Get on {label}", f"product-btn {key}")
        for key, (label, icon) in STORES.items() if product.get(f"{key}Link")
    )
    return f'''<article id="{panel_id}" class="product-info"{hidden}>
              <h3 class="product-name">{escape(product["name"])}</h3>
              <p class="product-description">{escape(product["description"])}</p>
              {feature_list}
              <div class="product-buttons">{buttons}</div>
            </article>'''


def home_content(config):
    products = read_json(ROOT / "data/products.json")["products"]
    thumbnails, details = [], []
    for index, product in enumerate(products):
        panel_id = "product-" + escape(product["id"])
        current = "false" if index else "true"
        image = image_tag(product["thumbnail"], product["name"], eager=index < 2)
        thumbnails.append(f'<a href="#{panel_id}" class="product-thumbnail" aria-current="{current}">{image}</a>')
        details.append(product_details(product, panel_id, " hidden" if index else ""))
    commissions = config["commissions"]
    services = "\n            ".join(
        f'<div class="service-card"><span class="service-icon" aria-hidden="true">✓</span>'
        f'<span class="service-name">{escape(service)}</span></div>' for service in commissions["services"]
    )
    return dict(product_thumbnails="\n            ".join(thumbnails), product_details="\n            ".join(details),
                commissions_title=escape(commissions["title"]), commissions_description=escape(commissions["description"]),
                services=services, contact_text=escape(commissions["contactText"]), contact_button=escape(commissions["contactButton"]),
                discord_path=escape(config["links"]["discord"]), terms_url=escape(config["links"]["tos"]))


def carousel_button(direction, carousel_id):
    previous = direction == "prev"
    label = "reviews" if carousel_id == "reviews-carousel" else "projects"
    return (f'<button type="button" class="carousel-nav carousel-nav-{direction}" '
            f'aria-label="{"Previous" if previous else "Next"} {label}" aria-controls="{carousel_id}" '
            f'hidden disabled>{"‹" if previous else "›"}</button>')


def project_card(project, personal=False, eager=False):
    css = "personal-project" if personal else "project"
    heading = "h3" if personal else "h4"
    description = f'<p>{escape(project["description"])}</p>' if personal and project.get("description") else ""
    body = f'''<div class="{css}-image">{image_tag(project["image"], eager=eager)}</div>
              <div class="{css}-info"><{heading}>{escape(project["name"])}</{heading}>{description}</div>'''
    return external_link(project["url"], body, f"{css}-card")


def portfolio_content(config):
    portfolio = read_json(ROOT / "data/portfolio.json")
    brands = []
    for index, brand in enumerate(portfolio["workedFor"]):
        carousel_id = "carousel-" + escape(brand["id"])
        projects = "\n              ".join(project_card(project, eager=index == 0 and number == 0)
                                           for number, project in enumerate(brand["projects"]))
        brands.append(f'''<div class="brand-section">
          <div class="brand-info">
            {image_tag(brand["logo"], css="brand-logo", eager=index == 0)}
            <h3 class="brand-name">{escape(brand["name"])}</h3>
          </div>
          <div class="projects-carousel-container">
            {carousel_button("prev", carousel_id)}
            <div class="projects-carousel" id="{carousel_id}">{projects}</div>
            {carousel_button("next", carousel_id)}
          </div>
        </div>''')
    reviews = []
    for review in portfolio["reviews"]:
        avatar = image_tag(review["image"], css="review-avatar") if review.get("image") else ""
        reviews.append(f'''<figure class="review-card">
            <blockquote class="review-quote">
              <svg class="quote-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25-.75 4-2.75 4v3c0 1 0 1 1 1z"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25-.75 4-2.75 4v3c0 1 0 1 1 1z"/>
              </svg>
              <p class="review-text">{escape(review["text"])}</p>
            </blockquote>
            <figcaption class="review-author">{avatar}<span class="review-name">{escape(review["author"])}</span></figcaption>
          </figure>''')
    return dict(worked_for="\n        ".join(brands), personal_projects="\n        ".join(
                    project_card(project, personal=True) for project in portfolio["personalProjects"]),
                other_projects="\n        ".join(external_link(project["url"], image_tag(project["image"], project["name"]),
                                                            "other-project-card") for project in portfolio["others"]),
                reviews="\n          ".join(reviews), reviews_previous=carousel_button("prev", "reviews-carousel"),
                reviews_next=carousel_button("next", "reviews-carousel"), vrchat_profile=escape(config["links"]["vrchatProfile"]))


def package_card(package, source_author, manifests_by_url, index):
    releases = package.get("releases", [])
    download = releases[0] if releases else ""
    metadata = manifests_by_url.get(download, {})
    package_id = metadata.get("name") or package["name"]
    suffix = package_id.rsplit(".", 1)[-1]
    fallback = re.sub(r"(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|_", " ", suffix)
    name = escape(metadata.get("displayName") or fallback[:1].upper() + fallback[1:])
    version = escape(metadata.get("version") or ("Latest" if download else "N/A"))
    identity = escape(package_id)
    description = escape(metadata.get("description") or f"VRChat package: {package_id}")
    author = metadata.get("author") or source_author
    author_name = escape(author.get("name") or "Unknown")
    author_link = external_link(author["url"], author_name) if author.get("url") else author_name
    details = [("Description", f"<p>{description}</p>"), ("Author", f"<p>{author_link}</p>")]
    if dependencies := metadata.get("vpmDependencies"):
        details.append(("Dependencies", "<ul>" + "".join(f"<li>{escape(dep)} {escape(value)}</li>" for dep, value in dependencies.items()) + "</ul>"))
    if keywords := metadata.get("keywords"):
        details.append(("Keywords", '<div class="vpm-modal-keywords">' + "".join(f'<span class="vpm-keyword">{escape(keyword)}</span>' for keyword in keywords) + "</div>"))
    if license_name := metadata.get("license"):
        details.append(("License", f"<p>{escape(license_name)}</p>"))
    modal_details = "\n                  ".join(f'<div class="vpm-modal-section"><h3 class="vpm-detail-title">{label}</h3>{value}</div>' for label, value in details)
    download_link = external_link(download, "Download", "vpm-package-btn vpm-package-btn-download") if download else ""
    return f'''<article class="vpm-package-card" data-package-id="{escape(package["name"])}">
              <div class="vpm-package-header"><span class="vpm-package-type">Tool</span><span class="vpm-package-version">{version}</span></div>
              <h3 class="vpm-package-name">{name}</h3>
              <p class="vpm-package-id">{identity}</p>
              <p class="vpm-package-description">{description}</p>
              <div class="vpm-package-actions">
                {download_link}
                <button type="button" class="vpm-package-btn vpm-package-btn-info" data-dialog="package-{index}" aria-label="Info for {name}" hidden>Info</button>
              </div>
              <dialog id="package-{index}" class="vpm-modal vpm-modal-content vpm-modal-large" aria-labelledby="package-title-{index}">
                <div class="vpm-modal-header">
                  <div>
                    <h2 id="package-title-{index}" class="vpm-modal-title">{name}</h2>
                    <p class="vpm-modal-subtitle">{identity} • {version}</p>
                  </div>
                  <form method="dialog"><button type="submit" class="vpm-modal-close" aria-label="Close">×</button></form>
                </div>
                <div class="vpm-modal-body">{modal_details}</div>
              </dialog>
            </article>'''


def build(vpm_index):
    config = read_json(ROOT / "data/site-config.json")
    source = read_json(ROOT / "source.json")
    vpm_bytes = vpm_index.read_bytes()
    listing = json.loads(vpm_bytes)
    site, pages = config["site"], config["pages"]
    for name in PAGE_FILES:
        pages[name]["path"] = "/" if name == "home" else f"/{name}"
    origin = site["url"].rstrip("/")
    listing_url = source["url"]
    manifests_by_url = {
        manifest["url"]: manifest
        for package in listing["packages"].values()
        for manifest in package["versions"].values()
        if manifest.get("url")
    }
    cards = "\n            ".join(package_card(package, source.get("author", {}), manifests_by_url, index)
                                  for index, package in enumerate(source.get("packages", [])))

    if OUTPUT.resolve() != OUTPUT:
        raise ValueError(f"Build output must be inside the repository: {OUTPUT}")
    if OUTPUT.exists():
        rmtree(OUTPUT)
    OUTPUT.mkdir()
    for directory in ("assets", "css", "js"):
        copytree(WEBSITE / directory, OUTPUT / directory)
    copy2(WEBSITE / "favicon.webp", OUTPUT / "favicon.webp")
    copy2(ROOT / "source.json", OUTPUT / "source.json")
    (OUTPUT / "index.json").write_bytes(vpm_bytes)

    for name, filename in PAGE_FILES.items():
        page = pages[name]
        canonical = escape(origin + page["path"])
        heading = escape(page["heading"])
        data = dict(heading=heading, intro=escape(page.get("intro", "")))
        if name == "portfolio":
            data.update(portfolio_content(config))
            scripts = '<script type="module" src="/js/carousels.js"></script>'
        else:
            data["packages_section"] = render(
                "components/packages.html", heading_tag="h1" if name == "packages" else "h2",
                heading=escape(pages["packages"]["heading"]), listing_url=escape(listing_url),
                vcc_url=f"vcc://vpm/addRepo?url={quote(listing_url, safe='')}", package_cards=cards,
            )
            scripts = '<script type="module" src="/js/packages.js"></script>'
            if name == "home":
                data.update(home_content(config))
                scripts += '\n  <script type="module" src="/js/products.js"></script>\n'
                scripts += '  <noscript><style>#productDetails .product-info[hidden] { display: block !important; }</style></noscript>'
            else:
                data.update(github_url=escape(source["infoLink"]["url"]), github_label=escape(source["infoLink"]["text"]))

        social_preview = '<meta name="twitter:card" content="summary">'
        if image := page.get("image"):
            width, height = image_size(image)
            social_preview = (f'<meta property="og:image" content="{escape(origin)}/{quote(image)}">\n'
                              f'  <meta property="og:image:alt" content="{escape(page["imageAlt"])}">\n'
                              f'  <meta property="og:image:width" content="{width}">\n'
                              f'  <meta property="og:image:height" content="{height}">\n'
                              '  <meta name="twitter:card" content="summary_large_image">')
        header, footer = site_chrome(config, page)
        html = render("components/layout.html", title=escape(page["title"]), description=escape(page["description"]),
                      site_name=escape(site["name"]), theme_color=escape(site["themeColor"]), canonical=canonical,
                      social_preview=social_preview, page_scripts=scripts, header=header, footer=footer,
                      content=render(f"{filename}.html", **data))
        (OUTPUT / f"{filename}.html").write_text(html + "\n", encoding="utf-8")

    (OUTPUT / "discord.html").write_text(render("discord.html", discord_url=escape(config["social"]["discord"])) + "\n", encoding="utf-8")
    (OUTPUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {origin}/sitemap.xml\n", encoding="utf-8")
    urls = "\n".join(f'  <url><loc>{escape(origin + page["path"])}</loc></url>' for page in pages.values())
    (OUTPUT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n'
                                       f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n', encoding="utf-8")


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=OUTPUT, **kwargs)

    def translate_path(self, path):
        resolved = Path(super().translate_path(path))
        page = resolved.with_suffix(".html")
        return str(page if not resolved.suffix and not resolved.exists() and page.is_file() else resolved)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--vpm-index", default=WEBSITE / "index.json", type=Path, help="VCC index generated by the VRChat listing builder")
    parser.add_argument("--serve", action="store_true", help="Serve the build at http://127.0.0.1:8080")
    parser.add_argument("--port", default=8080, type=int, help="Local preview port (default: 8080)")
    args = parser.parse_args()
    build(args.vpm_index)
    print(f"Built {OUTPUT}", flush=True)
    if args.serve:
        with ThreadingHTTPServer(("127.0.0.1", args.port), PreviewHandler) as server:
            print(f"Preview at http://127.0.0.1:{server.server_port}", flush=True)
            server.serve_forever()


if __name__ == "__main__":
    main()
