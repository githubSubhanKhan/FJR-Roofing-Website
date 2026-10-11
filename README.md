# FJR Affordable Roofing — landing page concept

Pitch concept for https://affordableroofinglongisland.com/ built in plain HTML, CSS and JavaScript. No build step, no frameworks, works offline.

## Open it
Double-click `index.html`. Everything (font, icons, images) is bundled locally, so it works without internet.

## Folder layout
```
index.html          the page (icon sprite is inlined so it works from file://)
css/styles.css      all styles, design tokens at the top (:root)
js/main.js          slider, repair-or-replace checker, tabs, lightbox, town search, forms
assets/fonts/       Archivo variable font (SIL Open Font License)
assets/img/         illustrated scenes (SVG), logo, og-image.png
assets/img/gallery/ project illustrations
```

## What's on the page
- Before/after drag slider in the hero (sweeps once on load; skipped if the visitor prefers reduced motion)
- Quick estimate bar right under the hero (3 fields)
- "Repair or replace?" checker: roof age + symptoms gives an honest verdict and a lifespan bar
- Service tabs (repair, replacement, installation, emergency) with keyboard arrow support
- Condo & HOA band, "What you get with FJR" comparison, 3-step process
- Project gallery with lightbox (arrow keys, Esc)
- Reviews, "Do we cover your town?" search, FAQ accordion
- Full estimate form with photo upload preview and validation
- Sticky Call / Free estimate bar on phones, sticky header, skip link, visible focus

## Before going live
1. **Real photos.** The house scenes are illustrations made for the pitch. Swap in FJR's real job photos (same file names in `assets/img/gallery/`, or update the `src` paths). Their existing gallery photos are the strongest trust asset they have.
2. **Form endpoint.** Both forms have `data-endpoint=""`. Paste a Formspree / Netlify Forms / CRM webhook URL and leads will POST there. Empty = demo mode (shows the success state).
3. **License numbers.** Add the Nassau and Suffolk home improvement license numbers to the footer.
4. **Reviews.** Replace the three testimonials with live, verified Google reviews.
5. **OG image.** Change `og:image` to an absolute URL once hosted.
6. **Email.** Move from the AOL address to a domain email (e.g. office@affordableroofinglongisland.com).

## Design tokens
| Token | Hex | Use |
|---|---|---|
| Asphalt | #23272B | text, dark bands |
| Slate | #4A5560 | secondary text |
| Flashing | #C9D0D4 | borders, dividers |
| Galvanized | #EEF1F2 | page background |
| Ladder yellow | #F2B705 | calls to action |
| Bay blue | #1E5A7A | links, icons |

Type: Archivo variable, expanded width (125%) for headings, normal width for body.
