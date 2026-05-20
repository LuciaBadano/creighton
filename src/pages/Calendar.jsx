import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useEntries } from '../hooks/useEntries'
import CalCell from '../components/CalCell'
import EntryModal from '../components/EntryModal'
import Sidebar from '../components/Sidebar'
import CycleView from './CycleView'
import styles from './Calendar.module.css'

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

// Códigos de sensación que califican como moco "pico" (transparente, elástico, lubricante)
const PEAK_SENSATION_CODES = ['10', '10DL', '10SL', '10WL']
const PEAK_CHAR_CODES      = ['K', 'L']   // Transparente, Lubricante

function isPeakQuality(entry) {
  if (!entry) return false
  if (entry.is_peak) return true
  if (entry.day_type === 'cuspide') return true
  if (PEAK_SENSATION_CODES.includes(entry.sensation_code)) return true
  if (entry.characteristic_codes?.some(c => PEAK_CHAR_CODES.includes(c))) return true
  return false
}

// Calcula el día pico real: último día consecutivo de moco fértil con calidad pico
function findPeakDay(entriesMap, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let peakDate = null

  for (let d = daysInMonth; d >= 1; d--) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const e = entriesMap[key]
    if (!e) continue
    const isMucusType = ['fertil','mucus','cuspide'].includes(e.day_type)
    if (isMucusType && isPeakQuality(e)) {
      peakDate = key
      break
    }
  }
  return peakDate
}

// Genera mapa de fecha → día post-pico (1, 2 o 3)
function buildPostPeakMap(entriesMap, year, month) {
  const peak = findPeakDay(entriesMap, year, month)
  if (!peak) return {}
  const map = {}
  const peakD = new Date(peak + 'T12:00:00')
  for (let i = 1; i <= 3; i++) {
    const nd = new Date(peakD)
    nd.setDate(nd.getDate() + i)
    if (nd.getFullYear() === year && nd.getMonth() === month) {
      const key = `${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,'0')}-${String(nd.getDate()).padStart(2,'0')}`
      map[key] = i
    }
  }
  return map
}

export default function Calendar() {
  const { user, signOut } = useAuth()
  const now = new Date()
  const [view,  setView]  = useState('month') // 'month' | 'cycle' | 'quick'
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)

  const { entries, loading, saveEntry, deleteEntry } = useEntries(year, month)

  const todayKey    = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const postPeakMap = buildPostPeakMap(entries, year, month)

  const prevMonth  = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  const nextMonth  = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }
  const goToToday  = () => { setYear(now.getFullYear()); setMonth(now.getMonth()) }

  const openModal  = (date, entry) => setModal({ date, entry: entry || null })
  const closeModal = () => setModal(null)

  const handleSave = async (date, payload) => {
    const result = await saveEntry(date, payload)
    if (!result.error) showToast('Observación guardada ✓')
    return result
  }
  const handleDelete = async (date) => {
    await deleteEntry(date)
    showToast('Registro eliminado')
  }
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    cells.push({ day: d, date: key, entry: entries[key] || null, isToday: key === todayKey, postPeakDay: postPeakMap[key] || null })
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        currentYear={year}
        currentMonth={month}
        entries={entries}
        user={user}
        onSignOut={signOut}
        currentView={view}
        onChangeView={setView}
      />

      <div className={styles.main}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {view === 'month' && <>
              <button className={styles.navBtn} onClick={prevMonth}>←</button>
              <h1 className={styles.monthTitle}>{MONTHS_ES[month]} <em>{year}</em></h1>
              <button className={styles.navBtn} onClick={nextMonth}>→</button>
            </>}
            {view === 'cycle' && <h1 className={styles.monthTitle}>Vista por <em>ciclo</em></h1>}
            {view === 'quick' && <h1 className={styles.monthTitle}>Registro <em>rápido</em></h1>}
          </div>
          <div className={styles.headerRight}>
            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${view==='month' ? styles.viewBtnActive:''}`} onClick={() => setView('month')}>📅 Mes</button>
              <button className={`${styles.viewBtn} ${view==='cycle' ? styles.viewBtnActive:''}`} onClick={() => setView('cycle')}>🔄 Ciclo</button>
              <button className={`${styles.viewBtn} ${view==='quick' ? styles.viewBtnActive:''}`} onClick={() => setView('quick')}>🌙 Hoy</button>
            </div>
            {view === 'month' && <button className={styles.todayBtn} onClick={goToToday}>Hoy</button>}
            <button className={styles.signOutMobile} onClick={signOut}>Salir</button>
          </div>
        </div>

        {/* VISTA MENSUAL */}
        {view === 'month' && <>
          {loading && <div className={styles.loadingBar} />}
          <div className={styles.dowRow}>
            {DAYS_ES.map(d => <div key={d} className={styles.dow}>{d}</div>)}
          </div>
          <div className={styles.grid}>
            {cells.map((cell, i) =>
              cell
                ? <CalCell key={cell.date} {...cell} onClick={openModal} />
                : <div key={`empty-${i}`} className={styles.emptyCell} />
            )}
          </div>
        </>}

        {/* VISTA POR CICLO */}
        {view === 'cycle' && <CycleView />}

        {/* REGISTRO RÁPIDO */}
        {view === 'quick' && (
          <QuickEntry
            todayKey={todayKey}
            entry={entries[todayKey] || null}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </div>

      {modal && (
        <EntryModal
          date={modal.date}
          entry={modal.entry}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}

// ─── REGISTRO RÁPIDO (pantalla "antes de dormir") ────────────────────────────
import { useEffect } from 'react'
import { DAY_TYPES, SENSATION_CODES, CHARACTERISTIC_CODES } from '../lib/codes'

const MONTHS_LONG = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const DAYS_LONG   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

function QuickEntry({ todayKey, entry, onSave, onDelete }) {
  const [y, m, d]     = todayKey.split('-').map(Number)
  const dateObj        = new Date(y, m-1, d)
  const dateLabel      = `${DAYS_LONG[dateObj.getDay()]}, ${d} de ${MONTHS_LONG[m-1]}`

  const [dayType,     setDayType]     = useState(entry?.day_type || '')
  const [sensCode,    setSensCode]    = useState(entry?.sensation_code || '')
  const [charCodes,   setCharCodes]   = useState(entry?.characteristic_codes || [])
  const [isPeak,      setIsPeak]      = useState(entry?.is_peak || false)
  const [bleedInt,    setBleedInt]    = useState(entry?.bleeding_intensity || '')
  const [note,        setNote]        = useState(entry?.note || '')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState(null)

  // Resetear si cambia el entry (ej. después de guardar)
  useEffect(() => {
    setDayType(entry?.day_type || '')
    setSensCode(entry?.sensation_code || '')
    setCharCodes(entry?.characteristic_codes || [])
    setIsPeak(entry?.is_peak || false)
    setBleedInt(entry?.bleeding_intensity || '')
    setNote(entry?.note || '')
  }, [entry])

  const isBleeding = ['menstrual','spotting'].includes(dayType)
  const hasMucus   = ['mucus','fertil','cuspide'].includes(dayType)

  const toggleChar = (c) => setCharCodes(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c])

  const handleSave = async () => {
    if (!dayType) { setError('Elegí el tipo de día'); return }
    setSaving(true); setError(null)
    const { error } = await onSave(todayKey, {
      day_type: dayType, sensation_code: sensCode||null,
      characteristic_codes: charCodes, is_peak: isPeak,
      bleeding_intensity: bleedInt||null, note: note.trim()||null
    })
    if (error) { setError(error.message); setSaving(false) }
    else { setSaved(true); setSaving(false); setTimeout(()=>setSaved(false), 3000) }
  }

  return (
    <div className={styles.quick}>
      {/* Fecha grande */}
      <div className={styles.quickDate}>
        <span className={styles.quickDateNum}>{d}</span>
        <div>
          <div className={styles.quickDateMonth}>{MONTHS_LONG[m-1]} {y}</div>
          <div className={styles.quickDateDay}>{DAYS_LONG[dateObj.getDay()]}</div>
        </div>
      </div>

      {entry && <div className={styles.quickExisting}>Ya tenés un registro de hoy. Podés modificarlo.</div>}

      {/* TIPO DE DÍA — botones grandes */}
      <div className={styles.quickSection}>
        <div className={styles.quickLabel}>¿Cómo fue hoy?</div>
        <div className={styles.quickDayTypes}>
          {DAY_TYPES.map(t => (
            <button
              key={t.value}
              className={`${styles.quickDayBtn} ${dayType===t.value ? styles[`qsel_${t.colorKey}`]:''}`}
              onClick={() => { setDayType(t.value); setSensCode(''); setCharCodes([]); setIsPeak(false) }}
            >
              <span className={styles.quickDayLetter}>{t.letter}</span>
              <span className={styles.quickDayLabel}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* INTENSIDAD SANGRADO */}
      {isBleeding && (
        <div className={styles.quickSection}>
          <div className={styles.quickLabel}>Intensidad</div>
          <div className={styles.quickChips}>
            {['Muy ligero','Ligero','Moderado','Abundante'].map(v => (
              <button key={v} className={`${styles.qchip} ${bleedInt===v?styles.qchipActive:''}`}
                onClick={()=>setBleedInt(bleedInt===v?'':v)}>{v}</button>
            ))}
          </div>
        </div>
      )}

      {/* CÓDIGO SENSACIÓN */}
      {!isBleeding && (
        <div className={styles.quickSection}>
          <div className={styles.quickLabel}>Código de sensación</div>
          <div className={styles.quickChips}>
            {SENSATION_CODES.map(s => (
              <button key={s.code}
                className={`${styles.qchip} ${styles.qchipCode} ${sensCode===s.code?styles.qchipActive:''}`}
                onClick={()=>setSensCode(sensCode===s.code?'':s.code)}>
                <b>{s.code}</b> <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CARACTERÍSTICAS */}
      {(hasMucus || sensCode) && !isBleeding && (
        <div className={styles.quickSection}>
          <div className={styles.quickLabel}>Características del moco</div>
          <div className={styles.quickChips}>
            {CHARACTERISTIC_CODES.map(c => (
              <button key={c.code}
                className={`${styles.qchip} ${styles.qchipCode} ${charCodes.includes(c.code)?styles.qchipActive:''}`}
                onClick={()=>toggleChar(c.code)}>
                <b>{c.code}</b> <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DÍA CÚSPIDE */}
      {!isBleeding && dayType && (
        <div className={styles.quickSection}>
          <label className={styles.quickPeakRow}>
            <input type="checkbox" checked={isPeak} onChange={e=>setIsPeak(e.target.checked)} />
            <span>Marcar como <strong>Día Cúspide (Pico)</strong></span>
            {isPeak && <span className={styles.peakBadge}>★ Cúspide</span>}
          </label>
        </div>
      )}

      {/* NOTA */}
      <div className={styles.quickSection}>
        <div className={styles.quickLabel}>Nota (opcional)</div>
        <textarea className={styles.quickTextarea} rows={2} value={note}
          onChange={e=>setNote(e.target.value)} placeholder="Alguna observación adicional..." />
      </div>

      {error && <p className={styles.quickError}>{error}</p>}

      {/* BOTÓN GUARDAR */}
      <button className={`${styles.quickSaveBtn} ${saved?styles.quickSaved:''}`}
        onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar registro de hoy'}
      </button>

      {entry && (
        <button className={styles.quickDeleteBtn}
          onClick={async()=>{ if(window.confirm('¿Eliminar registro de hoy?')) await onDelete(todayKey) }}>
          Eliminar registro
        </button>
      )}
    </div>
  )
}
