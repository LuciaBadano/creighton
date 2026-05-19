import { useState } from 'react'
import { useAllMenstrualDates, useEntriesRange } from '../hooks/useEntriesRange'
import CycleStrip from '../components/CycleStrip'
import EntryModal from '../components/EntryModal'
import { useEntries } from '../hooks/useEntries'
import styles from './CycleView.module.css'

// Calcula la fecha N días antes/después
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// Construye la lista de ciclos a partir de las fechas de inicio de menstruación
function buildCycles(menstrualStarts) {
  if (!menstrualStarts.length) return []
  const cycles = []
  for (let i = 0; i < menstrualStarts.length; i++) {
    const start = menstrualStarts[i]
    const end   = menstrualStarts[i + 1] ? addDays(menstrualStarts[i + 1], -1) : null
    cycles.push({ number: i + 1, startDate: start, endDate: end, isCurrent: !end })
  }
  return cycles.reverse() // más reciente primero
}

// Componente que carga las entradas de un rango y renderiza la tira
function CycleRow({ cycle, onCellClick }) {
  const today = todayStr()
  const from = cycle.startDate
  const to   = cycle.endDate || today
  const { entries } = useEntriesRange(from, to)

  return (
    <CycleStrip
      cycleNumber={cycle.number}
      startDate={cycle.startDate}
      endDate={cycle.endDate}
      entries={entries}
      onCellClick={onCellClick}
      isCurrentCycle={cycle.isCurrent}
    />
  )
}

export default function CycleView({ onOpenModal }) {
  const { menstrualDates, loading } = useAllMenstrualDates()
  const [modal, setModal] = useState(null)

  // Para el modal necesitamos saveEntry/deleteEntry — usamos el mes del día seleccionado
  const modalDate = modal?.date || null
  const modalYear  = modalDate ? parseInt(modalDate.split('-')[0]) : new Date().getFullYear()
  const modalMonth = modalDate ? parseInt(modalDate.split('-')[1]) - 1 : new Date().getMonth()
  const { saveEntry, deleteEntry } = useEntries(modalYear, modalMonth)

  const cycles = buildCycles(menstrualDates)

  const openModal  = (date, entry) => setModal({ date, entry: entry || null })
  const closeModal = () => setModal(null)

  const handleSave = async (date, payload) => {
    const result = await saveEntry(date, payload)
    return result
  }
  const handleDelete = async (date) => {
    await deleteEntry(date)
    closeModal()
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingBar} />
        <p>Cargando ciclos…</p>
      </div>
    )
  }

  if (cycles.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🌸</div>
        <p>Todavía no hay ciclos registrados.</p>
        <p className={styles.emptyHint}>Registrá el primer día de tu menstruación en la vista mensual para que aparezca acá.</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.cycleList}>
        {cycles.map(cycle => (
          <CycleRow
            key={cycle.startDate}
            cycle={cycle}
            onCellClick={openModal}
          />
        ))}
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
    </div>
  )
}
