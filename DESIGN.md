# Cosmere design system

The visual language of the app follows the official identity of the Cosmere RPG rulebooks
(navy ink, gold ornament, flared serif titles in caps, small-caps headings over a gold rule,
official iconography) in **two themes**:

- **Pergamino de tormenta** (light, `data-theme="light"`): the book page. Pale storm-cloud paper,
  white "talent box" cards, navy ink, navy primary buttons, antique-gold ornaments.
- **Luz tormentosa** (dark, `data-theme="dark"`): the same identity for playing at night. Ink sky,
  Stormlight blue as the light source, official gold.

The theme follows the system unless the user picks one (Ajustes / user menu → *Apariencia*:
Sistema · Libro · Noche; `store/themeStore.ts`, applied before first paint by `index.html`).
The source of truth for values is `src/index.css`. `src/theme.ts` exposes the same tokens for inline
styles, so **every token switches with the theme**. A component that only uses tokens works in both.

## Principles

0. **Both themes, always.** Only tokens, `tone.*`, `ink()`/`tint()`: never a literal colour. Check light and dark.
1. **Legible at the table.** Phones, low light, quick glances. Body text 15px, secondary 13px,
   nothing under 12px except 11px UPPERCASE eyebrow labels. All text ≥ 4.5:1 contrast.
2. **One accent, many gems.** Stormlight blue (`--brand`) is the only UI accent. Colour with
   meaning uses the ten gemstone tones. Never decorate with colour that carries no meaning.
3. **Official iconography.** Game concepts use the official Cosmere icons (`<CosmereIcon>`).
   Generic UI uses Lucide. Emojis are never used as icons.
4. **Nothing lost.** Rebranding never removes features, data, text or navigation paths.

## Colour

| Token | Use |
|---|---|
| `--bg`, `--surface-1..4` | ink backgrounds: page → card → nested tile → hover |
| `--border`, `--border-bright`, `--border-strong` | hairlines, from subtle to emphasised |
| `--text`, `--text-muted`, `--text-subtle` | primary, secondary and meta text (all AA) |
| `--text-disabled` | disabled controls only |
| `--brand`, `--brand-light`, `--brand-fill` + `--on-brand` | Stormlight: links, active state, primary button |
| `--brand-dark` | solid fill that carries white text |
| `--gold` | gold for TEXT (eyebrows, kickers): official `#D0A451` on dark, antique `#7E5C16` on paper |
| `--gold-ornament`, `--gold-rule`, `--gold-border` | official gold for decorative strokes, rules, frames (same in both themes) |
| `--navy` | official heading navy `#1E3C60` (fills; it is the primary button colour on paper) |
| `--hover`, `--hover-strong`, `--track` | hover washes and progress tracks |

Gem tones, each with `-bg` (tint) and `-border` (outline) variants (`tone.<name>` in `theme.ts`):

| Tone | Meaning |
|---|---|
| `rubi` | danger, damage, delete, **Director (GM)** |
| `granate` | physical (secondary), rose accents |
| `topacio` | warning, rank, desvío |
| `heliodoro` | concentración |
| `esmeralda` | success, confirm, healing, movement |
| `zafiro` | info, cognitive |
| `amatista` | investidura, radiant, spiritual |
| `circon` | senses |
| `cuarzo` | neutral / past / inactive |

Data-driven identity colours (radiant orders, heroic paths in `src/data`) stay as data (hex).
They were chosen for a dark background, so **as text or icon colour always wrap them in
`ink(color)`**: it clamps their OKLCH lightness per theme (≥0.72 on dark, ≤0.5 on paper) so they stay
readable. Backgrounds/borders use `tint(color, pct)`; `toneFrom(color)` gives all three. Never concatenate
hex alpha (`${hex}22`) onto a CSS variable. Character hero gradients (`lib/avatar.ts`) are deep in both
themes and carry white text, like the navy banners of the book.

Legacy mapping when migrating hard-coded colours:
`#f87171 #ef4444 #fca5a5 #dc2626 rgba(239,68,68,…)` → rubí ·
`#fb7185 #f43f5e #be185d #f472b6` → granate (or rubí if destructive) ·
`#fbbf24 #f59e0b #facc15 #d97706` → topacio · `#fb923c #f97316` → heliodoro ·
`#34d399 #86efac #4ade80 #10b981` → esmeralda · `#60a5fa #3b82f6 #0284c7` → zafiro ·
`#a78bfa #8b5cf6 #7c3aed #c084fc` → amatista (brand when it was just "the accent") ·
`rgba(180,190,254,…)` lavender → brand · `#67e8f9 #22d3ee` → circón · `#94a3b8` → cuarzo ·
`'white'` → `var(--text)` (except on gradients/fills that need `#fff`) ·
`rgba(255,255,255,0.0x)` → `rgba(160,190,235,0.0x)` or a surface token.

## Typography

Free equivalents of the rulebook faces:

- **Marcellus** (`--font-title`, `font.title`, `titleText` fragment) ≈ Penumbra: page titles (`h1`, styled globally),
  character/NPC names in heroes, the COSMERE wordmark. UPPERCASE, letter-spacing .045em, single weight (never bold).
- **Crimson Pro** (`--font-display`) ≈ Plantin: `h2`/`h3`, card titles, `SectionTitle` (small caps + gold rule),
  long reading text (diary, adventure prose). Weights 500–700.
- **Geist** (`--font-ui`) ≈ Laski Sans: interface, labels, tables and **numbers** (`numeral` fragment, like the book's stat blocks).
- **Geist Mono** (`--font-mono`): dice results, roll log.
- Scale (`fs` in theme.ts): 11 eyebrow · 12 xs · 13 sm · 15 base · 16 md · 18 lg · 22 xl · 28 2xl · 34 3xl.
- Page title: `h1` / `PageHeader`, 28px. Sections: `<SectionTitle>` (`h2`). Card titles: `h3` 17–19px Crimson Pro 600.
- Heading levels never skip (h1 → h2 → h3).

## Shape, depth, spacing, motion

- Radius: `radius.xs 6 · sm 10 · md 14 · lg 18 · xl 24 · full`. Cards 18, tiles 14, controls 10–14, pills full.
- Shadows: `shadow[1]` resting card, `shadow[2]` raised, `shadow[3]` dialogs, `shadow.glow` Stormlight glow.
- Spacing on a 4px grid: 4 · 8 · 12 · 16 · 20 · 24 · 32. Page gutter 16px on mobile, 680px column (`page` fragment).
- Motion: `.rise` (staggered entrance, `style={{ '--i': index }}`), `.fade-in`, `.pop-in`, `.sheet-up`.
  All motion is disabled under `prefers-reduced-motion`.

## Components (`src/components/ui.tsx`)

`Button` (primary · secondary · ghost · danger · gold; sm 36 · md 44 · lg 50) · `IconButton` (label is required) ·
`Input` `Textarea` `Select` + `Field` (label wired to control) · `Switch` · `Badge` · `Avatar` · `Card` ·
`StatBox` `StatTile` · `PageHeader` · `SectionTitle` · `EmptyState` · `Spinner` · `Skeleton` ·
`Tabs` + `TabPanel` (WAI-ARIA tablist, arrow keys) · `Segmented` (radiogroup) · `Stepper` ·
`Disclosure` (accordion) · `Sheet` (bottom sheet on phones, centred dialog ≥ 640px) · `ConfirmDialog` ·
`ErrorMessage`. Hook `useDialogA11y` (`hooks/useDialogA11y.ts`: focus trap, Escape, restore focus, stacked dialogs).

Other shared pieces: `CharacterHero` + `heroPill`/`heroButton` from `lib/hero.ts` (character header),
`lib/avatar.ts` (`characterGradient(id)`, `characterPalette(id)`), `BrandMark`/`BrandGlyph`,
`ThemeSwitcher`, `TalentActivation`, `RadiantOrderIcon`/`RadiantOrderPlacard`.

## Iconography

Priority: **official Cosmere iconography → Lucide → never emojis or home-made drawings.**
Official assets were extracted as vectors from the rulebooks (`cosmere-api/Resources/CaminaPiedras`)
and live in `src/assets/cosmere/` (they belong to Brotherwise Games / Dragonsteel; private table use).

| Concept | Component / name |
|---|---|
| Cosmere emblem | `BrandGlyph`, `CosmereIcon name="cosmere-emblem"` (tintable) / `cosmere-emblem-color` |
| Stormlight Archive, Bridge Four | `archivo-tormentas`, `puente-cuatro` |
| Plot die | `PlotIcon result="oportunidad" \| "complicacion"` (`trama-*`) |
| Talent activation | `TalentActivation type=…` (`accion-1/2/3`, `accion-gratuita`, `reaccion`, `activacion-especial`, `siempre-activo`) |
| Surges | `SurgeIcon surge="Adhesión"` (`potencia-<id>`, ten glyphs) |
| Radiant orders | `RadiantOrderIcon orderId=…` (`orden-<id>` glyph, placard fallback), `RadiantOrderPlacard`; Knights Radiant: `caballeros-radiantes` (mono) / `caballeros-radiantes-color` |
| Frames | `marco-defensa`, `marco-desvio`, `marco-recurso` (character-sheet shapes) |
| Ornaments | `ornamento-banda` (tileable chapter frieze), `ornamento-cartela`, `ornamento-filete`, `ornamento-cita`, `ornamento-rombo`, `ornamento-medallon` |
| Nacidos de la bruma emblem | `CosmereIcon name="nacidos-bruma-emblem"` (`WorldConfig.emblema` of the Mistborn world; tintable, PDF 410) |
| Metals of Scadrial | `MetalGlyph metal arte era?` (`components/mistborn/MetalGlyph.tsx`): the 50 glyphs of the «Alfabeto de acero y alfabeto de Terris» (`alomancia-era1-<metal>`, `alomancia-era2-<metal>`, `feruquimia-<metal>` in `assets/cosmere/mistborn/`, PDF 411), tintable, in ONE lazy chunk (`lib/mistbornAssets.ts`) that only a Mistborn campaign requests: an empty box while it loads, Lucide `Flame`/`Anvil` for a metal without glyph |
| Illustrations | `cosmereImage('dado-d20' \| 'dado-trama' \| 'esfera-chip-zafiro' \| 'esfera-marco-diamante' \| 'esfera-broam-esmeralda' \| 'esferas-fila' \| 'dinero-era1' \| 'dinero-era2')` |
| Heroic paths (no official emblem exists) | `HeroicPathIcon id=…` (Lucide: ScanSearch, BowArrow, Handshake, BookOpenText, Swords, Crown) |
| Mistborn ancestries and metalborn paths (no official icon exists) | `WorldConfig.ascendencias[].icono`, `WorldConfig.iconos.caminoInvestido` (Lucide, `worlds/mistborn.icons.tsx`) |
| Stats, dice-roller modes | `StatIcons.*`, `RollModeIcons.*` (Lucide) |

Registry helpers (`hasCosmereIcon`, `cosmereImage`) live in `lib/cosmereAssets.ts`; Lucide concept maps (`HEROIC_PATH_ICONS`, `StatIcons`, `RollModeIcons`, `surgeSlug`) in `lib/gameIcons.ts`.
`CosmereIcon` keeps each icon's proportions (`size` = height), inherits `currentColor`, and is decorative
unless you pass `title`.

CSS helpers in `index.css`: `.ui-btn--*`, `.ui-icon-btn`, `.ui-field`, `.ui-card--interactive`, `.ui-row`,
`.ui-link`, `.glass`, `.hairline`, `.sticky-under-topbar`, `.above-bottomnav`,
`.only-mobile` `.only-tablet` `.only-desktop` `.from-tablet` `.hide-mobile`, `.sr-only`.

## Accessibility checklist

- Every interactive element is a `<button>`, `<a>` or form control. No clickable `div`s.
- Icon-only buttons use `IconButton` (label → `aria-label` + tooltip). Decorative icons are `aria-hidden`.
- Every input has a label (`Field` or `<label htmlFor>`). Placeholders are not labels.
- Overlays use `Sheet`/`ConfirmDialog` (or `useDialogA11y` with `role="dialog" aria-modal`).
- Tabs use `Tabs`/`TabPanel`. Single-choice groups use `Segmented`. Expanders use `Disclosure` or `aria-expanded`.
- Touch targets ≥ 44px for primary actions on mobile (never below 24px).
- Never `outline: none` inline. The global `:focus-visible` ring must stay visible.
- Colour is never the only carrier of meaning: pair it with text or an icon.
- Tables of data use `<table>` with `<th scope>`.
- **Every delete asks for confirmation** (`ConfirmDialog`), per workspace rules.

## Layout

- Mobile: fixed glass top bar (`--topbar-h` 56px) and bottom tab bar (`--bottomnav-h` 64px), both safe-area aware.
  `.app-main` clears them. Floating elements use `.above-bottomnav`. Sticky bars use `.sticky-under-topbar`.
- Tablet (640–1023px): 80px rail. Desktop (≥ 1024px): 248px sidebar.
- The page background is transparent: the body carries the atmosphere (`--atmo` glows/clouds + grain). Don't paint `--bg` on page wrappers.
- z-index scale: sticky 10 · nav 40 · FAB 45 · sheet 60 · dialog 100 (sheets portal to `body`).
