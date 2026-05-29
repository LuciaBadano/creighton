import React from "react";
import { BLEEDING_INTENSITY_CODES } from "../lib/codes";
import styles from "./CalCell.module.css";
import BabyIcon from "../helpers/BabyIcon";

const CalCell = ({ day, date, entry, isToday, onClick, postPeakDay }) => {
  if (!day) return <div className={styles.empty} />;

  const dt = entry?.day_type;
  const isMenstrual = dt === "menstrual";
  const isSpotting = dt === "spotting";
  const isSeco = dt === "seco";
  const isMucus = dt === "mucus";
  const isCuspide = dt === "cuspide";
  const hasMoco = isMucus || isCuspide;

  // Seco post-pico (verde con bebé)
  const isSecoFertil = isSeco && !!postPeakDay;
  // Seco sin post-pico (verde sin bebé)
  const isSecoNormal = isSeco && !postPeakDay;

  const bleedingCode = entry?.bleeding_intensity
    ? BLEEDING_INTENSITY_CODES[entry.bleeding_intensity] ||
      entry.bleeding_intensity
    : "";
  const obsFreqCode = entry?.observation_frequency || "";

  // Clase de color
  let cellClass = styles.cell;
  if (isMenstrual) cellClass += " " + styles.cellMenstrual;
  else if (isSpotting) cellClass += " " + styles.cellSpotting;
  else if (isSecoNormal) cellClass += " " + styles.cellSeco;
  else if (isSecoFertil) cellClass += " " + styles.cellSecoFertil;
  else if (isCuspide) cellClass += " " + styles.cellCuspide;
  else if (isMucus) cellClass += " " + styles.cellFertil;
  else if (postPeakDay && !entry) cellClass += " " + styles.cellPostPeakEmpty;

  if (isToday) cellClass += " " + styles.today;
  if (!entry && !postPeakDay) cellClass += " " + styles.emptyEntry;

  return (
    <button
      className={cellClass}
      onClick={() => onClick(date, entry)}
      title={dt ? dt : `Día ${day}`}
    >
      {/* Número del día */}
      <span className={styles.dayNum}>{day}</span>

      {/* MENSTRUAL → M rojo */}
      {isMenstrual && <span className={styles.mainLetter}>M</span>}

      {/* SPOTTING → S rojo claro */}
      {isSpotting && <span className={styles.mainLetter}>S</span>}

      {/* SECO NORMAL → V verde */}
      {isSecoNormal && <span className={styles.mainLetter}>V</span>}

      {/* SECO POST-PICO → V verde + bebé */}
      {isSecoFertil && (
        <span className={styles.secoFertilContent}>
          <span className={styles.mainLetterSmall}>V</span>
          <BabyIcon size={10} />
        </span>
      )}

      {/* MOCO NO-PICO → bebé blanco */}
      {isMucus && (
        <span className={styles.fertilContent}>
          <BabyIcon size={14} />
        </span>
      )}

      {/* CÚSPIDE / PICO → P + bebé amarillo */}
      {isCuspide && (
        <span className={styles.cuspideContent}>
          <span className={styles.peakP}>P</span>
          <BabyIcon size={11} />
        </span>
      )}

      {/* Post-pico sin entrada — muestra número */}
      {postPeakDay && !entry && (
        <span className={styles.postPeakNum}>{postPeakDay}</span>
      )}

      {/* Código sensación / sangrado */}
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
