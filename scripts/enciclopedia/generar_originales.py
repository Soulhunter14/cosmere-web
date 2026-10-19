"""
Generates the «originales» of the encyclopedia: for every entry of the manifests `src/data/originales/<world>.json` (heroic paths,
metalborn paths, metallic arts…) it writes the original text of the book as Markdown (`<clave>.md`) and a mini-PDF with only
its pages (`<clave>.pdf`). The director uploads both from the encyclopedia page of the section («Originales del libro»).

The output is copyrighted material: write it OUTSIDE git (default: `cosmere-api/Resources/pdfextract/enciclopedia`, gitignored).

    python -I scripts/enciclopedia/generar_originales.py \
        --stormlight "../cosmere-api/Resources/CaminaPiedras/ART0001_MdAdlT_ESP_high.pdf" \
        --mistborn "C:/Users/xavie/Downloads/Español/SPA_Mistborn_Handbook.pdf" \
        [--out ../cosmere-api/Resources/pdfextract/enciclopedia] [--solo caminos-heroicos]

Needs PyMuPDF (`pip install pymupdf`). The mini-PDFs are recompressed (images at 150 ppp, JPEG 70; less if needed) so that
each one stays under MAX_PDF, the upload limit of the API (nginx accepts 4 MB per request).
"""
import argparse
import json
import os
import re
import sys

import pymupdf

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MANIFIESTOS = os.path.join(RAIZ, 'src', 'data', 'originales')
SALIDA = os.path.join(os.path.dirname(RAIZ), 'cosmere-api', 'Resources', 'pdfextract', 'enciclopedia')
MAX_PDF = 3_800_000
# (target dpi, JPEG quality): tried in order until the mini-PDF fits in MAX_PDF
COMPRESION = [(150, 70), (120, 65), (100, 60), (80, 55)]


def rangos(entrada):
    return [(a, b) for a, b in entrada['paginas']]


def paginas_libro(entrada, desfase):
    return ', '.join(f'{a - desfase}' if a == b else f'{a - desfase}-{b - desfase}' for a, b in rangos(entrada))


def paginas_pdf(entrada):
    return ', '.join(f'{a}' if a == b else f'{a}-{b}' for a, b in rangos(entrada))


# ── Mini-PDF ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────

def mini_pdf(src, entrada, destino):
    for dpi, calidad in COMPRESION:
        d = pymupdf.open()
        for a, b in rangos(entrada):
            d.insert_pdf(src, from_page=a - 1, to_page=b - 1)
        d.set_metadata({'title': entrada['titulo'], 'producer': 'CosmereAPP'})
        d.rewrite_images(dpi_threshold=dpi + 10, dpi_target=dpi, quality=calidad, lossy=True, lossless=True)
        d.save(destino, garbage=4, deflate=True, clean=True)
        d.close()
        if os.path.getsize(destino) <= MAX_PDF:
            return dpi
    raise SystemExit(f'{destino}: no cabe en {MAX_PDF} bytes ni con la compresión más alta')


# ── Text ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

ROTO = re.compile(r'(\w)-\n(\w)')


def limpiar(t):
    t = t.replace('\u00ad', '').replace('\ufffc', '').replace('\u200b', '')
    return re.sub(r'[ \t]+', ' ', t).strip()


def bloques_pagina(pagina):
    """The text blocks of a page in reading order: header and footer out, then column by column (left, right), top to bottom"""
    w, h = pagina.rect.width, pagina.rect.height
    mitad = w / 2
    salida = []
    for b in pagina.get_text('dict')['blocks']:
        if b.get('type') != 0:
            continue
        x0, y0, x1, y1 = b['bbox']
        if y1 < h * 0.045 or y0 > h * 0.93:  # running header, page number and chapter footer
            continue
        spans = [s for l in b['lines'] for s in l['spans'] if s['text'].strip()]
        if not spans:
            continue
        if max(s['size'] for s in spans) < 6:  # illustration credits and tiny labels
            continue
        if b['lines'] and all(abs(l['dir'][1]) > 0.5 for l in b['lines']):  # vertical text (artist credits)
            continue
        ancho = x1 - x0 > w * 0.6
        col = 0 if ancho or x0 < mitad - 10 else 1
        salida.append((0 if ancho and y0 < h * 0.3 else 1, col, y0, b))
    salida.sort(key=lambda t: (t[0], t[1], t[2]))
    return [t[3] for t in salida]


def unir(lineas):
    """Lines of one paragraph as a single line: words cut with a hyphen at the end of a line are joined again"""
    texto = ''
    for l in lineas:
        if texto.endswith('-') and re.match(r'[a-záéíóúñü]', l):
            texto = texto[:-1] + l
        else:
            texto = f'{texto} {l}' if texto else l
    texto = limpiar(texto)
    texto = re.sub(r'\*\*\s*\*\*', '', texto)
    return re.sub(r'\*\*(\S[^*]*?)\s+\*\*', r'**\1** ', texto).strip()


def texto_bloque(b, cuerpo):
    """A block as Markdown pieces: a heading for each run of lines bigger than the body (the small caps titles share the block
    with their first paragraph), and paragraphs with their bold runs (the labels «Espía.», «Prerrequisito:»…)"""
    piezas = []  # (kind, lines): kind 'h2' | 'h3' | 'p'
    for l in b['lines']:
        partes = []
        tam = 0
        for s in l['spans']:
            t = s['text']
            if not t.strip():
                partes.append(t)
                continue
            tam = max(tam, s['size'])
            negrita = bool(s['flags'] & 16) or 'Bold' in s['font'] or 'Semibold' in s['font']
            partes.append(f'**{t.strip()}** ' if negrita and s['size'] < cuerpo + 1.5 else t)
        linea = ''.join(partes).strip()
        if not linea:
            continue
        tipo = 'h2' if tam >= cuerpo + 7 else 'h3' if tam >= cuerpo + 1.5 else 'p'
        # A bold label at the start of a line opens a new paragraph (lists of the book with a hanging indent)
        nuevo = tipo == 'p' and linea.startswith('**') and piezas and piezas[-1][0] == 'p' and re.search(r'[.:]$', piezas[-1][1][-1].replace('**', ''))
        if piezas and piezas[-1][0] == tipo and not nuevo:
            piezas[-1][1].append(linea)
        else:
            piezas.append((tipo, [linea]))
    salida = []
    for tipo, lineas in piezas:
        texto = unir(lineas)
        if tipo != 'p':
            plano = texto.replace('**', '').strip()
            if len(plano) < 90:
                salida.append(('## ' if tipo == 'h2' else '### ') + plano)
                continue
        salida.append(texto)
    return [t for t in salida if t]


def tamano_cuerpo(doc, entrada):
    """The most frequent font size of the entry: the size of the body text"""
    cuenta = {}
    for a, b in rangos(entrada):
        for p in range(a - 1, b):
            for bl in doc[p].get_text('dict')['blocks']:
                for l in bl.get('lines', []):
                    for s in l['spans']:
                        k = round(s['size'], 1)
                        cuenta[k] = cuenta.get(k, 0) + len(s['text'])
    return max(cuenta, key=cuenta.get) if cuenta else 10


def markdown(doc, entrada, mundo, seccion, libro, desfase):
    cuerpo = tamano_cuerpo(doc, entrada)
    fuente = f'{libro}, L.{paginas_libro(entrada, desfase)} / PDF {paginas_pdf(entrada)}'
    salida = [
        '---',
        f'mundo: {mundo}',
        f'seccion: {seccion}',
        f'clave: {entrada["clave"]}',
        f'titulo: {entrada["titulo"]}',
        f'fuente: {fuente}',
        '---',
        '',
        f'# {entrada["titulo"]}',
        '',
    ]
    parrafos = []
    for a, b in rangos(entrada):
        for p in range(a - 1, b):
            parrafos.append(f'<!-- PDF {p + 1} · L.{p + 1 - desfase} -->')
            for bl in bloques_pagina(doc[p]):
                for t in texto_bloque(bl, cuerpo):
                    if parrafos and t == parrafos[-1]:
                        continue
                    # A paragraph cut by a column or page break goes on in the next block (no final stop and a lowercase start)
                    ultimo = next((i for i in range(len(parrafos) - 1, -1, -1) if not parrafos[i].startswith('<!--')), None)
                    previo = parrafos[ultimo] if ultimo is not None else ''
                    if (previo and not previo.startswith('#') and not t.startswith('#')
                            and not re.search(r'[.:!?»”)]\**$', previo) and re.match(r'[a-záéíóúñü(]', t)):
                        parrafos[ultimo] = previo[:-1] + t if previo.endswith('-') else f'{previo} {t}'
                    else:
                        parrafos.append(t)
    return '\n'.join(salida) + '\n\n'.join(parrafos).strip() + '\n'


# ── Main ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--stormlight', help='Manual del Archivo de las Tormentas (PDF)')
    ap.add_argument('--mistborn', help='Manual de Nacidos de la bruma (PDF)')
    ap.add_argument('--out', default=SALIDA)
    ap.add_argument('--solo', help='only this section (e.g. caminos-heroicos)')
    ap.add_argument('--sin-pdf', action='store_true', help='only the Markdown texts')
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')

    for mundo in ('stormlight', 'mistborn'):
        ruta = getattr(args, mundo)
        if not ruta:
            continue
        man = json.load(open(os.path.join(MANIFIESTOS, f'{mundo}.json'), encoding='utf-8'))
        src = pymupdf.open(ruta)
        for seccion, entradas in man['secciones'].items():
            if args.solo and seccion != args.solo:
                continue
            carpeta = os.path.join(args.out, mundo, seccion)
            os.makedirs(carpeta, exist_ok=True)
            for e in entradas:
                for a, b in rangos(e):
                    for p in range(a - 1, b):
                        if not src[p].get_text().strip():
                            print(f'  aviso: {mundo}/{seccion}/{e["clave"]}: la página PDF {p + 1} no tiene texto')
                md = markdown(src, e, mundo, seccion, man['libro'], man['desfase'])
                open(os.path.join(carpeta, f'{e["clave"]}.md'), 'w', encoding='utf-8').write(md)
                info = f'{len(md) // 1024} KB de texto'
                if not args.sin_pdf:
                    pdf = os.path.join(carpeta, f'{e["clave"]}.pdf')
                    dpi = mini_pdf(src, e, pdf)
                    info += f', PDF {os.path.getsize(pdf) // 1024} KB a {dpi} ppp'
                print(f'{mundo}/{seccion}/{e["clave"]}: PDF {paginas_pdf(e)} · {info}')


if __name__ == '__main__':
    main()
