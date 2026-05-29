import React, { useState } from "react";
import EntryForm from "./EntryForm";
import { buildPayload } from "../lib/classifyEntry";
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [y, m, d] = date.split("-").map(Number);
  const label = `${d} de ${MONTHS_ES[m - 1]} de ${y}`;

  const handleSave = async (formData) => {
    setSaving(true);
    setError(null);
    const payload = buildPayload(formData);
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

        <EntryForm
          entry={entry}
          onSave={handleSave}
          onDelete={entry ? handleDelete : null}
          onCancel={onClose}
          mode="modal"
          saving={saving}
        />

        {error && <p className={styles.formError}>{error}</p>}
      </div>
    </div>
  );
}
