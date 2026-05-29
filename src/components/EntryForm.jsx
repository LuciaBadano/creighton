/**
 * EntryForm.jsx
 * Formulario compartido de observación Creighton.
 * No pide "tipo de día" — lo deduce automáticamente via classifyEntry.js.
 *
 * Props:
 *   entry        - entrada existente (o null)
 *   onSave(payload) - callback con el payload listo para guardar
 *   onDelete()   - callback para eliminar (opcional)
 *   onCancel()   - callback cancelar (opcional, para modal)
 *   mode         - "modal" | "quick"  (afecta solo estilos del botón guardar)
 */
import React, { useEffect, useState } from "react";
import {
  SENSATION_CODES,
  CHARACTERISTIC_CODES,
  OBSERVATION_FREQUENCIES,
  BLEEDING_INTENSITY_LABELS,
} from "../lib/codes";
import { classifyDayType } from "../lib/classifyEntry";
import styles from "./EntryForm.module.css";

// Códigos que no aplican cuando hay sangrado
const BLEEDING_INTENSITIES = BLEEDING_INTENSITY_LABELS; // ["Muy ligero","Ligero","Moderado","Abundante"]

// Preview badge del tipo de día deducido
const DAY_TYPE_LABELS = {
  menstrual: { label: "Menstruación", color: "sangrado" },
  spotting: { label: "Manchado", color: "spotting" },
  seco: { label: "Día seco", color: "seco" },
  mucus: { label: "Moco", color: "fertil" },
  cuspide: { label: "Moco pico", color: "cuspide" },
};

export default function EntryForm({
  entry,
  onSave,
  onDelete,
  onCancel,
  mode = "modal",
  saving = false,
}) {
  const [bleedingInt, setBleedingInt] = useState(
    entry?.bleeding_intensity || "",
  );
  const [sensCode, setSensCode] = useState(entry?.sensation_code || "");
  const [charCodes, setCharCodes] = useState(entry?.characteristic_codes || []);
  const [obsFreq, setObsFreq] = useState(entry?.observation_frequency || "");
  const [note, setNote] = useState(entry?.note || "");
  const [error, setError] = useState(null);

  // Sincronizar si cambia el entry desde afuera (ej. QuickEntry recibe entry actualizado)
  useEffect(() => {
    setBleedingInt(entry?.bleeding_intensity || "");
    setSensCode(entry?.sensation_code || "");
    setCharCodes(entry?.characteristic_codes || []);
    setObsFreq(entry?.observation_frequency || "");
    setNote(entry?.note || "");
    setError(null);
  }, [entry]);

  const isBleeding = bleedingInt !== "";

  const toggleChar = (code) =>
    setCharCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );

  // Clasificación en tiempo real para mostrar preview
  const { day_type } = classifyDayType({
    bleeding_intensity: bleedingInt,
    sensation_code: sensCode,
    characteristic_codes: charCodes,
  });
  const typeInfo = DAY_TYPE_LABELS[day_type] || DAY_TYPE_LABELS.seco;
  const hasAnyData = bleedingInt || sensCode || charCodes.length > 0;

  const handleSave = () => {
    setError(null);
    onSave({
      bleeding_intensity: bleedingInt || null,
      sensation_code: sensCode || null,
      characteristic_codes: charCodes,
      observation_frequency: obsFreq || null,
      note: note.trim() || null,
    });
  };

  return (
    <div className={styles.form}>
      {/* GUÍA SOF */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Guía de observación</div>
        <div className={styles.guide}>
          <span>
            <strong>S</strong> Sensación
          </span>
          <span>
            <strong>O</strong> Observación
          </span>
          <span>
            <strong>FT</strong> Tacto
          </span>
        </div>
      </div>

      {/* CANTIDAD DE OBSERVACIONES */}
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

      {/* SANGRADO */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Sangrado (si hay)</div>
        <div className={styles.chips}>
          {BLEEDING_INTENSITIES.map((v) => (
            <button
              key={v}
              className={`${styles.chip} ${bleedingInt === v ? styles.sel_sangrado : ""}`}
              onClick={() => {
                const next = bleedingInt === v ? "" : v;
                setBleedingInt(next);
                if (next) {
                  setSensCode("");
                  setCharCodes([]);
                }
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* CÓDIGO DE SENSACIÓN — solo si no hay sangrado */}
      {!isBleeding && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Código de sensación</div>
          <div className={styles.chips}>
            {SENSATION_CODES.map((s) => (
              <button
                key={s.code}
                className={`${styles.chip} ${styles.chipCode} ${sensCode === s.code ? styles.sel_code : ""}`}
                onClick={() => setSensCode(sensCode === s.code ? "" : s.code)}
              >
                <span className={styles.codeTag}>{s.code}</span>
                <span className={styles.codeDesc}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CARACTERÍSTICAS — si hay sensación o sangrado L/VL */}
      {(sensCode || isBleeding) && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            Características del moco
            {isBleeding && (
              <span className={styles.reqHint}> (requerido para L/VL)</span>
            )}
          </div>
          <div className={styles.chips}>
            {CHARACTERISTIC_CODES.map((c) => (
              <button
                key={c.code}
                className={`${styles.chip} ${styles.chipCode} ${charCodes.includes(c.code) ? styles.sel_char : ""}`}
                onClick={() => toggleChar(c.code)}
              >
                <span className={styles.codeTag}>{c.code}</span>
                <span className={styles.codeDesc}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PREVIEW TIPO DE DÍA */}
      {hasAnyData && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Tipo de día deducido</div>
          <div
            className={`${styles.dayTypeBadge} ${styles[`badge_${typeInfo.color}`]}`}
          >
            {typeInfo.label}
          </div>
        </div>
      )}

      {/* NOTA */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Nota (opcional)</div>
        <textarea
          className={styles.textarea}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Observación adicional..."
          rows={2}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* ACCIONES */}
      <div
        className={`${styles.actions} ${mode === "quick" ? styles.actionsQuick : ""}`}
      >
        {onDelete && entry && (
          <button
            className={styles.btnDelete}
            onClick={onDelete}
            disabled={saving}
          >
            Eliminar
          </button>
        )}
        {onCancel && (
          <button
            className={styles.btnCancel}
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>
        )}
        <button
          className={`${styles.btnSave} ${mode === "quick" ? styles.btnSaveFull : ""}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
