# Repository rules

## Isolation and consent
This project belongs to Renata Alberigi. Never edit SSSOM, Aplanta, other worktrees or their processes. Read docs/01 through docs/09 before implementation. Develop on a dedicated branch and open a PR; no self-merge, visibility change or Pages activation.

## Editorial truth
Use `site/content/artist.json` as the source. Preserve the approved Portuguese biography and keep English substantively equivalent. Do not invent artwork, photographs, titles, dates, media, dimensions, credentials, awards, testimonials, prices or commercial availability. Missing media stays null. Machine translation is not human editorial approval. Both language variants are required for interface text, image descriptions and localized metadata; original artwork titles may also be preserved in `originalTitle`.
Never upload originals, personal/GPS metadata, residence addresses, birth-day details, credentials or other projects' private files. Audit fixtures must be neutral, explicitly labeled and created in a temporary directory outside `site/` and `dist/`.

## Mandatory Apple-like audit
Before ANY gallery, typography, interaction or responsive-layout work, read `.agents/skills/apple-like-design-audit/SKILL.md`. This is an original project audit contract using the documented SSSOM Apple-like references; it is not an Apple certification or a copied private skill.
Apply Apple-like restraint, content priority, systematic hierarchy, native-feeling controls and short functional motion. Retain the 12/8/4-column Müller grid, 8px rhythm and flush-left composition. No dashboard skin, arbitrary gradient, artwork crop, tint or decorative animation. Use system fonts without distributing proprietary font files.
Run `npm run design:apple`, inspect the screenshots, record actual results and unresolved subjective checks. A numerical pass with calibration media never approves the final artwork composition. No false claim of complete WCAG compliance.

## Interaction
Real anchors must reach complete static project pages without JavaScript. Dialog requires a visible close control, keyboard support, Escape, focus restoration and Back/Forward behavior. All controls target at least 44 CSS pixels. Respect reduced motion. Native horizontal scroll must not suppress vertical or ambiguous gestures. No touch-pan-x-only, scroll hijacking or autoplay. Only load external video after an explicit click.

## English-first, AI-readable
English is the canonical entry at the configured base path; `pt-br/` is the explicit Portuguese counterpart. Never force browser-language redirects. Use full static HTML, matching Markdown, accurate Person/VisualArtwork metadata, canonical and reciprocal hreflang. Build discovery files from public records only. Do not expose drafts or invent a product/Offer/Gumroad listing to influence agents.
`llms.txt` is supplementary guidance, not an indexing, ranking, recommendation, training or copyright guarantee. `robots.txt` is effective only at the origin root. A project-subpath copy is a candidate for deployment, not active crawler control. Confirm the root policy or use an authorized custom domain before release.

## Safety and gates
No inline executable scripts, eval, user-content innerHTML, secrets, authentication bypass, backend or new runtime dependency. Keep CSP strict. Paths must support both project Pages and root-domain hosting. Only approved referenced media enters the build; reject unsafe paths/symlinks and protect unknown output files.
Required: `npm run verify`, `npm run design:apple`; publication gate separately. Preserve noindex preview and fail-closed release flags until approved. Never weaken an administrative browser restriction to complete a test; use an independently authorized environment or record the block.
