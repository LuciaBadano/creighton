// ─── REGISTRO RÁPIDO (pantalla "antes de dormir") ────────────────────────────
import React, { useEffect, useState } from "react";
import {
  DAY_TYPES,
  SENSATION_CODES,
  CHARACTERISTIC_CODES,
  OBSERVATION_FREQUENCIES,
  BLEEDING_INTENSITY_LABELS,
  BLEEDING_DAY_TYPES,
  MUCUS_DAY_TYPES,
} from "../lib/codes";
import { MONTHS_ES, DAYS_LONG } from "../constants/dates";
import styles from "./Calendar.module.css";

const QuickEntry = ({ todayKey, entry, onSave, onDelete }) => {
  const [y, m, d] = todayKey.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);

  const [dayType, setDayType] = useState(entry?.day_type || "");
  const [sensCode, setSensCode] = useState(entry?.sensation_code || "");
  const [charCodes, setCharCodes] = useState(entry?.characteristic_codes || []);
  const [isPeak, setIsPeak] = useState(entry?.is_peak || false);
  const [bleedInt, setBleedInt] = useState(entry?.bleeding_intensity || "");
  const [obsFreq, setObsFreq] = useState(entry?.observation_frequency || "");
  const [note, setNote] = useState(entry?.note || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Resetear si cambia el entry (ej. después de guardar)
  useEffect(() => {
    setDayType(entry?.day_type || "");
    setSensCode(entry?.sensation_code || "");
    setCharCodes(entry?.characteristic_codes || []);
    setIsPeak(entry?.is_peak || false);
    setBleedInt(entry?.bleeding_intensity || "");
    setObsFreq(entry?.observation_frequency || "");
    setNote(entry?.note || "");
  }, [entry]);

  const isBleeding = BLEEDING_DAY_TYPES.includes(dayType);
  const hasMucus = MUCUS_DAY_TYPES.includes(dayType);

  const toggleChar = (c) =>
    setCharCodes((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const handleSave = async () => {
    if (!dayType) {
      setError("Elegí el tipo de día");
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await onSave(todayKey, {
      day_type: dayType,
      sensation_code: sensCode || null,
      characteristic_codes: charCodes,
      is_peak: isPeak,
      bleeding_intensity: bleedInt || null,
      observation_frequency: obsFreq || null,
      note: note.trim() || null,
    });
    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      setSaved(true);
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className={styles.quick}>
      {/* Fecha grande */}
      <div className={styles.quickDate}>
        <span className={styles.quickDateNum}>{d}</span>
        <div>
          <div className={styles.quickDateMonth}>
            {MONTHS_ES[m - 1]} {y}
          </div>
          <div className={styles.quickDateDay}>
            {DAYS_LONG[dateObj.getDay()]}
          </div>
        </div>
      </div>

      {entry && (
        <div className={styles.quickExisting}>
          Ya tenés un registro de hoy. Podés modificarlo.
        </div>
      )}

      {/* GUÍA DE REGISTRO */}
      <div className={styles.quickSection}>
        <div className={styles.quickLabel}>Guía de registro</div>
        <div className={styles.quickHelpText}>
          <p>
            <strong>S</strong> - Pasá el papel para notar si está lubricado.
          </p>
          <p>
            <strong>O</strong> - Observá el color y si hay moco.
          </p>
          <p>
            <strong>FT</strong> - Tocá con los dedos para sentir elasticidad,
            consistencia y color.
          </p>
        </div>
      </div>

      {/* TIPO DE DÍA — botones grandes */}
      <div className={styles.quickSection}>
        <div className={styles.quickLabel}>¿Cómo fue hoy?</div>
        <div className={styles.quickDayTypes}>
          {DAY_TYPES.map((t) => (
            <button
              key={t.value}
              className={`${styles.quickDayBtn} ${dayType === t.value ? styles[`qsel_${t.colorKey}`] : ""}`}
              onClick={() => {
                setDayType(t.value);
                setSensCode("");
                setCharCodes([]);
                setIsPeak(false);
              }}
            >
              <span className={styles.quickDayLetter}>{t.letter}</span>
              <span className={styles.quickDayLabel}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* INTENSIDAD SANGRADO */}
      {isBleeding && (
        <div className={styles.quickSection}>
          <div className={styles.quickLabel}>Intensidad</div>
          <div className={styles.quickChips}>
            {BLEEDING_INTENSITY_LABELS.map((v) => (
              <button
                key={v}
                className={`${styles.qchip} ${bleedInt === v ? styles.qchipActive : ""}`}
                onClick={() => setBleedInt(bleedInt === v ? "" : v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CÓDIGO SENSACIÓN */}
      {!isBleeding && (
        <div className={styles.quickSection}>
          <div className={styles.quickLabel}>Código de sensación</div>
          <div className={styles.quickChips}>
            {SENSATION_CODES.map((s) => (
              <button
                key={s.code}
                className={`${styles.qchip} ${styles.qchipCode} ${sensCode === s.code ? styles.qchipActive : ""}`}
                onClick={() => setSensCode(sensCode === s.code ? "" : s.code)}
              >
                <b>{s.code}</b> <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.quickSection}>
        <div className={styles.quickLabel}>Cantidad de observaciones</div>
        <div className={styles.quickChips}>
          {OBSERVATION_FREQUENCIES.map((f) => (
            <button
              key={f.code}
              className={`${styles.qchip} ${obsFreq === f.code ? styles.qchipActive : ""}`}
              onClick={() => setObsFreq(obsFreq === f.code ? "" : f.code)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* CARACTERÍSTICAS */}
      {(hasMucus || sensCode) && !isBleeding && (
        <div className={styles.quickSection}>
          <div className={styles.quickLabel}>Características del moco</div>
          <div className={styles.quickChips}>
            {CHARACTERISTIC_CODES.map((c) => (
              <button
                key={c.code}
                className={`${styles.qchip} ${styles.qchipCode} ${charCodes.includes(c.code) ? styles.qchipActive : ""}`}
                onClick={() => toggleChar(c.code)}
              >
                <b>{c.code}</b> <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DÍA CÚSPIDE */}
      {!isBleeding && dayType && (
        <div className={styles.quickSection}>
          <label className={styles.quickPeakRow}>
            <input
              type="checkbox"
              checked={isPeak}
              onChange={(e) => setIsPeak(e.target.checked)}
            />
            <span>
              Marcar como <strong>Día Cúspide (Pico)</strong>
            </span>
            {isPeak && <span className={styles.peakBadge}>★ Cúspide</span>}
          </label>
        </div>
      )}

      {/* NOTA */}
      <div className={styles.quickSection}>
        <div className={styles.quickLabel}>Nota (opcional)</div>
        <textarea
          className={styles.quickTextarea}
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Alguna observación adicional..."
        />
      </div>

      {error && <p className={styles.quickError}>{error}</p>}

      {/* BOTÓN GUARDAR */}
      <button
        className={`${styles.quickSaveBtn} ${saved ? styles.quickSaved : ""}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving
          ? "Guardando..."
          : saved
            ? "✓ Guardado"
            : "Guardar registro de hoy"}
      </button>

      {entry && (
        <button
          className={styles.quickDeleteBtn}
          onClick={async () => {
            if (window.confirm("¿Eliminar registro de hoy?"))
              await onDelete(todayKey);
          }}
        >
          Eliminar registro
        </button>
      )}
    </div>
  );
};

export default QuickEntry;
