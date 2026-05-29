import React from "react";
import { DAY_TYPES, COLOR_MAP } from "../lib/codes";
import styles from "./Sidebar.module.css";

const Sidebar = ({
  entries,
  user,
  onSignOut,
  currentView,
  onChangeView,
  isAdmin,
  onOpenAdmin,
}) => {
  const entriesArr = Object.values(entries);

  const stats = DAY_TYPES.map((t) => ({
    ...t,
    count: entriesArr.filter((e) => e.day_type === t.value).length,
  })).filter((t) => t.count > 0);

  const peakDays = entriesArr
    .filter((e) => e.is_peak)
    .map((e) => parseInt(e.date.split("-")[2]));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logoCircle}>C</span>
        <div>
          <div className={styles.appName}>
            Ciclo <em>Creighton</em>
          </div>
          <div className={styles.appSub}>registro personal</div>
        </div>
      </div>

      {/* NAVEGACIÓN DE VISTAS */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Vista</div>
        <div className={styles.viewNav}>
          <button
            className={`${styles.viewNavBtn} ${currentView === "month" ? styles.viewNavActive : ""}`}
            onClick={() => onChangeView("month")}
          >
            📅 Mensual
          </button>
          <button
            className={`${styles.viewNavBtn} ${currentView === "cycle" ? styles.viewNavActive : ""}`}
            onClick={() => onChangeView("cycle")}
          >
            🔄 Por ciclo
          </button>
          <button
            className={`${styles.viewNavBtn} ${currentView === "quick" ? styles.viewNavActive : ""}`}
            onClick={() => onChangeView("quick")}
          >
            🌙 Registro de hoy
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Este mes</div>
        {stats.length > 0 ? (
          <div className={styles.stats}>
            {stats.map((t) => {
              const c = COLOR_MAP[t.colorKey];
              return (
                <div key={t.value} className={styles.statRow}>
                  <span
                    className={styles.statDot}
                    style={{ background: c.fg }}
                  />
                  <span className={styles.statLabel}>{t.label}</span>
                  <span className={styles.statNum}>{t.count}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.empty}>Sin registros aún</p>
        )}
        {peakDays.length > 0 && (
          <div className={styles.peakInfo}>
            <span className={styles.peakDot}>●</span>
            Cúspide: día{peakDays.length > 1 ? "s" : ""} {peakDays.join(", ")}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Leyenda</div>
        <div className={styles.legend}>
          {DAY_TYPES.map((t) => {
            const c = COLOR_MAP[t.colorKey];
            return (
              <div key={t.value} className={styles.legRow}>
                <span
                  className={styles.legSello}
                  style={{ background: c.bg, color: c.fg }}
                >
                  {t.letter}
                </span>
                <span className={styles.legLabel}>{t.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.userEmail}>{user?.email}</span>
        {isAdmin && onOpenAdmin && (
          <button className={styles.adminBtn} onClick={onOpenAdmin}>
            ⚙️ Panel admin
          </button>
        )}
        <button className={styles.signOutBtn} onClick={onSignOut}>
          Salir
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
