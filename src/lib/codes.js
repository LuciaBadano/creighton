// Códigos oficiales del Método Creighton

export const SENSATION_CODES = [
  { code: "0", label: "Seco", color: "seco" },
  { code: "2", label: "Húmedo sin lubricación", color: "humedo" },
  { code: "2W", label: "Mojado sin lubricación", color: "humedo" },
  { code: "4", label: "Brillo sin lubricación", color: "humedo" },
  { code: "6", label: "Pegajoso (0.5 cm)", color: "fertil" },
  { code: "8", label: "Ligoso (1–2 cm)", color: "fertil" },
  { code: "10", label: "Elástico (2.5 cm o +)", color: "cuspide" },
  { code: "10DL", label: "Húmedo con lubricación", color: "cuspide" },
  { code: "10SL", label: "Brillo con lubricación", color: "cuspide" },
  { code: "10WL", label: "Mojado con lubricación", color: "cuspide" },
];

export const CHARACTERISTIC_CODES = [
  { code: "B", label: "Sangrado café/marrón" },
  { code: "C", label: "Nublado (blanco)" },
  { code: "C/K", label: "Nublado/Transparente" },
  { code: "G", label: "Gomoso" },
  { code: "K", label: "Transparente o Claro" },
  { code: "L", label: "Lubricante" },
  { code: "P", label: "Pastoso (cremoso)" },
  { code: "R", label: "Rojo" },
  { code: "Y", label: "Amarillo (pálido)" },
];

export const OBSERVATION_FREQUENCIES = [
  { code: "AD", label: "A lo largo del día" },
  { code: "x1", label: "1 vez" },
  { code: "x2", label: "2 veces" },
  { code: "x3", label: "3 veces" },
];

export const BLEEDING_INTENSITY_CODES = {
  "Muy ligero": "VL",
  Ligero: "L",
  Moderado: "M",
  Abundante: "H",
};

export const BLEEDING_INTENSITY_LABELS = [
  "Muy ligero",
  "Ligero",
  "Moderado",
  "Abundante",
];

export const BLEEDING_TYPES = [
  { code: "H", label: "Sangrado menstrual", color: "sangrado" },
  { code: "VL", label: "Muy ligero", color: "sangrado" },
  { code: "L", label: "Ligero", color: "sangrado" },
  { code: "M", label: "Moderado", color: "sangrado" },
  { code: "H", label: "Abundante", color: "sangrado" },
];

// Tipo de día para la celda del calendario
export const DAY_TYPES = [
  {
    value: "menstrual",
    label: "Menstruación",
    letter: "M",
    colorKey: "sangrado",
  },
  { value: "seco", label: "Día seco", letter: "V", colorKey: "seco" },
  {
    value: "mucus",
    label: "Moco sin fertilidad",
    letter: "A",
    colorKey: "amarillo",
  },
  { value: "fertil", label: "Moco fértil", letter: "B", colorKey: "fertil" },
  {
    value: "cuspide",
    label: "Día cúspide (Pico)",
    letter: "P",
    colorKey: "cuspide",
  },
  { value: "spotting", label: "Manchado", letter: "S", colorKey: "spotting" },
];

export const BLEEDING_DAY_TYPES = ["menstrual", "spotting"];
export const MUCUS_DAY_TYPES = ["mucus", "fertil", "cuspide"];

export const COLOR_MAP = {
  sangrado: { bg: "#FAEAE5", fg: "#C94B2E", border: "#E8A090" },
  spotting: { bg: "#FDF0ED", fg: "#D4724D", border: "#EDB09A" },
  seco: { bg: "#EAF2E7", fg: "#4A7C3F", border: "#9AC48F" },
  humedo: { bg: "#FEF9E7", fg: "#A67C1A", border: "#D4B96A" },
  amarillo: { bg: "#FAF2DC", fg: "#A67C1A", border: "#D4B96A" },
  fertil: { bg: "#E5EEFA", fg: "#2C6FAC", border: "#90B8E0" },
  cuspide: { bg: "#EDE8F7", fg: "#6B47A8", border: "#B09ADA" },
};
