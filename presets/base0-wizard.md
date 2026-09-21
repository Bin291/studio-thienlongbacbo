# Base 0 — Wizard: Áo Choàng Học Đồ Phép (Apprentice Arcanist)

Bộ đồ KHỞI ĐẦU (base0) của lớp **Wizard** (khoá nội bộ `archer`, cầm Wand). Ảnh tham chiếu: `base0-ref/wizard.png`.

- **Vai trò**: pháp sư tầm xa, mỏng máu — toàn vải, KHÔNG giáp tấm; sức nặng thị giác nằm ở áo choàng dài và mũ.
- **Chất liệu**: vải chàm (indigo) nhiều lớp, viền xanh nhạt, đai tím, chỉ vàng nhạt, chữ rune xanh cyan PHÁT SÁNG, ngọc tím phát sáng.
- **Nhận diện**: mũ nhọn vành rộng + ngọc tím · mũ trùm sau đầu · áo choàng vai (mantle) · mặt dây ngọc ngực · đai tím có sách phép + 2 bình thuốc · tay áo rộng có rune · gấu áo dài chạm ủng có rune.
- **Quy cách (chuẩn 2026-09-08)**: 4 món Mũ / Áo (torso + upperArm + forearm) / Quần (thigh + shin) / Giày (foot).
- **Chống lộ da**: tà áo choàng rủ tới gối, ống quần (gấu áo) loe che kín chân; mặt nhân vật vẫn lộ.

```javascript
// Base 0 - WIZARD. Sẵn có piece() từ armorKit.

const M = (pal) => ({
  indigo:  { color: 0x2c2f8a, metalness: 0.04, roughness: 0.92 }, // vai chinh
  indigoLo:{ color: 0x1f2166, metalness: 0.04, roughness: 0.95 }, // lop trong / bong
  indigoHi:{ color: 0x4b60b4, metalness: 0.05, roughness: 0.88 }, // vien xanh nhat
  purple:  { color: 0x5b2f86, metalness: 0.05, roughness: 0.90 }, // dai tim
  gold:    { color: 0xc9a25a, metalness: 0.65, roughness: 0.40 }, // chi vang nhat
  leather: { color: 0x5a3a26, metalness: 0.06, roughness: 0.88 }, // gang / ung / sach
  book:    { color: 0x4a2a6a, metalness: 0.05, roughness: 0.85 }, // bia sach phep
  page:    { color: 0xe4dcc0, metalness: 0.02, roughness: 0.95 }, // mep giay
  rune:    { color: 0x3fe0ff, metalness: 0.10, roughness: 0.30, emissive: 0x18c8ff, emissiveIntensity: 1.1 }, // rune cyan
  gem:     { color: 0xb146ff, metalness: 0.20, roughness: 0.20, emissive: 0x9a2cff, emissiveIntensity: 1.2 }, // ngoc tim
  vialC:   { color: 0x33d6ee, metalness: 0.10, roughness: 0.15, emissive: 0x1fb8d6, emissiveIntensity: 0.6 }, // binh cyan
  vialP:   { color: 0xa14be0, metalness: 0.10, roughness: 0.15, emissive: 0x8a30c8, emissiveIntensity: 0.6 }, // binh tim
});

// Chu rune xep bang vai o khoi nho (mau chu "cuon") - dung cho tay ao va gau ao
function runeGlyph(b, cx, cy, cz, s, faceZ) {
  const t = s * 0.15, k = t * 0.9;
  b.box('rune', s, t, k, [cx, cy + s * 0.44, cz]);                       // khung tren
  b.box('rune', t, s * 0.88, k, [cx - s * 0.425, cy, cz]);               // khung trai
  b.box('rune', s * 0.85, t, k, [cx + s * 0.075, cy - s * 0.44, cz]);    // khung duoi (ho goc phai)
  b.box('rune', t, s * 0.62, k, [cx + s * 0.425, cy + s * 0.13, cz]);    // khung phai (ngat nua duoi)
  b.box('rune', s * 0.52, t, k, [cx - s * 0.08, cy + s * 0.18, cz]);     // me cung: vach ngang trong
  b.box('rune', t, s * 0.36, k, [cx + s * 0.16, cy + s * 0.00, cz]);     // vach doc trong
  b.box('rune', s * 0.30, t, k, [cx - s * 0.02, cy - s * 0.18, cz]);     // vach ngang duoi trong
  return b;
}

// 1. MU PHU THUY + MU TRUM (Head)
export function head(w, h, d, pal) {
  const b = piece(M(pal));
  // Vanh mu rong
  b.slab('indigo', w * 2.05, h * 0.16, d * 2.05, [0, h * 0.30, 0], { ch: h * 0.035 });
  b.slab('indigoLo', w * 2.05, h * 0.04, d * 2.05, [0, h * 0.21, 0], { ch: 0 });
  b.slab('indigoHi', w * 2.07, h * 0.03, d * 2.07, [0, h * 0.385, 0], { ch: 0 });
  // Than mu nhon - cong dan ve phia sau (zStep am)
  // bandStack: tang dau = tang TREN CUNG (k=1), tang cuoi = DAY (k=1+taper) => tang tren nho, day to. Chop cong ra sau: z tang tren -0.30d -> day 0.
  b.bandStack('indigo', { w: w * 0.28, h: h * 1.20, d: d * 0.28, y: h * 1.00, z: -d * 0.24, count: 5, taper: 2.57, zStep: d * 0.24, ch: h * 0.07, liner: false });
  // Day vang + ngoc tim truoc mu
  b.slab('gold', w * 1.00, h * 0.10, d * 1.00, [0, h * 0.44, 0], { ch: h * 0.02 });
  b.slab('gold', w * 0.24, h * 0.24, d * 0.10, [0, h * 0.44, d * 0.52], { ch: h * 0.03 });
  b.box('gem', w * 0.12, h * 0.16, d * 0.10, [0, h * 0.44, d * 0.58], { rot: [0, 0, Math.PI / 4] });
  // Mu trum: ap tren dau + hai ben + sau gay (de mat lo o phia truoc)
  b.slab('indigo', w * 1.16, h * 0.20, d * 1.16, [0, h * 0.12, -d * 0.02], { ch: h * 0.03 });
  b.slab('indigo', w * 1.14, h * 0.96, d * 0.26, [0, -h * 0.02, -d * 0.56], { ch: h * 0.03 });
  b.both((sx) => {
    b.slab('indigo', w * 0.14, h * 0.90, d * 1.02, [sx * w * 0.55, -h * 0.02, -d * 0.02], { ch: w * 0.02 });
    b.slab('indigoHi', w * 0.03, h * 0.92, d * 0.30, [sx * w * 0.63, -h * 0.02, d * 0.42], { ch: 0 });
  });
  b.slab('indigoLo', w * 1.06, h * 0.22, d * 1.06, [0, -h * 0.50, 0], { ch: h * 0.03 });
  return b.build();
}

// Tay ao rong: cang tay loe + bo tay vang + rune + gang da
function sleeveFore(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('indigo', w, h, d, 1.52, 1.04, 1.52, [0, h * 0.02, 0]);                             // ong tay rong
  b.slab('indigoHi', w * 1.60, h * 0.05, d * 1.60, [0, -h * 0.26, 0], { ch: 0 });
  b.slab('gold', w * 1.62, h * 0.10, d * 1.62, [0, -h * 0.16, 0], { ch: h * 0.015 });        // bo tay vang
  b.slab('indigo', w * 1.56, h * 0.20, d * 1.56, [0, -h * 0.36, 0], { ch: h * 0.03 });        // mieng ong ao
  runeGlyph(b, 0, h * 0.10, d * 0.80, w * 0.42);                                               // rune truoc tay ao
  b.slab('leather', w * 1.00, h * 0.26, d * 1.02, [0, -h * 0.52, 0], { ch: h * 0.04 });       // gang da nau (che mu ban tay)
  return b.build();
}

// 2. AO CHOANG (Body)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('indigo', w, h, d, 1.34, 1.04, 1.34, [0, 0, 0]);
    b.slab('indigoHi', w * 1.40, h * 0.06, d * 1.40, [0, -h * 0.36, 0], { ch: 0 });
    return b.build();
  }
  if (slot === 'forearm') return sleeveFore(w, h, d, pal);

  const b = piece(mats);
  const fz = d * 0.58;
  // Ao choang than tren (cao co)
  b.cover('indigo', w, h, d, 1.24, 1.05, 1.28, [0, 0, 0]);
  b.slab('indigoLo', w * 0.56, h * 0.36, d * 0.60, [0, h * 0.62, 0], { ch: h * 0.05 });      // co ao cao
  // Mantle vai: lop tren + vien xanh nhat + hoa van vuong
  b.slab('indigo', w * 1.56, h * 0.30, d * 1.42, [0, h * 0.44, 0], { ch: h * 0.07 });
  b.slab('indigoHi', w * 1.58, h * 0.06, d * 1.44, [0, h * 0.29, 0], { ch: 0 });
  b.both((sx) => {
    b.slab('indigo', w * 0.42, h * 0.34, d * 1.46, [sx * w * 0.62, h * 0.32, 0], { ch: h * 0.07 });   // vai mem phu cung quet bap tay
    b.box('indigoHi', w * 0.10, h * 0.08, d * 0.10, [sx * w * 0.66, h * 0.50, fz + d * 0.02]);
  });
  // Cai vang + mat day ngoc tim ngực
  b.box('gold', w * 0.34, h * 0.05, d * 0.06, [0, h * 0.56, fz + d * 0.06]);
  b.slab('gold', w * 0.02, h * 0.26, d * 0.05, [0, h * 0.42, fz + d * 0.06], { ch: 0 });
  b.box('gem', w * 0.13, w * 0.13, d * 0.12, [0, h * 0.24, fz + d * 0.10], { rot: [0, 0, Math.PI / 4] });
  b.box('gold', w * 0.20, w * 0.20, d * 0.07, [0, h * 0.24, fz + d * 0.07], { rot: [0, 0, Math.PI / 4] });
  // Thap tu vang doc than ao
  b.slab('gold', w * 0.05, h * 0.42, d * 0.05, [0, -h * 0.10, fz + d * 0.05], { ch: 0 });
  b.slab('gold', w * 0.24, h * 0.05, d * 0.05, [0, -h * 0.02, fz + d * 0.05], { ch: 0 });
  // Dai tim quan eo + duoi dai buong truoc
  b.slab('purple', w * 1.20, h * 0.20, d * 1.24, [0, -h * 0.46, 0], { ch: h * 0.04 });
  b.box('gold', w * 0.18, h * 0.20, d * 0.08, [w * 0.32, -h * 0.46, fz + d * 0.06]);
  for (let i = 0; i < 3; i++) b.slab('purple', w * 0.10, h * (0.55 - i * 0.10), d * 0.06, [-w * 0.04 + i * w * 0.08, -h * (0.80 + i * 0.05), fz + d * 0.04], { ch: 0 });
  // Sach phep ben trai hong
  b.slab('book', w * 0.34, h * 0.44, d * 0.20, [-w * 0.56, -h * 0.64, fz - d * 0.02], { ch: h * 0.03 });
  b.slab('page', w * 0.30, h * 0.38, d * 0.10, [-w * 0.56, -h * 0.64, fz - d * 0.14], { ch: 0 });
  b.box('rune', w * 0.08, w * 0.08, d * 0.05, [-w * 0.56, -h * 0.62, fz + d * 0.10], { rot: [0, 0, Math.PI / 4] });
  // 2 binh thuoc ben phai (treo day)
  b.cyl('vialP', w * 0.07, w * 0.06, h * 0.22, [w * 0.44, -h * 0.72, fz - d * 0.02], { seg: 8 });
  b.cyl('vialC', w * 0.07, w * 0.06, h * 0.22, [w * 0.58, -h * 0.76, fz - d * 0.06], { seg: 8 });
  // Ta ao choang dai phu hong / dung toi goi (khu ho da)
  b.slab('indigo', w * 1.24, h * 0.62, d * 1.30, [0, -h * 0.86, 0], { ch: h * 0.03 });
  b.slab('indigo', w * 1.22, h * 0.46, d * 1.28, [0, -h * 1.34, 0], { ch: h * 0.03 });
  b.slab('gold', w * 0.36, h * 0.70, d * 0.05, [0, -h * 1.12, fz + d * 0.11], { ch: 0 });     // tam ap giua vang
  b.slab('indigoLo', w * 0.26, h * 0.60, d * 0.06, [0, -h * 1.12, fz + d * 0.09], { ch: 0 });
  b.both((sx) => { b.slab('indigoHi', w * 0.05, h * 1.05, d * 1.30, [sx * w * 0.56, -h * 1.02, 0], { ch: 0 }); });
  runeGlyph(b, w * 0.42, -h * 1.30, fz + d * 0.10, w * 0.26);
  runeGlyph(b, -w * 0.42, -h * 1.30, fz + d * 0.10, w * 0.26);
  return b.build();
}

// 3. GAU AO / ONG QUAN (Legs) - ao choang loe che kin chan
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('indigo', w, h, d, 1.34, 1.04, 1.40, [0, 0, 0]);
    b.slab('indigoHi', w * 1.42, h * 0.06, d * 1.48, [0, -h * 0.40, 0], { ch: 0 });          // vien gau ao
    b.slab('indigoLo', w * 1.40, h * 0.05, d * 1.46, [0, -h * 0.34, 0], { ch: 0 });
    runeGlyph(b, 0, -h * 0.12, d * 0.74, w * 0.36);
    return b.build();
  }
  b.cover('indigo', w, h, d, 1.30, 1.03, 1.36, [0, 0, 0]);
  b.slab('indigoHi', w * 0.04, h * 0.98, d * 1.38, [w * 0.50, 0, 0], { ch: 0 });
  b.slab('indigoHi', w * 0.04, h * 0.98, d * 1.38, [-w * 0.50, 0, 0], { ch: 0 });
  return b.build();
}

// 4. UNG MEM (Feet)
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('leather', w, h, d, 1.16, 1.40, 1.44, [0, h * 0.22, d * 0.10]);
  b.slab('gold', w * 0.72, h * 0.10, d * 0.16, [0, h * 0.50, d * 0.42], { ch: h * 0.02 });    // day khoa vang
  b.cover('indigoLo', w, h, d, 1.18, 0.50, 1.48, [0, -h * 0.50, d * 0.10]);
  return b.build();
}

export const BASE0_WIZARD = { head, body, legs, feet };
```
