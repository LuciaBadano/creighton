// Códigos de sensación que califican como moco "pico" (transparente, elástico, lubricante)
const PEAK_SENSATION_CODES = ["10", "10DL", "10SL", "10WL"];
const PEAK_CHAR_CODES = ["K", "L"]; // Transparente, Lubricante
//

export const isPeakQuality = (entry) => {
  if (!entry) return false;
  if (entry.is_peak) return true;
  if (entry.day_type === "cuspide") return true;
  if (PEAK_SENSATION_CODES.includes(entry.sensation_code)) return true;
  if (entry.characteristic_codes?.some((c) => PEAK_CHAR_CODES.includes(c)))
    return true;
  return false;
};

// Calcula el día pico real: último día consecutivo de moco fértil con calidad pico
export const findPeakDay = (entriesMap, year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let peakDate = null;

  for (let d = daysInMonth; d >= 1; d--) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const e = entriesMap[key];
    if (!e) continue;
    const isMucusType = ["fertil", "mucus", "cuspide"].includes(e.day_type);
    if (isMucusType && isPeakQuality(e)) {
      peakDate = key;
      break;
    }
  }
  return peakDate;
};

// Genera mapa de fecha → día post-pico (1, 2 o 3)
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
