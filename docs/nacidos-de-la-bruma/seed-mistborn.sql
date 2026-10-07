-- =====================================================================================================================
-- seed-mistborn.sql
-- Catálogo de «Nacidos de la Bruma» (Mistborn): opciones, armas, armaduras, equipo y viales del cap. 7 «Objetos»
-- (L.253-279 / PDF 259-285, con PDF = libro + 6). PostgreSQL. Anexo OBLIGATORIO de la tarea T00a.
--
-- Quién lo usa (copiar TAL CUAL la sección, sin reconstruirla):
--   · T39a  copia la sección «-- M3» en el Up de la migración AddWorldToCatalog, después de crear las columnas de §4.1.
--   · T40   copia la sección «-- M4» en la migración SeedMistbornCatalog (la guarda previa de ids 1001+ y el Down los escribe T40).
-- No colapsar los saltos de línea al copiar: los comentarios que empiezan por dos guiones llegan hasta el fin de línea.
-- En un string verbatim de C# hay que duplicar las comillas dobles de los identificadores. Ningún comentario ni literal las usa.
--
-- Origen de los datos
--   · Especificación propuesta-set-de-reglas-nacidos-de-la-bruma.md §4.1 (columnas) y §4.3 (M3, M4).
--   · Informe 07-delta-catalogo.md §2 (tablas del libro), §3 (rasgos), §4 (daño y alcances), §5.2-§5.3 (mapa de opciones e ids) y
--     §6 (contrato del seed). Peso, precio, dados y era de las 35 armas, 8 armaduras, 71 objetos y 13 viales se contrastaron
--     de nuevo con el texto del libro (SPA_Mistborn_Handbook.pdf, PDF 264-266, 268, 271, 273 y 275): sin diferencias.
--
-- Vocabulario: el informe 07 habla de RuleSet y de shared. Aquí la columna es World y el valor compartido es cosmere:
--   World vale stormlight, mistborn o cosmere (cosmere solo en CatalogOptions). Todo lo nuevo es mistborn.
--
-- Convenciones
--   · Pesos en kg. Precios en arquillas (ar). Era NULL = ambas eras. Los rangos del libro guardan el MÍNIMO en Weight y Price
--     y el rango completo va en Description (convención del seed original).
--   · GearItems.Price es NOT NULL (la entidad es double). En armas y armaduras, Price NULL = sin precio o solo recompensa.
--   · Los nombres no llevan el asterisco del libro (marca de objeto narrativo sin reglas): Arcón, no Arcón*.
--   · Cada fila lleva su página «L.<libro> / PDF <pdf>». Un comentario [inferido] marca lo que el informe 07 da como inferencia.
--   · Description: paráfrasis breves (informe 07 §2.4-§2.8, §3.2-§3.4 y §6.2), revisadas contra el texto del libro. Vacía si el
--     objeto no tiene reglas propias. Los rasgos de experto con texto (Única: ...) llevan la opción Única y su texto aquí.
--   · Sin DELETE (a diferencia de 20260410143041_SeedCatalogData). Sin BEGIN ni COMMIT: la transacción la gestiona EF.
--
-- Decisiones donde el informe 07 difiere de la especificación o del libro (si difieren el informe y la especificación,
-- manda la especificación §4.1 y §4.3):
--   1) Opciones 33 Energía y 34 Vital: el informe 07 (§4.1, §6.2) las marca shared (cosmere), pero §4.3 M4 dice todo
--      World mistborn y el rollback de F6 solo borra World mistborn. Con cosmere quedarían huérfanas tras el rollback y un
--      nuevo seed fallaría por clave duplicada. Se usa mistborn. Si se prefiere cosmere: cambiar esos dos valores y añadir
--      los ids 33 y 34 al DELETE de CatalogOptions del rollback y del Down.
--   2) setval: el informe 07 §6.6 da tres secuencias, §4.3 M3 y M4 exigen cuatro (añade CatalogOptions). Se incluyen las cuatro.
--   3) weapon_type 4 Armas de fuego: opcional en el informe 07 §4.3, pero §4.3 M4 lo lista. Incluido. Los ids 28 y 29 (skill
--      Alomancia y Feruquimia) son opcionales en el informe y no están en §4.3 M4: NO se insertan.
--   4) Gabán de bruma (1004): el informe 07 §6.4 da TraitIds 80,85, pero su §2.6 y el libro (PDF 271-272, comprobado en la
--      imagen de la página) dan solo Presentable como rasgo base y Única (Flecos ondeantes) como rasgo de EXPERTO.
--      Se usa TraitIds 80 y ExpertTraitIds 85.
--
-- Recuentos esperados tras M3 y M4
--   CatalogOptions: World cosmere = 50, mistborn = 23, stormlight = 10 (ids 41, 45, 55, 59, 63, 72, 75, 76, 77, 84).
--   WeaponCatalog World mistborn = 35 (ids 1001-1035). ArmorCatalog = 8 (1001-1008).
--   GearItems = 84 (1001-1084), de ellos Category vial = 13 (1072-1084).
--   Secuencias tras M4: último id 1035 en WeaponCatalog, 1008 en ArmorCatalog, 1084 en GearItems y 141 en CatalogOptions.
-- =====================================================================================================================

-- =====================================================================================================================
-- M3
-- Migración AddWorldToCatalog (T39a). Se ejecuta DESPUÉS de crear las columnas World, Era, IsRewardOnly, Price y Category
-- y sus índices (§4.1). Solo toca datos existentes: no inserta filas.
-- =====================================================================================================================

-- (1) Opciones existentes compartidas por Archivo de las Tormentas y Nacidos de la Bruma: pasan de stormlight (DEFAULT) a cosmere.
--     Mapa del informe 07 §5.2 y UPDATE de la especificación §4.3 M3 (50 ids, resultado esperado: 50 filas actualizadas).
--     Siguen en stormlight: range 41 y 45, weapon_trait 55, 59 y 63, armor_type 72, 75, 76 y 77, armor_trait 84.
UPDATE "CatalogOptions" SET "World" = 'cosmere' WHERE "Id" IN (
    1, 2, 3,                                                                 -- weapon_type
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,   -- skill
    30, 31, 32,                                                              -- damage_type
    40, 42, 43, 44, 46,                                                      -- range
    50, 51, 52, 53, 54, 56, 57, 58, 60, 61, 62, 64,                          -- weapon_trait
    70, 71, 73, 74,                                                          -- armor_type
    80, 81, 82, 83, 85                                                       -- armor_trait
);

-- (2) Secuencias IDENTITY al máximo id existente. 20260410143041_SeedCatalogData insertó ids explícitos sin avanzar las
--     secuencias: sin esto, el primer alta con id autogenerado (POST /catalog/weapons) chocaría con un id sembrado.
SELECT setval(pg_get_serial_sequence('"WeaponCatalog"','Id'), (SELECT MAX("Id") FROM "WeaponCatalog"));
SELECT setval(pg_get_serial_sequence('"ArmorCatalog"','Id'), (SELECT MAX("Id") FROM "ArmorCatalog"));
SELECT setval(pg_get_serial_sequence('"GearItems"','Id'), (SELECT MAX("Id") FROM "GearItems"));
SELECT setval(pg_get_serial_sequence('"CatalogOptions"','Id'), (SELECT MAX("Id") FROM "CatalogOptions"));
-- fin de M3

-- =====================================================================================================================
-- M4
-- Migración SeedMistbornCatalog (T40). Requiere M3 aplicada (columnas nuevas y secuencias). SQL puro, sin cambio de modelo.
-- SIN DELETE (a diferencia de 20260410143041_SeedCatalogData): no toca Stormlight ni los objetos propios de los usuarios.
-- Ids: opciones 4, 33, 34, 47-49, 65-69, 78, 79, 86, 100, 110-115, 140 y 141 (23) · armas 1001-1035 · armaduras 1001-1008 ·
-- equipo y viales 1001-1084 (Category vial en 1072-1084). Todas las filas llevan World mistborn (ver cabecera, punto 1).
-- La guarda previa que aborta si hay ids 1001+ ocupados y el Down (DELETE ... WHERE World = mistborn) los añade T40.
-- =====================================================================================================================

-- Parte 1 de 5 · Opciones nuevas (23). Informe 07 §3.2, §3.3, §4.1, §4.2, §4.3 y §6.2.
INSERT INTO "CatalogOptions"
    ("Id", "Category", "Name", "World", "Description")
VALUES
(4,   'weapon_type',  'Armas de fuego',         'mistborn', 'Armas de pólvora de la Era 2'),  -- L.262 / PDF 268  -- [inferido] el libro solo las agrupa bajo el encabezado Armas de fuego (ligeras, pesadas, especiales). Opcional en el informe 07 §4.3, incluida porque §4.3 M4 lista el id 4
(33,  'damage_type',  'Energía',                'mistborn', 'Calor y energía. El desvío lo reduce'),  -- L.312 / PDF 318  -- discrepancia: el informe 07 la marca shared (cosmere) pero la especificación §4.3 M4 dice todo mistborn: se usa mistborn (ver cabecera, punto 1)
(34,  'damage_type',  'Vital',                  'mistborn', 'Constitución: venenos, asfixia, frío. El desvío no lo reduce'),  -- L.312 / PDF 318  -- discrepancia: el informe 07 la marca shared (cosmere) pero la especificación §4.3 M4 dice todo mistborn: se usa mistborn (ver cabecera, punto 1)
(47,  'range',        'A Distancia 6/18',       'mistborn', 'Alcance corto 6 m / máximo 18 m'),  -- L.256 / PDF 262
(48,  'range',        'A Distancia 6/24',       'mistborn', 'Alcance corto 6 m / máximo 24 m'),  -- L.256 / PDF 262
(49,  'range',        'A Distancia 6/12',       'mistborn', 'Alcance corto 6 m / máximo 12 m'),  -- L.256 / PDF 262
(65,  'weapon_trait', 'Cargada [1]',            'mistborn', 'Almacena 1 unidad de munición; cada ataque a distancia gasta 1; Interactuar (1) la recarga entera; la DJ puede gastar C para dejarla con un solo disparo'),  -- L.257 / PDF 263
(66,  'weapon_trait', 'Cargada [2]',            'mistborn', 'Almacena 2 unidades de munición; cada ataque a distancia gasta 1; Interactuar (1) la recarga entera; la DJ puede gastar C para dejarla con un solo disparo'),  -- L.257 / PDF 263
(67,  'weapon_trait', 'Cargada [4]',            'mistborn', 'Almacena 4 unidades de munición; cada ataque a distancia gasta 1; Interactuar (1) la recarga entera; la DJ puede gastar C para dejarla con un solo disparo'),  -- L.257 / PDF 263
(68,  'weapon_trait', 'Cargada [6]',            'mistborn', 'Almacena 6 unidades de munición; cada ataque a distancia gasta 1; Interactuar (1) la recarga entera; la DJ puede gastar C para dejarla con un solo disparo'),  -- L.257 / PDF 263
(69,  'weapon_trait', 'Cargada [20]',           'mistborn', 'Almacena 20 unidades de munición; cada ataque a distancia gasta 1; Interactuar (1) la recarga entera; la DJ puede gastar C para dejarla con un solo disparo'),  -- L.257 / PDF 263
(78,  'armor_type',   'Capa de bruma',          'mistborn', 'Capa característica de los nacidos de la bruma'),  -- L.265 / PDF 271
(79,  'armor_type',   'Gabán de bruma',         'mistborn', 'Abrigo de la Era 2 en homenaje a la capa'),  -- L.265 / PDF 271
(86,  'armor_trait',  'Frágil',                 'mistborn', 'La DJ puede gastar C para que se rompa'),  -- L.266 / PDF 272
(100, 'range',        'Cuerpo a Cuerpo [+1,5]', 'mistborn', 'Suma 1,5 m a tu cercanía'),  -- L.256 / PDF 262
(110, 'weapon_trait', 'Explosiva [5]',          'mistborn', 'Radio 5 m; tras impacto o rasguño, rasguño al resto del radio; con impacto se puede gastar O para impactarlos a todos'),  -- L.257 / PDF 263
(111, 'weapon_trait', 'Explosiva [9]',          'mistborn', 'Radio 9 m; tras impacto o rasguño, rasguño al resto del radio; con impacto se puede gastar O para impactarlos a todos'),  -- L.257 / PDF 263
(112, 'weapon_trait', 'Explosiva [10]',         'mistborn', 'Radio 10 m; tras impacto o rasguño, rasguño al resto del radio; con impacto se puede gastar O para impactarlos a todos'),  -- L.257 / PDF 263
(113, 'weapon_trait', 'Desechable',             'mistborn', 'Tras usarla se consume de forma permanente'),  -- L.257 / PDF 263
(114, 'weapon_trait', 'Arrojadiza [6/18]',      'mistborn', 'Se arroja como ataque a distancia, corto 6 m y largo 18 m (desventaja más allá del corto); se pierde hasta recuperarla'),  -- L.257 / PDF 263
(115, 'weapon_trait', 'Voluminosa [6]',         'mistborn', 'Requiere Fuerza 6 o más; si no, desventaja en todos los ataques y Ralentizado mientras la empuñas'),  -- L.257 / PDF 263
(140, 'armor_type',   'Coraza de cerámica',     'mistborn', 'Coraza no metálica'),  -- L.265 / PDF 271
(141, 'armor_type',   'Armadura de madera',     'mistborn', 'Armadura no metálica');  -- L.265 / PDF 271

-- Parte 2 de 5 · Armas (35): 8 ligeras, 10 pesadas, 5 especiales y 12 de fuego (solo Era 2). Informe 07 §2.2-§2.5 y §6.3.
INSERT INTO "WeaponCatalog"
    ("Id", "Name", "WeaponTypeId", "SkillId", "DamageDiceCount", "DamageDiceValue", "DamageTypeId", "RangeId", "TraitIds", "ExpertTraitIds", "IsCustom", "Weight", "Price", "Era", "IsRewardOnly", "World", "Description")
VALUES
(1001, 'Bastón de madera',         1, 11, 1, 6,  31, 40,  ARRAY[50,51],              ARRAY[53],     false, 2.0,   5.0,    NULL, false, 'mistborn', 'Alománticamente inerte (sin metal): no le afectan el hierro ni el acero.'),  -- L.258 / PDF 264  -- [inferido] inerte: el nombre cita el material, el informe 07 §2.6 no lo da literal
(1002, 'Cuchillo',                 1, 11, 1, 4,  30, 40,  ARRAY[50],                 ARRAY[54,114], false, 0.5,   2.0,    NULL, false, 'mistborn', ''),  -- L.258 / PDF 264
(1003, 'Daga de cristal',          1, 11, 1, 4,  30, 40,  ARRAY[50,61],              ARRAY[54,114], false, 0.25,  50.0,   NULL, false, 'mistborn', 'Alománticamente inerte (sin metal): no le afectan el hierro ni el acero.'),  -- L.258 / PDF 264
(1004, 'Espada lateral',           1, 11, 1, 6,  30, 40,  ARRAY[52],                 ARRAY[54],     false, 1.0,   15.0,   NULL, false, 'mistborn', ''),  -- L.258 / PDF 264
(1005, 'Lanza corta',              1, 11, 1, 8,  30, 40,  ARRAY[51],                 ARRAY[57],     false, 1.5,   5.0,    NULL, false, 'mistborn', 'Con pericia, pierde A dos manos.'),  -- L.258 / PDF 264
(1006, 'Maza',                     1, 11, 1, 6,  31, 40,  ARRAY[]::int[],            ARRAY[58],     false, 1.5,   10.0,   NULL, false, 'mistborn', ''),  -- L.258 / PDF 264
(1007, 'Arco corto',               1, 11, 1, 6,  30, 42,  ARRAY[51],                 ARRAY[52],     false, 1.0,   40.0,   NULL, false, 'mistborn', ''),  -- L.258 / PDF 264
(1008, 'Honda',                    1, 11, 1, 4,  31, 43,  ARRAY[50],                 ARRAY[56],     false, 0.5,   1.0,    NULL, false, 'mistborn', ''),  -- L.258 / PDF 264
(1009, 'Alabarda',                 2, 12, 1, 10, 30, 40,  ARRAY[51],                 ARRAY[57],     false, 2.5,   20.0,   NULL, false, 'mistborn', 'Con pericia, Cuerpo a cuerpo [+1,5].'),  -- L.259 / PDF 265
(1010, 'Escudo',                   2, 12, 1, 4,  31, 40,  ARRAY[53],                 ARRAY[54],     false, 1.0,   5.0,    NULL, false, 'mistborn', ''),  -- L.259 / PDF 265
(1011, 'Escudo de madera',         2, 12, 1, 6,  31, 40,  ARRAY[53,51],              ARRAY[57],     false, 2.0,   50.0,   NULL, false, 'mistborn', 'Alománticamente inerte (sin metal): no le afectan el hierro ni el acero. Con pericia, pierde A dos manos.'),  -- L.259 / PDF 265
(1012, 'Espada larga',             2, 12, 1, 8,  30, 40,  ARRAY[52,51],              ARRAY[57],     false, 1.5,   30.0,   NULL, false, 'mistborn', 'Con pericia, pierde A dos manos.'),  -- L.259 / PDF 265
(1013, 'Hacha',                    2, 12, 1, 6,  30, 40,  ARRAY[114],                ARRAY[54],     false, 1.0,   10.0,   NULL, false, 'mistborn', ''),  -- L.259 / PDF 265
(1014, 'Hacha de obsidiana',       2, 12, 1, 6,  30, 40,  ARRAY[61],                 ARRAY[54],     false, 0.5,   100.0,  NULL, false, 'mistborn', 'Alománticamente inerte (sin metal): no le afectan el hierro ni el acero.'),  -- L.259 / PDF 265
(1015, 'Lanza larga',              2, 12, 1, 8,  30, 100, ARRAY[51],                 ARRAY[53],     false, 4.5,   20.0,   NULL, false, 'mistborn', ''),  -- L.259 / PDF 265
(1016, 'Martillo',                 2, 12, 1, 10, 31, 40,  ARRAY[51],                 ARRAY[58],     false, 4.0,   30.0,   NULL, false, 'mistborn', ''),  -- L.259 / PDF 265
(1017, 'Arco largo',               2, 12, 1, 6,  30, 46,  ARRAY[51],                 ARRAY[56],     false, 1.5,   75.0,   NULL, false, 'mistborn', ''),  -- L.259 / PDF 265
(1018, 'Ballesta',                 2, 12, 1, 8,  30, 44,  ARRAY[65,51],              ARRAY[60],     false, 3.5,   100.0,  NULL, false, 'mistborn', ''),  -- L.259 / PDF 265
(1019, 'Arma improvisada',         3, 10, 0, 0,  31, 40,  ARRAY[61,57],              ARRAY[57],     false, 0.0,   NULL,   NULL, false, 'mistborn', 'Se trata como el arma ligera o pesada no especial más parecida (lo decide la DJ), con el rasgo Frágil añadido. Con pericia, sus ataques se benefician de los rasgos de experto del arma más similar. A merced de otro: acabar con un enemigo totalmente indefenso no requiere tirada de ataque.'),  -- L.260 / PDF 266, reglas en la misma página  -- [inferido] SkillId 10 (Agilidad) es el marcador del seed para la misma habilidad que un arma similar, dados 0d0 como el id 19 del seed
(1020, 'Ataque sin armas',         3, 13, 0, 0,  31, 40,  ARRAY[57],                 ARRAY[58,54],  false, 0.0,   NULL,   NULL, false, 'mistborn', 'Siempre disponible: no cuenta como ataque con arma, no hace falta empuñar nada ni pueden desarmarte, y puede hacerse con las manos ocupadas. Entrenamiento de fuerza: el dado de daño depende de Fuerza (0-2: 1 de golpe sin tirada, 3-4: 1d4, 5-6: 1d8, 7-8: 2d6, 9 o más: 2d10, todos de golpe). Las nudilleras suben un paso la magnitud del dado (1 pasa a 1d4, 1d8 pasa a 1d10).'),  -- L.260 / PDF 266, reglas únicas L.261 / PDF 267
(1021, 'Bastón de duelo',          3, 12, 1, 8,  31, 40,  ARRAY[50,57],              ARRAY[54],     false, 1.5,   40.0,   NULL, false, 'mistborn', 'Alománticamente inerte (sin metal): no le afectan el hierro ni el acero. Flexibilidad en combate: se puede usar con Armamento pesado o ligero. Pericia especializada (solo por talento, recompensa o entrenamiento).'),  -- L.260 / PDF 266, reglas únicas L.261 / PDF 267  -- [inferido] un solo SkillId por fila: 12 (pesado), el libro admite también Armamento ligero (se dice en Description). Inerte: el libro lo cita como ejemplo habitual (PDF 262)
(1022, 'Hoja koloss',              3, 12, 1, 12, 31, 100, ARRAY[115,64,60,51,57],    ARRAY[57],     false, 100.0, NULL,   NULL, true,  'mistborn', 'Engorrosa: sus ataques no pueden hacer rasguño. Con pericia, pierde Peligrosa y el daño pasa a 1d20 golpe. Pericia especializada (solo por talento, recompensa o entrenamiento).'),  -- L.260 / PDF 266, reglas únicas L.261 / PDF 267
(1023, 'Palo de ruido',            3, 11, 1, 4,  31, 40,  ARRAY[61,57],              ARRAY[54],     false, 0.25,  100.0,  NULL, false, 'mistborn', 'Ensordecedora: 1 acción, Armamento ligero contra la Defensa espiritual de quienes te sientan; con éxito, 1d6 de daño vital y Desorientado hasta el final de su siguiente turno; con dos palos de ruido, ventaja contra quien tenga oído sobrenatural y, si tienes éxito, también Aturdido. Pericia especializada (solo por talento, recompensa o entrenamiento).'),  -- L.260 / PDF 266, reglas únicas L.261 / PDF 267
(1024, 'Granada de fragmentación', 4, 11, 2, 4,  30, 47,  ARRAY[110,64,62,113,114],  ARRAY[57],     false, 0.25,  75.0,   2,    false, 'mistborn', 'Con pericia, pierde Peligrosa.'),  -- L.262 / PDF 268
(1025, 'Fusil de caza',            4, 11, 1, 8,  30, 46,  ARRAY[65,62,51],           ARRAY[57],     false, 2.5,   400.0,  2,    false, 'mistborn', 'Con pericia, Cargada [3] en lugar de [1].'),  -- L.262 / PDF 268
(1026, 'Pistola de bota',          4, 11, 1, 4,  30, 49,  ARRAY[50,65,62],           ARRAY[52],     false, 0.25,  125.0,  2,    false, 'mistborn', ''),  -- L.262 / PDF 268
(1027, 'Pistola de cañón corto',   4, 11, 1, 4,  30, 47,  ARRAY[68,62],              ARRAY[50,54],  false, 0.5,   175.0,  2,    false, 'mistborn', ''),  -- L.262 / PDF 268
(1028, 'Revólver',                 4, 11, 1, 6,  30, 48,  ARRAY[68,62,51],           ARRAY[57],     false, 0.5,   250.0,  2,    false, 'mistborn', 'Con pericia, pierde A dos manos.'),  -- L.262 / PDF 268
(1029, 'Granada de conmoción',     4, 12, 2, 6,  31, 47,  ARRAY[112,64,113,114],     ARRAY[57],     false, 0.25,  50.0,   2,    false, 'mistborn', 'Con pericia, pierde Peligrosa.'),  -- L.262 / PDF 268
(1030, 'Cañón de mano',            4, 12, 1, 8,  30, 48,  ARRAY[68,62,51],           ARRAY[57],     false, 1.0,   300.0,  2,    false, 'mistborn', 'Con pericia, pierde A dos manos.'),  -- L.262 / PDF 268
(1031, 'Carabina',                 4, 12, 1, 8,  30, 42,  ARRAY[67,62,51],           ARRAY[57],     false, 3.5,   750.0,  2,    false, 'mistborn', 'Con pericia, Cargada [4] pasa a [8].'),  -- L.262 / PDF 268
(1032, 'Escopeta',                 4, 12, 1, 10, 30, 47,  ARRAY[64,66,62,51],        ARRAY[110],    false, 3.5,   600.0,  2,    false, 'mistborn', ''),  -- L.262 / PDF 268
(1033, 'Fusil de cerrojo',         4, 12, 1, 10, 30, 46,  ARRAY[65,62,51],           ARRAY[57],     false, 4.5,   600.0,  2,    false, 'mistborn', 'Con pericia, el alcance pasa a [75/300].'),  -- L.262 / PDF 268
(1034, 'Dinamita (1 cartucho)',    4, 12, 4, 6,  31, 40,  ARRAY[111,64,113,114,57],  ARRAY[57],     false, 0.25,  100.0,  2,    false, 'mistborn', 'Detonación retardada: 2 acciones para encender una mecha de 1 a 6 rondas; luego ataque de Manufactura contra la Defensa física de quienes estén a 1,5 m. Volátil: explota al impactar al arrojarla, y la DJ puede gastar C de cualquiera de tus pruebas para que un cartucho explote (rasguño a todos en su radio, incluido tú); sin riesgo con la pericia Dinamita. Sin patrocinador que autorice su adquisición, transporte o uso, es muy difícil comprarla y se arriesga el arresto. Pericia especializada (solo por talento, recompensa o entrenamiento).'),  -- L.262 / PDF 268, reglas únicas y patrocinador L.264 / PDF 270
(1035, 'Ametralladora rotatoria',  4, 12, 3, 4,  30, 47,  ARRAY[115,64,69,62,51,57], ARRAY[57],     false, 85.0,  2500.0, 2,    false, 'mistborn', 'Disparo rápido: sin límite de Acometidas por turno, pero cada ataque sufre tantas desventajas como ataques previos con ella en ese turno. Peso engorroso: es Voluminosa [6] mientras no esté anclada y cada Interactuar para anclarla reduce Voluminosa en 2. Con pericia, pierde Peligrosa. Sin patrocinador que autorice su adquisición, transporte o uso, es muy difícil comprarla y se arriesga el arresto. Pericia especializada (solo por talento, recompensa o entrenamiento).');  -- L.262 / PDF 268, reglas únicas y patrocinador L.264 / PDF 270

-- Parte 3 de 5 · Armaduras (8). Informe 07 §2.6 y §6.4.
INSERT INTO "ArmorCatalog"
    ("Id", "Name", "ArmorTypeId", "Desvio", "TraitIds", "ExpertTraitIds", "IsCustom", "Weight", "Price", "Era", "IsRewardOnly", "World", "Description")
VALUES
(1001, 'Uniforme',                   70,  0, ARRAY[80],      ARRAY[]::int[], false, 2.5,  20.0,   NULL, false, 'mistborn', ''),  -- L.265 / PDF 271
(1002, 'Capa de bruma',              78,  0, ARRAY[85],      ARRAY[85],      false, 2.5,  NULL,   NULL, true,  'mistborn', 'Flecos ondeantes: en una zona que ofusque la visión (brumas, oscuridad), ventaja en Sigilo contra personajes cuyo sentido principal esté afectado, que además sufren desventaja en sus pruebas de Percepción contra ti. Con la pericia especializada en Capa de bruma (solo por talento, recompensa o entrenamiento), rasgo de experto Solemnidad de nacido de la bruma: ventaja en Intimidación contra quien no sea nacido de la bruma. Alománticamente inerte (sin metal): no le afectan el hierro ni el acero.'),  -- L.265 / PDF 271, reglas L.266 / PDF 272  -- Inerte: el libro cita la capa de bruma como ejemplo habitual (PDF 262)
(1003, 'Cuero',                      71,  1, ARRAY[]::int[], ARRAY[80],      false, 5.0,  30.0,   NULL, false, 'mistborn', ''),  -- L.265 / PDF 271
(1004, 'Gabán de bruma',             79,  1, ARRAY[80],      ARRAY[85],      false, 5.0,  NULL,   2,    true,  'mistborn', 'Con la pericia especializada en Gabán de bruma (solo por talento, recompensa o entrenamiento), rasgo de experto Flecos ondeantes: en una zona que ofusque la visión (brumas, oscuridad), ventaja en Sigilo contra personajes cuyo sentido principal esté afectado, que además sufren desventaja en sus pruebas de Percepción contra ti.'),  -- L.265 / PDF 271, reglas L.266 / PDF 272  -- DISCREPANCIA del informe 07: §6.4 da TraitIds 80,85 pero §2.6 y el libro (PDF 271-272, comprobado en imagen) dan solo Presentable en rasgos base y Única (Flecos ondeantes) como rasgo de experto: se usa TraitIds 80 y ExpertTraitIds 85
(1005, 'Coraza',                     73,  2, ARRAY[81],      ARRAY[80],      false, 15.0, 50.0,   NULL, false, 'mistborn', ''),  -- L.265 / PDF 271
(1006, 'Coraza de cerámica',         140, 2, ARRAY[81,86],   ARRAY[85],      false, 10.0, 250.0,  NULL, false, 'mistborn', 'Alománticamente inerte (sin metal): no le afectan el hierro ni el acero. Con pericia, Voluminosa [2] en lugar de [3].'),  -- L.265 / PDF 271  -- [inferido] inerte: el nombre cita el material, el informe 07 §2.6 no lo da literal
(1007, 'Armadura de placas y malla', 74,  3, ARRAY[82],      ARRAY[85],      false, 20.0, 200.0,  NULL, false, 'mistborn', 'Con pericia, Voluminosa [3] en lugar de [4].'),  -- L.265 / PDF 271
(1008, 'Armadura de madera',         141, 3, ARRAY[83,86],   ARRAY[85],      false, 15.0, 1000.0, NULL, false, 'mistborn', 'Alománticamente inerte (sin metal): no le afectan el hierro ni el acero. Con pericia, pierde Frágil.');  -- L.265 / PDF 271

-- Parte 4 de 5 · Equipo (71, ids 1001-1071) y viales de metales raros (13, ids 1072-1084). Informe 07 §2.7, §2.8 y §6.5.
INSERT INTO "GearItems"
    ("Id", "Name", "Weight", "Price", "Era", "IsRewardOnly", "Category", "World", "Description")
VALUES
(1001, 'Aceite (1 frasco)',                0.5,  0.5,   NULL, false, NULL,   'mistborn', 'Combustible: sirve para linternas, para crear terreno peligroso o como arma improvisada (honda); deja al objetivo cubierto de aceite y el frasco se rompe tras el ataque.'),  -- L.269 / PDF 275
(1002, 'Alcohol (1 consumición)',          0.1,  0.1,   NULL, false, NULL,   'mistborn', 'Valor variable (0,1 – 50 ar según calidad). La DJ puede dar un efecto circunstancial a las variedades más caras.'),  -- L.269 / PDF 275
(1003, 'Alcohol (botella)',                1.0,  0.5,   NULL, false, NULL,   'mistborn', 'Peso y valor variables (1–2 kg / 0,5–300 ar).'),  -- L.269 / PDF 275
(1004, 'Anestésico (5 dosis)',             0.75, 30.0,  NULL, false, NULL,   'mistborn', 'Tras un descanso corto o largo, una dosis aplicada a una lesión reduce 1d4 días su recuperación restante. Solo se puede tratar cada lesión una vez al día.'),  -- L.269 / PDF 275
(1005, 'Antiséptico (débil, 5 dosis)',     0.5,  10.0,  NULL, false, NULL,   'mistborn', 'Tras un descanso corto, una dosis cura 1d6 de salud.'),  -- L.269 / PDF 275
(1006, 'Antiséptico (potente, 5 dosis)',   0.5,  25.0,  NULL, false, NULL,   'mistborn', 'Tras un descanso corto, una dosis cura 2d6 de salud.'),  -- L.269 / PDF 275
(1007, 'Arcón',                            12.5, 30.0,  NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1008, 'Arena metálica (bolsa)',           0.15, 5.0,   NULL, false, NULL,   'mistborn', 'Con 1 acción se lanza a un espacio a 9 m o menos: genera una nube de 3 m de lado hasta el final de tu siguiente turno que ofusca la visión y el sentido del metal. Las pruebas de Alomancia de hierro y acero sufren desventaja si la nube está en su línea de efecto.'),  -- L.269 / PDF 275
(1009, 'Balanza',                          1.5,  10.0,  NULL, false, NULL,   'mistborn', 'Pesa con precisión hasta 1 kg.'),  -- L.269 / PDF 275
(1010, 'Barril',                           35.0, 10.0,  NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1011, 'Bolsa',                            0.5,  0.5,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1012, 'Botella (cerámica)',               1.5,  4.0,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1013, 'Botella (cristal)',                1.0,  8.0,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1014, 'Cadena (fina, 0,3 metros)',        0.25, 10.0,  NULL, false, NULL,   'mistborn', 'Se rompe con una prueba de Atletismo CD 20 o infligiéndole 5 de daño.'),  -- L.269 / PDF 275
(1015, 'Cadena (gruesa, 3 metros)',        5.0,  10.0,  NULL, false, NULL,   'mistborn', 'Se rompe con una prueba de Atletismo CD 30 o infligiéndole 15 de daño.'),  -- L.269 / PDF 275
(1016, 'Cálamo',                           0.05, 0.05,  NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1017, 'Catalejo',                         0.5,  250.0, NULL, false, NULL,   'mistborn', 'Lo lejano se percibe como si estuviera a la mitad de distancia.'),  -- L.269 / PDF 275
(1018, 'Cera (1 bloque)',                  0.25, 1.0,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1019, 'Cerradura y llave',                0.5,  25.0,  NULL, false, NULL,   'mistborn', 'Se abre con la llave o con una prueba de Hurto CD 20.'),  -- L.269 / PDF 275
(1020, 'Comida (buena, 1 día)',            0.25, 10.0,  NULL, false, NULL,   'mistborn', 'Comida de calidad (restaurantes de lujo y banquetes de la nobleza).'),  -- L.269 / PDF 275
(1021, 'Comida (callejera, 1 día)',        0.75, 0.5,   NULL, false, NULL,   'mistborn', 'Comida de puestos callejeros.'),  -- L.269 / PDF 275
(1022, 'Comida (ración, 1 día)',           0.25, 0.1,   NULL, false, NULL,   'mistborn', 'Cecina o pan para viajes largos; seca, dura indefinidamente.'),  -- L.269 / PDF 275
(1023, 'Cubo',                             1.0,  0.5,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1024, 'Cuerda (15 metros)',               2.5,  15.0,  NULL, false, NULL,   'mistborn', 'Se corta infligiéndole 2 de daño; se desgarra con una prueba de Atletismo CD 20.'),  -- L.269 / PDF 275
(1025, 'Diapasón',                         0.25, 25.0,  NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1026, 'Escalera de mano (3 metros)',      10.0, 10.0,  NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1027, 'Espejo (de mano)',                 1.0,  15.0,  NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1028, 'Estuche (cuero)',                  0.5,  2.0,   NULL, false, NULL,   'mistborn', 'Estuche hermético: guarda hasta 10 hojas de papel o pergamino protegidas de la intemperie.'),  -- L.269 / PDF 275
(1029, 'Frasco o tarro',                   0.5,  0.5,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1030, 'Ganzúa',                           0.25, 2.0,   NULL, false, NULL,   'mistborn', 'Ventaja en Hurto para forzar cerraduras; resuelta la prueba, la DJ puede gastar C para que se rompa.'),  -- L.269 / PDF 275
(1031, 'Garfio de escalada',               2.0,  5.0,   NULL, false, NULL,   'mistborn', 'Bien anclado, da ventaja en Agilidad y Atletismo para escalar por la cuerda atada. Se lanza a un anclaje a 6 m o menos con una prueba de Agilidad o Atletismo.'),  -- L.269 / PDF 275
(1032, 'Grilletes',                        3.0,  5.0,   NULL, false, NULL,   'mistborn', 'Apresan a un personaje de tamaño Grande o menor e incluyen su llave. Escapar: Agilidad CD 25. Romperlos: Atletismo CD 25 o 15 de daño. Forzar la cerradura: Hurto CD 20.'),  -- L.269 / PDF 275
(1033, 'Instrumento musical',              0.25, 5.0,   NULL, false, NULL,   'mistborn', 'Peso y valor variables (250 g – 10 kg / 5–100 ar). Con pericia en el instrumento se obtiene ventaja en la prueba.'),  -- L.269 / PDF 275
(1034, 'Jabón',                            0.05, 0.5,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1035, 'Jarra o pichel',                   2.0,  1.0,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1036, 'Libro (referencia)',               0.5,  5.0,   NULL, false, NULL,   'mistborn', 'Peso y valor variables (0,5–2,5 kg / 5–250 ar). Con tiempo para consultarlo en una prueba de Intelecto, se considera pericia en ese tema.'),  -- L.269 / PDF 275
(1037, 'Linterna (aceite)',                1.0,  10.0,  NULL, false, NULL,   'mistborn', 'Luz en un radio de 9 m; arde hasta 6 h por cada medio litro de aceite.'),  -- L.269 / PDF 275
(1038, 'Lupa',                             0.1,  200.0, NULL, false, NULL,   'mistborn', 'Ventaja en pruebas de habilidad para tasar o inspeccionar un objeto pequeño o muy detallado. Precio de 200 ar tal como está impreso en el libro (parece alto frente al resto de objetos: posible errata).'),  -- L.269 / PDF 275  -- precio impreso tal cual (200 ar), posible errata del libro: ver informe 07 §11.1
(1039, 'Manta',                            1.0,  0.5,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1040, 'Martillo (de mano)',               1.5,  2.0,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1041, 'Mochila',                          2.5,  4.0,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1042, 'Nudilleras',                       0.25, 5.0,   NULL, false, NULL,   'mistborn', 'Valor variable (5–10 ar). En una mano, en lugar de un arma, suben un paso la magnitud del dado de daño sin armas (1 pasa a 1d4, 1d8 pasa a 1d10).'),  -- L.269 / PDF 275
(1043, 'Odre',                             0.5,  0.5,   NULL, false, NULL,   'mistborn', 'Peso 500 g vacío. Sin reglas específicas.'),  -- L.269 / PDF 275
(1044, 'Olla (hierro)',                    5.0,  4.0,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1045, 'Pala',                             2.5,  8.0,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1046, 'Palanca',                          1.5,  5.0,   NULL, false, NULL,   'mistborn', 'Ventaja en pruebas de Atletismo en las que sea posible aplicar su efecto.'),  -- L.269 / PDF 275
(1047, 'Papel o pergamino (1 hoja)',       0.05, 0.2,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1048, 'Pedernal y acero',                 0.75, 2.0,   NULL, false, NULL,   'mistborn', 'Con 1 acción prende un combustible abundante en tu cercanía; iniciar una hoguera en circunstancias difíciles puede llevar 1 minuto o más.'),  -- L.269 / PDF 275
(1049, 'Perfume (1 vial)',                 0.25, 10.0,  NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1050, 'Pico (minería)',                   5.0,  10.0,  NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1051, 'Piedra de afilar',                 0.5,  0.1,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1052, 'Red (de caza)',                    2.5,  2.0,   NULL, false, NULL,   'mistborn', 'Con 1 acción, Atletismo contra la Defensa física de un personaje de tamaño Grande o menor a 4,5 m o menos: si tienes éxito queda Retenido y Tumbado. Se libera con Interactuar y una prueba de Atletismo CD 15.'),  -- L.269 / PDF 275
(1053, 'Red (de pesca)',                   7.5,  5.0,   NULL, false, NULL,   'mistborn', 'Ventaja en las pruebas físicas relacionadas con la pesca.'),  -- L.269 / PDF 275
(1054, 'Ropa (buena)',                     3.0,  25.0,  NULL, false, NULL,   'mistborn', 'Valor variable (25–100 ar). Ventaja en pruebas espirituales para pasar por clase alta.'),  -- L.269 / PDF 275
(1055, 'Ropa (común)',                     1.5,  1.0,   NULL, false, NULL,   'mistborn', 'Ventaja en pruebas espirituales para pasar por clase trabajadora.'),  -- L.269 / PDF 275
(1056, 'Ropa (de apertura rápida)',        2.5,  120.0, NULL, false, NULL,   'mistborn', 'Se viste sobre armas y armaduras para ocultarlas: la armadura obtiene Presentable y las armas Discreta. Quitarla cuesta 1 acción. Mientras la llevas, desventaja en tus ataques y ventaja en los ataques contra ti.'),  -- L.269 / PDF 275
(1057, 'Ropa (raída)',                     0.75, 0.2,   NULL, false, NULL,   'mistborn', 'Ventaja en pruebas espirituales para pasar por indigente.'),  -- L.269 / PDF 275
(1058, 'Saco',                             0.25, 0.1,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1059, 'Sillalibre',                       6.0,  500.0, 2,    false, NULL,   'mistborn', 'Gratis o 500 ar: gratis para personajes con diversidad funcional. Dispositivo levitante con el mismo valor de movimiento que el resto de personajes, sin gastar acción para activarlo. En la Era 1 se usa una silla de ruedas con el mismo valor de movimiento.'),  -- L.269 / PDF 275, reglas L.270 / PDF 276
(1060, 'Sistema de poleas',                6.0,  50.0,  NULL, false, NULL,   'mistborn', 'Si se monta antes de elevar un objeto, este cuenta como si pesara una cuarta parte de su valor real.'),  -- L.269 / PDF 275
(1061, 'Suministros quirúrgicos',          1.5,  20.0,  NULL, false, NULL,   'mistborn', 'Contiene material para 10 usos; consumir un uso da ventaja en una prueba de Medicina para tratar a un personaje herido.'),  -- L.269 / PDF 275
(1062, 'Tienda de campaña (dos personas)', 10.0, 5.0,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1063, 'Tinta (vial de 30 ml)',            0.1,  20.0,  NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1064, 'Tónica (1 dosis)',                 0.1,  2.0,   NULL, false, NULL,   'mistborn', 'Tras un descanso corto, una dosis recupera 1d4 de salud y 1 de concentración.'),  -- L.269 / PDF 275
(1065, 'Tratamiento (médico, 1 dosis)',    0.1,  5.0,   NULL, false, NULL,   'mistborn', 'En un descanso corto, una dosis cura Desorientado, Agotado (reduce la penalización en 1) o Aturdido, si su origen no es una lesión permanente.'),  -- L.269 / PDF 275
(1066, 'Trompetilla',                      0.5,  25.0,  NULL, false, NULL,   'mistborn', 'Los sonidos lejanos se perciben como si estuvieran a la mitad de distancia.'),  -- L.269 / PDF 275
(1067, 'Vela',                             0.1,  0.1,   NULL, false, NULL,   'mistborn', 'Ilumina un radio de 4,5 m; arde hasta 6 h.'),  -- L.269 / PDF 275
(1068, 'Veneno (débil, 1 dosis)',          0.1,  10.0,  NULL, false, NULL,   'mistborn', 'Prueba de Atletismo CD 12 o 1d6 de daño vital.'),  -- L.269 / PDF 275
(1069, 'Veneno (efectivo, 1 dosis)',       0.1,  25.0,  NULL, false, NULL,   'mistborn', 'Prueba de Atletismo CD 14 o 2d8 de daño vital y Aturdido durante 1 hora.'),  -- L.269 / PDF 275
(1070, 'Veneno (potente, 1 dosis)',        0.1,  60.0,  NULL, false, NULL,   'mistborn', 'Prueba de Atletismo CD 16 o 3d10 de daño vital y Aturdido durante 1 hora (además, Inmovilizado mientras dure).'),  -- L.269 / PDF 275
(1071, 'Vial (cristal)',                   0.1,  2.0,   NULL, false, NULL,   'mistborn', 'Sin reglas específicas.'),  -- L.269 / PDF 275
(1072, 'Vial de aluminio (Era 1)',         0.1,  25.0,  1,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal). Incoherencia del libro: manufactura (L.273 / PDF 279) lo da no disponible en Era 1 pero el vial tiene precio en Era 1, se sigue la tabla de viales
(1073, 'Vial de aluminio (Era 2)',         0.1,  50.0,  2,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal)
(1074, 'Cuenta de atium',                  0.1,  150.0, 1,    false, 'vial', 'mistborn', 'Una cuenta de atium: la unidad es la cuenta, no un vial. El atium se registra aparte de la Investidura.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal)
(1075, 'Vial de bendaleo',                 0.1,  500.0, 2,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal)
(1076, 'Vial de cadmio',                   0.1,  50.0,  2,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal)
(1077, 'Vial de cromo',                    0.1,  10.0,  2,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal)
(1078, 'Vial de duraluminio (Era 1)',      0.1,  25.0,  1,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal). Incoherencia del libro: manufactura (L.273 / PDF 279) lo da no disponible en Era 1 pero el vial tiene precio en Era 1, se sigue la tabla de viales
(1079, 'Vial de duraluminio (Era 2)',      0.1,  50.0,  2,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal)
(1080, 'Vial de electro (Era 1)',          0.1,  10.0,  1,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal)
(1081, 'Vial de electro (Era 2)',          0.1,  50.0,  2,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal)
(1082, 'Vial de nicrosil',                 0.1,  50.0,  2,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal)
(1083, 'Vial de oro (Era 1)',              0.1,  5.0,   1,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.'),  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal)
(1084, 'Vial de oro (Era 2)',              0.1,  25.0,  2,    false, 'vial', 'mistborn', 'Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.');  -- L.267 / PDF 273  -- [inferido] peso 0.1 kg: el libro no da peso, se iguala a Vial (cristal)

-- Parte 5 de 5 · Secuencias IDENTITY al máximo id (tras el seed: 1035, 1008, 1084 y 141). Informe 07 §6.6 más CatalogOptions.
-- Los objetos propios nuevos nacen con id 1036 o mayor en armas, 1009 o mayor en armaduras (el equipo no admite alta).
SELECT setval(pg_get_serial_sequence('"WeaponCatalog"','Id'), (SELECT MAX("Id") FROM "WeaponCatalog"));
SELECT setval(pg_get_serial_sequence('"ArmorCatalog"','Id'), (SELECT MAX("Id") FROM "ArmorCatalog"));
SELECT setval(pg_get_serial_sequence('"GearItems"','Id'), (SELECT MAX("Id") FROM "GearItems"));
SELECT setval(pg_get_serial_sequence('"CatalogOptions"','Id'), (SELECT MAX("Id") FROM "CatalogOptions"));
-- fin de M4
