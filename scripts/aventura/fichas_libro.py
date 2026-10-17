"""Fichas de adversario tal como las imprime el libro: recorta de un PDF la caja de cada ficha, la de sus tácticas y la ilustración
del personaje, como WebP, para subirlas al catálogo de adversarios (GM → NPCs → «Subir fichas del libro»).

Las imágenes son páginas e ilustraciones del libro, con derechos de autor: se quedan en local, fuera de git, y solo las sube el
director a su servidor. En el repositorio solo está este script.

Lee la maqueta de las fichas de Cosmere (Nacidos de la bruma y Caminapiedras la comparten):
- Una ficha es una caja blanca, de una o dos columnas, que empieza por el nombre y la línea «Rival/Secuaz/Jefe de rango…».
  Una caja «<Nombre> (continuación)» se pega debajo de la suya. Una ficha impresa sin caja se recorta con el rectángulo del
  perfil (`manuales`).
- Las tácticas son las cajas grises «Tácticas de…». Van con la ficha de su nombre o, si son de varias («Tácticas de los
  koloss»), con las fichas cercanas que comparten sus palabras; una variante sin tácticas propias toma las de su base.
- El retrato es la ilustración del personaje, compuesta solo con sus capas de imagen (sin el texto, las cajas ni los adornos que
  se repiten por el libro), sobre fondo transparente. Va con la ficha cuyo nombre lleva en su pie; si no, con la de las tácticas
  de su página, con la ficha de su página o con la de la página de enfrente. `retratos` del perfil fija la página de un
  personaje, o None para dejarlo sin retrato.

Cada imagen se llama `<nombre>.<libro>.webp`, `<nombre>.<libro>.tacticas.webp` y `<nombre>.<libro>.retrato.webp`: la app la casa
por nombre con el catálogo y, si el adversario sale en dos libros, se queda con la del libro de su `source`. `indice.json` lista
lo recortado. Con `--revision <png>`, además, una hoja con todos los retratos y su personaje, para repasarlos.

Uso: python -I scripts/aventura/fichas_libro.py <legado|guia|caminapiedras> <pdf> <carpeta de salida> [--revision <png>]
"""
import collections
import colorsys
import io
import json
import os
import re
import sys
import unicodedata

import pymupdf
from PIL import Image, ImageDraw

PERFILES = {
    # El legado de los nacidos de la bruma: apéndice A, «Adversarios» (PDF 192-242)
    'legado': {'paginas': (185, 250), 'manuales': {}, 'retratos': {}},
    # Guía del mundo de Nacidos de la bruma: capítulo 8, «Adversarios» (PDF 223-269); de la 271 en adelante van los módulos de
    # rasgos y acciones, que no son fichas
    'guia': {
        'paginas': (215, 270),
        'manuales': {'Agente del grupo': (224, (36, 40, 594, 556))},
        # The three koloss share the illustration of the group (two stat blocks on one page); the old one has its own. Ojos de
        # Hierro's is too dark for the colour test
        'retratos': {
            'Koloss neófito': (246, (0, 120, 612, 746)), 'Koloss veterano': (246, (0, 120, 612, 746)),
            'Koloss anciano': (247, (0, 20, 490, 746)), 'Ojos de Hierro': (259, (247, 0, 612, 792)),
        },
    },
    # Caminapiedras: apéndice A, «Adversarios» (PDF 136-170)
    'caminapiedras': {
        'paginas': (130, 172),
        'manuales': {},
        # The chull is drawn in Shallan's notebook on the page before; the creature on its page is the whitespine of the next one.
        # The shadow fanatic's illustration is too dim for the colour test
        'retratos': {
            'Chull': (145, (100, 250, 470, 610)), 'Espinablanca joven': 146, 'Fanático en forma sombría': (149, (150, 300, 600, 760)),
        },
    },
}
DPI = 200
CALIDAD = 82
RETRATO_LADO = 1100
RANGO = re.compile(r'\b(Secuaz|Rival|Jefe)\s+de\s+rango\b', re.I)
TACTICAS = re.compile(r'^t[aá]cticas\s+(?:de\s+los|de\s+las|de\s+la|del|de)\s+', re.I)
VACIAS = {'de', 'del', 'la', 'las', 'los', 'el', 'y', 'una', 'un', 'en'}


def slug(texto):
    t = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def palabras(texto):
    return {p for p in slug(texto).split('-') if p and p not in VACIAS}


def titulo_de(pg, r):
    """The box's heading: its first lines in the font and size of the first one (a tactics heading can take two lines)"""
    d = pg.get_text('dict', clip=pymupdf.Rect(r.x0, r.y0, r.x1, min(r.y1, r.y0 + 70)))
    lineas = [ln for b in d['blocks'] for ln in b.get('lines', []) if any(s['text'].strip() for s in ln['spans'])]
    if not lineas:
        return '', ''
    primero = next(s for s in lineas[0]['spans'] if s['text'].strip())
    partes, resto = [], ''
    for ln in lineas:
        s = next(s for s in ln['spans'] if s['text'].strip())
        if s['font'] != primero['font'] or abs(s['size'] - primero['size']) > 0.3:
            resto = ''.join(x['text'] for x in ln['spans']).strip()
            break
        partes.append(''.join(x['text'] for x in ln['spans']).strip())
    return re.sub(r'\s+', ' ', ' '.join(partes)).strip(), resto


def cajas(pg):
    """The page's stat-block, continuation and tactics boxes, in reading order: (kind, rect, title)"""
    vistas, res = set(), []
    for d in pg.get_drawings():
        r, f = d['rect'], d.get('fill')
        if not f or r.width < 180 or r.width > 560 or r.height < 50:
            continue
        clave = tuple(round(v) for v in r)
        if clave in vistas:
            continue
        vistas.add(clave)
        blanca = all(v > 0.97 for v in f)
        gris = all(0.8 < v < 0.95 for v in f)
        if not (blanca or gris):
            continue
        titulo, siguiente = titulo_de(pg, r)
        if blanca and RANGO.search(siguiente):
            res.append(('ficha', r, titulo))
        elif blanca and titulo.endswith('(continuación)'):
            res.append(('continuacion', r, titulo[:-len('(continuación)')].strip()))
        elif gris and TACTICAS.match(titulo):
            res.append(('tacticas', r, TACTICAS.sub('', titulo).strip()))
    # Reading order: left column before right, top before bottom (a two-column box counts as left)
    return sorted(res, key=lambda c: (c[1].x0 > 305, c[1].y0))


def recorte(doc, pagina, r):
    pix = doc[pagina - 1].get_pixmap(dpi=DPI, clip=r)
    return Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')


def apilar(imagenes):
    """Several pieces of one stat block, one under the other on white"""
    if len(imagenes) == 1:
        return imagenes[0]
    ancho = max(i.width for i in imagenes)
    hueco = DPI // 12
    lienzo = Image.new('RGB', (ancho, sum(i.height for i in imagenes) + hueco * (len(imagenes) - 1)), 'white')
    y = 0
    for i in imagenes:
        lienzo.paste(i, (0, y))
        y += i.height + hueco
    return lienzo


# ── Portraits ────────────────────────────────────────────────────────────────

def capa(doc, xref, smask):
    """An image of the PDF with its soft mask, as RGBA"""
    pix = pymupdf.Pixmap(doc, xref)
    if pix.colorspace and pix.colorspace.n >= 4:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    if smask:
        try:
            pix = pymupdf.Pixmap(pix, pymupdf.Pixmap(doc, smask))
        except (RuntimeError, ValueError):
            pass
    return Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGBA')


def colorido(im):
    """
    How much of a layer is opaque, how saturated it is, how many hues it has (smoke is grey, a paint stroke one hue) and how
    light it is (a plain white box is light and colourless)
    """
    t = im.resize((48, 48))
    datos = t.get_flattened_data() if hasattr(t, 'get_flattened_data') else t.getdata()
    px = [p for p in datos if p[3] > 128]
    if len(px) < 40:
        return 0, 0, 0, 0
    sats, tonos, claros = [], collections.Counter(), []
    for r, g, b, _ in px:
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        sats.append(s * min(1, v * 2))
        claros.append(v)
        if s > 0.2 and v > 0.15:
            tonos[int(h * 12)] += 1
    return len(px) / (48 * 48), sum(sats) / len(sats), sum(1 for n in tonos.values() if n > len(px) * 0.03), sum(claros) / len(claros)


def capas_de(doc, pg, usos):
    """The image layers of a page that can be art: not repeated through the book (textures, ornaments) nor tiny"""
    smasks = {img[0]: img[1] for img in pg.get_images(full=True)}
    res = []
    for orden, i in enumerate(pg.get_image_info(xrefs=True)):
        x = i['xref']
        if not x or usos[x] >= 3 or i['width'] * i['height'] < 120 * 120:
            continue
        bbox = pymupdf.Rect(i['bbox'])
        dentro = bbox & pg.rect
        if dentro.is_empty or dentro.get_area() < 0.25 * bbox.get_area():
            continue
        im = capa(doc, x, smasks.get(x, 0))
        opaco, sat, tonos, claro = colorido(im)
        # A plain light box (paper, the back of a text box) is not art
        if opaco > 0.9 and sat < 0.05 and claro > 0.8:
            continue
        res.append({'orden': orden, 'bbox': bbox, 'im': im, 'opaco': opaco, 'sat': sat, 'tonos': tonos})
    return res


def ilustracion(doc, pg, usos, zona_fija=None):
    """
    The main illustration of a page: its most colourful layer and the layers drawn over or under it (a scene, smoke), leaving out
    a page-sized layer without colour (paper). With `zona_fija` (a profile's override), the layers inside that rectangle. None
    when it has none.
    """
    capas = capas_de(doc, pg, usos)
    if zona_fija:
        zona = pymupdf.Rect(zona_fija)
        juntas = [c for c in capas if (c['bbox'] & zona).get_area() > 0.2 * min(c['bbox'].get_area(), zona.get_area())]
        return {'zona': zona & pg.rect, 'capas': juntas} if juntas else None
    pagina = pg.rect.get_area()
    # Dim art (a night scene, a grey uniform) still has some colour; smoke and mist have none
    color = lambda c: c['sat'] > 0.07 and c['tonos'] >= 1
    capas = [c for c in capas if (c['bbox'] & pg.rect).get_area() < 0.6 * pagina or color(c)]
    figuras = [c for c in capas if color(c) and c['opaco'] > 0.15]
    if not figuras:
        return None
    principal = max(figuras, key=lambda c: c['opaco'] * c['bbox'].get_area() * (0.5 + c['sat']))
    zona = pymupdf.Rect(principal['bbox'])
    juntas = [c for c in capas if (c['bbox'] & zona).get_area() > 0.4 * min(c['bbox'].get_area(), zona.get_area())]
    for c in juntas:
        zona |= c['bbox']
    return {'zona': zona & pg.rect, 'capas': juntas}


def componer(il):
    """The illustration's layers in their drawing order on a transparent canvas, without its empty margins"""
    zona, escala = il['zona'], 150 / 72
    lienzo = Image.new('RGBA', (max(1, int(zona.width * escala)), max(1, int(zona.height * escala))), (0, 0, 0, 0))
    for c in il['capas']:
        r = c['bbox']
        tmp = Image.new('RGBA', lienzo.size, (0, 0, 0, 0))
        tmp.paste(c['im'].resize((max(1, int(r.width * escala)), max(1, int(r.height * escala)))),
                  (int((r.x0 - zona.x0) * escala), int((r.y0 - zona.y0) * escala)))
        lienzo = Image.alpha_composite(lienzo, tmp)
    caja = lienzo.getchannel('A').point(lambda a: 255 if a > 12 else 0).getbbox()
    if caja:
        lienzo = lienzo.crop(caja)
    lienzo.thumbnail((RETRATO_LADO, RETRATO_LADO))
    return lienzo


def asignar_retratos(doc, cfg, fichas, tacticas_de_pagina):
    """The portrait illustration of each stat block (slug → illustration, slug → page), by the rules of the module docstring"""
    usos = collections.Counter()
    for p in range(1, doc.page_count + 1):
        for x in {img[0] for img in doc[p - 1].get_images(full=True)}:
            usos[x] += 1
    ilus = {}
    for p in range(cfg['paginas'][0], min(cfg['paginas'][1], doc.page_count) + 1):
        il = ilustracion(doc, doc[p - 1], usos)
        if il:
            ilus[p] = il
    nombres = {slug(f['nombre']) for f in fichas}
    elegidas, paginas = {}, {}   # slug → illustration, slug → page
    vistas = set()               # illustrations already given (by page), or excluded by an override
    for nombre, valor in cfg['retratos'].items():
        s = slug(nombre)
        if valor is None:
            paginas[s] = None
            continue
        p, zona = (valor, None) if isinstance(valor, int) else valor
        il = ilustracion(doc, doc[p - 1], usos, zona) if zona or p not in ilus else ilus[p]
        if il:
            elegidas[s], paginas[s] = il, p
            vistas.add(p)
    libre = lambda s: s not in paginas

    def pie(p, zona):
        """
        Stat blocks a caption printed on the illustration names: lines that are a name («Lancero», «Maestro lancero»), or else
        the longest name inside a caption in capitals («TEDDY MORGENTHAX, UN JEFE DE FORAJIDOS»)
        """
        d = doc[p - 1].get_text('dict', clip=zona)
        lineas = [''.join(s['text'] for s in ln['spans']).strip() for b in d['blocks'] for ln in b.get('lines', [])]
        exactas = [slug(t) for t in lineas if slug(t) in nombres and libre(slug(t))]
        if exactas:
            return exactas
        grupos, actual = [], []
        for t in lineas + ['']:
            letras = [ch for ch in t if ch.isalpha()]
            if letras and sum(ch.isupper() for ch in letras) >= 0.8 * len(letras):
                actual.append(t)
            elif actual:
                grupos.append(f'-{slug(" ".join(actual))}-')
                actual = []
        dentro = [s for s in nombres if libre(s) and any(f'-{s}-' in g for g in grupos)]
        return [max(dentro, key=len)] if dentro else []

    def en_pagina(p, zona):
        """The stat block of the illustration's own page, the nearest one when there are several"""
        centro = ((zona.x0 + zona.x1) / 2, (zona.y0 + zona.y1) / 2)
        r = lambda f: f['piezas'][0][1]
        cerca = [f for f in fichas if f['pagina'] == p and libre(slug(f['nombre']))]
        return [slug(min(cerca, key=lambda f: abs((r(f).x0 + r(f).x1) / 2 - centro[0]) + abs((r(f).y0 + r(f).y1) / 2 - centro[1]))['nombre'])] if cerca else []

    def dar(duenos, p):
        for s in duenos:
            elegidas[s], paginas[s] = ilus[p], p

    # The sure ones first in the whole book (its caption, the tactics of its page, the stat block of its page); then, for the
    # illustrations left, the only stat block without a portrait on the facing page
    sueltas = []
    for p, il in sorted(ilus.items()):
        if p in vistas:
            continue
        duenos = pie(p, il['zona']) or [s for s in tacticas_de_pagina.get(p, []) if libre(s)][:1] or en_pagina(p, il['zona'])
        if duenos:
            dar(duenos, p)
        else:
            sueltas.append(p)
    for p in sueltas:
        for q in (p + 1, p - 1):
            vecinas = [f for f in fichas if f['pagina'] == q and libre(slug(f['nombre']))]
            if len(vecinas) == 1:
                dar([slug(vecinas[0]['nombre'])], p)
                break
    # A variant without an illustration of its own shares its base's («Quimera hemalúrgica, líder de manada»)
    for s in sorted(nombres):
        if libre(s):
            base = max((b for b in elegidas if s.startswith(f'{b}-')), key=len, default=None)
            if base:
                elegidas[s], paginas[s] = elegidas[base], paginas[base]
    return elegidas, {s: p for s, p in paginas.items() if p}


def hoja_revision(retratos, nombres, ruta):
    celdas = []
    for s, im in retratos:
        t = im.copy()
        t.thumbnail((200, 230))
        cel = Image.new('RGB', (210, 250), (210, 210, 210))
        cel.paste(t, ((210 - t.width) // 2, 0), t)
        ImageDraw.Draw(cel).text((4, 234), nombres[s][:32], fill='black')
        celdas.append(cel)
    cols = 8
    hoja = Image.new('RGB', (cols * 210, max(1, (len(celdas) + cols - 1) // cols) * 250), 'white')
    for i, c in enumerate(celdas):
        hoja.paste(c, ((i % cols) * 210, (i // cols) * 250))
    hoja.save(ruta)


def main():
    args = sys.argv[1:]
    revision = None
    if '--revision' in args:
        k = args.index('--revision')
        revision = args[k + 1]
        args = args[:k] + args[k + 2:]
    perfil, pdf, salida = args
    cfg = PERFILES[perfil]
    doc = pymupdf.open(pdf)
    os.makedirs(salida, exist_ok=True)
    fichas, tacticas = [], []   # fichas: {nombre, pagina, piezas: [(pagina, rect)]}; tacticas: (pagina, rect, nombre)
    for p in range(cfg['paginas'][0], min(cfg['paginas'][1], doc.page_count) + 1):
        for tipo, r, titulo in cajas(doc[p - 1]):
            if tipo == 'ficha':
                fichas.append({'nombre': titulo, 'pagina': p, 'piezas': [(p, r)]})
            elif tipo == 'continuacion':
                destino = next((f for f in reversed(fichas) if slug(f['nombre']) == slug(titulo)), None)
                if destino is None:
                    print(f'  ¿continuación sin ficha? p{p} «{titulo}»')
                else:
                    destino['piezas'].append((p, r))
            else:
                tacticas.append((p, r, titulo))
    for nombre, (p, rect) in cfg['manuales'].items():
        fichas.append({'nombre': nombre, 'pagina': p, 'piezas': [(p, pymupdf.Rect(*rect))]})

    # Tactics: the stat block of their name; else the nearby ones sharing their words («de los koloss»)
    asignadas = {}
    con_nombre = {slug(t[2]) for t in tacticas}
    for p, r, nombre in tacticas:
        exacta = [f for f in fichas if slug(f['nombre']) == slug(nombre)]
        if exacta:
            destinos = exacta
        else:
            cerca = [f for f in fichas if p - 1 <= f['pagina'] <= p + 2 and slug(f['nombre']) not in con_nombre]
            puntos = {id(f): len(palabras(nombre) & palabras(f['nombre'])) for f in cerca}
            mejor = max(puntos.values(), default=0)
            destinos = [f for f in cerca if mejor and puntos[id(f)] == mejor]
        if not destinos:
            print(f'  ¿tácticas sin ficha? p{p} «{nombre}»')
        for f in destinos:
            asignadas.setdefault(slug(f['nombre']), (p, r))
    # A variant shares its base's tactics («Tácticas del mataneblino» → «Mataneblino de élite»), when it has none of its own
    for f in fichas:
        if slug(f['nombre']) in asignadas:
            continue
        base = next(((p, r) for p, r, nombre in tacticas
                     if p - 1 <= f['pagina'] <= p + 2 and slug(f['nombre']).startswith(f'{slug(nombre)}-')), None)
        if base:
            asignadas[slug(f['nombre'])] = base

    tacticas_de_pagina = collections.defaultdict(list)
    for p, r, nombre in tacticas:
        tacticas_de_pagina[p] += [slug(f['nombre']) for f in fichas if asignadas.get(slug(f['nombre'])) == (p, r)]
    retratos, paginas_retrato = asignar_retratos(doc, cfg, fichas, tacticas_de_pagina)

    indice, revisados = [], []
    for f in fichas:
        s = slug(f['nombre'])
        base = f'{s}.{perfil}'
        imagen = apilar([recorte(doc, p, r) for p, r in f['piezas']])
        imagen.save(os.path.join(salida, f'{base}.webp'), 'WEBP', quality=CALIDAD, method=6)
        entrada = {'nombre': f['nombre'], 'pdf': f['pagina'], 'ficha': f'{base}.webp', 'tacticas': None, 'retrato': None}
        t = asignadas.get(s)
        if t:
            recorte(doc, *t).save(os.path.join(salida, f'{base}.tacticas.webp'), 'WEBP', quality=CALIDAD, method=6)
            entrada['tacticas'] = f'{base}.tacticas.webp'
        if s in retratos:
            im = componer(retratos[s])
            im.save(os.path.join(salida, f'{base}.retrato.webp'), 'WEBP', quality=CALIDAD, method=6)
            entrada['retrato'] = f'{base}.retrato.webp'
            entrada['retrato_pdf'] = paginas_retrato[s]
            revisados.append((s, im))
        indice.append(entrada)
    with open(os.path.join(salida, 'indice.json'), 'w', encoding='utf-8') as fh:
        json.dump(indice, fh, ensure_ascii=False, indent=2)
    if revision:
        hoja_revision(revisados, {slug(f['nombre']): f['nombre'] for f in fichas}, revision)
    print(f'{perfil}: {len(indice)} fichas, {sum(1 for e in indice if e["tacticas"])} con tácticas, '
          f'{sum(1 for e in indice if e["retrato"])} con retrato → {salida}')
    sin = [e['nombre'] for e in indice if not e['retrato']]
    if sin:
        print(f'  sin retrato: {", ".join(sin)}')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
