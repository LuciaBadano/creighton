/**
 * classifyEntry.js
 * Deduce automáticamente day_type e is_peak a partir de los datos observados.
 *
 * Reglas:
 *  - Sangrado H o M               → menstrual
 *  - Sangrado L o VL               → spotting
 *  - Código 10/10DL/10SL/10WL     → cuspide (moco tipo pico)
 *  - Característica K (transp.) o L (lubricante) → cuspide
 *  - Códigos 2/2W/4/6/8 con características moco → mucus (no-pico)
 *  - Código 0, sin moco            → seco
 *
 * is_peak se deduce en helpers/Calendar.jsx mirando todos los registros del mes.
 * Aquí solo clasificamos el día individual.
 */

// Códigos de sensación que indican moco tipo PICO
const PEAK_SENSATION = new Set(["10", "10DL", "10SL", "10WL"]);

// Características que indican tipo pico
const PEAK_CHARS = new Set(["K", "L"]);

// Códigos de sensación que indican presencia de moco (no-pico por sí solos)
const MUCUS_SENSATION = new Set(["2", "2W", "4", "6", "8"]);

// Características que implican presencia de moco (independiente del código)
const MUCUS_CHARS = new Set(["B", "C", "C/K", "G", "P", "Y", "K", "L"]);

/**
 * @param {object} raw  - campos del formulario:
 *   bleeding_intensity: "" | "Muy ligero" | "Ligero" | "Moderado" | "Abundante"
 *   sensation_code: string
 *   characteristic_codes: string[]
 * @returns {{ day_type: string }}
 */
export function classifyDayType({
  bleeding_intensity,
  sensation_code,
  characteristic_codes = [],
}) {
  // 1. Sangrado
  if (bleeding_intensity === "Abundante" || bleeding_intensity === "Moderado") {
    return { day_type: "menstrual" };
  }
  if (bleeding_intensity === "Ligero" || bleeding_intensity === "Muy ligero") {
    return { day_type: "spotting" };
  }

  // 2. Moco tipo pico: código 10/10DL/10SL/10WL
  if (PEAK_SENSATION.has(sensation_code)) {
    return { day_type: "cuspide" };
  }

  // 3. Moco tipo pico: característica K o L
  if (characteristic_codes.some((c) => PEAK_CHARS.has(c))) {
    return { day_type: "cuspide" };
  }

  // 4. Moco no-pico: código de sensación mucoso
  if (MUCUS_SENSATION.has(sensation_code)) {
    return { day_type: "mucus" };
  }

  // 5. Moco no-pico: características de moco presentes
  if (characteristic_codes.some((c) => MUCUS_CHARS.has(c))) {
    return { day_type: "mucus" };
  }

  // 6. Seco: código 0 o sin datos
  return { day_type: "seco" };
}

/**
 * Construye el payload completo para guardar, deduciendo day_type.
 */
export function buildPayload({
  bleeding_intensity,
  sensation_code,
  characteristic_codes,
  observation_frequency,
  note,
}) {
  const { day_type } = classifyDayType({
    bleeding_intensity,
    sensation_code,
    characteristic_codes,
  });

  return {
    day_type,
    sensation_code: sensation_code || null,
    characteristic_codes: characteristic_codes ?? [],
    is_peak: false, // se recalcula en helpers/Calendar al renderizar
    bleeding_intensity: bleeding_intensity || null,
    observation_frequency: observation_frequency || null,
    note: note?.trim() || null,
  };
}
