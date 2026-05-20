import { DAY_TYPES, COLOR_MAP } from '../lib/codes'
import styles from './CalCell.module.css'

// SVG bebé minimalista
function BabyIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.babyIcon}>
      <circle cx="12" cy="5" r="3" fill="currentColor" opacity="0.7"/>
      <path d="M7 13c0-2.76 2.24-5 5-5s5 2.24 5 5v2H7v-2z" fill="currentColor" opacity="0.5"/>
      <path d="M9 18c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-1H9v1z" fill="currentColor" opacity="0.4"/>
      <circle cx="9" cy="13.5" r="1" fill="currentColor" opacity="0.3"/>
      <circle cx="15" cy="13.5" r="1" fill="currentColor" opacity="0.3"/>
    </svg>
  )
}

export default function CalCell({ day, date, entry, isToday, onClick, postPeakDay }) {
  if (!day) return <div className={styles.empty} />

  const dayType = entry ? DAY_TYPES.find(t => t.value === entry.day_type) : null
  const isMenstrual = entry?.day_type === 'menstrual' || entry?.day_type === 'spotting'
  const isSeco      = entry?.day_type === 'seco'
  const isFertil    = entry?.day_type === 'fertil' || entry?.day_type === 'mucus'
  const isCuspide   = entry?.day_type === 'cuspide'
  const isPeak      = entry?.is_peak

  // Clase de color principal
  let cellClass = styles.cell
  if (isMenstrual) cellClass += ' ' + styles.cellMenstrual
  else if (isSeco)      cellClass += ' ' + styles.cellSeco
  else if (isCuspide || isPeak) cellClass += ' ' + styles.cellCuspide
  else if (isFertil)    cellClass += ' ' + styles.cellFertil
  else if (postPeakDay) cellClass += ' ' + styles.cellPostPeak
  if (isToday)     cellClass += ' ' + styles.today
  if (!entry && !postPeakDay) cellClass += ' ' + styles.empty_entry

  return (
    <button
      className={cellClass}
      onClick={() => onClick(date, entry)}
      title={dayType ? dayType.label : `Día ${day}`}
    >
      {/* Número del día del mes — arriba */}
      <span className={styles.dayNum}>{day}</span>

      {/* === MENSTRUAL: fondo rojo sólido, letra M === */}
      {isMenstrual && (
        <span className={styles.mainLetter}>
          {entry.day_type === 'spotting' ? 'S' : 'M'}
        </span>
      )}

      {/* === SECO: fondo verde, letra V === */}
      {isSeco && <span className={styles.mainLetter}>V</span>}

      {/* === FÉRTIL / MOCO: fondo blanco/crema, bebé === */}
      {(isFertil && !isCuspide) && (
        <span className={styles.fertilContent}>
          <BabyIcon size={14} />
        </span>
      )}

      {/* === CÚSPIDE / PICO: bebé + P === */}
      {(isCuspide || isPeak) && (
        <span className={styles.cuspideContent}>
          <span className={styles.peakP}>P</span>
          <BabyIcon size={12} />
        </span>
      )}

      {/* === POST-PICO días 1, 2, 3 === */}
      {postPeakDay && !entry && (
        <span className={styles.postPeakNum}>{postPeakDay}</span>
      )}
      {postPeakDay && entry && (isFertil || isCuspide) && (
        <span className={styles.postPeakNum}>{postPeakDay}</span>
      )}

      {/* Código de sensación abajo */}
      {entry?.sensation_code && (
        <span className={styles.code}>{entry.sensation_code}</span>
      )}
    </button>
  )
}
