import { useState, useEffect } from "react";
import {
  DAY_TYPES,
  SENSATION_CODES,
  CHARACTERISTIC_CODES,
  OBSERVATION_FREQUENCIES,
} from "../lib/codes";
import styles from "./EntryModal.module.css";

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export default function EntryModal({ date, entry, onSave, onDelete, onClose }) {
  const [dayType, setDayType] = useState(entry?.day_type || "");
  const [sensCode, setSensCode] = useState(entry?.sensation_code || "");
  const [charCodes, setCharCodes] = useState(entry?.characteristic_codes || []);
  const [isPeak, setIsPeak] = useState(entry?.is_peak || false);
  const [bleedingInt, setBleedingInt] = useState(
    entry?.bleeding_intensity || "",
  );
  const [obsFreq, setObsFreq] = useState(entry?.observation_frequency || "");
  const [note, setNote] = useState(entry?.note || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [y, m, d] = date.split("-").map(Number);
  const label = `${d} de ${MONTHS_ES[m - 1]} de ${y}`;

  const isBleeding = ["menstrual", "spotting"].includes(dayType);
  const hasMucus = ["mucus", "fertil", "cuspide"].includes(dayType);

  const toggleChar = (code) => {
    setCharCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleSave = async () => {
    if (!dayType) {
      setError("Seleccioná el tipo de día");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      day_type: dayType,
      sensation_code: sensCode || null,
      characteristic_codes: charCodes,
      is_peak: isPeak,
      bleeding_intensity: bleedingInt || null,
      observation_frequency: obsFreq || null,
      note: note.trim() || null,
    };
    const { error } = await onSave(date, payload);
    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    setSaving(true);
    await onDelete(date);
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{label}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* TIPO DE DÍA */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Tipo de día</div>
          <div className={styles.chips}>
            {DAY_TYPES.map((t) => (
              <button
                key={t.value}
                className={`${styles.chip} ${dayType === t.value ? styles[`sel_${t.colorKey}`] : ""}`}
                onClick={() => {
                  setDayType(t.value);
                  setSensCode("");
                  setCharCodes([]);
                  setIsPeak(false);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* GUÍA DE REGISTRO */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Guía de registro</div>
          <div className={styles.helpText}>
            <p>
              <strong>S</strong> - Pasá el papel para sentir si está lubricado.
            </p>
            <p>
              <strong>O</strong> - Observá el color y si hay moco.
            </p>
            <p>
              <strong>FT</strong> - Tocá con los dedos para notar elasticidad,
              consistencia y color.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>Cantidad de observaciones</div>
          <div className={styles.chips}>
            {OBSERVATION_FREQUENCIES.map((f) => (
              <button
                key={f.code}
                className={`${styles.chip} ${obsFreq === f.code ? styles.sel_code : ""}`}
                onClick={() => setObsFreq(obsFreq === f.code ? "" : f.code)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* INTENSIDAD SANGRADO */}
        {isBleeding && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Intensidad</div>
            <div className={styles.chips}>
              {["Muy ligero", "Ligero", "Moderado", "Abundante"].map((v) => (
                <button
                  key={v}
                  className={`${styles.chip} ${bleedingInt === v ? styles.sel_sangrado : ""}`}
                  onClick={() => setBleedingInt(bleedingInt === v ? "" : v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CÓDIGO DE SENSACIÓN */}
        {!isBleeding && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Código de sensación</div>
            <div className={styles.chips}>
              {SENSATION_CODES.map((s) => (
                <button
                  key={s.code}
                  className={`${styles.chip} ${styles.chipCode} ${sensCode === s.code ? styles.sel_code : ""}`}
                  onClick={() => setSensCode(sensCode === s.code ? "" : s.code)}
                  title={s.label}
                >
                  <span className={styles.codeTag}>{s.code}</span>
                  <span className={styles.codeDesc}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CARACTERÍSTICAS DEL MOCO */}
        {(hasMucus || sensCode) && !isBleeding && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Características del moco</div>
            <div className={styles.chips}>
              {CHARACTERISTIC_CODES.map((c) => (
                <button
                  key={c.code}
                  className={`${styles.chip} ${styles.chipCode} ${charCodes.includes(c.code) ? styles.sel_char : ""}`}
                  onClick={() => toggleChar(c.code)}
                  title={c.label}
                >
                  <span className={styles.codeTag}>{c.code}</span>
                  <span className={styles.codeDesc}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DÍA CÚSPIDE */}
        {!isBleeding && (
          <div className={styles.section}>
            <label className={styles.peakRow}>
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
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Nota</div>
          <textarea
            className={styles.textarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Observación adicional..."
            rows={2}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          {entry && (
            <button
              className={styles.btnDelete}
              onClick={handleDelete}
              disabled={saving}
            >
              Eliminar
            </button>
          )}
          <button
            className={styles.btnCancel}
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className={styles.btnSave}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
