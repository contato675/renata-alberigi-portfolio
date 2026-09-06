---
name: apple-like-design-audit
description: Original mandatory audit contract for every gallery, typography, motion and responsive-layout change in Renata Alberigi's portfolio. Apply Apple-like hierarchy/restraint and measurable Muller grid; report browser evidence without implying Apple certification.
---
# Apple-like design audit — Renata portfolio

This is an original project contract, not copied proprietary material. Sources: SSSOM `docs/design-system/STUDIO_KIT_PLATFORMS.md` and `docs/plans/SLICE-04-DESIGN-AUDIT-MATRIX.md` at `f4e913efc377e13419c19bfb4199940b6469f431`; Apple HIG accessibility; source links in docs/06.

## Inspect before styling
Read the current render, tokens, gallery behavior and English/Portuguese content. List the states affected: absent media, actual gallery, single/multiple-image viewer, permanent detail, video before/after activation, locale switch and narrow screen. Do not reuse a rejected design authority or copy a dashboard because it is from SSSOM.

## A — Content priority
Art and biography are immediate, readable and true. White/graphite chrome, few controls, no arbitrary accents, gradients, glass, decorative animation or social counters. Preserve full photographs, original proportions/colours and approved titles. No empty decoration posing as artwork.

## B — Grid and hierarchy
One12/8/4 grid with8px rhythm, shared margins/gutters, flush-left hierarchy by scale and weight. Guides use the exact same content box. Check widths below/above max-width. Preserve accessible font scaling and full images over rigid pixel snapping. Measure optical offsets with the actual font and inspect before deciding a correction; do not use inline style mutation.

## C — Interaction
44CSSpx project target, visible focus, names, meaningful states, keyboard and Escape. Native scrolling leaves vertical gestures alone. Static anchors remain navigable without JS. Viewer restores focus/position and cooperates with browser history. Single image has no useless pagination. No third-party player before consent click. Motion150ms controls/220ms overlay; reduced-motion disables nonessential effects.

## D — Evidence, not adjectives
Run `npm run verify` and `npm run design:apple`. Inspect actual screenshots of EN/PT desktop/mobile/tablet, the gallery, viewer and detail. Record each failed measurement and repair it; rerun after edits. All-new code with synthetic calibration media may pass structural gates but cannot pass final artistic/colour review.
Do not label a design approved merely because numbers pass. State untested real device gestures, screen-reader checks, zoom, field performance and editorial approval. Do not call the audit an Apple certification or WCAG certification.

## E — Security and scope
Never modify browser policies, lower CSP, add eval/innerHTML or deploy unapproved media to make an audit pass. Fixtures live only in a temporary copy, never public content. Do not change other repositories, self-merge or redistribute fonts/third-party skills. The user authorised a public, noindex Pages preview for PR #1; this does not approve the final release or original media files.
