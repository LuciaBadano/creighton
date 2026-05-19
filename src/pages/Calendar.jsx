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

export default function Calendar() {
  const { user, signOut } = useAuth()
  const now = new Date()
  const [view,  setView]  = useState('month') // 'month' | 'cycle'
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)

  const { entries, loading, saveEntry, deleteEntry } = useEntries(year, month)

  const todayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }
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
    cells.push({ day: d, date: key, entry: entries[key] || null, isToday: key === todayKey })
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
              <h1 className={styles.monthTitle}>
                {MONTHS_ES[month]} <em>{year}</em>
              </h1>
              <button className={styles.navBtn} onClick={nextMonth}>→</button>
            </>}
            {view === 'cycle' && (
              <h1 className={styles.monthTitle}>Vista por <em>ciclo</em></h1>
            )}
          </div>
          <div className={styles.headerRight}>
            {/* Toggle de vista */}
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${view === 'month' ? styles.viewBtnActive : ''}`}
                onClick={() => setView('month')}
              >Mensual</button>
              <button
                className={`${styles.viewBtn} ${view === 'cycle' ? styles.viewBtnActive : ''}`}
                onClick={() => setView('cycle')}
              >Por ciclo</button>
            </div>
            {view === 'month' && (
              <button className={styles.todayBtn} onClick={goToToday}>Hoy</button>
            )}
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
