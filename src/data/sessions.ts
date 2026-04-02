// AUTO-GENERATED — do not edit manually.
// Run: node cosmere-api/Resources/obsidian/import_sessions.mjs

export type MentionType = 'pj' | 'npc' | 'spren' | 'faction' | 'unknown'

export interface SessionMention {
  raw: string
  display: string
  type: MentionType
}

export interface Session {
  number: number
  title: string
  slug: string
  preview: string
  body: string
  participants: string[]
  mentions: SessionMention[]
}

export const SESSIONS: Session[] = [
  {
    "number": 1,
    "title": "El Encuentro",
    "slug": "sesion-01",
    "body": "En las Montañas Irreclamadas, el destino unió a [[PJ - Guizmo]], [[PJ - Roca Pequeña]], [[PJ - Kaligula]], [[PJ - Hanol]] y [[PJ - Raito]].\n\nAllí encontraron a [[PJ - Taszo-hijo-Clutio]], gravemente herido tras el ataque de sabuesos-hacha.\n\nEl monje, portador de una misteriosa piedra ([[Spren - Po’ahu]]), pidió escolta hacia el este.\n\nEl grupo aceptó, iniciando un viaje que los llevaría hasta la Encrucijada de la Piedra del Concilio.\n\nLa sesión termina con la creciente tensión en el campamento y la inminente amenaza que se cierne sobre Taszo.",
    "preview": "En las Montañas Irreclamadas, el destino unió a [[PJ - Guizmo]], [[PJ - Roca Pequeña]], [[PJ - Kaligula]], [[PJ - Hanol]] y [[PJ - Raito]].",
    "participants": [
      "Guizmo",
      "Roca Pequeña",
      "Kaligula",
      "Hanol",
      "Raito",
      "Taszo-hijo-Clutio"
    ],
    "mentions": [
      {
        "raw": "PJ - Guizmo",
        "display": "Guizmo",
        "type": "pj"
      },
      {
        "raw": "PJ - Roca Pequeña",
        "display": "Roca Pequeña",
        "type": "pj"
      },
      {
        "raw": "PJ - Kaligula",
        "display": "Kaligula",
        "type": "pj"
      },
      {
        "raw": "PJ - Hanol",
        "display": "Hanol",
        "type": "pj"
      },
      {
        "raw": "PJ - Raito",
        "display": "Raito",
        "type": "pj"
      },
      {
        "raw": "PJ - Taszo-hijo-Clutio",
        "display": "Taszo-hijo-Clutio",
        "type": "pj"
      },
      {
        "raw": "Spren - Po’ahu",
        "display": "Po’ahu",
        "type": "spren"
      }
    ]
  },
  {
    "number": 2,
    "title": "La Trampa",
    "slug": "sesion-02",
    "body": "En la Encrucijada, el grupo presencia la dureza del ejército alezi y conoce rumores sobre un prisionero que afirma ser un Heraldo.\n\nMientras tanto, [[PJ - Taszo-hijo-Clutio]] revela su misión: recuperar la Hoja de Honor.\n\nLa calma se rompe cuando [[NPC - Hana]] pide ayuda para rescatar el carro de [[NPC - Tet Rebin]].\n\n[[PJ - Roca Pequeña]] y [[PJ - Raito]] acuden en su ayuda, sin saber que se trata de una emboscada.\n\nLa sesión termina justo cuando el grupo se dispone a intervenir en la defensa de la caravana.",
    "preview": "En la Encrucijada, el grupo presencia la dureza del ejército alezi y conoce rumores sobre un prisionero que afirma ser un Heraldo.",
    "participants": [
      "Taszo-hijo-Clutio",
      "Roca Pequeña",
      "Raito"
    ],
    "mentions": [
      {
        "raw": "PJ - Taszo-hijo-Clutio",
        "display": "Taszo-hijo-Clutio",
        "type": "pj"
      },
      {
        "raw": "NPC - Hana",
        "display": "Hana",
        "type": "npc"
      },
      {
        "raw": "NPC - Tet Rebin",
        "display": "Tet Rebin",
        "type": "npc"
      },
      {
        "raw": "PJ - Roca Pequeña",
        "display": "Roca Pequeña",
        "type": "pj"
      },
      {
        "raw": "PJ - Raito",
        "display": "Raito",
        "type": "pj"
      }
    ]
  },
  {
    "number": 3,
    "title": "El Sacrificio",
    "slug": "sesion-03",
    "body": "La emboscada se desata.\n\nDurante el combate, [[PJ - Roca Pequeña]] manifiesta por primera vez un poder sobrenatural vinculado a [[Spren - Magma]].\n\nEn paralelo, [[PJ - Kaligula]] descubre el robo de la Hoja de Honor por parte de [[NPC - Kaiana]].\n\n[[PJ - Taszo-hijo-Clutio]] huye hacia la tormenta en persecución de los ladrones.\n\nEl grupo lo sigue, encontrándolo mortalmente herido por agentes de [[Facción - Ojos de Pala]].\n\nEn su último aliento, Taszo les hace jurar continuar su misión y les deja el nombre de [[PJ - Liss]].\n\nSu muerte marca un punto de no retorno para el grupo.",
    "preview": "La emboscada se desata.",
    "participants": [
      "Roca Pequeña",
      "Kaligula",
      "Taszo-hijo-Clutio",
      "Liss"
    ],
    "mentions": [
      {
        "raw": "PJ - Roca Pequeña",
        "display": "Roca Pequeña",
        "type": "pj"
      },
      {
        "raw": "Spren - Magma",
        "display": "Magma",
        "type": "spren"
      },
      {
        "raw": "PJ - Kaligula",
        "display": "Kaligula",
        "type": "pj"
      },
      {
        "raw": "NPC - Kaiana",
        "display": "Kaiana",
        "type": "npc"
      },
      {
        "raw": "PJ - Taszo-hijo-Clutio",
        "display": "Taszo-hijo-Clutio",
        "type": "pj"
      },
      {
        "raw": "Facción - Ojos de Pala",
        "display": "Ojos de Pala",
        "type": "faction"
      },
      {
        "raw": "PJ - Liss",
        "display": "Liss",
        "type": "pj"
      }
    ]
  },
  {
    "number": 4,
    "title": "Ecos en el Campamento]",
    "slug": "sesion-04",
    "body": "El grupo llega a los Campamentos de Guerra.\n\nBuscan información sobre [[PJ - Liss]], descubriendo pistas que los llevan al [[Lugar - Rocabrote Rojo]].\n\n[[PJ - Kaligula]] tiene una visión de un encapuchado: [[NPC - Mraize]].\n\nEl grupo interactúa con mercaderes y soldados, y recibe recompensas de [[NPC - Tet Rebin]].\n\n[[PJ - Raito]] ayuda a los olvidados en la zona médica, donde jura proteger a los portadores del [[Lugar - Puente Nueve]].\n\nLa sesión termina con el grupo planificando sus movimientos para el día siguiente.",
    "preview": "El grupo llega a los Campamentos de Guerra.",
    "participants": [
      "Liss",
      "Kaligula",
      "Raito"
    ],
    "mentions": [
      {
        "raw": "PJ - Liss",
        "display": "Liss",
        "type": "pj"
      },
      {
        "raw": "Lugar - Rocabrote Rojo",
        "display": "Lugar - Rocabrote Rojo",
        "type": "unknown"
      },
      {
        "raw": "PJ - Kaligula",
        "display": "Kaligula",
        "type": "pj"
      },
      {
        "raw": "NPC - Mraize",
        "display": "Mraize",
        "type": "npc"
      },
      {
        "raw": "NPC - Tet Rebin",
        "display": "Tet Rebin",
        "type": "npc"
      },
      {
        "raw": "PJ - Raito",
        "display": "Raito",
        "type": "pj"
      },
      {
        "raw": "Lugar - Puente Nueve",
        "display": "Lugar - Puente Nueve",
        "type": "unknown"
      }
    ]
  },
  {
    "number": 5,
    "title": "El Puente Nueve",
    "slug": "sesion-05",
    "body": "El grupo se divide.\n\n[[PJ - Roca Pequeña]] y [[PJ - Raito]] se infiltran en el [[Lugar - Puente Nueve]].\n\n[[PJ - Kaligula]] acepta una misión de [[NPC - Mraize]] ([[Facción - Sangre Espectral]]).\n\n[[PJ - Hanol]] y [[PJ - Guizmo]] exploran los abismos en busca de parshendi.\n\nDurante el enfrentamiento, la situación se vuelve crítica.\n\nEn un momento desesperado, [[PJ - Hanol]] invoca un muro de piedra gracias a [[Spren - Po’ahu]], permitiendo la huida.\n\nLa sesión termina con el grupo escapando, pero siendo perseguidos.",
    "preview": "El grupo se divide.",
    "participants": [
      "Roca Pequeña",
      "Raito",
      "Kaligula",
      "Hanol",
      "Guizmo"
    ],
    "mentions": [
      {
        "raw": "PJ - Roca Pequeña",
        "display": "Roca Pequeña",
        "type": "pj"
      },
      {
        "raw": "PJ - Raito",
        "display": "Raito",
        "type": "pj"
      },
      {
        "raw": "Lugar - Puente Nueve",
        "display": "Lugar - Puente Nueve",
        "type": "unknown"
      },
      {
        "raw": "PJ - Kaligula",
        "display": "Kaligula",
        "type": "pj"
      },
      {
        "raw": "NPC - Mraize",
        "display": "Mraize",
        "type": "npc"
      },
      {
        "raw": "Facción - Sangre Espectral",
        "display": "Sangre Espectral",
        "type": "faction"
      },
      {
        "raw": "PJ - Hanol",
        "display": "Hanol",
        "type": "pj"
      },
      {
        "raw": "PJ - Guizmo",
        "display": "Guizmo",
        "type": "pj"
      },
      {
        "raw": "Spren - Po’ahu",
        "display": "Po’ahu",
        "type": "spren"
      }
    ]
  },
  {
    "number": 6,
    "title": "Las Ruinas",
    "slug": "sesion-06",
    "body": "La persecución culmina en las ruinas.\n\nEl grupo enfrenta un abismoide, enjambres de cremlinos y múltiples peligros.\n\n[[PJ - Kaligula]] explora el interior y resuelve un misterio oculto.\n\n[[PJ - Roca Pequeña]] protege al grupo hasta caer inconsciente.\n\n[[PJ - Raito]] cumple su juramento ayudando a los mercaderes.\n\n[[PJ - Hanol]] y [[PJ - Guizmo]] resisten la persecución y logran reunirse con el grupo.\n\nFinalmente, regresan a los campamentos, donde:\n- Se reportan pérdidas\n- Se entregan prisioneros\n- [[PJ - Kaligula]] recibe una nota misteriosa\n\nLa sesión termina en un punto de aparente calma… antes de lo que vendrá.",
    "preview": "La persecución culmina en las ruinas.",
    "participants": [
      "Kaligula",
      "Roca Pequeña",
      "Raito",
      "Hanol",
      "Guizmo"
    ],
    "mentions": [
      {
        "raw": "PJ - Kaligula",
        "display": "Kaligula",
        "type": "pj"
      },
      {
        "raw": "PJ - Roca Pequeña",
        "display": "Roca Pequeña",
        "type": "pj"
      },
      {
        "raw": "PJ - Raito",
        "display": "Raito",
        "type": "pj"
      },
      {
        "raw": "PJ - Hanol",
        "display": "Hanol",
        "type": "pj"
      },
      {
        "raw": "PJ - Guizmo",
        "display": "Guizmo",
        "type": "pj"
      }
    ]
  }
]
