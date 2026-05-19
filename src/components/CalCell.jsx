import { COLOR_MAP, DAY_TYPES } from '../lib/codes'
import styles from './CalCell.module.css'

const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function CalCell({ day, date, entry, isToday, onClick }) {
  if (!day) return <div className={styles.empty} />

  const dayType = entry ? DAY_TYPES.find(t => t.value === entry.day_type) : null
  const colors  = dayType ? COLOR_MAP[dayType.colorKey] : null

  return (
    <button
      className={`${styles.cell} ${isToday ? styles.today : ''} ${entry ? styles.hasEntry : ''}`}
      onClick={() => onClick(date, entry)}
      style={colors ? {
        '--cell-bg': colors.bg,
        '--cell-fg': colors.fg,
        '--cell-border': colors.border,
      } : {}}
      title={dayType ? dayType.label : `Registrar ${day}/${date.slice(5,7)}`}
    >
      {entry && <div className={styles.cellBg} />}

      <span className={styles.dayNum}>{day}</span>

      {entry && dayType && (
        <span className={styles.sello} style={{ background: colors.bg, color: colors.fg }}>
          {dayType.letter}
        </span>
      )}

      {entry?.sensation_code && (
        <span className={styles.code}>{entry.sensation_code}</span>
      )}

      {entry?.is_peak && <span className={styles.peakDot} title="Día cúspide" />}

      {entry?.characteristic_codes?.length > 0 && (
        <span className={styles.chars}>
          {entry.characteristic_codes.slice(0,2).join('/')}
        </span>
      )}
    </button>
  )
}
