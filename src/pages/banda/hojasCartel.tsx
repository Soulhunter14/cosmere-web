/**
 * Sheets of the «Cartel» tab: write a notice (the director: as a draft or published at once), close one in progress and add a clue.
 * Spec: docs/banda/propuesta-cartel-misiones.md §5.4.
 */
import { useState } from 'react'
import { Button, ErrorMessage, Field, Input, Segmented, Select, Sheet, Textarea } from '../../components/ui'
import { c, fs } from '../../theme'
import { nuevoId, type Aviso, type AvisoPrivado, type Contacto, type TipoAviso, type VerdadRumor } from './estado'
import {
  anadirPista, cerrarAviso, editarAviso, guardarBorrador, publicarAviso, type DatosAviso, type DatosPrivadosAviso, type OpBanda,
} from './operaciones'
import { TIPO_AVISO, VERDAD_RUMOR, leerCantidad, useEjecutar } from './etiquetas'
import { CampoCantidad } from './piezas'

const etiqueta = { fontSize: fs.sm, fontWeight: 650, color: c.text, marginBottom: 6 } as const

/** The amount as the field shows it («12,5»), or empty */
const textoImporte = (v: number | null) => (v === null ? '' : String(v).replace('.', ','))

/**
 * Writes a notice. A new one or a draft can be saved as a draft or published; a published one (or in progress) is only corrected.
 * `aviso` null = new
 */
export function AvisoSheet({ aviso, privado, publicado, contactos, onClose, aplicar }: {
  aviso: Aviso | null
  privado: AvisoPrivado | null
  /** It is already on the board (it is corrected, not published again) */
  publicado: boolean
  contactos: Contacto[]
  onClose: () => void
  aplicar: (op: OpBanda) => void
}) {
  const [id] = useState(() => aviso?.id ?? nuevoId())
  const [tipo, setTipo] = useState<TipoAviso>(aviso?.tipo ?? 'encargo')
  const [titulo, setTitulo] = useState(aviso?.titulo ?? '')
  const [texto, setTexto] = useState(aviso?.texto ?? '')
  const [origenContacto, setOrigenContacto] = useState<string | null>(aviso?.origenContacto ?? null)
  const [origenTexto, setOrigenTexto] = useState(aviso?.origenTexto ?? '')
  const [lugar, setLugar] = useState(aviso?.lugar ?? '')
  const [recompensa, setRecompensa] = useState(aviso?.recompensa ?? '')
  const [pago, setPago] = useState(textoImporte(aviso?.pago ?? null))
  const [plazo, setPlazo] = useState(privado?.semanasRestantes != null ? String(privado.semanasRestantes) : '')
  const [verdad, setVerdad] = useState<VerdadRumor | null>(privado?.verdad ?? null)
  const [notas, setNotas] = useState(privado?.notas ?? '')
  const [siCaduca, setSiCaduca] = useState(privado?.siCaduca ?? '')
  const { error, ejecutar } = useEjecutar(aplicar)

  const datos = (): DatosAviso => {
    const importe = leerCantidad(pago)
    const semanas = plazo.trim() ? Number(plazo) : null
    return {
      tipo, titulo, texto, origenContacto, origenTexto, lugar, recompensa, pago: Number.isNaN(importe) ? null : importe,
      semanasRestantes: semanas === null || Number.isNaN(semanas) ? null : semanas,
    }
  }
  const priv = (): DatosPrivadosAviso => ({ verdad, notas, siCaduca })

  const guardar = () => ejecutar(publicado ? editarAviso(id, datos(), priv()) : guardarBorrador(datos(), priv(), id), onClose)
  const publicar = () => ejecutar((doc, ctx) => publicarAviso(id)(guardarBorrador(datos(), priv(), id)(doc, ctx), ctx), onClose)

  return (
    <Sheet
      open
      onClose={onClose}
      title={aviso ? `Editar: ${aviso.titulo}` : 'Nuevo aviso'}
      description={publicado ? undefined : 'Un borrador solo lo ves tú hasta que lo publicas.'}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          {publicado ? (
            <Button onClick={guardar} disabled={!titulo.trim()}>Guardar</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={guardar} disabled={!titulo.trim()}>Guardar borrador</Button>
              <Button onClick={publicar} disabled={!titulo.trim()}>Publicar</Button>
            </>
          )}
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <div>
          <p style={etiqueta}>Tipo</p>
          <Segmented<TipoAviso>
            size="sm"
            ariaLabel="Tipo de aviso"
            value={tipo}
            onChange={setTipo}
            options={(Object.keys(TIPO_AVISO) as TipoAviso[]).map((t) => ({ value: t, label: TIPO_AVISO[t].label }))}
          />
        </div>
        <Field label="Título">
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Cobrar la deuda de Brannoc" autoFocus maxLength={80} />
        </Field>
        <Field label="Qué se cuenta" hint="El gancho, como lo cuenta quien lo ofrece. Lo leen los jugadores.">
          <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} />
        </Field>
        <Field label="Quién lo ofrece">
          <Select value={origenContacto ?? ''} onChange={(e) => setOrigenContacto(e.target.value || null)}>
            <option value="">Otra persona (escríbela abajo)</option>
            {contactos.map((ct) => <option key={ct.id} value={ct.id}>{ct.nombre}</option>)}
          </Select>
        </Field>
        {!origenContacto && (
          <Field label="Otra persona">
            <Input value={origenTexto} onChange={(e) => setOrigenTexto(e.target.value)} placeholder="Un apostador del Foso" maxLength={80} />
          </Field>
        )}
        <Field label="Lugar">
          <Input value={lugar} onChange={(e) => setLugar(e.target.value)} placeholder="El Foso, canales de Urteau" maxLength={80} />
        </Field>
        <Field label="Recompensa anunciada" hint="Lo que se promete, en texto.">
          <Input value={recompensa} onChange={(e) => setRecompensa(e.target.value)} placeholder="150 ar y un favor de Enge" maxLength={120} />
        </Field>
        <Field label="Pago a la tesorería" hint="Se ingresa al cumplirlo. Vacío: nada automático.">
          <CampoCantidad valor={pago} onCambio={setPago} placeholder="150" />
        </Field>

        <div style={{ display: 'grid', gap: 14, paddingTop: 12, borderTop: `1px solid ${c.border}` }}>
          <p style={{ fontSize: fs.sm, color: c.muted }}>Solo tú (nunca llega a los jugadores):</p>
          <Field label="Plazo (semanas)" hint="«Pasar semanas» lo descuenta; si un aviso del cartel llega a 0, caduca. Vacío: sin plazo.">
            <Input
              inputMode="numeric"
              value={plazo}
              onChange={(e) => setPlazo(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="2"
            />
          </Field>
          {tipo === 'rumor' && (
            <div>
              <p style={etiqueta}>¿Es verdad?</p>
              <Segmented<VerdadRumor | 'sin'>
                size="sm"
                ariaLabel="Si el rumor es verdad"
                value={verdad ?? 'sin'}
                onChange={(v) => setVerdad(v === 'sin' ? null : v)}
                options={[
                  { value: 'sin', label: 'Sin decidir' },
                  ...(Object.keys(VERDAD_RUMOR) as VerdadRumor[]).map((v) => ({ value: v, label: VERDAD_RUMOR[v].label })),
                ]}
              />
            </div>
          )}
          <Field label="Notas" hint="Qué hay detrás, la recompensa real…">
            <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} />
          </Field>
          <Field label="Si caduca o lo rechazan" hint="Te lo recuerda «Pasar semanas» cuando caduque.">
            <Textarea value={siCaduca} onChange={(e) => setSiCaduca(e.target.value)} rows={2} />
          </Field>
        </div>
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

/** The director closes a notice in progress: fulfilled (with the payment) or failed, and how it ended */
export function CerrarAvisoSheet({ aviso, onClose, aplicar }: { aviso: Aviso; onClose: () => void; aplicar: (op: OpBanda) => void }) {
  const [resultado, setResultado] = useState<'cumplido' | 'fallido'>('cumplido')
  const [desenlace, setDesenlace] = useState('')
  const [pago, setPago] = useState(textoImporte(aviso.pago))
  const { error, ejecutar } = useEjecutar(aplicar)
  const cerrar = () => {
    const importe = leerCantidad(pago)
    ejecutar(cerrarAviso(aviso.id, resultado, desenlace, resultado === 'cumplido' && !Number.isNaN(importe) ? importe : null), onClose)
  }
  return (
    <Sheet
      open
      onClose={onClose}
      title={`Cerrar: ${aviso.titulo}`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={cerrar}>Cerrar el aviso</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Segmented<'cumplido' | 'fallido'>
          ariaLabel="Cómo acabó"
          value={resultado}
          onChange={setResultado}
          options={[{ value: 'cumplido', label: 'Cumplido' }, { value: 'fallido', label: 'Fallido' }]}
        />
        <Field label="Desenlace" hint="Lo verán los jugadores en el archivo del cartel.">
          <Textarea value={desenlace} onChange={(e) => setDesenlace(e.target.value)} rows={3} placeholder="Brannoc pagó la mitad y huyó por los muelles" />
        </Field>
        {resultado === 'cumplido' && (
          <Field label="Pago a la tesorería" hint="Vacío o 0: no entra dinero.">
            <CampoCantidad valor={pago} onCambio={setPago} placeholder="150" />
          </Field>
        )}
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

/** Something the crew found out about a notice in progress */
export function PistaSheet({ aviso, onClose, aplicar }: { aviso: Aviso; onClose: () => void; aplicar: (op: OpBanda) => void }) {
  const [texto, setTexto] = useState('')
  const { error, ejecutar } = useEjecutar(aplicar)
  return (
    <Sheet
      open
      onClose={onClose}
      title="Añadir una pista"
      description={aviso.titulo}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => ejecutar(anadirPista(aviso.id, texto), onClose)} disabled={!texto.trim()}>Añadir</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Pista">
          <Input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Los animales llegan en barcaza, de noche" autoFocus maxLength={160} />
        </Field>
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}
