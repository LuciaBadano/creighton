/**
 * helpers/Calendar.jsx
 *
 * Reglas de color:
 *  - Rojo       (sangrado)  → day_type "menstrual"
 *  - Rojo claro (spotting)  → day_type "spotting"
 *  - Verde      (seco)      → day_type "seco", fuera de cuenta post-pico
 *  - Blanco + bebé          → day_type "mucus" o "cuspide"  (moco presente)
 *  - Verde + bebé           → day_type "seco" dentro de los 3 días post-pico
 *
 * Día pico:
 *  Se deduce automáticamente: el ÚLTIMO día con day_type "cuspide"
 *  antes de una racha sin "cuspide".
 */

// Códigos de sensación tipo pico
const PEAK_SENSATION_CODES = new Set(["10", "10DL", "10SL", "10WL"]);
const PEAK_CHAR_CODES = new Set(["K", "L"]);

/**
 * ¿La entrada tiene calidad de moco pico?
 */
export const isPeakQuality = (entry) => {
  if (!entry) return false;
  if (entry.day_type === "cuspide") return true;
  if (PEAK_SENSATION_CODES.has(entry.sensation_code)) return true;
  if (entry.characteristic_codes?.some((c) => PEAK_CHAR_CODES.has(c)))
    return true;
  return false;
};

/**
 * Encuentra el día pico del mes:
 * El último día con moco tipo pico (cuspide) en el mes.
 * Si hay días post-pico con moco pico de nuevo, ese sería un nuevo pico.
 *
 * Algoritmo: busca de adelante hacia atrás el último día "cuspide".
 */
export const findPeakDay = (entriesMap, year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let peakDate = null;

  for (let d = daysInMonth; d >= 1; d--) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const e = entriesMap[key];
    if (!e) continue;
    if (isPeakQuality(e)) {
      peakDate = key;
      break;
    }
  }
  return peakDate;
};

/**
 * Genera mapa fecha → número de día post-pico (1, 2, 3).
 * Solo los 3 días siguientes al día pico.
 */
export const buildPostPeakMap = (entriesMap, year, month) => {
  const peak = findPeakDay(entriesMap, year, month);
  if (!peak) return {};

  const map = {};
  const peakD = new Date(peak + "T12:00:00");

  for (let i = 1; i <= 3; i++) {
    const nd = new Date(peakD);
    nd.setDate(nd.getDate() + i);
    if (nd.getFullYear() === year && nd.getMonth() === month) {
      const key = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}-${String(nd.getDate()).padStart(2, "0")}`;
      map[key] = i;
    }
  }
  return map;
};

/**
 * Devuelve el colorKey visual para una celda del calendario.
 *
 * colorKey:
 *   "sangrado"  → rojo
 *   "spotting"  → rojo claro
 *   "seco"      → verde (sin bebé)
 *   "mucus"     → blanco con bebé  (moco no-pico)
 *   "cuspide"   → blanco con bebé destacado (moco pico)
 *   "seco_fertil" → verde con bebé (seco post-pico)
 */
export const getCellColorKey = (entry, postPeakDay) => {
  if (!entry) return null;

  const dt = entry.day_type;

  if (dt === "menstrual") return "sangrado";
  if (dt === "spotting") return "spotting";
  if (dt === "cuspide" || dt === "mucus") return dt; // blanco con bebé
  if (dt === "seco") {
    return postPeakDay ? "seco_fertil" : "seco";
  }
  return "seco";
};
