"""Parses the whole «Caminapiedras» adventure PDF (introduction, chapters 1-7 and appendices) into structured text.

Usage (from cosmere-web):
    python -I scripts/aventura/parsear_caminapiedras.py <adventure.pdf> <json dir> <markdown dir>

Output, one file per part (intro, cap1 … cap7, apendice-a, apendice-b):
- `<json dir>/<parte>.json`: the part as a flat list of nodes in reading order (headings, paragraphs, read-aloud boxes, lists,
  side boxes, tables, maps), each with its PDF page. Base for future features.
- `<markdown dir>/<parte>.md`: the same text in the import format of the director's «Guion» (docs/pantalla-director/guion-formato.md):
  one `##` scene per heading, `>` read-aloud, `### PNJ` for «Cómo interpretar a…», tables as lists, maps as images.

The book is copyrighted: both outputs stay out of git (cosmere-api/Resources/pdfextract and docs/pantalla-director/guiones are
ignored). Only this script is versioned.

How the book is laid out (PyMuPDF spans): headings in Plantin 17.5 / 15.5 / 13.5 in blue; body text Plantin 9; read-aloud boxes
in Laski Sans 9; side boxes («Cómo interpretar a…», «Camino a la Radianza») titled in Laski Sans Bold 11; tables titled in Laski
Sans Bold 11.5 with a white 8 pt header row; bullets with the ZapfDingbats «◆»; action and plot-die glyphs in CosmereDingbats;
map labels in white over the map image; chapter openers with a 55 pt drop cap.
"""
import json
import os
import re
import sys

import pymupdf

# Book page = PDF page - 4
DESPLAZAMIENTO = 4
PARTES = [
    ('intro', 'Introducción', None, 5, 21),
    ('cap1', 'Honor más allá de la tormenta', 1, 22, 38),
    ('cap2', 'Tras la pista de Doliente', 2, 39, 60),
    ('cap3', 'La ciudad quemada', 3, 61, 80),
    ('cap4', 'Hacia el valle', 4, 81, 96),
    ('cap5', 'La Guerra de los Ochenta', 5, 97, 108),
    ('cap6', 'Al borde del cambio', 6, 109, 120),
    ('cap7', 'Lo que fue y lo que podría ser', 7, 121, 135),
    ('apendice-a', 'Apéndice A: Adversarios', None, 136, 170),
    ('apendice-b', 'Apéndice B: Objetos', None, 171, 172),
]
# Maps already published by the web (public/maps/map_p<PDF page>.webp)
MAPAS_PUBLICOS = {29, 32, 35, 41, 57, 59, 65, 66, 70, 76, 77, 87, 93}

AZUL = 0x1E3C60
BLANCO = 0xFFFFFF
GRIS_CREDITOS = 0x8B98A6
# CosmereDingbats glyphs inside the text: actions and reaction (in tables «O» and «C» are plot-die results)
GLIFOS = {'1': '1', '2': '2', '3': '3', 'r': 'reacción', 'f': 'acción gratuita', 'O': 'Oportunidad', 'C': 'Complicación'}


def es_negrita(fuente: str) -> bool:
    return 'Bold' in fuente or 'Black' in fuente or 'Semibol' in fuente


def es_cursiva(fuente: str) -> bool:
    return 'Italic' in fuente


class Span:
    def __init__(self, s: dict):
        self.texto = s['text']
        self.fuente = s['font']
        self.tam = round(s['size'], 1)
        self.color = s['color']
        self.bbox = s['bbox']

    @property
    def x0(self):
        return self.bbox[0]

    @property
    def y0(self):
        return self.bbox[1]


class Linea:
    def __init__(self, spans: list, bbox):
        self.spans = spans
        self.bbox = bbox


def dentro(bbox, rect) -> bool:
    cx = (bbox[0] + bbox[2]) / 2
    cy = (bbox[1] + bbox[3]) / 2
    return rect.x0 <= cx <= rect.x1 and rect.y0 <= cy <= rect.y1


def lineas_de_pagina(pagina: pymupdf.Page):
    """Text lines of a page without footer, art credits, pull quotes and map labels (white text over a map image)"""
    ancho, alto = pagina.rect.width, pagina.rect.height
    imagenes = []
    for info in pagina.get_image_info():
        r = pymupdf.Rect(info['bbox'])
        if r.width * r.height < ancho * alto * 0.85:
            imagenes.append(r)
    bloques = []
    for b in pagina.get_text('dict')['blocks']:
        if b['type'] != 0:
            continue
        lineas = []
        for l in b['lines']:
            spans = []
            for s in l['spans']:
                if not s['text'].strip() and not spans:
                    continue
                sp = Span(s)
                if sp.bbox[1] > alto * 0.955:                      # running footer and page number
                    continue
                if sp.color == GRIS_CREDITOS or sp.fuente.startswith('EmilyAustin'):
                    continue
                if sp.color == BLANCO and sp.tam < 40 and any(dentro(sp.bbox, r) for r in imagenes):
                    continue
                spans.append(sp)
            if any(s.texto.strip() for s in spans):
                lineas.append(Linea(spans, l['bbox']))
        if lineas:
            x0 = min(l.bbox[0] for l in lineas)
            y0 = min(l.bbox[1] for l in lineas)
            x1 = max(l.bbox[2] for l in lineas)
            y1 = max(l.bbox[3] for l in lineas)
            bloques.append({'bbox': (x0, y0, x1, y1), 'lineas': lineas})
    return bloques


def texto_linea(linea: Linea, en_tabla=False) -> str:
    """The text of a line with **bold**, *italic* and the glyphs written out"""
    partes = []
    for s in linea.spans:
        t = s.texto
        if s.fuente.startswith('CosmereDingbats'):
            t = ''.join(GLIFOS.get(ch, ch) if not (en_tabla and ch in 'OC') else ch for ch in t)
        if s.fuente.startswith('ZapfDingbats'):
            continue
        if t.strip() and es_negrita(s.fuente) and not s.fuente.startswith('Laski'):
            t = marcar(t, '**')
        elif t.strip() and es_cursiva(s.fuente):
            t = marcar(t, '*')
        partes.append(t)
    return re.sub(r'\*\*\s*\*\*', '', ''.join(partes))


def marcar(t: str, m: str) -> str:
    pre = t[:len(t) - len(t.lstrip())]
    post = t[len(t.rstrip()):]
    return f'{pre}{m}{t.strip()}{m}{post}'


def unir(lineas: list) -> str:
    """Joins wrapped lines: a word cut with «-» at the end of a line is rejoined"""
    texto = ''
    for l in lineas:
        l = l.strip()
        if not l:
            continue
        if texto.endswith('-') and l[:1].islower() and texto[-2:-1].isalpha():
            texto = texto[:-1] + l
        else:
            texto = f'{texto} {l}' if texto else l
    # A word cut at the end of a line inside a cell or a box («permanen- temente»)
    texto = re.sub(r'(?<=[a-záéíóúñü])- (?=[a-záéíóúñü])', '', texto)
    texto = re.sub(r'\(\s+', '(', texto)
    texto = re.sub(r'\s+\)', ')', texto)
    texto = re.sub(r'\*\*(\s*)\*\*', r'\1', texto)
    return re.sub(r'\s{2,}', ' ', texto).strip()


def primera(bloque):
    for l in bloque['lineas']:
        for s in l.spans:
            if s.texto.strip() and not s.fuente.startswith('ZapfDingbats'):
                return s
    return None


def clase_linea(linea: Linea) -> str:
    """What a line is by its first span: a heading, a box title, Laski text (read-aloud or box body) or body text"""
    s = primera({'lineas': [linea]})
    if s is None:
        return 'cuerpo'
    if s.tam >= 40:
        return 'capital'
    if s.fuente.startswith('Plantin') and s.color == AZUL and s.tam >= 13:
        return f'titulo{s.tam}'
    if s.fuente.startswith('Laski') and es_negrita(s.fuente) and s.tam >= 10.5:
        return 'caja'
    if s.fuente.startswith('Laski'):
        return 'laski'
    return 'cuerpo'


def segmentar(bloque):
    """PyMuPDF often puts a heading and the paragraph under it in one block: split it into runs of lines of the same kind"""
    trozos = []
    for l in bloque['lineas']:
        clase = clase_linea(l)
        if trozos and trozos[-1][0] == clase:
            trozos[-1][1].append(l)
        else:
            trozos.append((clase, [l]))
    salida = []
    for _, lineas in trozos:
        x0 = min(l.bbox[0] for l in lineas)
        y0 = min(l.bbox[1] for l in lineas)
        x1 = max(l.bbox[2] for l in lineas)
        y1 = max(l.bbox[3] for l in lineas)
        salida.append({'bbox': (x0, y0, x1, y1), 'lineas': lineas})
    return salida


# ── Tables ───────────────────────────────────────────────────────────────────

def extraer_tablas(bloques, ancho):
    """Finds tables by their white 8 pt header row; returns the tables and removes their text from the page blocks"""
    cabeceras = []
    for b in bloques:
        for l in b['lineas']:
            for s in l.spans:
                if s.color == BLANCO and es_negrita(s.fuente) and 7.5 <= s.tam <= 8.6 and s.texto.strip():
                    cabeceras.append(s)
    filas_cab = []
    for s in sorted(cabeceras, key=lambda s: (round(s.y0), s.x0)):
        if filas_cab and abs(filas_cab[-1][0].y0 - s.y0) < 3:
            filas_cab[-1].append(s)
        else:
            filas_cab.append([s])
    tablas = []
    usados = set()
    for fila in filas_cab:
        cols = sorted(fila, key=lambda s: s.x0)
        x_min = cols[0].x0 - 8
        if cols[-1].x0 > ancho / 2 and cols[0].x0 < ancho / 2:
            x_max = ancho - 25
        elif cols[0].x0 >= ancho / 2:
            x_max = ancho - 25
        else:
            x_max = ancho / 2 - 4
        y_cab = cols[0].y0
        # Title: a bold Laski line of 10.5 pt or more just above the header
        titulo = ''
        for b in bloques:
            p = primera(b)
            if p and p.fuente.startswith('Laski') and es_negrita(p.fuente) and p.tam >= 10.5 \
                    and x_min - 10 <= b['bbox'][0] <= x_max and 0 < y_cab - b['bbox'][3] < 40:
                titulo = unir([texto_linea(l) for l in b['lineas']])
                usados.add(id(b))
        # Body: the spans under the header inside its width, until text that is not a table cell
        cuerpo = []
        for b in bloques:
            for l in b['lineas']:
                for s in l.spans:
                    cx = (s.bbox[0] + s.bbox[2]) / 2
                    if s.y0 > y_cab + 2 and x_min <= cx <= x_max:
                        cuerpo.append(s)
        cuerpo.sort(key=lambda s: (s.y0, s.x0))
        fin = None
        for s in cuerpo:
            if s.texto.strip() and (s.tam > 8.6 and not s.fuente.startswith('CosmereDingbats')):
                fin = s.y0
                break
        cuerpo = [s for s in cuerpo if fin is None or s.y0 < fin]
        xs = [c.x0 for c in cols]
        filas = []
        lineas_vis = []
        for s in cuerpo:
            if lineas_vis and abs(lineas_vis[-1][0].y0 - s.y0) < 2.5:
                lineas_vis[-1].append(s)
            else:
                lineas_vis.append([s])
        for lv in lineas_vis:
            celdas = [''] * len(cols)
            for s in lv:
                i = max([k for k, x in enumerate(xs) if s.x0 >= x - 6] or [0])
                t = s.texto
                if s.fuente.startswith('CosmereDingbats'):
                    t = ''.join(GLIFOS.get(ch, ch) if ch not in 'OC' else ch for ch in t)
                celdas[i] += t
            # A new row starts when the first cell of the previous one is complete (a glyph, or text ending a sentence or quote)
            previa = unir(filas[-1][0]) if filas else ''
            completa = not filas or len(previa) <= 2 or re.search(r'[.”»!?)]\**$', previa)
            if celdas[0].strip() and completa:
                filas.append([[c] for c in celdas])
            else:
                for i, c in enumerate(celdas):
                    filas[-1][i].append(c)
        ids_cuerpo = {id(s) for s in cuerpo} | {id(c) for c in cols}
        tablas.append({
            'tipo': 'tabla',
            'titulo': titulo,
            'columnas': [unir([c.texto]) for c in cols],
            'filas': [[unir(c) for c in f] for f in filas if any(unir(c) for c in f)],
            'y': y_cab - 15 if titulo else y_cab,
            'x': x_min + 8,
            'ancho_completo': x_max - x_min > ancho * 0.6,
        })
        usados |= ids_cuerpo
    # Remove what the tables used from the blocks
    limpios = []
    for b in bloques:
        if id(b) in usados:
            continue
        lineas = []
        for l in b['lineas']:
            spans = [s for s in l.spans if id(s) not in usados]
            if any(s.texto.strip() for s in spans):
                lineas.append(Linea(spans, l.bbox))
        if lineas:
            limpios.append({**b, 'lineas': lineas})
    return tablas, limpios


# ── Reading order and classification ─────────────────────────────────────────

def ordenar(elementos, ancho):
    """Left column, then right column; wide elements go with the left column by height"""
    def columna(e):
        x0, x1 = e['bbox'][0], e['bbox'][2]
        if x1 - x0 > ancho * 0.6:
            return 0
        return 0 if (x0 + x1) / 2 < ancho / 2 else 1
    return sorted(elementos, key=lambda e: (columna(e), e['bbox'][1], e['bbox'][0]))


def nodos_de_parte(doc, desde, hasta):
    nodos = []
    caja = None          # open side box: its node
    capital = ''         # drop cap waiting for its paragraph
    for n in range(desde, hasta + 1):
        pagina = doc[n - 1]
        ancho = pagina.rect.width
        bloques = lineas_de_pagina(pagina)
        tablas, bloques = extraer_tablas(bloques, ancho)
        bloques = [t for b in bloques for t in segmentar(b)]
        elementos = [{'bbox': b['bbox'], 'bloque': b} for b in bloques]
        for t in tablas:
            x1 = ancho - 25 if t['ancho_completo'] or t['x'] >= ancho / 2 else ancho / 2
            elementos.append({'bbox': (t['x'], t['y'], x1, t['y'] + 1), 'tabla': t})
        for e in ordenar(elementos, ancho):
            if 'tabla' in e:
                t = {k: v for k, v in e['tabla'].items() if k not in ('y', 'x', 'ancho_completo')}
                t['pdf'] = n
                nodos.append(t)
                caja = None
                continue
            b = e['bloque']
            p = primera(b)
            if p is None:
                continue
            texto = unir([texto_linea(l) for l in b['lineas']])
            fuente, tam = p.fuente, p.tam
            if tam >= 40:                                            # drop cap
                capital = texto.strip()
                continue
            if fuente.startswith('Penumbra') or (fuente.startswith('Laski') and tam >= 15.5):
                continue                                             # chapter opener title
            if fuente.startswith('Plantin') and p.color == AZUL and tam >= 13:
                nivel = 1 if tam >= 17 else 2 if tam >= 15 else 3
                nodos.append({'tipo': 'titulo', 'nivel': nivel, 'texto': texto.replace('**', ''), 'pdf': n})
                caja = None
                continue
            if fuente.startswith('Laski') and es_negrita(fuente) and tam >= 10.5:
                limpio = texto.replace('**', '')
                if re.match(r'^Mapa\s', limpio):
                    nodos.append({'tipo': 'mapa', 'titulo': re.sub(r'(\d)\.\s+(\d)', r'\1.\2', limpio), 'pdf': n})
                    caja = None
                    continue
                caja = {'tipo': 'recuadro', 'titulo': limpio, 'pdf': n, 'contenido': []}
                nodos.append(caja)
                continue
            if fuente.startswith('Laski') and caja is not None:
                caja['contenido'].extend(parrafos(b, 'parrafo'))
                continue
            if fuente.startswith('Laski') and tam <= 9.5:
                for x in parrafos(b, 'leer'):
                    x['pdf'] = n
                    nodos.append(x)
                continue
            caja = None
            for x in parrafos(b, 'parrafo'):
                if capital and x['tipo'] == 'parrafo':
                    x['texto'] = capital + x['texto']
                    capital = ''
                x['pdf'] = n
                nodos.append(x)
    return fusionar_continuaciones(nodos)


def parrafos(bloque, tipo):
    """Paragraphs and bullet items of a block: an indented first line or a «◆» starts a new one"""
    salida = []
    x_base = min(l.bbox[0] for l in bloque['lineas'])
    actual = None
    for l in bloque['lineas']:
        vineta = any(s.fuente.startswith('ZapfDingbats') for s in l.spans[:2])
        texto = texto_linea(l)
        sangrada = l.bbox[0] > x_base + 7
        if vineta:
            actual = {'tipo': 'item', 'lineas': [texto]}
            salida.append(actual)
        elif actual is None or (sangrada and actual['tipo'] != 'item'):
            actual = {'tipo': tipo, 'lineas': [texto]}
            salida.append(actual)
        else:
            actual['lineas'].append(texto)
    resultado = []
    for x in salida:
        t = unir(x['lineas'])
        if not t:
            continue
        if x['tipo'] == 'item':
            if resultado and resultado[-1]['tipo'] == 'lista':
                resultado[-1]['items'].append(t)
            else:
                resultado.append({'tipo': 'lista', 'items': [t]})
        else:
            resultado.append({'tipo': x['tipo'], 'texto': t})
    return resultado


def fusionar_continuaciones(nodos):
    """A paragraph cut by a column or page break (it ends without a full stop and the next one starts in lowercase) is one"""
    salida = []
    for nodo in nodos:
        if nodo['tipo'] == 'recuadro':
            nodo['contenido'] = fusionar_continuaciones(nodo['contenido'])
        prev = salida[-1] if salida else None
        if prev and nodo['tipo'] == prev['tipo'] and nodo['tipo'] in ('parrafo', 'leer') \
                and not re.search(r'[.:!?»”)]\**$', prev['texto']) and re.match(r'^\**[a-záéíóúñü]', nodo['texto']):
            if prev['texto'].endswith('-') and prev['texto'][-2:-1].isalpha():
                prev['texto'] = prev['texto'][:-1] + nodo['texto']
            else:
                prev['texto'] += ' ' + nodo['texto']
            continue
        if prev and nodo['tipo'] == 'lista' and prev['tipo'] == 'lista':
            prev['items'].extend(nodo['items'])
            continue
        salida.append(nodo)
    return salida


# ── Markdown in the «Guion» format ───────────────────────────────────────────

def md_de_parte(clave, titulo, numero, nodos):
    grupo = f'Capítulo {numero} · {titulo}' if numero else titulo
    lineas = ['---', f'guion: Caminapiedras · {grupo} (texto del libro)', '---', '', f'# {grupo}', '']
    escenas = []
    actual = None
    padre = ''
    vistos = {}

    def nueva(t, pdf):
        nonlocal actual
        base = t
        if base in vistos:
            vistos[base] += 1
            t = f'{base} · {padre}' if padre and padre != base else f'{base} ({vistos[base]})'
        else:
            vistos[base] = 1
        actual = {'titulo': t, 'pdf': pdf, 'imagenes': [], 'cuerpo': [], 'combate': False}
        escenas.append(actual)

    for nodo in nodos:
        if nodo['tipo'] == 'titulo' and nodo['nivel'] <= 2:
            if nodo['nivel'] == 1:
                padre = nodo['texto']
            nueva(nodo['texto'], nodo['pdf'])
            continue
        if actual is None:
            nueva('Introducción' if numero else titulo, nodo.get('pdf', 0))
        c = actual['cuerpo']
        if nodo['tipo'] == 'titulo':
            c += ['', f"### {nodo['texto']}"]
            if re.search(r'campo de batalla', nodo['texto'], re.I):
                actual['combate'] = True
        elif nodo['tipo'] == 'parrafo':
            c += ['', nodo['texto']]
        elif nodo['tipo'] == 'leer':
            c += ['', f"> {nodo['texto']}"]
        elif nodo['tipo'] == 'lista':
            c += [''] + [f'- {i}' for i in nodo['items']]
        elif nodo['tipo'] == 'mapa':
            if nodo['pdf'] in MAPAS_PUBLICOS:
                actual['imagenes'].append(f"imagen: /maps/map_p{nodo['pdf']}.webp | {nodo['titulo']}")
            c += ['', f"*{nodo['titulo']} (PDF {nodo['pdf']}).*"]
        elif nodo['tipo'] == 'recuadro':
            m = re.match(r'^Cómo interpretar a(?:l)?\s+(.+)$', nodo['titulo'])
            textos = [x['texto'] if x['tipo'] != 'lista' else ' '.join(x['items']) for x in nodo['contenido']]
            if m:
                c += ['', '### PNJ', f"- **{m.group(1)}**: {' '.join(textos)}"]
            else:
                c += ['', f"### {nodo['titulo']}"] + sum((['', t] for t in textos), [])
        elif nodo['tipo'] == 'tabla':
            c += ['', f"### {nodo['titulo'] or 'Tabla'}"]
            cols = nodo['columnas']
            for f in nodo['filas']:
                if len(cols) <= 2:
                    c.append(f"- **{f[0]}**: {f[1] if len(f) > 1 else ''}".rstrip(': '))
                else:
                    resto = ' · '.join(f'{cols[i]}: {f[i]}' for i in range(1, len(cols)) if i < len(f) and f[i])
                    c.append(f'- **{f[0]}** · {resto}')
    for e in escenas:
        cabeza = [f"## {e['titulo']}", f"tipo: {'combate' if e['combate'] else 'narrativa'}",
                  f"fuente: Caminapiedras L.{e['pdf'] - DESPLAZAMIENTO} / PDF {e['pdf']}", f'grupo: {grupo}'] + e['imagenes']
        lineas += cabeza + e['cuerpo'] + ['']
    return '\n'.join(lineas).replace('\n\n\n', '\n\n') + '\n'


def main(pdf: str, dir_json: str, dir_md: str) -> None:
    sys.stdout.reconfigure(encoding='utf-8')
    doc = pymupdf.open(pdf)
    os.makedirs(dir_json, exist_ok=True)
    os.makedirs(dir_md, exist_ok=True)
    for clave, titulo, numero, desde, hasta in PARTES:
        nodos = nodos_de_parte(doc, desde, hasta)
        datos = {'libro': 'Caminapiedras', 'parte': clave, 'titulo': titulo, 'numero': numero,
                 'pdf': [desde, hasta], 'paginas': [desde - DESPLAZAMIENTO, hasta - DESPLAZAMIENTO], 'nodos': nodos}
        with open(os.path.join(dir_json, f'{clave}.json'), 'w', encoding='utf-8') as f:
            json.dump(datos, f, ensure_ascii=False, indent=1)
        with open(os.path.join(dir_md, f'{clave}.md'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(md_de_parte(clave, titulo, numero, nodos))
        cuenta = {}
        for nodo in nodos:
            cuenta[nodo['tipo']] = cuenta.get(nodo['tipo'], 0) + 1
        print(clave, f'PDF {desde}-{hasta}', cuenta)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3])
