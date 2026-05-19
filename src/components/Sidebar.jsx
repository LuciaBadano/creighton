import { DAY_TYPES, COLOR_MAP } from '../lib/codes'
import styles from './Sidebar.module.css'

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function Sidebar({ currentYear, currentMonth, entries, onNavigate, user, onSignOut }) {
  const entriesArr = Object.values(entries)

  const stats = DAY_TYPES.map(t => ({
    ...t,
    count: entriesArr.filter(e => e.day_type === t.value).length
  })).filter(t => t.count > 0)

  const peakDays = entriesArr.filter(e => e.is_peak).map(e => parseInt(e.date.split('-')[2]))

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logoCircle}>C</span>
        <div>
          <div className={styles.appName}>Ciclo <em>Creighton</em></div>
          <div className={styles.appSub}>registro personal</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Este mes</div>
        {stats.length > 0 ? (
          <div className={styles.stats}>
            {stats.map(t => {
              const c = COLOR_MAP[t.colorKey]
              return (
                <div key={t.value} className={styles.statRow}>
                  <span className={styles.statDot} style={{ background: c.fg }} />
                  <span className={styles.statLabel}>{t.label}</span>
                  <span className={styles.statNum}>{t.count}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className={styles.empty}>Sin registros aún</p>
        )}
        {peakDays.length > 0 && (
          <div className={styles.peakInfo}>
            <span className={styles.peakDot}>●</span>
            Cúspide: día{peakDays.length > 1 ? 's' : ''} {peakDays.join(', ')}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Leyenda</div>
        <div className={styles.legend}>
          {DAY_TYPES.map(t => {
            const c = COLOR_MAP[t.colorKey]
            return (
              <div key={t.value} className={styles.legRow}>
                <span className={styles.legSello} style={{ background: c.bg, color: c.fg }}>
                  {t.letter}
                </span>
                <span className={styles.legLabel}>{t.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.userEmail}>{user?.email}</span>
        <button className={styles.signOutBtn} onClick={onSignOut}>Salir</button>
      </div>
    </aside>
  )
}
