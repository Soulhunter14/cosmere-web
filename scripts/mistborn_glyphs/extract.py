#!/usr/bin/env python3
"""Extracts the official vector and image assets of "Nacidos de la bruma" from the Spanish handbook (T45).

Official Cosmere RPG iconography (Brotherwise Games / Dragonsteel), extracted as vectors from the rulebook
SPA_Mistborn_Handbook.pdf (416 pages; PDF page = book page + 6), like the Stormlight icons of src/assets/cosmere
(see components/CosmereIcon.tsx). Private table use only: the artwork and the Nacidos de la bruma(R) / Cosmere(R)
marks belong to their owners. Nothing is drawn by hand: every outline comes from the PDF, and the PDF itself is
never copied to the repository (it is a parameter).

What it writes, relative to --out (the src/assets/cosmere folder of cosmere-web):

  mistborn/alomancia-era1-<metal>.svg   17  font MistbornAllomantic-Era1 embedded in PDF 411 (CFF outlines)
  mistborn/alomancia-era2-<metal>.svg   16  font MistbornAllomantic-Era2 (no atium in Era 2, L.167 / PDF 173)
  mistborn/feruquimia-<metal>.svg       17  vector drawings of the Terris-alphabet column of PDF 411
  nacidos-bruma-emblem.svg               1  vector drawings of the emblem of PDF 410 (kept in the ROOT: it is the
                                            only one the eager glob of lib/cosmereAssets.ts must see)
  img/dinero-era1.webp, img/dinero-era2.webp
                                         2  «Dinero de la Era 1 / Era 2», raster images with alpha of PDF 260

The 50 glyphs live in the mistborn/ subfolder, OUTSIDE the eager glob '../assets/cosmere/*.svg', so they stay out of
the main bundle (they are loaded from one lazy module, T46). Every SVG is tintable (fill="currentColor").

Glyph geometry. Each family (Era 1, Era 2, Terris) is drawn in a square 1000 x 1000 frame with ONE scale per family
(the largest glyph of the family fills the frame minus a 3 % margin), so the glyphs keep the relative size they have
in the book, and every glyph is centred by its bounding box. Coordinates are rounded to integers.

The letter -> metal table is the one printed in PDF 411 ("Alfabeto de acero y alfabeto de Terris"). The script reads
the rows from the page itself and fails if a row disagrees with the expected table below. Tin (I / E) and pewter
(O / U) print two Allomantic glyphs each; the first one (I, O) is exported. The book confirms it: the corner
glyphs of the cover (PDF 1 and 416, glyphs "one".."four" of the Era 1 font) are exactly the outlines of B, P, I, O.

Usage (from cosmere-web):
  python scripts/mistborn_glyphs/extract.py --pdf "<path>/SPA_Mistborn_Handbook.pdf" [--out src/assets/cosmere]
         [--only glyphs,emblem,money] [--money-size 360]

Requires PyMuPDF (pymupdf) and fontTools; Pillow is needed only for the WebP step (money).
Tested with Python 3.13, PyMuPDF 1.28.2, fontTools 4.65.0 and Pillow 12.3.0.
"""

from __future__ import annotations

import argparse
import io
import re
import sys
from pathlib import Path

try:
    import pymupdf
    from fontTools.cffLib import CFFFontSet
    from fontTools.pens.boundsPen import BoundsPen
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
except ImportError as exc:  # pragma: no cover
    sys.exit(f"Missing dependency: {exc.name}. Install it with: pip install pymupdf fonttools pillow")

# PDF pages (1-based). Book page = PDF page - 6.
PAGE_MONEY = 260     # L.254, «Divisa»: «Dinero de la Era 1» (left) and «Dinero de la Era 2» (right)
PAGE_EMBLEM = 410    # L.404, «Hoja de artes metálicas»: emblem + title box
PAGE_ALPHABET = 411  # L.405, «Alfabeto de acero y alfabeto de Terris»

FRAME = 1000.0       # side of the square viewBox of the glyphs
MARGIN = 0.03        # share of the frame left empty around the largest glyph of a family

# id, name as printed in PDF 411, letter of the first Allomantic glyph of its row (03-superficie-ui.md 7.2)
METALS = [
    ("hierro", "Hierro", "B"), ("acero", "Acero", "P"), ("estano", "Estaño", "I"), ("peltre", "Peltre", "O"),
    ("cinc", "Cinc", "L"), ("laton", "Latón", "R"), ("cobre", "Cobre", "D"), ("bronce", "Bronce", "T"),
    ("aluminio", "Aluminio", "Z"), ("duraluminio", "Duraluminio", "S"), ("cromo", "Cromo", "W"),
    ("nicrosil", "Nicrosil", "Y"), ("cadmio", "Cadmio", "G"), ("bendaleo", "Bendaleo", "K"),
    ("oro", "Oro", "M"), ("electro", "Electro", "N"), ("atium", "Atium", "V"),
]
NO_ERA2 = {"atium"}  # atium only exists in Era 1 (L.167 / PDF 173): no Era 2 glyph is exported

FONT_ERA = {"era1": "MistbornAllomantic-Era1", "era2": "MistbornAllomantic-Era2"}


# ─────────────────────────── helpers ───────────────────────────

def num(v: float, dec: int) -> str:
    s = f"{v:.{dec}f}"
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return "0" if s in ("", "-0") else s


def ascii_only(s: str) -> str:
    """Letters A-Z only: PDF 411 prints 'Estaño' / 'Latón' with a broken accent, so rows are matched without them."""
    return re.sub(r"[^A-Za-z]", "", s).lower()


def svg_doc(w: str, h: str, body: str) -> str:
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="currentColor">{body}</svg>'


def bezier(p0, p1, p2, p3, steps: int = 24):
    for i in range(steps + 1):
        t = i / steps
        a, b, c, d = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3
        yield (a * p0.x + b * p1.x + c * p2.x + d * p3.x, a * p0.y + b * p1.y + c * p2.y + d * p3.y)


def item_points(items):
    """Points on the outline of a PyMuPDF drawing (curves are sampled: the rect of a drawing is a control-point box)."""
    for it in items:
        op = it[0]
        if op == "l":
            yield (it[1].x, it[1].y)
            yield (it[2].x, it[2].y)
        elif op == "c":
            yield from bezier(*it[1:5])
        elif op == "re":
            r = it[1]
            yield from ((r.x0, r.y0), (r.x1, r.y0), (r.x1, r.y1), (r.x0, r.y1))
        elif op == "qu":
            q = it[1]
            yield from ((p.x, p.y) for p in (q.ul, q.ur, q.lr, q.ll))


def bbox_of(points):
    pts = list(points)
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def drawing_path(items, tr, dec: int) -> str:
    """SVG path data (absolute M/L/C/Z) of the items of a PyMuPDF drawing. All of them are fills, so every subpath
    is closed; a closing line that ends where the subpath started is dropped (Z does it)."""
    subpaths: list[list] = []  # [start, [cmd...]] with cmd = ("L", p) | ("C", c1, c2, p)
    cur = None

    def same(a, b) -> bool:
        return abs(a.x - b.x) < 1e-3 and abs(a.y - b.y) < 1e-3

    for it in items:
        op = it[0]
        if op in ("l", "c"):
            if cur is None or not same(cur, it[1]):
                subpaths.append([it[1], []])
            if op == "l":
                subpaths[-1][1].append(("L", it[2]))
                cur = it[2]
            else:
                subpaths[-1][1].append(("C", it[2], it[3], it[4]))
                cur = it[4]
        elif op in ("re", "qu"):
            if op == "re":
                r = it[1]
                corners = [pymupdf.Point(r.x0, r.y0), pymupdf.Point(r.x1, r.y0), pymupdf.Point(r.x1, r.y1), pymupdf.Point(r.x0, r.y1)]
            else:
                q = it[1]
                corners = [q.ul, q.ur, q.lr, q.ll]
            subpaths.append([corners[0], [("L", p) for p in corners[1:]]])
            cur = None
        else:
            raise SystemExit(f"Unexpected drawing item {op!r}")

    def pt(p) -> str:
        x, y = tr(p.x, p.y)
        return f"{num(x, dec)} {num(y, dec)}"

    out = []
    for start, cmds in subpaths:
        if cmds and cmds[-1][0] == "L" and same(cmds[-1][1], start):
            cmds = cmds[:-1]
        out.append("M" + pt(start))
        for c in cmds:
            out.append(("L" if c[0] == "L" else "C") + " ".join(pt(p) for p in c[1:]))
        out.append("Z")
    return "".join(out)


def load_cff(doc, page, font_name: str):
    for f in page.get_fonts(full=True):
        if font_name in f[3]:
            _, ext, _, content = doc.extract_font(f[0])
            if ext != "cff":
                raise SystemExit(f"{font_name}: expected an embedded CFF font, got {ext!r}")
            cff = CFFFontSet()
            cff.decompile(io.BytesIO(content), None)
            return cff[cff.fontNames[0]].CharStrings
    raise SystemExit(f"Font {font_name} not found on PDF page {page.number + 1}: wrong PDF?")


def check_page(doc, number: int, needle: str) -> pymupdf.Page:
    if number > len(doc):
        raise SystemExit(f"The PDF has {len(doc)} pages and PDF page {number} does not exist: this is not the 416-page handbook")
    page = doc[number - 1]
    if needle.lower() not in page.get_text().lower():
        raise SystemExit(f"PDF page {number} does not contain {needle!r}: this is not the expected handbook (PDF = book + 6)")
    return page


def check_cover_glyphs(doc, chars) -> None:
    """Evidence for tin = I and pewter = O. The corner medallions of the cover (PDF 1 and 416) are typeset with the
    glyphs "one".."four" of the Era 1 font, i.e. iron, steel, tin and pewter. Their outlines are exactly those of B, P, I
    and O, and differ from those of E and U (the second glyph of the tin and pewter pairs of PDF 411)."""
    def outline(name: str) -> str:
        pen = SVGPathPen(None)
        chars[name].draw(pen)
        return pen.getCommands()

    for cover, letter, other in (("one", "B", None), ("two", "P", None), ("three", "I", "E"), ("four", "O", "U")):
        if outline(cover) != outline(letter) or (other and outline(cover) == outline(other)):
            raise SystemExit(f"Cover glyph {cover!r} is not the outline of {letter!r}: re-check which tin / pewter glyph to export")
    for number in (1, 416):
        used = sorted(
            s["text"].strip() for b in doc[number - 1].get_text("dict")["blocks"] if b["type"] == 0
            for l in b["lines"] for s in l["spans"] if FONT_ERA["era1"] in s["font"]
        )
        if used != ["1", "2", "3", "4"]:
            raise SystemExit(f"PDF page {number}: expected the four corner glyphs of the cover, found {used}")
    print("  cover corners (PDF 1, 416) = glyphs B, P, I, O of the Era 1 font: tin = I, pewter = O (not E, U)")


# ─────────────────────────── glyphs (PDF 411) ───────────────────────────

def read_table(page):
    """Rows of the table: printed label ('I / E'), printed metal, vertical centre, and the spans of the glyph fonts."""
    spans = [s for b in page.get_text("dict")["blocks"] if b["type"] == 0 for l in b["lines"] for s in l["spans"]]
    yc = lambda s: (s["bbox"][1] + s["bbox"][3]) / 2
    cells = [s for s in spans if abs(s["size"] - 10.0) < 0.1 and s["bbox"][1] > 125 and s["bbox"][2] < 150]
    labels = sorted((s for s in cells if s["bbox"][0] < 90), key=yc)
    metals = [s for s in cells if s["bbox"][0] >= 90]
    rows = []
    for lab in labels:
        m = [s for s in metals if abs(yc(s) - yc(lab)) < 3]
        if len(m) != 1:
            raise SystemExit(f"Row {lab['text']!r}: expected one metal cell, found {len(m)}")
        rows.append({"label": lab["text"].strip(), "name": m[0]["text"].strip(), "yc": yc(lab), "glyphs": {}})
    for tag, font in FONT_ERA.items():
        for s in spans:
            if font in s["font"] and s["text"].strip():
                row = min(rows, key=lambda r: abs(r["yc"] - yc(s)))
                if abs(row["yc"] - yc(s)) > 8:
                    raise SystemExit(f"Glyph span {s['text']!r} ({tag}) is not on any row of the table")
                row["glyphs"].setdefault(tag, []).append((s["bbox"][0], s["text"].strip()))
    for r in rows:
        for tag in r["glyphs"]:
            r["glyphs"][tag] = [t for _, t in sorted(r["glyphs"][tag])]
    return rows


def terris_groups(page, rows):
    """Black fills of the Terris column (x 295-335, below the header) assigned to the nearest row."""
    for r in rows:
        r["terris"] = []
    for d in page.get_drawings():
        r = d["rect"]
        if d["type"] != "f" or d.get("fill") != (0.0, 0.0, 0.0) or not (295 < r.x0 and r.x1 < 335 and r.y0 > 125):
            continue
        yc = (r.y0 + r.y1) / 2
        row = min(rows, key=lambda w: abs(w["yc"] + 2 - yc))
        row["terris"].append(d)
    for w in rows:
        seq = sorted(d["seqno"] for d in w["terris"] if "seqno" in d)
        if seq and seq[-1] - seq[0] + 1 != len(seq):
            print(f"  warning: the paths of row {w['label']!r} are not contiguous in the page stream", file=sys.stderr)
    return rows


def export_glyphs(doc, out: Path) -> int:
    page = check_page(doc, PAGE_ALPHABET, "alfabeto de terris")
    rows = terris_groups(page, read_table(page))
    dest = out / "mistborn"
    dest.mkdir(parents=True, exist_ok=True)
    by_name = {ascii_only(r["name"]): r for r in rows}

    selected = []  # (id, row, letters per era)
    for mid, printed, letter in METALS:
        row = by_name.get(ascii_only(printed))
        if row is None:
            raise SystemExit(f"{mid}: no row {printed!r} in the table of PDF {PAGE_ALPHABET}")
        for tag in ("era1", "era2"):
            if tag == "era2" and mid in NO_ERA2:
                continue
            got = row["glyphs"].get(tag, [None])[0]
            if got != letter:
                raise SystemExit(f"{mid} ({tag}): the page has letter {got!r}, the expected table says {letter!r}")
        if not row["terris"]:
            raise SystemExit(f"{mid}: no Terris glyph found in its row")
        selected.append((mid, row, letter))

    count = 0
    # ── Allomantic glyphs: outlines of the embedded fonts, one scale per font ──
    for tag in ("era1", "era2"):
        chars = load_cff(doc, page, FONT_ERA[tag])
        if tag == "era1":
            check_cover_glyphs(doc, chars)
        use = [(mid, letter) for mid, _, letter in selected if not (tag == "era2" and mid in NO_ERA2)]
        boxes = {}
        for mid, letter in use:
            bp = BoundsPen(None)
            chars[letter].draw(bp)
            boxes[mid] = bp.bounds
        biggest = max(max(b[2] - b[0], b[3] - b[1]) for b in boxes.values())
        scale = FRAME * (1 - 2 * MARGIN) / biggest
        for mid, letter in use:
            x0, y0, x1, y1 = boxes[mid]
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            pen = SVGPathPen(None, ntos=lambda v: num(v, 0))
            chars[letter].draw(TransformPen(pen, (scale, 0, 0, -scale, FRAME / 2 - cx * scale, FRAME / 2 + cy * scale)))
            svg = svg_doc(num(FRAME, 0), num(FRAME, 0), f'<path d="{pen.getCommands()}"/>')
            (dest / f"alomancia-{tag}-{mid}.svg").write_bytes(svg.encode("utf-8"))
            print(f"  alomancia-{tag}-{mid}.svg  glyph {letter!r}  {len(svg)} B")
            count += 1

    # ── Feruchemical glyphs: the filled paths of the Terris column, one scale for all ──
    boxes = {mid: bbox_of(p for d in row["terris"] for p in item_points(d["items"])) for mid, row, _ in selected}
    biggest = max(max(b[2] - b[0], b[3] - b[1]) for b in boxes.values())
    scale = FRAME * (1 - 2 * MARGIN) / biggest
    for mid, row, _ in selected:
        x0, y0, x1, y1 = boxes[mid]
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        tr = lambda x, y, cx=cx, cy=cy: ((x - cx) * scale + FRAME / 2, (y - cy) * scale + FRAME / 2)
        paths = "".join(
            "<path" + (' fill-rule="evenodd"' if d.get("even_odd") else "") + f' d="{drawing_path(d["items"], tr, 0)}"/>'
            for d in sorted(row["terris"], key=lambda d: d.get("seqno", 0))
        )
        svg = svg_doc(num(FRAME, 0), num(FRAME, 0), paths)
        (dest / f"feruquimia-{mid}.svg").write_bytes(svg.encode("utf-8"))
        print(f"  feruquimia-{mid}.svg  {len(row['terris'])} paths  {len(svg)} B")
        count += 1
    return count


# ─────────────────────────── emblem (PDF 410) ───────────────────────────

def export_emblem(doc, out: Path) -> int:
    page = check_page(doc, PAGE_EMBLEM, "hoja de artes")
    parts = [
        d for d in page.get_drawings()
        if d["type"] == "f" and d["rect"].x1 < 70 and d["rect"].y1 < 75 and all(c < 0.05 for c in d["fill"])
    ]  # the title box next to it spans x 48-225 and is left out
    if len(parts) != 4:
        raise SystemExit(f"Emblem: expected 4 filled paths, found {len(parts)}")
    parts.sort(key=lambda d: d.get("seqno", 0))
    x0, y0, x1, y1 = bbox_of(p for d in parts for p in item_points(d["items"]))
    pad = 1.0  # a unit of margin so the arcs are not cut at small sizes
    tr = lambda x, y: (x - x0 + pad, y - y0 + pad)
    w, h = (x1 - x0) + 2 * pad, (y1 - y0) + 2 * pad
    body = "".join(f'<path d="{drawing_path(d["items"], tr, 2)}"/>' for d in parts)
    svg = svg_doc(num(w, 2), num(h, 2), body)
    (out / "nacidos-bruma-emblem.svg").write_bytes(svg.encode("utf-8"))
    print(f"  nacidos-bruma-emblem.svg  {len(parts)} paths  {w:.2f} x {h:.2f}  {len(svg)} B")
    return 1


# ─────────────────────────── money (PDF 260) ───────────────────────────

def export_money(doc, out: Path, side: int) -> int:
    try:
        from PIL import Image
    except ImportError:
        raise SystemExit("Pillow is required for the WebP step: pip install pillow")
    page = check_page(doc, PAGE_MONEY, "divisa")
    imgs = [
        i for i in page.get_image_info(xrefs=True)
        if i["xref"] and i["has-mask"] and (i["bbox"][2] - i["bbox"][0]) < 400 and i["bbox"][1] > 300
    ]
    imgs.sort(key=lambda i: i["bbox"][0])  # left: Era 1, right: Era 2 (checked against the captions below)
    if len(imgs) != 2:
        raise SystemExit(f"Money: expected 2 illustrations with alpha, found {len(imgs)}")
    words = page.get_text("words")
    dest = out / "img"
    dest.mkdir(parents=True, exist_ok=True)
    for era, info in zip(("1", "2"), imgs):
        bx0, _, bx1, by1 = info["bbox"]
        caption = [
            words[k + 1][4] for k, w in enumerate(words[:-1])
            if w[4].lower() == "era" and bx0 - 5 <= w[0] <= bx1 and by1 - 25 <= w[1] <= by1 + 45
        ]
        if caption != [era]:
            raise SystemExit(f"Money: the illustration at x={bx0:.0f} is captioned {caption}, expected Era {era}")
        raw = doc.extract_image(info["xref"])
        rgb = Image.open(io.BytesIO(raw["image"])).convert("RGB")
        alpha = Image.open(io.BytesIO(doc.extract_image(raw["smask"])["image"])).convert("L")
        alpha = alpha.point(lambda a: 0 if a < 6 else (255 if a > 250 else a))  # JPEG noise of the soft mask
        rgb.putalpha(alpha)
        box = alpha.point(lambda a: 255 if a > 8 else 0).getbbox()
        rgb = rgb.crop((max(box[0] - 2, 0), max(box[1] - 2, 0), min(box[2] + 2, rgb.width), min(box[3] + 2, rgb.height)))
        rgb.thumbnail((side, side), Image.Resampling.LANCZOS)  # RGBA is resampled premultiplied: no halos
        target = dest / f"dinero-era{era}.webp"
        rgb.save(target, "WEBP", quality=82, method=6, alpha_quality=90)
        print(f"  img/{target.name}  {rgb.width} x {rgb.height}  {target.stat().st_size} B")
    return 2


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--pdf", required=True, help="path of SPA_Mistborn_Handbook.pdf (not stored in the repository)")
    ap.add_argument("--out", type=Path, default=Path(__file__).resolve().parents[2] / "src" / "assets" / "cosmere",
                    help="src/assets/cosmere folder (default: the one of this repository)")
    ap.add_argument("--only", default="glyphs,emblem,money", help="comma-separated steps: glyphs, emblem, money")
    ap.add_argument("--money-size", type=int, default=360, help="longest side in px of the WebP illustrations")
    args = ap.parse_args()
    steps = {s.strip() for s in args.only.split(",") if s.strip()}
    unknown = steps - {"glyphs", "emblem", "money"}
    if unknown:
        sys.exit(f"Unknown step(s): {', '.join(sorted(unknown))}")
    doc = pymupdf.open(args.pdf)
    if len(doc) != 416:
        print(f"warning: the PDF has {len(doc)} pages, the handbook has 416", file=sys.stderr)
    args.out.mkdir(parents=True, exist_ok=True)
    total = 0
    if "glyphs" in steps:
        print("Glyphs (PDF 411):")
        total += export_glyphs(doc, args.out)
    if "emblem" in steps:
        print("Emblem (PDF 410):")
        total += export_emblem(doc, args.out)
    if "money" in steps:
        print("Money (PDF 260):")
        total += export_money(doc, args.out, args.money_size)
    print(f"Done: {total} files in {args.out}")


if __name__ == "__main__":
    main()
