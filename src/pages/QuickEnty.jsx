// ─── REGISTRO RÁPIDO ─────────────────────────────────────────────────────────
import React, { useState } from "react";
import EntryForm from "../components/EntryForm";
import { buildPayload } from "../lib/classifyEntry";
import { MONTHS_ES, DAYS_LONG } from "../constants/dates";
import styles from "./Calendar.module.css";

const QuickEntry = ({ todayKey, entry, onSave, onDelete }) => {
  const [y, m, d] = todayKey.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (formData) => {
    setSaving(true);
    setError(null);
    const payload = buildPayload(formData);
    const { error } = await onSave(todayKey, payload);
    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      setSaved(true);
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar registro de hoy?")) return;
    await onDelete(todayKey);
  };

  return (
    <div className={styles.quick}>
      {/* Fecha */}
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

      {saved && (
        <div className={styles.quickSavedBanner}>✓ Registro guardado</div>
      )}

      <EntryForm
        entry={entry}
        onSave={handleSave}
        onDelete={entry ? handleDelete : null}
        mode="quick"
        saving={saving}
      />

      {error && <p className={styles.quickError}>{error}</p>}
    </div>
  );
};

export default QuickEntry;
