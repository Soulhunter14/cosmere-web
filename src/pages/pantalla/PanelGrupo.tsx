import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, UserPlus, Users } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useWorldConfig } from '../../store/campaignStore'
import { Button, Disclosure, EmptyState, ErrorMessage, Spinner } from '../../components/ui'
import { CharacterIdentityPills } from '../../components/CharacterIdentityPills'
import { CosmereIcon } from '../../components/CosmereIcon'
import { StatIcons } from '../../lib/gameIcons'
import { c, eyebrow, font, fs, numeral, pill, radius, shadow, tone, type Tone } from '../../theme'
import type { Character } from '../../types'
import type { AttrField } from '../../worlds/types'
import { usePaneles, usePantalla } from './contexto'
import { habilidadesDe } from './adversarios'
import { anadirPersonajes, asegurarEncuentro, destinoAnadir } from './encuentro'
import { personajeEnCombate } from './estado'
import { BarraRecurso } from './piezas'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }

const ATRIBUTO_DE_CODIGO: Record<string, AttrField> = {
  FUE: 'fuerza', VEL: 'velocidad', INT: 'intelecto', VOL: 'voluntad', DIS: 'discernimiento', PRE: 'presencia',
}

/** The custom skill slots that are in use (Alomancia, Feruquimia, a profession…): rank + attribute (+ server bonus) */
function personalizadas(ch: Character, bonos: Partial<Record<AttrField, number>>) {
  return ([1, 2, 3, 4, 5, 6] as const)
    .map((i) => {
      const nombre = ch[`habilidadPersonalizada${i}`]
      const atributo = ATRIBUTO_DE_CODIGO[ch[`habilidadPersonalizada${i}Atributo`]] as AttrField | undefined
      const valor = ch[`habilidadPersonalizada${i}Valor`] ?? 0
      return nombre ? { nombre, mod: valor + (atributo ? (ch[atributo] ?? 0) + (bonos[atributo] ?? 0) : 0) } : null
    })
    .filter((x): x is { nombre: string; mod: number } => x !== null)
}

export function PanelGrupo() {
  const { cId, estado, actualizar, ultimoDiario } = usePantalla()
  const { irA } = usePaneles()
  const cfg = useWorldConfig()
  const { data: personajes = [], isLoading, isError } = useQuery({ queryKey: ['characters', cId], queryFn: () => charactersApi.getAll(cId) })

  if (isLoading) return <Spinner label="Cargando personajes…" />
  if (isError) return <ErrorMessage message="No se pudieron cargar los personajes." />
  if (personajes.length === 0) {
    return <EmptyState icon={<Users size={22} aria-hidden />} title="Sin personajes" description="Cuando los jugadores creen sus personajes, aparecerán aquí." />
  }

  // The characters that fight nowhere (with a split party, one already in the other fight stays there)
  const fuera = personajes.filter((ch) => !personajeEnCombate(estado, ch.id))
  const anadir = (lista: Character[]) => {
    actualizar((b) => { anadirPersonajes(b, asegurarEncuentro(b, 'Encuentro', ultimoDiario), lista, cfg.habilidades, cfg.features.bonosServidor) })
    irA('encuentro')
  }

  return (
    <div style={stack(14)}>
      {fuera.length > 0 && (
        <Button variant="secondary" icon={<UserPlus size={16} aria-hidden />} onClick={() => anadir(fuera)} style={{ alignSelf: 'flex-start' }}>
          {estado.encuentros.length ? `Añadir ${destinoAnadir(estado)} a los que faltan` : 'Empezar un encuentro con el grupo'}
        </Button>
      )}
      <ul style={{ ...listReset, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
        {personajes.map((ch) => (
          <li key={ch.id}>
            <TarjetaPj ch={ch} enEncuentro={!fuera.includes(ch)} onAnadir={() => anadir([ch])} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function TarjetaPj({ ch, enEncuentro, onAnadir }: { ch: Character; enEncuentro: boolean; onAnadir: () => void }) {
  const { cId, estado } = usePantalla()
  const cfg = useWorldConfig()
  const bonos = cfg.features.bonosServidor ? ch.bonosAtributos : {}
  const habilidades = habilidadesDe(ch, cfg.habilidades, bonos)
  const extra = personalizadas(ch, bonos)
  const donde = personajeEnCombate(estado, ch.id)
  const cb = donde?.cb ?? null
  const varios = estado.encuentros.length > 1
  const nombreEstado = (id: string) => cfg.estados.find((e) => e.id === id)?.nombre ?? id
  const investiduraMax = ch.investidura?.total ?? 0

  return (
    <article style={{ ...stack(12), height: '100%', padding: 14, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }}>
      <header>
        <h3 style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, lineHeight: 1.2, color: c.text }}>{ch.name}</h3>
        <p style={{ fontSize: fs.sm, color: c.muted }}>
          {ch.playerName || 'Sin jugador'} · Nv. {ch.level}{ch.ascendencia ? ` · ${ch.ascendencia}` : ''}
        </p>
        <CharacterIdentityPills character={ch} style={{ marginTop: 6 }} />
        {donde && varios && <span style={{ ...pill(tone.rubi), marginTop: 6 }}>En «{donde.enc.titulo}»</span>}
      </header>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px 14px', flexWrap: 'wrap' }}>
        <Defensa etiqueta="Física" valor={ch.defensaFisica?.total ?? 10} t={tone.granate} />
        <Defensa etiqueta="Cognitiva" valor={ch.defensaCognitiva?.total ?? 10} t={tone.zafiro} />
        <Defensa etiqueta="Espiritual" valor={ch.defensaEspiritual?.total ?? 10} t={tone.amatista} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: fs.xs, color: c.subtle }}>
          <CosmereIcon name="marco-desvio" size={18} style={{ color: tone.topacio.fg }} />
          Desvío <strong style={{ ...numeral, fontSize: fs.md, color: c.text }}>{ch.desvioCalculado?.total ?? ch.desvio}</strong>
        </span>
      </div>

      {cb ? (
        <BarraRecurso etiqueta={donde && varios ? `Salud en «${donde.enc.titulo}»` : 'Salud en el encuentro'} icono={<StatIcons.salud size={13} aria-hidden />} actual={cb.salud.actual} max={cb.salud.max} t={tone.granate} />
      ) : null}

      <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
        <Dato etiqueta="Salud máx." valor={ch.salud?.total ?? ch.maxHealth} t={tone.granate} />
        <Dato etiqueta="Concentración" valor={ch.concentracion?.total ?? 0} t={tone.heliodoro} />
        {investiduraMax > 0 && <Dato etiqueta="Investidura" valor={investiduraMax} t={tone.amatista} />}
        <Dato etiqueta="Movimiento" valor={`${ch.movimiento?.total ?? 0} ${ch.movimiento?.unidad ?? 'm'}`} t={tone.esmeralda} />
        {cfg.recursos.filter((r) => ch.recursos?.[r.clave] !== undefined).map((r) => (
          <Dato key={r.clave} etiqueta={r.label} valor={Number(ch.recursos[r.clave]).toFixed(r.decimales)} t={tone.cuarzo} />
        ))}
      </dl>

      {cb && cb.estados.length > 0 && (
        <p style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cb.estados.map((e, i) => <span key={`${e.id}-${i}`} style={pill(tone.topacio)}>{nombreEstado(e.id)}{e.valor ? ` [${e.valor}]` : ''}</span>)}
        </p>
      )}

      <Disclosure headingLevel={4} title="Habilidades" style={{ boxShadow: 'none' }}>
        <ul style={{ ...listReset, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '4px 12px' }}>
          {[...cfg.habilidades.map((h) => ({ nombre: h.label, mod: habilidades[h.field] ?? 0 })), ...extra].map((h) => (
            <li key={h.nombre} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: fs.sm, padding: '3px 0', borderBottom: `1px solid ${c.border}` }}>
              <span style={{ color: c.muted }}>{h.nombre}</span>
              <span style={{ ...numeral, fontSize: fs.sm, color: h.mod > 0 ? c.text : c.subtle }}>{h.mod >= 0 ? '+' : ''}{h.mod}</span>
            </li>
          ))}
        </ul>
      </Disclosure>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
        {!enEncuentro && (
          <Button size="sm" variant="secondary" icon={<UserPlus size={15} aria-hidden />} onClick={onAnadir}>
            {varios ? `Añadir ${destinoAnadir(estado)}` : 'Al encuentro'}
          </Button>
        )}
        <Link
          to={`/campaigns/${cId}/gm/characters/${ch.id}`}
          className="ui-btn ui-btn--ghost"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 36, padding: '0 12px', borderRadius: radius.sm,
            color: c.muted, fontSize: fs.sm, fontWeight: 650, textDecoration: 'none', border: '1px solid transparent',
          }}
        >
          <ExternalLink size={15} aria-hidden />
          Ver ficha
        </Link>
      </div>
    </article>
  )
}

function Defensa({ etiqueta, valor, t }: { etiqueta: string; valor: number; t: Tone }) {
  return (
    <span title={`Defensa ${etiqueta.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ position: 'relative', width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <CosmereIcon name="marco-defensa" size={32} style={{ position: 'absolute', inset: 0, margin: 'auto', color: t.fg }} />
        <span style={{ ...numeral, position: 'relative', fontSize: fs.sm + 1, color: c.text, marginTop: 1 }}>{valor}</span>
      </span>
      <span style={{ fontSize: fs.xs, color: c.subtle }}>{etiqueta}</span>
    </span>
  )
}

function Dato({ etiqueta, valor, t }: { etiqueta: string; valor: number | string; t: Tone }) {
  return (
    <div style={{ padding: '8px 10px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}>
      <dt style={{ ...eyebrow, color: t.fg, marginBottom: 2 }}>{etiqueta}</dt>
      <dd style={{ ...numeral, fontSize: fs.lg, color: c.text }}>{valor}</dd>
    </div>
  )
}
