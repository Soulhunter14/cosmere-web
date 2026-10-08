"""Extract a PDF to text once: one page per form feed (same convention as mistborn_flow.txt), plus its outline.

Usage: python -I extraer_pdf.py <pdf> <salida.txt>
Prints the outline (level, title, PDF page) and how many adversary stat-block headers the text has.
"""
import re
import sys

import pymupdf

sys.stdout.reconfigure(encoding="utf-8")  # -I ignores PYTHONIOENCODING; the Windows console default (cp1252) breaks on « »
pdf, salida = sys.argv[1], sys.argv[2]
doc = pymupdf.open(pdf)
print(f"{pdf}: {doc.page_count} pages")
for nivel, titulo, pagina in doc.get_toc():
    if nivel <= 2:
        print(f"  {'  ' * (nivel - 1)}{titulo}  -> PDF {pagina}")

paginas = [p.get_text("text") for p in doc]
with open(salida, "w", encoding="utf-8") as f:
    f.write("\f".join(paginas))

cabecera = re.compile(r"(Secuaz|Rival|Jefe) de rango \d+")
hits = [(i + 1, m.group(0)) for i, t in enumerate(paginas) for m in cabecera.finditer(t)]
print(f"stat-block headers: {len(hits)}")
por_pagina = {}
for pag, h in hits:
    por_pagina.setdefault(pag, []).append(h)
print("pages with headers:", ", ".join(f"{p}({len(v)})" for p, v in sorted(por_pagina.items())))
