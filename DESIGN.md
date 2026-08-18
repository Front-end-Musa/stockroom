---
name: Stockroom
description: A tabbed reference-manual workspace for keeping product catalogs in working order.
colors:
  ink: "#173247"
  muted: "#546778"
  board: "#ebe0c3"
  paper: "#fff9e9"
  divider: "#bda970"
  brand: "#174b61"
  brand-dark: "#0f3546"
  tab-red: "#d24f38"
  warning-red: "#a9382b"
  metric-yellow: "#f7d54b"
  acetate-green: "#d8e4d8"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(3rem, 6.4vw, 5.7rem)"
    fontWeight: 500
    lineHeight: 0.88
    letterSpacing: "-0.045em"
  body:
    fontFamily: "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  label:
    fontFamily: "ui-monospace, monospace"
    fontSize: "0.65rem"
    letterSpacing: "0.07em"
rounded:
  square: "0"
spacing:
  page-gutter: "3rem"
  section: "1.8rem"
  panel: "2.2rem"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
  button-hero:
    backgroundColor: "{colors.metric-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    height: "3.45rem"
  catalog-card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "2.2rem 2.1rem 1.5rem 3.4rem"
  entry-card:
    backgroundColor: "{colors.acetate-green}"
    rounded: "{rounded.square}"
    padding: "2.2rem 1.45rem 1.5rem"
---

# Design System: Stockroom

## Overview

**Creative North Star: "The Tabbed Reference Manual"**

Stockroom is an operational catalog workspace with the physical logic of a well-used product reference manual: warm board beneath the page, a yellow divider rail, an ink-blue title sheet, and visible binding holes. The language is direct and practical, but never generic—inventory work should feel organized, tangible, and unmistakably owned.

The catalog is a paper leaf held beside a translucent green entry sheet. Large serif statements establish hierarchy; compact monospaced labels make controls, metrics, status, and table structure fast to scan. This is a dense working surface, not a floating-card dashboard.

**Key Characteristics:**

- Warm board ground and strong horizontal/vertical rules.
- Deep blue as the principal editorial field and text color.
- Yellow reserved for divider-rail energy, summary metrics, and the primary hero action.
- Square, bounded controls with punch-hole and acetate signatures.

## Colors

The palette uses paper and board as materials, blue as ink, yellow as the active tab, and restrained red for labels or destructive states.

### Primary

- **Reference Ink:** Used for primary text, rules, navigation outlines, the hero field, and standard primary actions.
- **Dark Ink:** Used as the hover depth for blue actions and any high-contrast dark state.

### Secondary

- **Divider Yellow:** Used in the left rail, metrics band, hero CTA, and binding-hole accents; it is a structural signal, not a decorative wash.
- **Tab Red:** Used for entry tabs, focus emphasis, and the catalog's visible punched binding.

### Tertiary

- **Acetate Green:** The translucent-looking, calm entry-sheet ground that differentiates the product form from the catalog leaf.

### Neutral

- **Board:** The warm base behind the manual and rails.
- **Paper:** The cream catalog surface and light text on ink-blue fields.
- **Muted Ledger Ink:** Secondary descriptions and supporting metadata.
- **Divider Brass:** The quiet global rule color outside the stronger ink borders.

**The Yellow Rail Rule.** Divider Yellow stays concentrated in rails, metrics, and the direct hero CTA. Do not use it as a general card background or body-text color.

## Typography

**Display Font:** Georgia, with Times New Roman fallback.
**Body Font:** Inter, with system sans-serif fallbacks.
**Label/Mono Font:** `ui-monospace`, monospace.

**Character:** Serif type gives headings the authority of a printed manual; the sans-serif body remains neutral and readable. Monospace is the operational layer, used for compact all-caps labels and controls rather than prose.

### Hierarchy

- **Display:** The hero statement uses the display token; it is large, tight, and allowed to break over lines.
- **Headline:** Section and form headings use Georgia at approximately `2.2rem`, with close tracking.
- **Title:** Product names use Georgia to distinguish records from table metadata.
- **Body:** Inter carries descriptions, instructions, and runtime messages.
- **Label:** Monospace at small sizes with positive tracking and uppercase identifies metrics, fields, API status, and table headers.

**The Two-Register Rule.** Use serif for named, editorial hierarchy; use mono for machine-like operational labels. Do not turn all interface copy into display type.

## Layout

The page is capped at `1280px` and normally uses `3rem` side gutters. The shell begins with a warm board background interrupted by a narrow yellow vertical rail; on small screens the rail scales down but remains present.

The hero is a full ink-blue block, followed immediately by a three-column yellow metrics strip. The work area is a flush two-column composition: flexible catalog leaf at left, `22.5rem` entry sheet at right, with no floating gap. At `980px` it becomes one column, with the entry sheet above the catalog; at `760px` metrics stack and the catalog/form padding contracts. Product rows reduce to a compact two-column mobile arrangement while actions remain right-aligned.

## Elevation & Depth

The baseline is deliberately flat: borders, section rules, tonal paper layers, and the acetate inset establish hierarchy. Only exceptional moments lift—the yellow hero CTA has a hard offset shadow, the catalog's acetate inset has a faint structural shadow, and destructive confirmation uses a heavy offset shadow. Focus states use compact square offset shadows, never soft ambient glows.

### Shadow Vocabulary

- **Hero action:** `7px 7px 0 rgb(9 32 43 / 35%)` makes the yellow CTA a direct, bounded tab.
- **Acetate inset:** `5px 6px 14px rgb(23 50 71 / 8%)` lightly separates the translucent catalog sheet.
- **Destructive dialog:** `10px 12px 0 rgb(23 50 71 / 26%)` makes the irreversible decision physically prominent.

**The Flat-By-Default Rule.** A surface earns elevation only when it is actionable, inset, or modal.

## Shapes

The system is square-cornered (`0` radius) throughout: cards, fields, buttons, pills, chips, dialogs, and status panels all behave like cut paper or stamped labels. Ink borders are normally `1px`; important seams use `2px`. Circular geometry is reserved for actual punch holes and small status markers, never for softening containers.

## Components

### Buttons

- **Character:** Direct, stamped controls.
- **Primary:** Ink-blue fill with paper text; monospaced uppercase copy and square corners.
- **Hero CTA:** Yellow fill with ink text, `3.45rem` minimum height, and hard offset shadow. On hover it lightens and shifts up-left by `2px`.
- **Secondary:** Transparent paper-control treatment with an ink outline; reserve it for cancellation or non-primary actions.
- **Danger:** Warning-red fill for irreversible delete confirmation only.

### Cards / Containers

- **Catalog leaf:** Cream paper, ink outline, left punched-binding rail, and an internal translucent acetate rectangle.
- **Entry sheet:** Acetate Green panel with an `ENTRY` red tab at its top-right edge.
- **Metrics:** A contiguous yellow band divided by rules, not separate floating cards.

### Inputs / Fields

- **Style:** Square fields with green-gray border and translucent paper fill.
- **Focus:** The border turns ink-blue and receives a compact `3px` square offset shadow.
- **Error:** Preserve the square form and change the border to the defined error red.

### Navigation

- **Top bar:** A ruled manual header with a square yellow brand mark, serif product name, and monospaced status badge.
- **Table controls:** Search, paging, and row actions use square outlines; hover converts icon controls to paper-on-ink.

### Inventory Status

- **Stock pills:** Square mono labels with a small circular status marker. Use green for in-stock, amber for low stock, and red only for out of stock.

## Do's and Don'ts

### Do:

- **Do** retain the warm board, yellow rail, and ink-rule skeleton on every Stockroom operating surface.
- **Do** use paper and acetate layers to separate catalog review from product entry.
- **Do** preserve serif headings with monospaced labels and controls.
- **Do** make primary actions bounded yellow or ink-blue rectangles, with hard rather than diffuse emphasis.

### Don't:

- **Don't** introduce pill-shaped buttons, rounded cards, glassmorphism, or generic floating dashboard panels.
- **Don't** use yellow as a broad decorative backdrop outside its rail, metrics, and primary-action roles.
- **Don't** replace the punch-hole binding and acetate inset with ornamental illustrations; these physical cues are the signature.
- **Don't** use a soft shadow vocabulary for ordinary content cards.
