/**
 * «Cartel» tab: the crew's mission board. The director writes notices (jobs, rumours, threats), keeps them as drafts and publishes
 * them; the crew as a whole (any player it is shared with, or the director) accepts or rejects a published one, and what it accepts is
 * in progress until the director closes it. A rumour's truth, the notes and what happens if it expires are only the director's.
 * Spec: docs/banda/propuesta-cartel-misiones.md.
 */
import { useState, type ReactNode } from 'react'
import { Check, ClipboardList, Lock, Pencil, Plus, Search, Send, Trash2, Undo2, X } from 'lucide-react'
import { Badge, Button, Card, ConfirmDialog, Disclosure, EmptyState, ErrorMessage, IconButton, SectionTitle, Segmented } from '../../components/ui'
import { c, font, fs, tone } from '../../theme'
import { avisoCerrado, type Aviso, type AvisoPrivado, type BandaEstado, type BandaSecretos, type TipoAviso } from './estado'
import { aceptarAviso, borrarAviso, descartarAviso, publicarAviso, rechazarAviso, type OpBanda } from './operaciones'
import { ESTADO_AVISO, TIPO_AVISO, VERDAD_RUMOR, semanasTexto, textoSuave, useEjecutar } from './etiquetas'
import { AvisoSheet, CerrarAvisoSheet, PistaSheet } from './hojasCartel'

interface Props {
  banda: BandaEstado
  /** Only the director's */
  secretos: BandaSecretos | null
  /** The director may write and close notices */
  editable: boolean
  /** Whoever sees the sheet may accept or reject for the crew */
  puedeActuar: boolean
  dinero: (v: number) => string
  aplicar: (op: OpBanda) => void
}

type Filtro = 'todo' | TipoAviso
type Hoja =
  | { tipo: 'aviso'; aviso: Aviso | null; publicado: boolean }
  | { tipo: 'cerrar'; aviso: Aviso }
  | { tipo: 'pista'; aviso: Aviso }
type Confirmacion = { accion: 'rechazar' | 'retirar' | 'borrar'; aviso: Aviso }

export function PanelCartel({ banda, secretos, editable, puedeActuar, dinero, aplicar }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('todo')
  const [hoja, setHoja] = useState<Hoja | null>(null)
  const [confirmar, setConfirmar] = useState<Confirmacion | null>(null)
  const { error, ejecutar } = useEjecutar(aplicar)

  const enCurso = banda.cartel.filter((a) => a.estado === 'aceptado')
  const publicados = banda.cartel.filter((a) => a.estado === 'publicado')
  const visibles = publicados.filter((a) => filtro === 'todo' || a.tipo === filtro)
  const archivo = banda.cartel.filter(avisoCerrado).sort((a, b) => (b.cerradoEn ?? '').localeCompare(a.cerradoEn ?? ''))
  const borradores = secretos?.borradores ?? []
  const origenDe = (a: Aviso) => (a.origenContacto ? banda.contactos.find((ct) => ct.id === a.origenContacto)?.nombre : null) ?? a.origenTexto
  const privadoDe = (a: Aviso): AvisoPrivado | null => secretos?.cartel[a.id] ?? null

  const tarjeta = (a: Aviso, acciones: ReactNode) => (
    <TarjetaAviso key={a.id} aviso={a} origen={origenDe(a)} privado={privadoDe(a)} dinero={dinero} acciones={acciones} />
  )
  const editar = (a: Aviso, publicado: boolean) => (
    <IconButton label={`Editar ${a.titulo}`} onClick={() => setHoja({ tipo: 'aviso', aviso: a, publicado })}><Pencil size={18} aria-hidden /></IconButton>
  )

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section>
        <SectionTitle as="h3">En curso</SectionTitle>
        {enCurso.length === 0 ? (
          <p style={textoSuave}>La banda no tiene nada entre manos.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {enCurso.map((a) => tarjeta(a, (
              <>
                {puedeActuar && (
                  <Button size="sm" variant="secondary" icon={<Search size={15} aria-hidden />} onClick={() => setHoja({ tipo: 'pista', aviso: a })}>
                    Añadir pista
                  </Button>
                )}
                {editable && (
                  <>
                    <Button size="sm" icon={<Check size={15} aria-hidden />} onClick={() => setHoja({ tipo: 'cerrar', aviso: a })}>Cerrar</Button>
                    {editar(a, true)}
                  </>
                )}
              </>
            )))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle
          as="h3"
          action={editable ? (
            <Button size="sm" icon={<Plus size={15} aria-hidden />} onClick={() => setHoja({ tipo: 'aviso', aviso: null, publicado: false })}>Nuevo aviso</Button>
          ) : undefined}
        >
          En el cartel
        </SectionTitle>
        {publicados.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <Segmented<Filtro>
              size="sm"
              ariaLabel="Qué avisos ver"
              value={filtro}
              onChange={setFiltro}
              options={[
                { value: 'todo', label: 'Todo' },
                { value: 'encargo', label: 'Encargos' },
                { value: 'rumor', label: 'Rumores' },
                { value: 'amenaza', label: 'Amenazas' },
              ]}
            />
          </div>
        )}
        {publicados.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={28} aria-hidden />}
            title="El cartel está vacío"
            description={editable ? 'Encargos, rumores y amenazas para la banda. Escribe uno y publícalo cuando quieras que lo vean.' : 'El director aún no ha colgado nada.'}
          />
        ) : visibles.length === 0 ? (
          <p style={textoSuave}>No hay avisos de ese tipo.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {visibles.map((a) => tarjeta(a, (
              <>
                {puedeActuar && (
                  <>
                    <Button size="sm" icon={<Check size={15} aria-hidden />} onClick={() => ejecutar(aceptarAviso(a.id))}>Aceptar</Button>
                    <Button size="sm" variant="ghost" icon={<X size={15} aria-hidden />} onClick={() => setConfirmar({ accion: 'rechazar', aviso: a })}>Rechazar</Button>
                  </>
                )}
                {editable && (
                  <>
                    {editar(a, true)}
                    <IconButton label={`Retirar ${a.titulo} del cartel`} onClick={() => setConfirmar({ accion: 'retirar', aviso: a })}><Undo2 size={18} aria-hidden /></IconButton>
                    <IconButton label={`Borrar ${a.titulo}`} onClick={() => setConfirmar({ accion: 'borrar', aviso: a })}><Trash2 size={18} aria-hidden /></IconButton>
                  </>
                )}
              </>
            )))}
          </div>
        )}
      </section>

      {editable && borradores.length > 0 && (
        <Disclosure title={`Borradores (${borradores.length})`} summary="Solo los ves tú" icon={<Lock size={16} aria-hidden />}>
          <div style={{ display: 'grid', gap: 10 }}>
            {borradores.map((a) => tarjeta(a, (
              <>
                <Button size="sm" icon={<Send size={15} aria-hidden />} onClick={() => ejecutar(publicarAviso(a.id))}>Publicar</Button>
                {editar(a, false)}
                <IconButton label={`Borrar ${a.titulo}`} onClick={() => setConfirmar({ accion: 'borrar', aviso: a })}><Trash2 size={18} aria-hidden /></IconButton>
              </>
            )))}
          </div>
        </Disclosure>
      )}

      {archivo.length > 0 && (
        <Disclosure title={`Archivo (${archivo.length})`} summary="Lo cumplido, fallido, rechazado, caducado o retirado">
          <div style={{ display: 'grid', gap: 10 }}>
            {archivo.map((a) => tarjeta(a, editable ? (
              <IconButton label={`Borrar ${a.titulo}`} onClick={() => setConfirmar({ accion: 'borrar', aviso: a })}><Trash2 size={18} aria-hidden /></IconButton>
            ) : null))}
          </div>
        </Disclosure>
      )}

      {error && <ErrorMessage message={error} />}

      {hoja?.tipo === 'aviso' && (
        <AvisoSheet
          key={hoja.aviso?.id ?? 'nuevo'}
          aviso={hoja.aviso}
          privado={hoja.aviso ? privadoDe(hoja.aviso) : null}
          publicado={hoja.publicado}
          contactos={banda.contactos}
          onClose={() => setHoja(null)}
          aplicar={aplicar}
        />
      )}
      {hoja?.tipo === 'cerrar' && <CerrarAvisoSheet aviso={hoja.aviso} onClose={() => setHoja(null)} aplicar={aplicar} />}
      {hoja?.tipo === 'pista' && <PistaSheet aviso={hoja.aviso} onClose={() => setHoja(null)} aplicar={aplicar} />}

      <ConfirmDialog
        open={!!confirmar}
        title={confirmar ? CONFIRMACION[confirmar.accion].titulo(confirmar.aviso.titulo) : ''}
        message={confirmar ? CONFIRMACION[confirmar.accion].mensaje : undefined}
        confirmLabel={confirmar ? CONFIRMACION[confirmar.accion].boton : undefined}
        onConfirm={() => {
          if (confirmar) {
            const { accion, aviso } = confirmar
            ejecutar(accion === 'rechazar' ? rechazarAviso(aviso.id) : accion === 'retirar' ? descartarAviso(aviso.id, '') : borrarAviso(aviso.id))
          }
          setConfirmar(null)
        }}
        onCancel={() => setConfirmar(null)}
      />
    </div>
  )
}

const CONFIRMACION: Record<Confirmacion['accion'], { titulo: (t: string) => string; mensaje: string; boton: string }> = {
  rechazar: { titulo: (t) => `¿Rechazar «${t}»?`, mensaje: 'Sale del cartel y pasa al archivo. No se puede deshacer.', boton: 'Rechazar' },
  retirar: { titulo: (t) => `¿Retirar «${t}» del cartel?`, mensaje: 'Los jugadores dejan de verlo en el cartel; queda en el archivo.', boton: 'Retirar' },
  borrar: { titulo: (t) => `¿Borrar «${t}»?`, mensaje: 'Desaparece del todo, también lo que solo ves tú.', boton: 'Borrar' },
}

/** Deadline of a notice, as the director's card says it (the players never see it) */
function plazoDe(a: Aviso, privado: AvisoPrivado | null): { texto: string; alerta: boolean } | null {
  if (avisoCerrado(a) || !privado || privado.semanasRestantes === null) return null
  const n = privado.semanasRestantes
  if (a.estado === 'aceptado') return n === 0 ? { texto: 'Fuera de plazo', alerta: true } : { texto: `Quedan ${semanasTexto(n)}`, alerta: false }
  return { texto: `Caduca en ${semanasTexto(n)}`, alerta: n <= 1 }
}

function TarjetaAviso({ aviso: a, origen, privado, dinero, acciones }: {
  aviso: Aviso
  origen: string
  privado: AvisoPrivado | null
  dinero: (v: number) => string
  acciones: ReactNode
}) {
  const tipo = TIPO_AVISO[a.tipo]
  const plazo = plazoDe(a, privado)
  const datos = [
    origen && `Lo ofrece: ${origen}`,
    a.lugar && `Lugar: ${a.lugar}`,
  ].filter(Boolean) as string[]
  return (
    <Card padding={14} style={{ display: 'grid', gap: 8 }}>
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
          <Badge tone={tipo.tono}>{tipo.label}</Badge>
          {a.estado !== 'publicado' && <Badge tone={ESTADO_AVISO[a.estado].tono}>{ESTADO_AVISO[a.estado].label}</Badge>}
          {plazo && (
            <Badge tone={plazo.alerta ? 'rubi' : 'cuarzo'}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Lock size={11} aria-hidden /><span className="sr-only">Solo el director: </span>{plazo.texto}
              </span>
            </Badge>
          )}
        </div>
        <h4 style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text, lineHeight: 1.25 }}>{a.titulo}</h4>
      </div>
      {a.texto && <p style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{a.texto}</p>}
      {datos.length > 0 && <p style={textoSuave}>{datos.join(' · ')}</p>}
      {(a.recompensa || a.pago) && (
        <p style={textoSuave}>
          <strong style={{ color: c.text }}>Recompensa:</strong> {a.recompensa || dinero(a.pago ?? 0)}
          {a.recompensa && a.pago && !a.recompensa.includes(dinero(a.pago)) ? ` (${dinero(a.pago)} a la tesorería)` : ''}
        </p>
      )}
      {a.pistas.length > 0 && (
        <div>
          <p style={{ fontSize: fs.sm, fontWeight: 650, color: c.text, marginBottom: 4 }}>Pistas</p>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 2 }}>
            {a.pistas.map((p, i) => <li key={i} style={textoSuave}>{p}</li>)}
          </ul>
        </div>
      )}
      {avisoCerrado(a) && a.desenlace && <p style={textoSuave}><strong style={{ color: c.text }}>Desenlace:</strong> {a.desenlace}</p>}
      {privado && (privado.verdad || privado.notas || privado.siCaduca) && (
        <div style={{ ...textoSuave, display: 'flex', gap: 6, alignItems: 'flex-start', color: 'var(--gm)' }}>
          <Lock size={14} aria-hidden style={{ flexShrink: 0, marginTop: 3 }} />
          <div style={{ display: 'grid', gap: 2 }}>
            <span className="sr-only">Solo el director: </span>
            {a.tipo === 'rumor' && privado.verdad && (
              <span><Badge tone={VERDAD_RUMOR[privado.verdad].tono}>{VERDAD_RUMOR[privado.verdad].label}</Badge></span>
            )}
            {privado.notas && <span style={{ whiteSpace: 'pre-line' }}>{privado.notas}</span>}
            {privado.siCaduca && <span>Si caduca: {privado.siCaduca}</span>}
          </div>
        </div>
      )}
      {acciones && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, paddingTop: 4, borderTop: `1px solid ${tone.cuarzo.border}` }}>
          {acciones}
        </div>
      )}
    </Card>
  )
}
