// Ngoại hình nhân vật — Tỉ lệ & tùy biến vóc dáng chuẩn của game

export const HAIR = [
  { name: 'Hói', tag: 'u' },          // 0
  { name: 'Cua', tag: 'm' },          // 1
  { name: 'Đầu đinh', tag: 'm' },     // 2
  { name: 'Mái bằng', tag: 'u' },     // 3
  { name: 'Rẽ ngôi', tag: 'm' },      // 4
  { name: 'Búi tó', tag: 'u' },       // 5
  { name: 'Mohawk', tag: 'm' },       // 6
  { name: 'Xoăn xù', tag: 'u' },      // 7
  { name: 'Gai dài', tag: 'm' },      // 8
  { name: 'Ngang vai', tag: 'f' },    // 9
  { name: 'Dài thẳng', tag: 'f' },    // 10
  { name: 'Hai bím', tag: 'f' },      // 11
  { name: 'Đuôi ngựa', tag: 'u' },    // 12
  { name: 'Búi cao', tag: 'f' },      // 13
  { name: 'Bob', tag: 'f' },          // 14
  { name: 'Sóng lượn', tag: 'f' },    // 15
];
export const HAIR_STYLES = HAIR.length;

export function hairFor(gender) {
  const want = gender === 'female' ? 'f' : 'm';
  return HAIR.map((h, i) => ({ ...h, i })).filter((h) => h.tag === 'u' || h.tag === want);
}

export const OUTFITS = [
  { v: 'gambeson', name: '🛡️ Áo lót giáp (Kín 100% da)' },
  { v: 'shirt', name: 'Áo sơ mi' },
  { v: 'under', name: 'Đồ lót (Soi da)' },
];

export const BODY_SLIDERS = [
  { key: 'height', label: 'Chiều cao', min: 0.80, max: 1.25, def: 1 },
  { key: 'legLen', label: 'Độ dài chân', min: 0.72, max: 1.38, def: 1 },
  { key: 'torsoLen', label: 'Độ dài thân', min: 0.78, max: 1.32, def: 1 },
  { key: 'armLen', label: 'Độ dài tay', min: 0.78, max: 1.32, def: 1 },
  { key: 'fat', label: 'Độ mập', min: 0.80, max: 1.40, def: 1 },
  { key: 'headScale', label: 'Kích thước đầu', min: 0.70, max: 1.50, def: 1 },
  { key: 'chest', label: 'Độ lớn ngực', min: 0, max: 1, def: 0.35 },
  { key: 'bust', label: 'Vòng một', min: 0, max: 1.8, def: 0.45, female: true },
  { key: 'belly', label: 'Độ lớn bụng', min: 0, max: 1, def: 0.1 },
  { key: 'butt', label: 'Kích cỡ mông', min: 0, max: 1, def: 0.3 },
];

export const DEFAULT_APPEARANCE = {
  ...Object.fromEntries(BODY_SLIDERS.map((s) => [s.key, s.def])),
  skin: 0xffcf9e, shirt: 0x3a7bd5, pants: 0x2b3a55,
  underArmor: 0x14171d, // Vải lót giáp đen mun
  hair: 1, hairColor: 0x3a2a1a, gender: 'male',
  outfit: 'gambeson', // Mặc định dùng áo lót giáp để 0% bị lộ da thịt
};

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const col = (v, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= 0 ? (n & 0xffffff) : d; };
const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);

export function sanitizeAppearance(a) {
  a = a || {};
  const validOutfits = ['gambeson', 'shirt', 'under'];
  const out = {
    skin: col(a.skin, DEFAULT_APPEARANCE.skin),
    shirt: col(a.shirt, DEFAULT_APPEARANCE.shirt),
    pants: col(a.pants, DEFAULT_APPEARANCE.pants),
    underArmor: col(a.underArmor, DEFAULT_APPEARANCE.underArmor),
    hair: clamp(Math.round(num(a.hair, 0)), 0, HAIR_STYLES - 1),
    hairColor: col(a.hairColor, DEFAULT_APPEARANCE.hairColor),
    gender: a.gender === 'female' ? 'female' : 'male',
    outfit: validOutfits.includes(a.outfit) ? a.outfit : 'gambeson',
  };
  for (const s of BODY_SLIDERS) out[s.key] = clamp(num(a[s.key], s.def), s.min, s.max);
  return out;
}
