# Renata Alberigi — visual-art portfolio

**English-first · Português (Brasil) · Apple-like + Müller · 6 September 2026.**
Private, independent repository. GitHub Pages is not enabled. The build is a review preview, not an approved public portfolio.

## Implemented foundation
English is served at the site base path; Brazilian Portuguese at `pt-br/`. Both are complete static HTML, with explicit language links, reciprocal hreflang, self-canonicals and Markdown counterparts. No locale detection or redirect based on the browser language.

The gallery uses project covers, a native-dialog image viewer, and a permanent static page for each published project. All images and project metadata remain readable without JavaScript. The viewer adds keyboard navigation, browser Back/Forward, reduced-motion handling, and native horizontal scrolling without taking over vertical touch gestures.

`llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml` and per-language `portfolio.json` are generated from the same approved public records. No fabricated product, price, availability, Gumroad integration, or claim of AI recommendation is emitted.

## Design authority
Apple-like restraint, hierarchy and response from the actual SSSOM design contracts; Müller-Brockmann column discipline. Read [.agents/skills/apple-like-design-audit/SKILL.md](.agents/skills/apple-like-design-audit/SKILL.md) before any gallery or layout change. No proprietary Apple font or copied third-party skill is bundled.

## Run locally
Node.js 22 or newer; no third-party dependencies or install step.
```sh
npm run verify
npm run preview
npm run design:apple
```
The browser audit uses an isolated temporary profile in installed Chrome/Chromium/Edge. Set `CHROME_BIN` only when the installed path is not detected. It does not use the normal browser profile or disable security policies. `artifacts/apple-like/` contains local reports and screenshots; it is never published.

## Documentation
- [Visual direction](docs/01-direcao-visual.md), [layout and interaction](docs/02-layout-interacoes-mobile.md)
- [Content and media](docs/03-conteudo-e-midias.md), [Pages deployment](docs/04-github-pages.md)
- [Acceptance and remaining work](docs/05-implementacao-e-aceite.md), [sources](docs/06-fontes-e-decisoes.md)
- [AI discovery and bilingual architecture](docs/08-ai-i18n.md)
- [Apple-like audit](docs/09-auditoria-apple-like.md), [PDF plan](pdf/README.md)

## Editorial and deployment safeguards
Real artwork photographs, portrait, final video and PDF are still missing. Portuguese biography is preserved; the English translation is implemented but awaits human editorial review. Neutral calibration fixtures exist only in an audit-created temporary directory, never in the artist's published content.

`npm run build` creates a noindex preview. `npm run check:publish` and `npm run build:release` deliberately fail until media, editorial approval, readiness and effective origin-root robots deployment are confirmed. Never publish the preview, change repository visibility, enable Pages, or merge an implementation PR without authorization.
