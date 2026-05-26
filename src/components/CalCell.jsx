import React from "react";
import { DAY_TYPES, BLEEDING_INTENSITY_CODES } from "../lib/codes";
import styles from "./CalCell.module.css";
import BabyIcon from "../helpers/BabyIcon";

const CalCell = ({ day, date, entry, isToday, onClick, postPeakDay }) => {
  if (!day) return <div className={styles.empty} />;

  const dayType = entry
    ? DAY_TYPES.find((t) => t.value === entry.day_type)
    : null;
  const isMenstrual =
    entry?.day_type === "menstrual" || entry?.day_type === "spotting";
  const isSeco = entry?.day_type === "seco";
  const isFertil = entry?.day_type === "fertil" || entry?.day_type === "mucus";
  const isCuspide = entry?.day_type === "cuspide";
  const isPeak = entry?.is_peak;
  const bleedingCode = entry?.bleeding_intensity
    ? BLEEDING_INTENSITY_CODES[entry.bleeding_intensity] ||
      entry.bleeding_intensity
    : "";
  const obsFreqCode = entry?.observation_frequency || "";

  // Clase de color principal
  let cellClass = styles.cell;
  if (isMenstrual) cellClass += " " + styles.cellMenstrual;
  else if (isSeco) cellClass += " " + styles.cellSeco;
  else if (isCuspide || isPeak) cellClass += " " + styles.cellCuspide;
  else if (isFertil) cellClass += " " + styles.cellFertil;
  else if (postPeakDay) cellClass += " " + styles.cellPostPeak;
  if (isToday) cellClass += " " + styles.today;
  if (!entry && !postPeakDay) cellClass += " " + styles.empty_entry;

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
          {entry.day_type === "spotting" ? "S" : "M"}
        </span>
      )}

      {/* === SECO: fondo verde, letra V === */}
      {isSeco && <span className={styles.mainLetter}>V</span>}

      {/* === FÉRTIL / MOCO: fondo blanco/crema, bebé === */}
      {isFertil && !isCuspide && (
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

      {/* Códigos abajo */}
      {(entry?.sensation_code || bleedingCode) && (
        <span className={styles.code}>
          {entry?.sensation_code || bleedingCode}
        </span>
      )}
      {obsFreqCode && (
        <span className={`${styles.code} ${styles.freqCode}`}>
          {obsFreqCode}
        </span>
      )}
    </button>
  );
};

export default CalCell;
