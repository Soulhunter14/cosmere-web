"""
Genera los mapas limpios de Caminapiedras (webp) que sirve la app desde public/maps/caminapiedras/.

Fuentes (material con copyright, fuera del repo; ver ../CLAUDE.md, «Caminapiedras»):
  - Maps-and-Tokens-Stonewalkers.pdf: losetas tamaño carta de cada mapa de batalla, que aquí se montan borde con borde
    (no se solapan) y, cuando hace falta, se giran. Las recetas están en docs/caminapiedras/mapas-y-fichas.md.
  - ARTO007_Caminapiedras aventura_high.pdf (Manual de la partida): de él se recortan los dos mapas con rótulos en
    castellano que el PDF de mapas no trae rotulados (2.1 campamento de guerra de los Kholin y 3.1 la ciudad de Rathalas).

Uso, desde cosmere-web/:
  python -I scripts/caminapiedras/generar_mapas.py <Maps-and-Tokens.pdf> <ARTO007 aventura.pdf> public/maps/caminapiedras
         [--hoja hoja.png] [--solo mapa-1-1,mapa-4-1]

Requiere PyMuPDF (pymupdf) y Pillow con soporte webp.
"""
import argparse
import os
import sys
import warnings

warnings.filterwarnings("ignore")
import pymupdf as fitz  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

CALIDAD_WEBP = 82

# Orden de las losetas por filas; «giro» en grados: 90 = a la izquierda (antihorario), -90 = a la derecha; «lado» es el
# lado largo en píxeles de la imagen final.
MAPAS = [
    dict(nombre="mapa-1-1", titulo="Mapa 1.1: Atrapados en el crem", losetas=[7, 8], cols=2, giro=0, lado=3000),
    dict(nombre="mapa-1-emboscada", titulo="La caravana en marcha (emboscada en el camino; sin número en el libro)",
         losetas=[9, 10], cols=2, giro=0, lado=3000),
    dict(nombre="mapa-1-2", titulo="Mapa 1.2: La caravana", losetas=[11, 12], cols=1, giro=0, lado=3000),
    dict(nombre="mapa-1-3", titulo="Mapa 1.3: Batalla con Veth", losetas=[13], cols=1, giro=0, lado=2400),
    dict(nombre="mapa-2-1", titulo="Mapa 2.1: Campamento de guerra de los Kholin (Manual, con rótulos)",
         manual=41, recorte="pagina", lado=2600),
    dict(nombre="mapa-2-2", titulo="Mapa 2.2: El complejo del templo (rótulos en inglés)", losetas=[31], cols=1, giro=0, lado=2400),
    dict(nombre="mapa-2-3", titulo="Mapa 2.3: Interior del monasterio (16 losetas)",
         losetas=list(range(15, 31)), cols=4, giro=0, lado=4000),
    dict(nombre="mapa-3-1", titulo="Mapa 3.1: La ciudad de Rathalas (Manual, con rótulos A1–A8)",
         manual=65, recorte="imagen", lado=2600),
    dict(nombre="mapa-3-2", titulo="Mapa 3.2: El suelo del cañón", losetas=[49], cols=1, giro=0, lado=2400),
    dict(nombre="mapa-3-3", titulo="Mapa 3.3: La prisión de Rathalas", losetas=[33, 34], cols=2, giro=0, lado=3000),
    dict(nombre="mapa-3-4", titulo="Mapa 3.4: El salón y la plataforma", losetas=[35, 36, 37, 38], cols=2, giro=0, lado=3000),
    dict(nombre="mapa-3-5", titulo="Mapa 3.5: El salón y la plataforma caída", losetas=[41, 42, 39, 40], cols=2, giro=0, lado=3000),
    dict(nombre="mapa-4-1", titulo="Mapa 4.1: Zanjas de Hexi", losetas=[45, 46, 48, 47], cols=2, giro=90, lado=3000),
    dict(nombre="mapa-4-2", titulo="Mapa 4.2: El valle de Cultivación", losetas=[50, 51], cols=2, giro=-90, lado=3000),
]


def pixmap_a_imagen(pix):
    modo = "RGBA" if pix.alpha else "RGB"
    return Image.frombytes(modo, (pix.width, pix.height), pix.samples).convert("RGB")


def montar_losetas(maps_pdf, paginas, cols, giro, lado):
    """Monta las losetas (orden por filas) en una página temporal, la gira si hace falta y la renderiza al lado largo pedido."""
    r0 = maps_pdf[paginas[0] - 1].rect
    tw, th = r0.width, r0.height
    filas = (len(paginas) + cols - 1) // cols
    rejilla_doc = fitz.open()
    rejilla = rejilla_doc.new_page(width=cols * tw, height=filas * th)
    for k, pno in enumerate(paginas):
        x0, y0 = (k % cols) * tw, (k // cols) * th
        rejilla.show_pdf_page(fitz.Rect(x0, y0, x0 + tw, y0 + th), maps_pdf, pno - 1)
    if giro % 180:
        final_doc = fitz.open()
        final = final_doc.new_page(width=rejilla.rect.height, height=rejilla.rect.width)
        final.show_pdf_page(final.rect, rejilla_doc, 0, rotate=giro)
    else:
        final = rejilla
    escala = lado / max(final.rect.width, final.rect.height)
    return pixmap_a_imagen(final.get_pixmap(matrix=fitz.Matrix(escala, escala)))


def recortar_manual(manual_pdf, pno, recorte, lado):
    """Recorta el mapa de una página del Manual: la página entera o la imagen más grande que no es el fondo."""
    page = manual_pdf[pno - 1]
    area = page.rect.width * page.rect.height
    imagenes = [(fitz.Rect(i["bbox"]), i["width"]) for i in page.get_image_info()]
    if recorte == "pagina":
        clip = page.rect
        candidatas = [(r, w) for r, w in imagenes if r.width * r.height > 0.8 * area]
    else:
        candidatas = [(r, w) for r, w in imagenes if 0.05 * area < r.width * r.height < 0.8 * area]
        candidatas.sort(key=lambda rw: -rw[0].width * rw[0].height)
        clip = candidatas[0][0] & page.rect
    # No ampliar por encima de la resolución nativa de la imagen incrustada
    nativo_px = candidatas[0][1] if candidatas else None
    lado_max = max(clip.width, clip.height)
    if nativo_px:
        lado = min(lado, int(nativo_px * lado_max / max(candidatas[0][0].width, 1)))
    escala = lado / lado_max
    return pixmap_a_imagen(page.get_pixmap(matrix=fitz.Matrix(escala, escala), clip=clip))


def hoja_de_contacto(ficheros, salida):
    cols, tw, th, lbl, pad = 4, 320, 330, 30, 8
    filas = (len(ficheros) + cols - 1) // cols
    hoja = Image.new("RGB", (cols * (tw + pad) + pad, filas * (th + lbl + pad) + pad), "white")
    dr = ImageDraw.Draw(hoja)
    for k, (nombre, ruta) in enumerate(ficheros):
        im = Image.open(ruta).convert("RGB")
        ancho, alto = im.size
        im.thumbnail((tw, th))
        x0, y0 = pad + (k % cols) * (tw + pad), pad + (k // cols) * (th + lbl + pad)
        dr.text((x0 + 2, y0), nombre, fill=(180, 0, 0))
        dr.text((x0 + 2, y0 + 13), f"{ancho}x{alto}  {os.path.getsize(ruta) // 1024} KB", fill=(60, 60, 60))
        hoja.paste(im, (x0, y0 + lbl))
    hoja.save(salida)
    return salida


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("maps_pdf")
    ap.add_argument("manual_pdf")
    ap.add_argument("salida")
    ap.add_argument("--hoja", help="PNG con miniaturas de todos los mapas generados, para revisarlos")
    ap.add_argument("--solo", help="nombres separados por comas; por defecto se generan todos")
    args = ap.parse_args()

    maps_pdf = fitz.open(args.maps_pdf)
    manual_pdf = fitz.open(args.manual_pdf)
    os.makedirs(args.salida, exist_ok=True)
    solo = set(args.solo.split(",")) if args.solo else None

    generados = []
    for m in MAPAS:
        if solo and m["nombre"] not in solo:
            continue
        if "losetas" in m:
            im = montar_losetas(maps_pdf, m["losetas"], m["cols"], m["giro"], m["lado"])
        else:
            im = recortar_manual(manual_pdf, m["manual"], m["recorte"], m["lado"])
        ruta = os.path.join(args.salida, m["nombre"] + ".webp")
        im.save(ruta, "WEBP", quality=CALIDAD_WEBP, method=6)
        print(f"{m['nombre']:18s} {im.size[0]}x{im.size[1]}  {os.path.getsize(ruta) // 1024:5d} KB  {m['titulo']}")
        generados.append((m["nombre"], ruta))

    if args.hoja and generados:
        print("hoja:", hoja_de_contacto(generados, args.hoja))
    return 0


if __name__ == "__main__":
    sys.exit(main())
