import { DAY_TYPES, COLOR_MAP, BLEEDING_INTENSITY_CODES } from "../lib/codes";
import styles from "./CycleStrip.module.css";
import BabyIcon from "../helpers/BabyIcon";

const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
const DAYS_SHORT = ["do", "lu", "ma", "mi", "ju", "vi", "sá"];

function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}
function dayOfWeek(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return DAYS_SHORT[d.getDay()];
}

export default function CycleStrip({
  cycleNumber,
  startDate,
  endDate,
  entries,
  onCellClick,
  isCurrentCycle,
}) {
  // Genera lista de fechas desde startDate hasta endDate (o hoy si es ciclo actual)
  const days = [];
  const start = new Date(startDate + "T12:00:00");
  const end = endDate ? new Date(endDate + "T12:00:00") : new Date();
  end.setHours(12, 0, 0, 0);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ key, dayNum: days.length + 1 });
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className={`${styles.cycle} ${isCurrentCycle ? styles.current : ""}`}>
      {/* Encabezado del ciclo */}
      <div className={styles.cycleHeader}>
        <span className={styles.cycleLabel}>
          Ciclo {cycleNumber}
          {isCurrentCycle && (
            <span className={styles.currentBadge}>en curso</span>
          )}
        </span>
        <span className={styles.cycleDates}>
          {formatDate(startDate)}
          {endDate ? ` → ${formatDate(endDate)}` : " → hoy"}
          <span className={styles.cycleDays}> · {days.length} días</span>
        </span>
      </div>

      {/* Tira horizontal de celdas */}
      <div className={styles.strip}>
        {days.map(({ key, dayNum }) => {
          const entry = entries[key] || null;
          const dayType = entry
            ? DAY_TYPES.find((t) => t.value === entry.day_type)
            : null;
          const colors = dayType ? COLOR_MAP[dayType.colorKey] : null;
          const isToday = key === todayKey;
          const isFertilDay =
            entry?.day_type === "fertil" || entry?.day_type === "mucus";
          const isCuspide = entry?.day_type === "cuspide";
          const obsFreqCode = entry?.observation_frequency || "";

          return (
            <button
              key={key}
              className={`${styles.cell} ${isToday ? styles.cellToday : ""} ${entry ? styles.cellFilled : ""}`}
              style={
                colors
                  ? {
                      "--cell-bg": colors.bg,
                      "--cell-fg": colors.fg,
                      "--cell-border": colors.border,
                    }
                  : {}
              }
              onClick={() => onCellClick(key, entry)}
              title={`Día ${dayNum} — ${formatDate(key)}`}
            >
              {/* Fondo de color */}
              {entry && <div className={styles.cellBg} />}

              {/* Número de día del ciclo */}
              <span className={styles.cycDay}>{dayNum}</span>

              {/* Sello */}
              {isFertilDay && !isCuspide && (
                <span className={styles.babyWrap}>
                  <BabyIcon size={18} />
                </span>
              )}

              {/* Código de sensación o intensidad de sangrado */}
              {(entry?.sensation_code || entry?.bleeding_intensity) && (
                <div className="intensity">
                  <span className={styles.code}>
                    {entry?.sensation_code ||
                      BLEEDING_INTENSITY_CODES[entry?.bleeding_intensity] ||
                      entry?.bleeding_intensity}
                    {obsFreqCode && (
                      <span className={`${styles.code} ${styles.freqCode}`}>
                        {obsFreqCode}
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* Características */}
              {entry?.characteristic_codes?.length > 0 && (
                <span className={styles.chars}>
                  {entry.characteristic_codes.slice(0, 2).join("/")}
                </span>
              )}

              {/* Punto cúspide */}
              {entry?.is_peak && <span className={styles.peakDot} />}

              {/* Fecha */}
              <span className={styles.date}>{formatDate(key)}</span>
              <span className={styles.dow}>{dayOfWeek(key)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
