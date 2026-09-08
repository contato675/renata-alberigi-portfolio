# Regional residence only — privacy revision

The artist requested removing the specific place of residence and studio from the public portfolio. Use Chapada Diamantina, Bahia as the only residential geography, with localized country names where already present.

## Changes
- Updated the short introduction, full biography and location line in English, Brazilian Portuguese and French from the shared artist record.
- Preserved the artist's name, birthplace, birth year, motherhood, techniques, exhibitions, artistic history and professional contact.
- HTML (including metadata and aliases), Markdown, portfolio JSON, llms.txt and llms-full.txt are regenerated from the revised source.
- Artwork records, captions, original media, videos, UI/CSS, hosting configuration, DNS and existing publication flags are not changed.
- Added regression tests for all three languages and a scan of all generated public text. The live verifier also scans every published text resource and checks regional copy on all homepages.

## Privacy boundary
This deploy updates the current website and current source version. It does not erase historical Git commits, third-party archives, search caches or an email already sent. No history rewrite, force-push or merge into main is authorized or performed.

## Validation
137 automated tests passed, including 13 new privacy regression tests; build generated 434 files for 21 projects in three languages.
The additional copy-layout check passed six viewport/language combinations. Screenshots of the English desktop hero, Portuguese desktop biography and French mobile hero were inspected. The full Apple-like audit and public HTTP results are recorded after completion in PR #1.

Full Apple-like audit: 42 layouts and 9 interactions passed with zero failures. Summary: docs/audits/2026-09-07-residence-privacy.json. Public HTTP/deployment receipt will be recorded in PR #1.
