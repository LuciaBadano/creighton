import React from "react";
import { useEntries } from "../hooks/useEntries";
import CalCell from "../components/CalCell";
import styles from "./Calendar.module.css";
import { DAYS_ES } from "../constants/dates";
import { buildPostPeakMap } from "../helpers/Calendar";
import { VIEWS } from "../constants/views";

const Calendar = ({ setModal, view, year, month }) => {
  const now = new Date();

  const { entries, loading } = useEntries(year, month);

  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const postPeakMap = buildPostPeakMap(entries, year, month);

  const openModal = (date, entry) => setModal({ date, entry: entry || null });

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
      {view === VIEWS.MONTH && (
        <>
          {loading && <div className={styles.loadingBar} />}
          <div className={styles.dowRow}>
            {DAYS_ES.map((d) => (
              <div key={d} className={styles.dow}>
                {d}
              </div>
            ))}
          </div>
          <div className={styles.grid}>
            {cells.map((cell, i) =>
              cell ? (
                <CalCell key={cell.date} {...cell} onClick={openModal} />
              ) : (
                <div key={`empty-${i}`} className={styles.emptyCell} />
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
