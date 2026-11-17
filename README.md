# Spark-DO site

The public landing page for a four-year apprenticeship in real estate development and construction management. Built with [Astro](https://astro.build) and published to GitHub Pages at <https://sparkdo.org>. The address is set once, as `site` in `astro.config.mjs`.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # writes dist/
```

Pushing to `main` builds and deploys the site through `.github/workflows/deploy.yml`.

## Where the content lives

| File | What it holds |
|---|---|
| `src/data/curriculum.json` | The program: phases, months, weekly hours, milestones, running threads. Edit by hand. |
| `src/data/semester-2027-spring.json` | One semester: courses, weeks, days, checkpoints. Generated, do not edit by hand. |
| `src/lib/content.js` | Semester prose and the builders for the Markdown versions and `llms.txt`. |
| `src/pages/index.astro` | The landing page layout. Its prose is in `curriculum.json`. |
| `src/pages/semester/2027-spring.astro` | The day-by-day semester page. |

The semester data is generated from the Markdown plan in the private curriculum repo:

```sh
npm run import                              # reads ../curriculum/semester-2027-spring.md
npm run import -- path/to/another-semester.md
```

The importer checks that every date falls on the weekday the plan says it does and that days are numbered without gaps.

## Search engines and language models

- Every page carries a canonical link, Open Graph and Twitter card tags, and schema.org JSON-LD (set in `src/layouts/Base.astro`).
- `sitemap-index.xml` and `robots.txt` are generated at build time; `robots.txt` points to the sitemap and allows all crawlers.
- `/llms.txt` is a short guide for language models. Each page also has a Markdown version (`/index.md`, `/semester/2027-spring.md`), and `/llms-full.txt` holds both in one file. All of them are built from the same data as the HTML.
- The social share image is `public/og.png`. Its source is `scripts/og.html`; after changing the headline, run `npm run og` to redraw it (needs Chrome, Brave, Edge or Chromium installed).

## Privacy

This repo is public and the curriculum repo is not. No personal names of family members or employees belong in this repo: the pages say "the student", "the mentor", "the PM" and "the super", and never describe how they are related. The sponsors' names, 3F Construction and Monroe Residential Partners, are fine to use; their logos are in `public/sponsors/`.
