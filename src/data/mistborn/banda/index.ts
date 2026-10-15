/**
 * «La banda» of Nacidos de la bruma: the crew catalog (docs/banda/propuesta.md, Anexo A).
 * - Official rules (Manual de Nacidos de la bruma, cap. 8 «Metas y recompensas»): adapted very faithfully IN OUR OWN WORDS, every number
 *   and condition kept, with the chapter and section they come from (`cita`). The book's literal text never goes here (copyright): when
 *   one of these texts is rewritten, check it shares no run of 8 words with the book (the way the adventure chapters were checked).
 * - Our table rules (`casero`): prices, upkeep, wages, refuge capacity, the extra upgrades, trades, factions and the siege's scarcity,
 *   because the book leaves them to the GM; `casero` notes on an official rule say how this table plays it.
 * Texts that differ by era carry one version per era, so each campaign reads only its own. Loaded lazily through `WorldConfig.banda.cargar`.
 */
import type { CatalogoBanda } from '../../../lib/banda/tipos'
import { METALES } from '../metales'

const ORGANIZACIONES = 'Manual · Cap. 8 › Organizaciones'
const REFUGIOS = 'Manual · Cap. 8 › Refugios'
const MEJORAS = `${REFUGIOS} › Mejoras de refugio`
const BIBLIA = 'Biblia de campaña › La banda › Hoja de banda'

/** The book's basic refuge: the notes of the refuge type and one of the rules of the «Refugio» tab */
const REFUGIO_BASICO = 'Una guarida donde los personajes pasan desapercibidos mientras no lleven problemas a su puerta a propósito: el sótano de una taberna, un almacén cochambroso entre otros iguales o una cámara excavada bajo un solar que nadie mira. Sea como sea, tiene lo justo: quien descansa en él cuenta con un alojamiento modesto.'
/** Our capacity and upkeep of the basic refuge (Manual · Cap. 8 leaves them to the GM) */
const BASICO = { capacidad: 2, mantenimiento: { era1: 1, era2: 2 } }

/** «Una vez por escena… el elegido <efecto>» of the resistance cell, by scale */
const porLaCausa = (efecto: string) =>
  `Una vez por escena, cualquier miembro puede invertir 2 acciones en recordar por qué luchan, a sí mismo o a otro miembro que pueda oírle; el elegido ${efecto}. Nadie lo recibe más de una vez por sesión.`

/** The social club's rumour, by scale */
const murmullos = (efecto: string) =>
  `Ser socio da trato con el resto de miembros, para mezclarse con ellos e intentar inclinarlos hacia tus intereses. Una vez por sesión, uno o varios socios pueden lanzar un rumor, que corre por el club (y quizá por toda la comunidad, si la DJ lo decide); el primer socio que haga una prueba para sacarle partido ${efecto}`

export const CATALOGO_BANDA_MISTBORN: CatalogoBanda = {
  escalaMaxima: 4,
  notoriedadMaxima: 6,
  trabajadoresPorEscala: 3,
  semanasPorMes: 4,
  claveDinero: 'arquillas',
  sueldoPorRango: {
    secuaz: { era1: 3, era2: 6 },
    rival: { era1: 8, era2: 16 },
    jefe: { era1: 20, era2: 40 },
  },
  sueldoNacidoDelMetal: { era1: 10, era2: 20 },

  definiciones: {
    escala: {
      titulo: 'Escala', origen: 'oficial', cita: `${ORGANIZACIONES} › Escala de la organización`,
      texto: 'La escala mide, de forma abstracta, lo grande que es una organización. Su máximo lo pone el rango de quien la lidera (si hay varios líderes, cuenta el rango más alto): un líder de rango 1 da una escala máxima de 1, uno de rango 2 una de 2, y así hasta rango 5 y escala 5. La escala también limita cuántas metas de organización pueden llevar sus miembros al mismo tiempo: tantas como su escala.',
      casero: 'La banda empieza en escala 1 y sube hasta 4 eligiendo «Reclutamiento» al cumplir una meta de banda, sin el tope del rango de quien la lidera. Cada punto de escala da 3 plazas de trabajador.',
    },
    tesoreria: {
      titulo: 'Tesorería', origen: 'casero', cita: BIBLIA,
      texto: 'Dinero común de la banda, aparte del de cada personaje. Entra cuando un personaje aporta de su bolsa y sale con los gastos que hace un personaje, las mejoras, los sueldos y el mantenimiento.',
    },
    notoriedad: {
      titulo: 'Notoriedad', origen: 'casero', cita: BIBLIA,
      texto: {
        era1: 'Lo que saben de la banda sus enemigos, de 0 a 6. Sube con golpes ruidosos, testigos, fracasos y pasquines; baja borrando el rastro o cambiando de refugio. A 3, la Élite Dorada actúa contra la banda: golpea a un contacto o al refugio.',
        era2: 'Lo que saben de la banda sus enemigos, de 0 a 6. Sube con golpes ruidosos, testigos, fracasos y pasquines; baja borrando el rastro o cambiando de refugio. A 3, el Trío Dorado actúa contra la banda y puede atacar el refugio.',
      },
    },
  },

  reglasRefugio: [
    {
      titulo: 'Refugios', origen: 'oficial', cita: REFUGIOS,
      texto: 'Da igual con quién se junte la banda (rebeldes, colegas de empresa, agitadores políticos o agentes de la ley): un refugio siempre le viene bien. Tanto los miembros de una organización como quien va por libre necesitan un sitio donde recuperarse y reponer existencias entre aventuras, y es el escenario natural de los reposos entre los grandes momentos de la historia. Quien recibe esta recompensa, sea un personaje o una organización, obtiene un refugio básico; si ya tenía uno, puede ampliarlo con mejoras de refugio.',
    },
    {
      titulo: 'Refugios básicos', origen: 'oficial', cita: `${REFUGIOS} › Refugios básicos`, texto: REFUGIO_BASICO,
      casero: {
        era1: `Caben ${BASICO.capacidad} mejoras y su mantenimiento cuesta ${BASICO.mantenimiento.era1} ar por semana.`,
        era2: `Caben ${BASICO.capacidad} mejoras y su mantenimiento cuesta ${BASICO.mantenimiento.era2} ar por semana.`,
      },
    },
    {
      titulo: 'Mejoras de refugio', origen: 'oficial', cita: MEJORAS,
      texto: 'Un refugio básico apenas es un sitio seguro, algo incómodo, donde tramar planes y dormir unas horas; con un par de mejoras puede convertirse en una base escondida a la vista de todos. Cada mejora de refugio recibida como recompensa añade un rasgo a la guarida: uno de la tabla de mejoras o uno a medida pactado con la DJ. Si la DJ lo permite, los dueños también pueden construir o conseguir mejoras, o comprarlas sin más; el coste lo decide ella según la forma de la mejora y lo difícil que sea añadir lo que hace.',
      casero: 'Cada mejora tiene un precio y unas semanas de obra fijos: los paga la tesorería y la obra avanza al pasar semanas.',
    },
    {
      titulo: 'Traslado de refugios', origen: 'oficial', cita: `${REFUGIOS} › Traslado de refugios`,
      texto: 'Si un refugio queda al descubierto por lo que ha hecho un PJ, o la organización simplemente quiere mudarse, se puede llevar la base a otro lugar. La mudanza lleva como mínimo unos días, y bastante más según dónde esté el refugio y lo que haya dentro; la DJ puede exigir apoyo logístico o dinero. Ya en el sitio nuevo, el refugio conserva todas las mejoras que tenía y los rasgos narrativos que sigan encajando allí.',
      casero: 'Trasladarse baja la Notoriedad en 2. Movilidad solo se conserva si el sitio nuevo también es un vehículo.',
    },
  ],

  patrocinador: {
    titulo: 'Patrocinadores', origen: 'oficial', cita: 'Manual · Cap. 8 › Patrocinadores',
    texto: 'Un patrocinador es un PNJ que te da apoyo, recursos o consejo que no tendrías a tu alcance, a cambio de cierta lealtad. Su respaldo abre puertas, pero espera resultados: si no le compensa lo que le traes, puede retirarte la ayuda o incluso delatarte. Mientras persigas metas que le convengan te deja usar sus recursos, y te pone más a tu disposición cuanto más sube tu rango. Suele dar dos cosas: una bonificación propia y, donde llega su influencia y cuando le parezca posible y oportuno, comodidades de viaje y alojamiento para ti y tus compañeros (confortable con rango 1, lujoso con 2, aristocrático con 3, y aristocrático con atenciones a medida con 4 o más). Si domina uno de tus poderes alománticos o feruquímicos, puede hacer de mentor durante el reposo en lugar de darte esos beneficios.',
  },

  // Cap. 8, «Organizaciones»: the crew is an organization led by the PCs; its type gives these perks
  tiposOrganizacion: [
    {
      id: 'red-criminal', nombre: 'Red criminal', origen: 'oficial', cita: `${ORGANIZACIONES} › Ejemplo de organización: red criminal`,
      resumen: 'De una banda de ladrones bien avenida a un gran sindicato del crimen, estas organizaciones enriquecen a sus miembros con negocios ilegales compartidos. Se entienden con códigos y señales que no llaman la atención, y quien goza de buena fama entre los suyos puede pedir ayuda a otras organizaciones parecidas cuando la necesita. Una vez por sesión, uno o varios miembros de la red pueden pedir ayuda a los bajos fondos (una de sus ventajas), siempre que estén en un sitio donde sus contactos puedan llegar de forma razonable. Entre ladrones se espera cierto honor: si la gente o el material prestados reciben malos tratos o sufren daños, otras organizaciones criminales pueden reclamar más adelante favores de peso parecido. La DJ decide cómo se paga ese desaire.',
      ventajas: [
        {
          id: 'huida-limpia', nombre: 'Huida limpia', uso: 'sesion',
          porEscala: [
            'La red organiza una vía de escape y deja hasta tres caballos esperando en el sitio y a la hora acordados.',
            'La red organiza una vía de escape y deja hasta tres caballos esperando en el sitio y a la hora acordados.',
            'La red organiza una vía de escape y deja hasta tres caballos esperando en el sitio y a la hora acordados. Con escala 3 o más puede añadir una diligencia tirada por dos caballos (con cochero, si hace falta) o hasta tres caballos más.',
            'La red organiza una vía de escape y deja hasta tres caballos esperando en el sitio y a la hora acordados. Con escala 3 o más puede añadir una diligencia tirada por dos caballos (con cochero, si hace falta) o hasta tres caballos más.',
          ],
        },
        {
          id: 'musculo-prestado', nombre: 'Músculo prestado', uso: 'sesion',
          porEscala: [1, 2, 3, 4].map((n) =>
            `La red tira de un especialista: elegid a un miembro, que durante la semana siguiente tendrá ${n === 1 ? '1 compañero' : `${n} compañeros`} «Músculo a sueldo» (tantos como la escala).`),
        },
        {
          id: 'mensajeria', nombre: 'Servicio de «mensajería»', uso: 'sesion',
          porEscala: [
            'La red cuela de contrabando un objeto de tamaño Pequeño en el sitio que elijáis (el tamaño máximo crece con la escala).',
            'La red cuela de contrabando un objeto de tamaño Pequeño en el sitio que elijáis (el tamaño máximo crece con la escala).',
            'La red cuela de contrabando un objeto de hasta tamaño Mediano en el sitio que elijáis.',
            'La red cuela de contrabando un objeto de hasta tamaño Grande en el sitio que elijáis.',
          ],
        },
      ],
    },
    {
      id: 'celula-resistencia', nombre: 'Célula de resistencia', origen: 'oficial', cita: `${ORGANIZACIONES} › Ejemplo de organización: célula de resistencia`,
      resumen: 'Cuando una fuerza opresora aprieta, la gente puede acabar organizando movimientos clandestinos para plantarle cara. Estas células dan a los oprimidos un modo de convertir su descontento en acción directa, y además dan a sus miembros un propósito y compañeros con los que seguir peleando, día tras día, una guerra que parece imposible de ganar.',
      ventajas: [
        {
          id: 'por-la-causa', nombre: 'Por la causa', uso: 'escena',
          porEscala: [
            porLaCausa('cura 1d4 de salud o recupera 1 de concentración'),
            porLaCausa('cura 1d8 de salud o recupera 1d4 de concentración'),
            porLaCausa('cura 2d10 de salud, recupera 1d4 de concentración y queda Resuelto'),
            porLaCausa('cura 3d12 de salud, recupera 1d6 de concentración y queda Resuelto o Concentrado'),
          ],
        },
      ],
    },
    {
      id: 'empresa-comercial', nombre: 'Empresa comercial', origen: 'oficial', cita: `${ORGANIZACIONES} › Ejemplo de organización: empresa comercial`,
      resumen: 'Sea un gremio, un negocio de toda la vida o una firma que especula, una empresa comercial existe para ganar dinero y protegerlo. La DJ puede pedirle un volumen mínimo de negocio o limitarla a las actividades que permitan las autoridades del lugar.',
      ventajas: [
        {
          id: 'margen', nombre: 'Margen de beneficio', uso: 'pasiva',
          porEscala: ['Además de dar al grupo un cauce para sus negocios, una empresa que marcha bien produce dinero: mientras los personajes la mantengan sana y a salvo de amenazas, rinde cada mes el beneficio de su escala. Sale de la actividad diaria mientras el grupo persigue objetivos mayores, y quien la lidera lo gasta como le parezca.'],
        },
      ],
      beneficioMensual: [
        { era1: 50, era2: 100 },
        { era1: 125, era2: 250 },
        { era1: 250, era2: 500 },
        { era1: 500, era2: 1000 },
      ],
    },
    {
      id: 'grupo-politico', nombre: 'Grupo político', origen: 'oficial', cita: `${ORGANIZACIONES} › Ejemplo de organización: grupo político`,
      resumen: 'A sus miembros los une un interés o unos valores comunes: quieren sumar gente a su causa y manejar los resortes del poder. Si el grupo funciona, sus miembros participan en las decisiones del gobierno o, como mínimo, pueden presionar a quienes las toman; y, además de esos cauces formales, pertenecer a él abre la puerta a personas, sitios y actos que a un ciudadano de a pie le quedan lejos. Una vez por sesión, uno o varios miembros pueden pedir a un contacto político que mueva sus hilos para darles acceso a una persona importante, a un lugar seguro o a un acto privado; lo que se consigue crece con la escala, y la DJ decide hasta dónde llega cada favor.',
      ventajas: [
        {
          id: 'favores-politicos', nombre: 'Favores políticos', uso: 'sesion',
          porEscala: [
            'Persona: el alcalde de un pueblo, quien dirige una empresa pequeña o el cabeza de una casa noble menor. Lugar: visitar una fábrica o entrar en la casa o el negocio de un ciudadano corriente. Acto: una celebración privada de la baja nobleza o un acontecimiento cívico de aforo reducido.',
            'Persona: el alcalde de una ciudad, un administrador regional o quien lidera una casa noble o una gran compañía. Lugar: entrar en una sede del gobierno regional o visitar un gran centro de producción. Acto: un baile ofrecido por alguna Gran Casa o la reunión de los accionistas de una compañía importante.',
            'Persona: quien gobierna el Estado o un general de alto rango. Lugar: entrar en un edificio del gobierno o en una instalación militar del Estado. Acto: un desfile militar, un banquete oficial o una recepción con delegaciones extranjeras.',
            'Persona: quien lidera una organización secreta o una potencia extranjera de origen desconocido. Lugar: el santuario escondido de un grupo clandestino. Acto: una cumbre de poderosos cuya influencia va más allá de Scadrial.',
          ],
        },
      ],
    },
    {
      id: 'club-social', nombre: 'Club social', origen: 'oficial', cita: `${ORGANIZACIONES} › Ejemplo de organización: club social`,
      resumen: 'Tenga o no un fin declarado, un club social existe sobre todo para que sus miembros se traten entre sí. Da compañía y relaciones, y es de los mejores sitios para enterarse de los últimos chismes: al tratar con otros socios, un personaje se entera de los rumores que corren por la comunidad, y la DJ puede dejarle usar el club para hacer correr los suyos, sean ciertos o falsos.',
      ventajas: [
        {
          id: 'murmullos', nombre: 'Murmullos incesantes', uso: 'sesion',
          porEscala: [
            murmullos('lo encuentra verosímil: tiene ventaja en esa prueba y, para ella, la defensa espiritual y la cognitiva del objetivo cuentan 1 punto menos.'),
            murmullos('lo encuentra bastante convincente: tiene ventaja en esa prueba y, para ella, la defensa espiritual y la cognitiva del objetivo cuentan 2 puntos menos.'),
            murmullos('lo encuentra muy persuasivo: tiene ventaja en esa prueba y, para ella, la defensa espiritual y la cognitiva del objetivo cuentan 3 puntos menos.'),
            murmullos('lo encuentra casi imposible de rebatir: tiene ventaja en esa prueba y, para ella, la defensa espiritual y la cognitiva del objetivo cuentan 4 puntos menos.'),
          ],
        },
      ],
    },
  ],

  // Types of refuge: the basic one is the book's; capacity, upkeep and the other types are ours
  tiposRefugio: [
    {
      id: 'basico', nombre: 'Refugio básico', origen: 'oficial', cita: `${REFUGIOS} › Refugios básicos`, ...BASICO, movil: false,
      notas: REFUGIO_BASICO,
    },
    { id: 'barcaza', nombre: 'Barcaza', origen: 'casero', eras: ['era1'], capacidad: 4, mantenimiento: { era1: 4 }, movil: true, notas: 'Lleva Movilidad de serie; amarra en Urteau, Fellise y Luthadel.' },
    { id: 'sotano', nombre: 'Sótano en los canales secos', origen: 'casero', eras: ['era1'], capacidad: 3, mantenimiento: { era1: 1 }, movil: false, notas: 'Urteau, junto a los Hijos de la Ceniza.' },
    {
      id: 'taller', nombre: 'Taller o almacén', origen: 'casero', capacidad: 5, mantenimiento: { era1: 3, era2: 6 }, movil: false,
      notas: { era1: 'Un almacén de refugiados, una serrería, una vieja guarida de ladrones.', era2: 'El almacén portuario de los Guardianes, un taller, una nave junto a las vías.' },
    },
    { id: 'piso', nombre: 'Piso', origen: 'casero', eras: ['era2'], capacidad: 3, mantenimiento: { era2: 5 }, movil: false, notas: 'Un piso de la ciudad (tabla «Nuevo refugio» de El legado, cap. 6).' },
    { id: 'local', nombre: 'Local con negocio', origen: 'casero', eras: ['era2'], capacidad: 5, mantenimiento: { era2: 8 }, movil: false, notas: 'Club, salón, bar, teatro o serrería (tabla «Nuevo refugio» de El legado, cap. 6).' },
    { id: 'mansion', nombre: 'Mansión', origen: 'casero', capacidad: 8, mantenimiento: { era1: 10, era2: 20 }, movil: false, notoriedadAlInstalarse: 1, notas: 'Mucho sitio, pero llama la atención: Notoriedad +1 al instalarse.' },
  ],

  // The seven official upgrades (adapted per era; prices and weeks are ours) and our own ones
  mejorasRefugio: [
    {
      id: 'almacen', nombre: 'Almacén', origen: 'oficial', cita: MEJORAS, coste: [{ era1: 150, era2: 750 }], semanas: 2,
      efecto: {
        era1: 'Una parte del refugio se reserva para guardar provisiones prácticas. Cada vez que un personaje termina allí un descanso corto o largo, puede sacar un objeto que no sea un arma y cuyo precio no pase de 10 ar.',
        era2: 'Una parte del refugio se reserva para guardar provisiones prácticas. Cada vez que un personaje termina allí un descanso corto o largo, puede sacar un objeto que no sea un arma y cuyo precio no pase de 50 ar.',
      },
    },
    {
      id: 'armeria', nombre: 'Armería', origen: 'oficial', cita: MEJORAS, coste: [{ era1: 250, era2: 1250 }], semanas: 2,
      efecto: {
        era1: 'El refugio guarda un arsenal de los que impresionan. Al terminar allí un descanso corto o largo, un personaje puede rellenar toda la munición corriente de sus armas a distancia o llevarse un arma o una pieza de armadura de no más de 25 ar.',
        era2: 'El refugio guarda un arsenal de los que impresionan. Al terminar allí un descanso corto o largo, un personaje puede rellenar toda la munición corriente de sus armas a distancia o llevarse un arma o una pieza de armadura de no más de 150 ar.',
      },
    },
    {
      id: 'despensa', nombre: 'Despensa', origen: 'oficial', cita: MEJORAS, coste: [{ era1: 50, era2: 250 }], semanas: 1, libraEscasez: true,
      efecto: 'Hay comida y bebida de sobra en el refugio. Cada vez que un personaje termina allí un descanso corto o largo, se lleva raciones de comida de la calle para un día.',
      casero: { era1: 'El mantenimiento del refugio no sufre la escasez del asedio.' },
    },
    {
      id: 'mesa-trabajo', nombre: 'Mesa de trabajo', origen: 'oficial', cita: MEJORAS, coste: [{ era1: 150, era2: 750 }], semanas: 1,
      efecto: 'Un rincón del refugio está preparado para trabajar, con herramientas y material para hacer objetos nuevos. Mientras estén en el refugio, los personajes tienen ventaja en cualquier prueba de manufactura.',
    },
    {
      id: 'mobiliario', nombre: 'Mobiliario selecto', origen: 'oficial', cita: MEJORAS, coste: [{ era1: 100, era2: 500 }, { era1: 300, era2: 1500 }, { era1: 1000, era2: 5000 }], semanas: 1,
      efecto: 'La decoración, cuidada, hace que la banda esté a gusto. Se puede tomar hasta tres veces, y cada vez sube el nivel del alojamiento del refugio: confortable con la primera, lujoso con la segunda y aristocrático con la tercera.',
    },
    {
      id: 'movilidad', nombre: 'Movilidad', origen: 'oficial', cita: MEJORAS, coste: [], semanas: 0,
      efecto: {
        era1: 'El refugio está montado en algo que se mueve, como una embarcación, así que llevarlo de un sitio a otro es sencillo: puede viajar, e incluso desplazarse sin que tengáis que hacer nada.',
        era2: 'El refugio está montado en algo que se mueve, como un vagón de tren o un barco, así que llevarlo de un sitio a otro es sencillo: puede viajar, e incluso desplazarse sin que tengáis que hacer nada.',
      },
      casero: 'Viene con el vehículo: no se construye ni se compra aparte.',
    },
    {
      id: 'reservas-metal', nombre: 'Reservas de metal', origen: 'inferido', cita: MEJORAS, coste: [{ era1: 200, era2: 1000 }], semanas: 1,
      efecto: 'Una parte del refugio guarda metales, para que a la banda nunca le falte con qué usar sus artes metálicas. Como efecto, el libro repite el de la Mesa de trabajo (ventaja al manufacturar en el refugio), que parece una errata.',
      casero: 'Tras un descanso largo, un vial de metal básico por cada nacido del metal de la banda; una vez por fase, un metal raro a mitad de precio.',
    },
    { id: 'escondrijo', nombre: 'Escondrijo', origen: 'casero', efecto: 'Compartimentos ocultos: el Clavo y el contrabando no aparecen en un registro, y los registros e inspecciones no comprometen el refugio.', coste: [{ era1: 100, era2: 500 }], semanas: 1 },
    { id: 'enfermeria', nombre: 'Enfermería', origen: 'casero', efecto: 'Los trabajadores heridos sanan en una fase; con un sanador en su puesto, cada día de «Recuperación» de un personaje cuenta como tres.', coste: [{ era1: 200, era2: 1000 }], semanas: 2 },
    { id: 'nube-cobre', nombre: 'Nube de cobre', origen: 'casero', efecto: 'Con un ahumador en su puesto, el refugio no se detecta con bronce y se repite la tirada de cualquier suceso alomántico.', coste: [{ era1: 100, era2: 500 }], semanas: 1, requiereOficio: 'ahumador' },
    { id: 'red-vigias', nombre: 'Red de vigías', origen: 'casero', efecto: '−2 a la tirada de sucesos; una amenaza nunca coge a la banda por sorpresa.', coste: [{ era1: 120, era2: 600 }], semanas: 1 },
    { id: 'salida-secreta', nombre: 'Salida secreta', origen: 'casero', efecto: 'En un asalto nadie es capturado; si hay que abandonar el refugio, el traslado se hace esa misma noche.', coste: [{ era1: 150, era2: 750 }], semanas: 2 },
    {
      id: 'tapadera', nombre: 'Tapadera', origen: 'casero', coste: [{ era1: 300, era2: 1500 }], semanas: 3, requiereOficio: 'administrador', ingresoSemanal: { era1: 10, era2: 20 },
      efecto: {
        era1: 'Con un administrador en su puesto: +10 ar por semana, y las inspecciones se superan sin coste.',
        era2: 'Con un administrador en su puesto: +20 ar por semana, y las inspecciones se superan sin coste.',
      },
    },
    {
      id: 'sala-mapas', nombre: 'Sala de mapas', origen: 'casero', coste: [{ era1: 80, era2: 400 }], semanas: 1,
      efecto: {
        era1: 'Ventaja en la primera prueba del plan del siguiente encargo; +1 plano en la cripta.',
        era2: 'Ventaja en la primera prueba del plan del siguiente encargo.',
      },
    },
    { id: 'dormitorio-refugiados', nombre: 'Dormitorio de refugiados', origen: 'casero', eras: ['era1'], efecto: 'Al terminarlo, reputación +1 con los skaa; un candidato más por fase; mantenimiento +2 ar por semana.', coste: [{ era1: 100 }], semanas: 1, mantenimientoExtra: { era1: 2 } },
    { id: 'imprenta', nombre: 'Imprenta', origen: 'casero', eras: ['era2'], efecto: 'Una vez por fase, anula el +1 de Notoriedad de un pasquín de Kwylliam; con un periodista en su puesto, «Rumores» da tres.', coste: [{ era2: 1200 }], semanas: 2 },
    { id: 'garaje', nombre: 'Garaje', origen: 'casero', eras: ['era2'], efecto: 'Guarda un coche, que se compra aparte (4000 ar; Manual · Cap. 7 › Vehículos); si la banda es una Red criminal, su «Huida limpia» puede ser ese coche.', coste: [{ era2: 800 }], semanas: 1 },
    { id: 'laboratorio', nombre: 'Laboratorio', origen: 'casero', eras: ['era2'], efecto: 'Ventaja en Investigación sobre química, metales o fotografía.', coste: [{ era2: 1000 }], semanas: 2 },
    { id: 'archivo', nombre: 'Archivo', origen: 'casero', eras: ['era2'], efecto: 'La actividad «Investigación» tarda la mitad.', coste: [{ era2: 900 }], semanas: 2 },
  ],

  // Trades of the workers (all ours, on the official companions of the Manual · Cap. 8 › Compañeros)
  oficios: [
    { id: 'barquero', nombre: 'Barquero', origen: 'casero', eras: ['era1'], rango: 'secuaz', puesto: { tipoRefugio: 'barcaza', ventaja: 'Trasladar la barcaza no cuesta dinero y tarda la mitad.' }, ordenesAfines: ['contrabando'], perfilPnj: 'Plebeyo' },
    { id: 'cocinero', nombre: 'Cocinero', origen: 'casero', rango: 'secuaz', puesto: { mejoras: ['despensa'], ventaja: 'En la Despensa: el mantenimiento de su refugio baja un 25 %.', efecto: { mantenimientoPct: -25 } }, ordenesAfines: ['abastecer'], perfilPnj: 'Plebeyo' },
    { id: 'maton', nombre: 'Matón', origen: 'casero', rango: 'rival', puesto: { ventaja: 'Guardia: en un asalto lucha con la banda y nadie es sorprendido.' }, ordenesAfines: ['vigilar', 'hostigar'], perfilPnj: 'Matón' },
    { id: 'informante', nombre: 'Informante', origen: 'casero', rango: 'rival', puesto: null, ordenesAfines: ['rumores', 'borrar-rastro'], perfilPnj: 'Informador' },
    { id: 'falsificador', nombre: 'Falsificador', origen: 'casero', rango: 'rival', puesto: { mejoras: ['mesa-trabajo'], ventaja: 'Papeles falsos: ventaja para pasar un control, una vez por sesión.' }, ordenesAfines: ['borrar-rastro', 'sacar-prision'], perfilPnj: 'Especialista' },
    { id: 'sanador', nombre: 'Sanador', origen: 'casero', rango: 'rival', puesto: { mejoras: ['enfermeria'], ventaja: 'Hace funcionar la Enfermería.' }, ordenesAfines: [], perfilPnj: 'Especialista' },
    { id: 'artesano', nombre: 'Artesano', origen: 'casero', rango: 'rival', puesto: { mejoras: ['mesa-trabajo', 'armeria'], ventaja: 'Las obras de su refugio tardan una semana menos.', efecto: { obraSemanaExtra: true } }, ordenesAfines: ['construir'], perfilPnj: 'Especialista' },
    { id: 'contrabandista', nombre: 'Contrabandista', origen: 'casero', rango: 'rival', puesto: null, ordenesAfines: ['contrabando', 'abastecer'], perfilPnj: 'Forajido' },
    { id: 'mensajero', nombre: 'Mensajero', origen: 'casero', rango: 'secuaz', puesto: null, ordenesAfines: ['rumores'], perfilPnj: 'Plebeyo' },
    { id: 'administrador', nombre: 'Administrador', origen: 'casero', rango: 'rival', puesto: { mejoras: ['tapadera'], ventaja: 'Hace funcionar la Tapadera; si la banda es una empresa comercial, su beneficio sube un 50 %.', efecto: { beneficioPct: 50 } }, ordenesAfines: ['trabajo-honrado'], perfilPnj: 'Plebeyo' },
    { id: 'ahumador', nombre: 'Ahumador', origen: 'casero', rango: 'rival', metal: 'cobre', puesto: { mejoras: ['nube-cobre'], ventaja: 'Hace funcionar la Nube de cobre.' }, ordenesAfines: ['borrar-rastro'], perfilPnj: 'Especialista con alomancia' },
    { id: 'buscador', nombre: 'Buscador', origen: 'casero', rango: 'rival', metal: 'bronce', puesto: null, ordenesAfines: ['vigilar'], perfilPnj: 'Especialista con alomancia' },
    { id: 'periodista', nombre: 'Periodista', origen: 'casero', eras: ['era2'], rango: 'rival', puesto: { mejoras: ['imprenta'], ventaja: 'Con la Imprenta, «Rumores» da tres.' }, ordenesAfines: ['rumores'], perfilPnj: 'Plebeyo' },
    { id: 'mecanico', nombre: 'Mecánico', origen: 'casero', eras: ['era2'], rango: 'rival', puesto: { mejoras: ['garaje'], ventaja: 'Las obras de su refugio tardan una semana menos.', efecto: { obraSemanaExtra: true } }, ordenesAfines: ['construir'], perfilPnj: 'Especialista' },
    { id: 'abogado', nombre: 'Abogado', origen: 'casero', eras: ['era2'], rango: 'rival', puesto: null, ordenesAfines: ['borrar-rastro', 'sacar-prision'], perfilPnj: 'Plebeyo' },
  ],

  // Factions of the campaign bible («Era 1: el tablero», «Era 2: el tablero»)
  facciones: [
    { id: 'skaa-urteau', nombre: 'Skaa de Urteau y refugiados', origen: 'casero', eras: ['era1'] },
    { id: 'kandor', nombre: 'Construcciones Kandor y los obreros', origen: 'casero', eras: ['era1'] },
    { id: 'iglesia', nombre: 'Iglesia del Superviviente', origen: 'casero', eras: ['era1'] },
    { id: 'nobleza-menor', nombre: 'Nobleza menor y circuito de bailes', origen: 'casero', eras: ['era1'] },
    { id: 'elite-dorada', nombre: 'Élite Dorada', origen: 'casero', eras: ['era1'], enemiga: true },
    { id: 'asedio', nombre: 'Ejércitos del asedio', origen: 'casero', eras: ['era1'] },
    { id: 'gobierno-elend', nombre: 'Gobierno de Elend y la Asamblea', origen: 'casero', eras: ['era1'] },
    { id: 'universidad', nombre: 'Universidad de Elendel', origen: 'casero', eras: ['era2'] },
    { id: 'guardianes', nombre: 'Guardianes', origen: 'casero', eras: ['era2'] },
    { id: 'trio-dorado', nombre: 'Trío Dorado y la Élite', origen: 'casero', eras: ['era2'], enemiga: true },
    { id: 'conrad', nombre: 'Industrias Conrad', origen: 'casero', eras: ['era2'] },
    { id: 'morgenthax', nombre: 'Familia Morgenthax', origen: 'casero', eras: ['era2'] },
    { id: 'alta-sociedad', nombre: 'Alta sociedad y prensa', origen: 'casero', eras: ['era2'] },
    { id: 'aridos', nombre: 'Los Áridos', origen: 'casero', eras: ['era2'] },
    { id: 'armonia', nombre: 'Armonía', origen: 'casero', eras: ['era2'] },
  ],

  // Scarcity of the siege (Era 1): wages and upkeep cost more as the siege drags on (biblia, «El asedio»)
  contextos: [
    { id: 'sin-escasez', nombre: 'Sin escasez', origen: 'casero', eras: ['era1'], multiplicador: 1 },
    { id: 'asedio', nombre: 'Asedio de Straff y Cett (×1,5)', origen: 'casero', eras: ['era1'], multiplicador: 1.5 },
    { id: 'koloss', nombre: 'Invierno de los koloss (×2)', origen: 'casero', eras: ['era1'], multiplicador: 2 },
  ],

  // Black market of the crew's store (ours, docs/banda/propuesta-mercado-negro.md): only the director sees these numbers
  mercadoNegro: {
    usadoPct: 50,
    tramos: [
      { hasta: 50, etiqueta: 'Regalado', prob: 80 },
      { hasta: 80, etiqueta: 'Barato', prob: 60 },
      { hasta: 110, etiqueta: 'Justo', prob: 40 },
      { hasta: 140, etiqueta: 'Caro', prob: 20 },
      { hasta: 200, etiqueta: 'Abusivo', prob: 5 },
      { hasta: null, etiqueta: 'Nadie lo compra', prob: 0 },
    ],
    crecimientoPorSemana: 25,
    semanasMax: 4,
    modificadores: {
      oficio: { id: 'contrabandista', puntos: 10 },
      puesto: { mejora: 'almacen', puntos: 10, maximo: 20 },
      organizacion: { 'red-criminal': 5 },
      notoriedad: { desde: 3, puntos: -10 },
    },
    maximo: 95,
    riesgo: 5,
    mejoraEscondite: 'escondrijo',
    regla: {
      titulo: 'El mercado negro', origen: 'casero',
      texto: 'Los jugadores ponen el precio y solo ven el precio de mercado: el del libro, o la mitad si está usado. Las cuentas del mercado negro solo las ves tú: la escasez sube el valor de mercado, y el tramo en que cae el precio da la probabilidad de venderse cada semana. Al pasar semanas se tira 1d100 por lote y semana: con su probabilidad o menos se vende, y con 96-100 hay un soplo.',
    },
  },

  // «Cosas que pueden pasar» while weeks pass: a placeholder table until the real one (docs/banda/propuesta.md, Anexo A.8). Every week
  // something happens with a 17 or more on 1d20, one less for each quiet week in a row (9 at least); a second 1d20 says what
  sucesos: {
    origen: 'casero',
    dado: 20,
    umbralBase: 17,
    bajadaPorSemana: 1,
    umbralMinimo: 9,
    tabla: [
      { desde: 1, hasta: 4, titulo: 'Golpe de suerte', provisional: true, texto: 'Texto provisional: algo sale mejor de lo esperado (dinero, un contacto, una pista).' },
      { desde: 5, hasta: 10, titulo: 'Oportunidad', provisional: true, texto: 'Texto provisional: aparece una ocasión que la banda puede aprovechar.' },
      { desde: 11, hasta: 13, titulo: 'Complicación', provisional: true, texto: 'Texto provisional: surge un problema que hay que atender.' },
      { desde: 14, hasta: 16, titulo: 'Avería', provisional: true, efecto: 'danar-mejora', texto: 'Texto provisional: algo se rompe en el refugio y una mejora queda dañada.' },
      { desde: 17, hasta: 18, titulo: 'Daños en el refugio', provisional: true, efecto: 'danar-refugio', texto: 'Texto provisional: el refugio sufre daños y sus mejoras quedan dañadas.' },
      { desde: 19, hasta: 19, titulo: 'Problemas serios', provisional: true, texto: 'Texto provisional: algo pone en peligro a la banda, a un trabajador o al refugio.' },
      { desde: 20, hasta: 20, titulo: 'Desastre', provisional: true, texto: 'Texto provisional: un golpe grave contra la banda, que abre la próxima sesión.' },
    ],
  },

  // Candidate generator (ours): our own names by era (none from the books), a trait everyone sees and the director's secrets. No
  // metalborn but the trades that are (Ahumador, Buscador)
  generadorCandidatos: {
    nombres: {
      era1: [
        'Brann', 'Tessa', 'Corlo', 'Mirel', 'Hessa', 'Jorn', 'Lisbe', 'Rett', 'Saba', 'Tolle', 'Wenna', 'Arlo', 'Bessa', 'Cadd', 'Drusa',
        'Edrik', 'Faye', 'Grell', 'Hollis', 'Ivo', 'Jessa', 'Lom', 'Mott', 'Nessa', 'Orrin', 'Quill', 'Rook', 'Sela', 'Tamm', 'Vessa',
      ],
      era2: [
        'Abel Strome', 'Corra Vandt', 'Desmond Hale', 'Eliza Fenwick', 'Garret Lomm', 'Hester Caine', 'Ivan Rook', 'Josie Marr',
        'Lionel Tadd', 'Mabel Quent', 'Nolan Pike', 'Opal Sterne', 'Percival Ash', 'Rosalind Teague', 'Silas Brook', 'Tamsin Rhee',
        'Ulric Dane', 'Vera Holt', 'Wendell Crane', 'Ada Venn', 'Benedict Shaw', 'Clara Wynn', 'Doran Fitch', 'Edith Morrow',
      ],
    },
    rasgos: [
      'Bebe más de la cuenta', 'No calla nunca', 'Desconfía de los nobles', 'Tiene familia a su cargo', 'Fue soldado', 'Callado y observador',
      'Juega a los dados en cuanto puede', 'Muy supersticioso', 'Sabe leer y escribir', 'Se ríe por cualquier cosa', 'Siempre llega tarde',
      'Cojea de una vieja herida', 'Canta mientras trabaja', 'Conoce a todo el mundo en el muelle', 'Muy devoto', 'Le da miedo la bruma',
      'Guarda rencor', 'Siempre tiene hambre', 'Muy ordenado', 'Habla demasiado alto',
    ],
    secretos: [
      'Informa a otra facción a cambio de dinero', 'Debe dinero a un prestamista peligroso', 'Huye de la justicia', 'Robó a su anterior patrón',
      'Piensa irse en cuanto cobre bastante', 'Tiene un familiar en la guardia', 'Busca vengarse de alguien de la ciudad',
      'Trabaja para el enemigo sin saberlo', 'Se le escapan cosas cuando bebe', 'Conoce de antes a alguien de la banda',
      'Sabe un secreto de uno de los personajes', 'Esconde a su familia lejos de aquí',
    ],
    conFaccion: 50,
    conSecreto: 50,
  },

  metales: METALES.map((m) => ({ id: m.id, nombre: m.nombre })),
}
