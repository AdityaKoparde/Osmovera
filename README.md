# Osmovera — Multi-Page Business Website

A complete, dependency-free, multi-page business website for a fictional company:

> **Osmovera — Water Reclamation & Reuse Engineering**
> A B2B engineering firm that designs, builds and monitors water reuse systems for
> hospitals, campuses, hotels, data centers and manufacturers.

The company name **Osmovera** was chosen because it is not in use by any existing brand,
company or product.

---

## 1. Pages

| Page | File | Purpose |
|---|---|---|
| Home | `public/index.html` | Hero, services overview, animated stats, process, featured projects, testimonial |
| About | `public/about.html` | Story, values, milestone timeline, leadership team |
| Services | `public/services.html` | Six detailed services with expandable detail panels + FAQ accordion |
| Projects | `public/projects.html` | Six case studies with JavaScript sector filtering |
| Contact | `public/contact.html` | Validated request form, office details, hours, service-area map, careers |
| 404 | `public/404.html` | Custom not-found page |

## 2. File structure

```
osmovera-website/
├── public/                  ← the website itself (everything a browser loads)
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   ├── projects.html
│   ├── contact.html
│   ├── 404.html
│   ├── robots.txt           ← crawler instructions + sitemap pointer
│   ├── sitemap.xml          ← all five indexable pages
│   ├── css/
│   │   └── styles.css       ← design system, components, responsive rules
│   ├── js/
│   │   └── main.js          ← navigation, counters, accordion, filters, form validation
│   └── assets/
│       ├── logo.svg         ← brand mark
│       ├── favicon.svg
│       └── hero-dashboard.svg
├── worker.js                ← deployment wrapper (adds security headers, serves assets)
├── deploy.json              ← Cloudflare Workers Sites manifest
├── README.md
└── .gitignore
```

**No build step, no frameworks, no dependencies.** Plain HTML + CSS + vanilla JavaScript,
as required by the assignment.

## 3. Running it locally

Option A — just open it:

```
Double-click public/index.html
```

Option B — serve it (recommended, so relative URLs and caching behave like production):

```bash
cd public
python3 -m http.server 8080
# then open http://localhost:8080
```

## 4. Uploading to GitHub

1. Create a new repository on github.com (e.g. `osmovera-website`).
2. Extract this zip and push its contents:

```bash
unzip osmovera-website.zip
cd osmovera-website
git init
git add .
git commit -m "Osmovera multi-page business website"
git remote add origin https://github.com/<your-username>/osmovera-website.git
git push -u origin main
```

If you want **GitHub Pages**, publish the `public/` folder:
*Settings → Pages → Deploy from a branch → main / `public`*.
All page links are relative, so the site works from a sub-path out of the box.

## 5. What was optimised

### Performance
- Single external stylesheet, single deferred script — no render-blocking JavaScript.
- **Zero web fonts and zero third-party requests** (system font stack): no layout shift,
  no extra DNS lookups.
- All graphics are inline/`<img>` **SVG** (kilobytes instead of megabytes), with explicit
  `width`/`height`/`aspect-ratio` to prevent cumulative layout shift.
- `fetchpriority="high"` on the hero image; everything else is either text or lazy by nature.
- `IntersectionObserver` powers reveal animations and counters — no scroll-event polling.
- `prefers-reduced-motion` respected: animations are disabled for users who ask for it.
- Baseline caching + CSP and security headers added by `worker.js` in production.

### SEO
- Unique `<title>`, meta description, canonical URL and Open Graph / Twitter tags per page.
- Semantic HTML5 landmarks: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`.
- JSON-LD structured data: `Organization`, `AboutPage`, `ItemList` of services,
  `CollectionPage`, and `ContactPage` + `LocalBusiness` with opening hours.
- `robots.txt` and `sitemap.xml` with priorities and last-modified dates.
- Descriptive heading hierarchy (one `h1` per page), descriptive link text,
  alt text on meaningful images and `aria-hidden` on decorative ones.
- Internal linking between all pages, plus a custom 404 page (`noindex`).

### Accessibility
- Skip-to-content link, visible focus styles, `aria-current="page"` on the active nav item.
- Mobile menu exposes `aria-expanded` and closes on Escape.
- Accordions and filters use `aria-expanded` / `aria-pressed` / `role="status"` live regions.
- Form errors are announced via `aria-describedby` and focus moves to the first invalid field.

### JavaScript features (progressive enhancement)
1. Sticky header shadow on scroll
2. Responsive mobile navigation (toggle, Escape, outside-click-free close on link select)
3. Scroll-reveal animations
4. Animated stat counters
5. Service/FAQ accordions (single-open per group)
6. Case-study sector filtering with live result count
7. Client-side contact form validation with inline error messages and success state
8. Automatic copyright year

Every page remains fully readable and navigable with JavaScript disabled.

## 6. Customising the site

| To change… | Edit |
|---|---|
| Company copy, services, case studies | the relevant file in `public/*.html` |
| Colours, spacing, typography | `:root` variables at the top of `public/css/styles.css` |
| Behaviour / animations | `public/js/main.js` |
| Domain used in canonical/OG/sitemap/robots | search-replace `https://www.osmovera.com` |
| Logo | `public/assets/logo.svg` |

## 7. Deployment

`deploy.json` + `worker.js` package `public/` as a Cloudflare Workers static-asset site
(the same manifest used by the Freebuff Sites deploy tool). GitHub Pages or any static
host (Netlify, Vercel, S3) also works — upload the **contents of `public/`**.

---

*Osmovera is a fictional company created for this academic project. Phone numbers use the
555 exchange reserved for fiction, and the contact form validates in the browser only —
no data is transmitted.*
