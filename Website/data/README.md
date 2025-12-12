# Data Management Guide

This folder contains JSON files that control the content displayed on your website. Edit these files to update your site without touching HTML or JavaScript.

## Files

### `products.json`
Manages the products displayed in the Products Showcase section.

**Structure:**
```json
{
  "products": [
    {
      "id": "unique-product-id",
      "name": "Product Name",
      "description": "Product description goes here",
      "thumbnail": "path/to/thumbnail.jpg",
      "jinxxyLink": "https://jinxxy.com/valenvrc/products/...",
      "gumroadLink": "https://store.valenvrc.com/l/..."
    }
  ]
}
```

**Notes:**
- `id`: Unique identifier for the product
- `thumbnail`: Path relative to the website root (e.g., `assets/thumbnails/product1.jpg`)
- `jinxxyLink` and `gumroadLink`: Leave empty string `""` if not available - button won't show
- Products appear in the order they're listed in the array

---

### `site-config.json`
Contains site-wide settings, social links, and commission information.

**Sections:**

#### Site Info
```json
"site": {
  "title": "ValenVRC",
  "tagline": "Your tagline",
  "welcomeMessage": "Welcome message"
}
```

#### Links
```json
"links": {
  "stores": {
    "jinxxy": "https://jinxxy.com/valenvrc",
    "gumroad": "https://store.valenvrc.com/"
  },
  "discord": "valenvrc.com/discord",
  "docs": "https://docs.valenvrc.com",
  "tos": "https://docs.valenvrc.com/tos"
}
```

#### Social Media
```json
"social": {
  "twitter": "https://x.com/YourHandle",
  "instagram": "https://www.instagram.com/yourhandle/",
  "youtube": "https://www.youtube.com/@yourhandle",
  "vrchat": "https://vrc.group/XXXX.XXXX",
  "discord": "https://discord.gg/yourinvite"
}
```

#### Commission Services
```json
"commissions": {
  "title": "Commission Services",
  "description": "Your commission description",
  "services": [
    "Service 1",
    "Service 2",
    "Service 3"
  ],
  "contactText": "Contact call-to-action",
  "contactButton": "Button text"
}
```

**Notes:**
- Services array can have any number of items
- All text fields support basic HTML if needed

---

## How to Update

1. **Adding a new product:**
   - Open `products.json`
   - Add a new object to the `products` array
   - Upload the thumbnail image to your assets folder
   - Commit and push to GitHub

2. **Updating social links:**
   - Open `site-config.json`
   - Find the `social` section
   - Update the URLs
   - Commit and push

3. **Adding/removing services:**
   - Open `site-config.json`
   - Edit the `services` array under `commissions`
   - Commit and push

## Tips

- Always validate your JSON before committing (use jsonlint.com)
- Keep backup copies when making major changes
- Test locally if possible before pushing to production
- Images should be optimized for web (under 500KB recommended)
