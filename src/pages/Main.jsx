import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useEntries } from "../hooks/useEntries";
import EntryModal from "../components/EntryModal";
import Sidebar from "../components/Sidebar";
import CycleView from "./CycleView";
import styles from "./Calendar.module.css";
import { MONTHS_ES } from "../constants/dates";
import QuickEntry from "./QuickEnty";
import Calendar from "./Calendar";
import { buildPostPeakMap } from "../helpers/Calendar";
import { VIEWS } from "../constants/views";

const Main = () => {
  const { user, signOut } = useAuth();
  const now = new Date();
  const [view, setView] = useState(VIEWS.CYCLE);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const { entries, saveEntry, deleteEntry } = useEntries(year, month);

  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const postPeakMap = buildPostPeakMap(entries, year, month);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };
  const goToToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  const closeModal = () => setModal(null);

  const handleSave = async (date, payload) => {
    const result = await saveEntry(date, payload);
    if (!result.error) showToast("Observación guardada ✓");
    return result;
  };
  const handleDelete = async (date) => {
    await deleteEntry(date);
    showToast("Registro eliminado");
  };
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      day: d,
      date: key,
      entry: entries[key] || null,
      isToday: key === todayKey,
      postPeakDay: postPeakMap[key] || null,
    });
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
            {view === VIEWS.MONTH && (
              <>
                <button className={styles.navBtn} onClick={prevMonth}>
                  ←
                </button>
                <h1 className={styles.monthTitle}>
                  {MONTHS_ES[month]} <em>{year}</em>
                </h1>
                <button className={styles.navBtn} onClick={nextMonth}>
                  →
                </button>
              </>
            )}
            {view === VIEWS.CYCLE && (
              <h1 className={styles.monthTitle}>
                Vista por <em>ciclo</em>
              </h1>
            )}
            {view === VIEWS.QUICK && (
              <h1 className={styles.monthTitle}>
                Registro <em>rápido</em>
              </h1>
            )}
          </div>
          <div className={styles.headerRight}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${view === VIEWS.MONTH ? styles.viewBtnActive : ""}`}
                onClick={() => setView(VIEWS.MONTH)}
              >
                📅 Mes
              </button>
              <button
                className={`${styles.viewBtn} ${view === VIEWS.CYCLE ? styles.viewBtnActive : ""}`}
                onClick={() => setView(VIEWS.CYCLE)}
              >
                🔄 Ciclo
              </button>
              <button
                className={`${styles.viewBtn} ${view === VIEWS.QUICK ? styles.viewBtnActive : ""}`}
                onClick={() => setView(VIEWS.QUICK)}
              >
                🌙 Hoy
              </button>
            </div>
            {view === VIEWS.MONTH && (
              <button className={styles.todayBtn} onClick={goToToday}>
                Hoy
              </button>
            )}
            <button className={styles.signOutMobile} onClick={signOut}>
              Salir
            </button>
          </div>
        </div>

        {/* VISTA MENSUAL */}
        {view === VIEWS.MONTH && (
          <Calendar setModal={setModal} view={view} year={year} month={month} />
        )}

        {/* VISTA POR CICLO */}
        {view === VIEWS.CYCLE && (
          <CycleView modal={modal} setModal={setModal} />
        )}

        {/* REGISTRO RÁPIDO */}
        {view === VIEWS.QUICK && (
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
  );
};

export default Main;
