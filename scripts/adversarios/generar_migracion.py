"""Write the EF seed migration of the adversaries parsed by parse_adversarios.py.

Usage: python -I generar_migracion.py <adversarios.json> <Migration.cs> <ClassName> <world> <fuente> <resumen_origen>
The migration only inserts (InsertData, same columns as SeedAllNpcs plus World) and its Down deletes exactly those rows
(World + Source), so it is additive and reversible.
"""
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")
datos, salida, clase, mundo, fuente, origen = sys.argv[1:7]
filas = json.load(open(datos, encoding="utf-8"))

COLS = [
    "Name", "Source", "Tipo", "Ascendencia", "Level",
    "Fuerza", "Velocidad", "Intelecto", "Voluntad", "Discernimiento", "Presencia",
    "MaxHealth", "MaxConcentration", "MaxInvestiture",
    "Agilidad", "ArmasLigeras", "ArmasPesadas", "Atletismo", "Hurto", "Sigilo",
    "Deduccion", "Disciplina", "Intimidacion", "Manufactura", "Medicina", "Conocimiento",
    "Engano", "Liderazgo", "Percepcion", "Perspicacia", "Persuasion", "Supervivencia",
    "Talentos", "Apariencia", "Notas", "ImageUrl", "CreatedAt", "UpdatedAt", "World",
]


# Named adversaries whose ancestry is only in their description (El legado): NeBaal «kandra de la sexta generación», Azmine
# «humana de sangre koloss», Yunque «aceptó sus clavos koloss» (chapter 7); the hemalurgic creatures have no ancestry.
ASCENDENCIA = {
    "NeBaal": "Kandra",
    "Azmine Wilko": "Sangre koloss",
    "Yunque": "Koloss",
    "Bestia hemalúrgica": "Criatura hemalúrgica",
    "Monstruosidad hemalúrgica": "Criatura hemalúrgica",
}


def ascendencia(nombre: str) -> str:
    if nombre in ASCENDENCIA:
        return ASCENDENCIA[nombre]
    n = nombre.lower()
    if "kandra" in n:
        return "Kandra"
    if "sangre koloss" in n:
        return "Sangre koloss"
    if "koloss" in n:
        return "Koloss"
    if "espectro de la bruma" in n:
        return "Espectro de la bruma"
    if "quimera" in n:
        return "Quimera hemalúrgica"
    return "Humano"


cs = lambda s: json.dumps(s, ensure_ascii=False)  # a JSON string literal is a valid C# one (\" \\ \n)

lineas = [
    "using Microsoft.EntityFrameworkCore.Migrations;",
    "",
    "#nullable disable",
    "",
    "namespace Infrastructure.Migrations",
    "{",
    "    /// <summary>",
    f"    /// {origen}",
    "    /// Generated from the book by scripts/adversarios (web repo): skills hold the rank (total minus attribute), as in SeedAllNpcs;",
    "    /// defenses are not stored (10 + the two attributes), and a stat block whose printed defenses differ says so in a «Nota del",
    "    /// libro» at the top of its notes. Only inserts; Down deletes exactly these rows (World and Source).",
    "    /// </summary>",
    f"    public partial class {clase} : Migration",
    "    {",
    "        static readonly string[] Cols =",
    "        [",
    "            " + ",".join(cs(c) for c in COLS),
    "        ];",
    "",
    "        static readonly System.DateTime Ts = new(2026, 10, 8, 0, 0, 0, System.DateTimeKind.Utc);",
    "",
    "        /// <inheritdoc />",
    "        protected override void Up(MigrationBuilder migrationBuilder)",
    "        {",
]
for f in filas:
    valores = [
        cs(f["Name"]), cs(fuente), cs(f["Tipo"]), cs(ascendencia(f["Name"])), str(f["Level"]),
        *(str(f[k]) for k in ("Fuerza", "Velocidad", "Intelecto", "Voluntad", "Discernimiento", "Presencia")),
        *(str(f[k]) for k in ("MaxHealth", "MaxConcentration", "MaxInvestiture")),
        *(str(f[k]) for k in COLS[14:32]),
        cs(f["Talentos"]), cs(f["Apariencia"]), cs(f["Notas"]), "null", "Ts", "Ts", cs(mundo),
    ]
    lineas += [
        f"            // {f['Name']} (L.{f['libro']} / PDF {f['pdf']})",
        "            migrationBuilder.InsertData(\"GlobalNpcs\", Cols, new object[]",
        "            {",
        "                " + ", ".join(valores[:5]) + ",",
        "                " + ", ".join(valores[5:11]) + ",  " + ", ".join(valores[11:14]) + ",",
        "                " + ", ".join(valores[14:20]) + ",  " + ", ".join(valores[20:26]) + ",  " + ", ".join(valores[26:32]) + ",",
        "                " + valores[32] + ",",
        "                " + valores[33] + ",",
        "                " + valores[34] + ",",
        "                " + ", ".join(valores[35:]),
        "            });",
        "",
    ]
lineas[-1:] = [
    "        }",
    "",
    "        /// <inheritdoc />",
    "        protected override void Down(MigrationBuilder migrationBuilder)",
    "        {",
    f"            migrationBuilder.Sql(@\"DELETE FROM \"\"GlobalNpcs\"\" WHERE \"\"World\"\" = '{mundo}' AND \"\"Source\"\" = '{fuente}';\");",
    "        }",
    "    }",
    "}",
    "",
]
open(salida, "w", encoding="utf-8-sig", newline="\r\n").write("\n".join(lineas))
print(f"{len(filas)} filas → {salida}")
