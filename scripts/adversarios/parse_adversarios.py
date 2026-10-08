"""Parse the adversary stat blocks of a Cosmere RPG book (Spanish edition) from its flow text into GlobalNpc rows.

Usage: python -I parse_adversarios.py <flow.txt> <pdf> <desde_pdf> <hasta_pdf> <fuente> <offset_libro> <salida.json> <informe.txt>
  flow.txt      one page per form feed (extraer_pdf.py)
  pdf           the book, only to read its outline (sections and their start pages)
  desde/hasta   PDF page range of the adversary chapter
  fuente        value of GlobalNpc.Source («Guía del mundo»)
  offset_libro  PDF page - book page (to cite «L.<libro> / PDF <pdf>»)

Every number is validated: the printed defenses must be 10 + the two attributes of their column, the health must sit inside its
printed range, and every skill name must be one of the 18 of the book. The report lists any block that fails.
"""
import json
import re
import sys
import unicodedata

import pymupdf

sys.stdout.reconfigure(encoding="utf-8")
flow, pdf, desde, hasta, fuente, offset, salida, informe = sys.argv[1:9]
desde, hasta, offset = int(desde), int(hasta), int(offset)

# Book skill table (src/worlds/skills.ts, HABILIDADES_COSMERE): label → (GlobalNpc field, attribute)
HABILIDADES = {
    "Agilidad": ("Agilidad", "vel"), "Armamento ligero": ("ArmasLigeras", "vel"), "Armamento pesado": ("ArmasPesadas", "fue"),
    "Atletismo": ("Atletismo", "fue"), "Hurto": ("Hurto", "vel"), "Sigilo": ("Sigilo", "vel"),
    "Deducción": ("Deduccion", "int"), "Disciplina": ("Disciplina", "vol"), "Intimidación": ("Intimidacion", "vol"),
    "Manufactura": ("Manufactura", "int"), "Medicina": ("Medicina", "int"), "Saber": ("Conocimiento", "int"),
    "Engaño": ("Engano", "pre"), "Liderazgo": ("Liderazgo", "pre"), "Percepción": ("Percepcion", "dis"),
    "Perspicacia": ("Perspicacia", "dis"), "Persuasión": ("Persuasion", "pre"), "Supervivencia": ("Supervivencia", "dis"),
}

paginas = open(flow, encoding="utf-8").read().split("\f")


def limpiar(texto: str) -> str:
    """Drop the running footer («Capítulo 8: Adversarios» and the page number, only at the end of the page: the attribute
    table also has one number per line) and art credits (lines in capitals, anywhere)."""
    lineas = texto.replace("\u2212", "-").replace("\u2009", " ").replace("\u00a0", " ")
    # Action costs: the Guía's font gives digits, El legado's gives «▶» (1 action) and «▷» (free): both become digits
    # The reaction is «r», except once in El legado (PDF 222, Kwylliam's «Amistad instantánea»): «R» + en space
    lineas = lineas.replace("\u25b6", "1").replace("\u25b7", "0").replace("R\u2002", "r ").split("\n")
    pie = r"(?:Cap[ií]tulo \d+|Ap[ée]ndice [A-Z])\s*:.*"  # «Capítulo 8: Adversarios» (Guía) · «Apéndice A: Adversarios» (El legado)
    while lineas and (not lineas[-1].strip() or re.fullmatch(r"\d{1,3}|" + pie, lineas[-1].strip())):
        lineas.pop()
    fuera = []
    for linea in lineas:
        l = linea.strip()
        if re.fullmatch(pie, l):
            continue
        letras = [ch for ch in l if ch.isalpha()]
        if len(letras) >= 6 and all(ch.isupper() for ch in letras) and not re.match(r"(ERA|Era)\s*\d", l):
            continue  # «STEVE PRESCOTT Y DARKO STANOVICH»
        fuera.append(linea.rstrip())
    return "\n".join(fuera)


def unir(texto: str) -> str:
    """Lines of a paragraph into one line (the extraction breaks every printed line). A word hyphenated at the end of a line
    («ban-» / «das», «senso-» / «rial») is joined back."""
    t = re.sub(r"([a-záéíóúñ])-[ \t]*\n[ \t]*([a-záéíóúñ])", r"\1\2", texto)
    t = re.sub(r"[ \t]*\n[ \t]*", " ", t)
    return re.sub(r"\s{2,}", " ", t).strip()


def normal(s: str) -> str:
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower().strip()


# Sections of the chapter from the outline (title, start page): description and tactics belong to a section
doc = pymupdf.open(pdf)
entradas = [
    (re.sub(r"\s+(ERA|Era)\s*\d.*$", "", t.replace("\n", " ")).strip(), p, n)
    for n, t, p in doc.get_toc()
    if desde <= p <= hasta and n >= 2 and not re.match(r"(Cómo usar|Módulos)", t)
]
secciones = [(t, p) for t, p, _ in entradas]
# Outline level of each entry: a sub-entry («Variantes de aspirantes…», «Caridus», «Zane») belongs to its parent, whose pages
# run until the next entry of its own level
niveles = [n for _, _, n in entradas]

CAB = re.compile(r"^(Secuaz|Rival|Jefe) de rango\s*(\d+)\s*[–-]\s*(.+?)\s*$", re.M)
# A tactics sidebar heading: «Tácticas del koloss», «Tácticas de disrupción»… a whole line with no full stop (the trait
# «Tácticas defensivas. El mataneblino…» is not one)
TACT = re.compile(r"^T[áa]cticas d[^.\n]*$", re.M)
sin_era = lambda l: re.sub(r"\s+(ERA|Era)\s*\d.*$", "", l).strip()
ETIQUETAS = r"(Salud|Concentración|Investidura|Desvío|Movimiento|Sentidos|Inmunidades|Idiomas|Habilidades [^:]{3,40})\s*:"
# Headings of a stat block: «Rasgos:» / «Acciones:» (Guía del mundo), «Rasgos» / «rasgos» / «Acciones» on their own line (El legado)
RASGOS = re.compile(r"(?mi)^\s*rasgos:?(?=\s|$)")
ACCIONES = re.compile(r"(?mi)^\s*acciones:?(?=\s|$)")
OPORTUNIDADES = re.compile(r"(?mi)^\s*oportunidades y complicaciones\s*$")
TITULOS = {normal(t) for t, _ in secciones}


def continuacion(texto: str) -> str:
    """Start of the next page when a stat block runs over (El legado: «Jefe de forajidos» has its actions overleaf): up to the
    first heading that belongs to something else (tactics sidebar, section title, the name line of another stat block)."""
    cortes = [m.start() for m in TACT.finditer(texto)]
    cab = CAB.search(texto)
    if cab:
        antes = texto[: cab.start()].rstrip("\n")
        cortes.append(antes.rfind("\n") if "\n" in antes else 0)
    pos = 0
    for linea in texto.split("\n"):
        if normal(sin_era(linea)) in TITULOS:
            cortes.append(pos)
            break
        pos += len(linea) + 1
    return texto[: min(cortes + [len(texto)])]


filas, problemas = [], []
for n in range(desde, hasta + 1):
    texto = limpiar(paginas[n - 1])
    cabeceras = list(CAB.finditer(texto))
    for i, m in enumerate(cabeceras):
        antes = texto[: m.start()].rstrip("\n").split("\n")
        nombre = next((l.strip() for l in reversed(antes) if l.strip()), "?")
        fin = cabeceras[i + 1].start() if i + 1 < len(cabeceras) else len(texto)
        bloque = texto[m.end() : fin]
        if i + 1 < len(cabeceras):  # the next block's name line belongs to it
            bloque = bloque[: bloque.rstrip("\n").rfind("\n")]
        tact = TACT.search(bloque)
        if tact:  # a tactics sidebar printed after the stat block: not part of it (sections collect them below)
            bloque = bloque[: tact.start()]
        elif i + 1 == len(cabeceras) and not ACCIONES.search(bloque) and n < hasta:
            # The last block of the page has no actions yet: they are overleaf
            bloque += "\n" + continuacion(limpiar(paginas[n]))

        nivel, rango, tipo = m.group(1), int(m.group(2)), m.group(3).strip()
        avisos = []

        # Attributes and printed defenses: fue def vel int def vol dis def pre
        tabla = re.search(r"\bpre\b\s+((?:-?\d+\s+){8}-?\d+)", bloque)
        if not tabla:
            problemas.append(f"PDF {n} {nombre}: sin tabla de atributos")
            continue
        fue, df, vel, int_, dc, vol, dis, de, pre = map(int, tabla.group(1).split())
        attr = {"fue": fue, "vel": vel, "int": int_, "vol": vol, "dis": dis, "pre": pre}
        for etiqueta, impreso, calculado in (("física", df, 10 + fue + vel), ("cognitiva", dc, 10 + int_ + vol), ("espiritual", de, 10 + dis + pre)):
            if impreso != calculado:
                avisos.append(f"defensa {etiqueta} impresa {impreso} ≠ 10 + atributos = {calculado}")

        cuerpo = bloque[tabla.end():]
        # A boss box «Oportunidades y complicaciones» closes the block (El legado): its two lines go to the notes
        m_o = OPORTUNIDADES.search(cuerpo)
        oportunidades = ""
        if m_o:
            oportunidades = unir(cuerpo[m_o.end():])
            cuerpo = cuerpo[: m_o.start()]
        m_r = RASGOS.search(cuerpo)
        m_a = ACCIONES.search(cuerpo)
        rasgos_i, rasgos_f = (m_r.start(), m_r.end()) if m_r else (-1, -1)
        acciones_i, acciones_f = (m_a.start(), m_a.end()) if m_a else (-1, -1)
        cab_fin = min(x for x in (rasgos_i, acciones_i, len(cuerpo)) if x >= 0)
        campos_txt = unir(cuerpo[:cab_fin])
        campos = {}
        for c in re.finditer(ETIQUETAS + r"\s*(.*?)(?=" + ETIQUETAS + r"|$)", campos_txt):
            campos[c.group(1)] = c.group(2).strip().rstrip(".")

        salud = re.match(r"(\d+)\s*\((\d+)\s*a\s*(\d+)\)", campos.get("Salud", ""))
        if not salud:
            problemas.append(f"PDF {n} {nombre}: salud sin formato «N (a a b)»: {campos.get('Salud')!r}")
            continue
        hp, hp_min, hp_max = map(int, salud.groups())
        if not hp_min <= hp <= hp_max:
            avisos.append(f"salud {hp} fuera de {hp_min}-{hp_max}")
        conc = int(re.match(r"\d+", campos.get("Concentración", "0")).group(0))
        inv = int(re.match(r"\d+", campos.get("Investidura", "0")).group(0))

        rangos = {campo: 0 for campo, _ in HABILIDADES.values()}
        artes = []
        for etiqueta, valor in campos.items():
            if not etiqueta.startswith("Habilidades"):
                continue
            if etiqueta in ("Habilidades físicas", "Habilidades cognitivas", "Habilidades espirituales"):
                for h in re.finditer(r"([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [a-záéíóúñ]+)?)\s*\+(\d+)", valor):
                    if h.group(1) not in HABILIDADES:
                        avisos.append(f"habilidad desconocida {h.group(1)!r}")
                        continue
                    campo, a = HABILIDADES[h.group(1)]
                    rangos[campo] = int(h.group(2)) - attr[a]
                    if rangos[campo] < 0:
                        avisos.append(f"{h.group(1)} con rango negativo ({h.group(2)} - {attr[a]})")
            else:
                artes.append(f"{etiqueta.replace('Habilidades de ', '').capitalize()}: {valor}")

        rasgos = unir(cuerpo[rasgos_f : acciones_i if acciones_i > rasgos_i else len(cuerpo)]) if rasgos_i >= 0 else ""
        acciones = unir(cuerpo[acciones_f:]) if acciones_i >= 0 else ""
        # One trait per line, «Nombre: descripción» (the detail page bolds the name): a short capitalised phrase ending in «. »
        # (a trait name has no comma: «Cuando es derrotado, tira el dado de trama.» is a sentence, not a trait)
        rasgos = re.sub(r"(?<=[.)\]])\s+(?=[A-ZÁÉÍÓÚÑ][^.:,]{2,45}?(?:\s\([^)]{1,40}\))?\.\s)", "\n", rasgos)
        rasgos = "\n".join(re.sub(r"^([^.:,\n]{2,45}?(?:\s\([^)]{1,40}\))?)\.\s", r"\1: ", l) for l in rasgos.split("\n"))
        # One action per line: they start with their cost (1, 2, 3, 0 or r for a reaction) before a capitalised name. Not after
        # an era tag: «Acometida: Arco largo. ERA 1 Ataque +5…» is one action of a weapon that only exists in Era 1
        acciones = re.sub(r"(?<!ERA)(?<!Era)\s(?=(?:[0-3]|r)\s+[A-ZÁÉÍÓÚÑ])", "\n", acciones).strip()
        # Stretches whose cost glyphs did not come out as text (some pages lose the action ones and keep the «r» of reactions):
        # split before «Acometida:» and before a short action title («Granada (2 usos).», «Quemar hierro.», «Tirón de hierro
        # (Coste: …).») that follows a full stop. Weapon traits («Perforante:», «Cargada [6]:») end in a colon and stay put
        trozos = []
        for linea in acciones.split("\n"):
            if linea and not re.match(r"(?:[0-3]|r)\s", linea):
                antes = linea
                linea = re.sub(r"(?<=\.)\s+(?=Acometida:)", "\n", linea)
                linea = re.sub(r"(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [a-záéíóúñ/]+){0,3}(?: \([^)]{1,60}\))?\.\s)", "\n", linea)
                if linea != antes:
                    avisos.append("acciones sin icono de coste en el texto: separadas por su título")
            trozos.append(linea)
        acciones = "\n".join(trozos)

        notas = []
        for etiqueta in ("Desvío", "Movimiento", "Sentidos", "Inmunidades", "Idiomas"):
            if etiqueta in campos:
                notas.append(f"{etiqueta}: {campos[etiqueta]}.")
        notas += [f"{a}." for a in artes]
        if acciones:
            notas.append(acciones)
        if oportunidades:  # «Oportunidad. Un enemigo puede…» / «Complicación. La DJ puede…» → one line each, «Nombre: …»
            for linea in re.sub(r"\s+(?=Complicación\.)", "\n", oportunidades).split("\n"):
                notas.append(re.sub(r"^(Oportunidad|Complicación)\.\s*", r"\1: ", linea.strip()))

        filas.append({
            "pdf": n, "libro": n - offset, "Name": nombre, "Source": fuente,
            "Tipo": f"{nivel} Rango {rango} – {tipo}", "Level": rango,
            "Fuerza": fue, "Velocidad": vel, "Intelecto": int_, "Voluntad": vol, "Discernimiento": dis, "Presencia": pre,
            "MaxHealth": hp, "MaxConcentration": conc, "MaxInvestiture": inv, **rangos,
            "Talentos": rasgos, "Notas": "\n".join(notas), "avisos": avisos,
            "defensas_libro": (df, dc, de) if (df, dc, de) != (10 + fue + vel, 10 + int_ + vol, 10 + dis + pre) else None,
            "defensas_calc": (10 + fue + vel, 10 + int_ + vol, 10 + dis + pre),
        })


def hasta_corte(texto: str) -> str:
    """Text of a description or a tactics sidebar: up to the next heading (another tactics sidebar, the name line of a stat block,
    or a section title: in El legado the description of an adversary comes right after its tactics, under its title)."""
    cortes = [m.start() for m in TACT.finditer(texto)]
    cab = CAB.search(texto)
    if cab:
        antes = texto[: cab.start()].rstrip("\n")
        cortes.append(antes.rfind("\n") if "\n" in antes else 0)
    pos = 0
    for linea in texto.split("\n"):
        if pos > 0 and normal(sin_era(linea)) in TITULOS:
            cortes.append(pos - 1)
            break
        pos += len(linea) + 1
    return texto[: min(cortes + [len(texto)])]


# Description and tactics of each section (all its pages). The layout sometimes prints a stat block inside the pages of another
# section (the «Vigilante de la ley» of «Agentes de la ley» sits after the «Aristócrata»), so both go by name, not by page:
# a tactics sidebar goes to the block of the same name («Tácticas del vigilante de la ley»), else to the blocks of its section
# whose name contains it («Tácticas de los koloss» → the three koloss), else to the whole section («Tácticas de disrupción»)
descripciones = {}
for k, (titulo, inicio) in enumerate(secciones):
    siguiente = next((secciones[j][1] for j in range(k + 1, len(secciones)) if niveles[j] <= niveles[k]), hasta + 1)
    fin = max(inicio, siguiente - 1)
    de_seccion = [f for f in filas if inicio <= f["pdf"] <= fin]
    desc = ""
    for n in range(inicio, fin + 1):
        texto = limpiar(paginas[n - 1])
        if not desc:
            lineas = texto.split("\n")
            # The name line of a stat block repeats the title («Alguacil» right above «Secuaz de rango 1…»): never the title
            nombres_de_perfil = {j for j in range(len(lineas) - 1) if CAB.match(lineas[j + 1].strip())}
            pos = None
            for j, l in enumerate(lineas):
                if j in nombres_de_perfil:
                    continue
                if normal(sin_era(l)) == normal(titulo):
                    pos = j
                    break
                # A title broken over two lines («Protector del» / «clan koloss Era 2»)
                if j + 1 < len(lineas) and normal(sin_era(f"{l.strip()} {lineas[j + 1].strip()}")) == normal(titulo):
                    pos = j + 1
                    break
            if pos is not None:
                desc = unir(hasta_corte("\n".join(lineas[pos + 1 :])))
        for t in TACT.finditer(texto):
            cuerpo_t = unir(hasta_corte(texto[t.end() :]))
            if not cuerpo_t:
                continue
            objetivo = normal(re.sub(r"^T[áa]cticas de(?:l| la| los| las)?\s+", "", t.group(0).strip()))
            raiz = re.sub(r"s$", "", objetivo)
            exactos = [f for f in filas if normal(f["Name"]) == objetivo]
            # «Tácticas del mataneblino» also serves «Mataneblino de Élite» (same section, name starting the same)
            variantes = [f for f in de_seccion if f not in exactos and re.match(re.escape(objetivo) + r"\W", normal(f["Name"]))] if exactos else []
            destino = exactos + variantes \
                or [f for f in de_seccion if raiz and raiz in normal(f["Name"])] \
                or de_seccion
            texto_t = f"{t.group(0).strip()}: {cuerpo_t}"
            for f in destino:
                # Two outline entries can start on the same page («Informador» and «Jefe de forajidos»): a sidebar counts once
                if texto_t not in f.setdefault("tacticas", []):
                    f["tacticas"].append(texto_t)
    if len(desc) > 900:
        desc = desc[:900].rsplit(". ", 1)[0] + "."
    descripciones[titulo] = (desc, inicio, fin)

palabras = lambda s: set(re.findall(r"[a-z]{5,}", normal(s)))

for f in filas:
    nombre = normal(f["Name"])
    primera = nombre.split(" ")[0]
    # 0. The section the block is printed in, when its title shares a word with the name («Informador ojo de estaño de Conrad»
    #    belongs to «Empleados de Conrad», not to «Informador»)
    en_pagina = next((d for t, (d, i, fi) in descripciones.items() if d and i <= f["pdf"] <= fi and palabras(t) & palabras(f["Name"])), None)
    # 1. The longest section title inside the name wins: «Oficial de sangre koloss» is its own section, not «Koloss»
    por_titulo = sorted(((len(t), d) for t, (d, _, _) in descripciones.items() if d and (normal(t) in nombre or nombre in normal(t))), reverse=True)
    elegida = en_pagina \
        or (por_titulo[0][1] if por_titulo else None) \
        or next((d for t, (d, _, _) in descripciones.items() if d and len(primera) >= 5 and primera in normal(d)[:300]), None) \
        or next((d for t, (d, i, fi) in descripciones.items() if d and i <= f["pdf"] <= fi), "")
    f["Apariencia"] = elegida

for f in filas:
    if f.get("defensas_libro"):
        (lf, lc, le), (cf, cc, ce) = f["defensas_libro"], f["defensas_calc"]
        f["Notas"] = (f"Nota del libro: el perfil imprime las defensas física {lf}, cognitiva {lc} y espiritual {le}; "
                      f"con 10 + atributos serían {cf}, {cc} y {ce}.\n") + f["Notas"]
    for t in f.pop("tacticas", []):
        f["Notas"] += f"\n{t}"
    f["Notas"] += f"\nFuente: {f['Source']}, L.{f['libro']} / PDF {f['pdf']}."
    f.setdefault("Apariencia", "")

json.dump(filas, open(salida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
with open(informe, "w", encoding="utf-8") as out:
    out.write(f"perfiles: {len(filas)}\n")
    for p in problemas:
        out.write(f"PROBLEMA {p}\n")
    for f in filas:
        estado = "OK" if not f["avisos"] else "AVISO " + "; ".join(f["avisos"])
        out.write(f"PDF {f['pdf']:>3} · {f['Name']:<32} · {f['Tipo']:<40} · salud {f['MaxHealth']:>3} · {estado}\n")
print(f"{len(filas)} perfiles, {len(problemas)} problemas, {sum(1 for f in filas if f['avisos'])} con avisos")
