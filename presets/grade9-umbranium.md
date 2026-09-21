# Bộ Giáp Ám Kim (Umbranium Set)

Bộ giáp Grade 9 chính thức theo "Bảng dựng 13 bộ giáp" — DÙNG CHUNG cả 3 lớp.
- **Chất liệu**: Hắc Dạ Kim đen tuyền hút sáng (`umbraBlack`), thép tối màu vát cạnh (`umbraSteel`), vải sương mù giá buốt (`fogCloth`), bọc lót đen mun (`innerSuit`), viền tím ám phát sáng (`darkVoidGlow`).
- **Phong cách**: Kỹ thuật tạo hình Trim-layering (§14) — Vùng Hắc Dạ u ám, bí hiểm và đầy quyền lực.
- **Điểm nhấn**: Mũ visor khe mắt tím u uất, cầu vai thép đen vát nhọn, giáp ngực xẻ khe tím huyền bí, áo choàng sương đen buông dài sau lưng.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// GRADE 9 — GIÁP ÁM KIM (Umbranium / Azurnium) — Vùng Hắc Dạ.
// 2026-09-10: bộ CHÍNH THỨC theo "Bảng dựng 13 bộ" — DÙNG CHUNG cả 3 lớp (LL-AR-001 §3.5c).
// Chất liệu: Hắc Dạ Kim đen tuyền hút sáng + thép tối vát cạnh + vải sương mù + viền tím ám phát sáng yếu.
// Chi tiết: mũ visor khe mắt tím ám, cầu vai thép đen vát nhọn, khe tím dọc ngực, áo choàng sương đen.
// ═══════════════════════════════════════════════════════════════════════════

// Bảng vật liệu Giáp Ám Kim (Umbranium / Azurnium)
const M = (pal) => ({
  umbraBlack: { color: 0x0a0a0c, metalness: 0.95, roughness: 0.40 }, // Hắc Dạ Kim đen tuyền hút sáng
  umbraSteel: { color: 0x27272a, metalness: 0.90, roughness: 0.25 }, // Thép tối màu vát cạnh
  fogCloth:   { color: 0x18181b, metalness: 0.05, roughness: 0.95 }, // Vải sương mù giá buốt
  innerSuit:  { color: 0x050507, metalness: 0.05, roughness: 0.98 }, // Bọc lót đen mun bọc kín 100%
  darkVoidGlow:{ color: 0xa855f7, metalness: 0.10, roughness: 0.10, emissive: 0x7e22ce, emissiveIntensity: 0.65 }, // Viền tím ám phát sáng yếu
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. MŨ ÁM KIM (Head) - Visor Tím Ám + Vành Mũ Bóng Tối
// ─────────────────────────────────────────────────────────────────────────────
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // Lót tối bọc kín đầu & cổ
  b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.10, [0, h * 0.04, 0]);

  // Mũ trùm giáp Hắc Dạ Kim đen tuyền
  b.cover('umbraBlack', w, h, d, 1.14, 1.06, 1.14, [0, h * 0.04, 0]);

  // Gờ vòm trán vát 45°
  b.slab('umbraSteel', w * 1.16, h * 0.10, d * 0.18, [0, h * 0.40, d * 0.56], { ch: h * 0.03 });

  // Visor khe mắt tím ám phát sáng u uất
  b.slab('darkVoidGlow', w * 0.55, h * 0.08, d * 0.06, [0, h * 0.18, d * 0.58], { ch: 0 });

  // Nẹp che cằm & Gáy bóng tối
  b.slab('umbraBlack', w * 0.88, h * 0.28, d * 0.12, [0, -h * 0.35, d * 0.52], { ch: 0 });
  b.slab('umbraBlack', w * 0.88, h * 0.25, d * 0.08, [0, -h * 0.25, -d * 0.54], { ch: 0 });

  return b.build();
}

// Helper cẳng tay: Găng giáp đen tuyền nẹp tím ám.
// Phủ kín ống cẳng tay + BAO BÀN TAY riêng (khử hở da khuỷu/bàn tay — kỹ thuật như cryoFrostgold).
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('innerSuit', w, h, d, 1.14, 1.15, 1.14, [0, h * 0.05, 0]);    // lót phủ kín (ky>1 trùm khuỷu)
  b.cover('umbraBlack', w, h, d, 1.16, 1.15, 1.16, [0, h * 0.08, 0]);   // ống cẳng tay đen tuyền
  b.cover('umbraBlack', w, h, d, 1.26, 0.66, 1.32, [0, -h * 0.58, 0]);  // bao BÀN TAY (thấp/rộng, khử hở)
  b.slab('umbraSteel', w * 1.3, h * 0.28, d * 0.55, [0, -h * 0.52, d * 0.46], { ch: h * 0.05 }); // giáp mu bàn tay nhô trước

  // Nẹp cẳng tay dán đường chỉ tím ám phát sáng
  b.slab('umbraSteel', w * 0.28, h * 0.65, d * 0.08, [0, 0, d * 0.60], { ch: h * 0.03 });
  b.slab('darkVoidGlow', w * 0.08, h * 0.55, d * 0.09, [0, 0, d * 0.62], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ÁO GIÁP ÁM KIM (Body) - Giáp Đen Hút Sáng + Khí Chất Quyền Lực
// ─────────────────────────────────────────────────────────────────────────────
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('innerSuit', w, h, d, 1.10, 1.02, 1.10, [0, 0, 0]);
    b.cover('umbraBlack', w, h, d, 1.15, 0.92, 1.15, [0, -h * 0.04, 0]);
    b.slab('umbraSteel', w * 1.18, h * 0.08, d * 1.18, [0, h * 0.35, 0], { ch: 0 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);
  const fz = d * 0.58;

  // Lót giáp đen mun bọc kín
  b.cover('innerSuit', w, h, d, 1.18, 1.12, 1.20, [0, -h * 0.05, 0]);
  b.cover('umbraBlack', w, h, d, 1.22, 1.04, 1.24, [0, 0, 0]);

  // CẦU VAI THÉP ĐEN VÁT GÓC NHỌN (Pauldrons)
  b.both((sx) => {
    b.slab('umbraSteel', w * 0.58, h * 0.30, d * 1.28, [sx * w * 0.62, h * 0.44, 0], { ch: h * 0.05 });
    b.slab('darkVoidGlow', w * 0.10, h * 0.22, d * 1.30, [sx * w * 0.82, h * 0.48, 0], { ch: 0 });
  });

  // GIÁP NGỰC TRƯỚC - KHE TÍM ÁM CHẠY DỌC TRỰC DIỆN
  b.slab('umbraSteel', w * 0.82, h * 0.42, d * 0.08, [0, h * 0.10, fz + 0.01], { ch: h * 0.03 });
  b.slab('darkVoidGlow', w * 0.18, h * 0.38, d * 0.04, [0, h * 0.10, fz + 0.05], { ch: 0 });

  // ĐAI THẮT LƯNG ĐEN TUYỀN & VẠT VẢI SƯƠNG MÙ CHE RỦ DƯỚI ĐÙI
  b.slab('umbraSteel', w * 1.25, h * 0.14, d * 1.28, [0, -h * 0.44, 0], { ch: 0 });
  b.slab('fogCloth', w * 0.42, h * 0.75, d * 0.06, [0, -h * 0.80, fz + 0.02], { ch: 0 });
  b.slab('darkVoidGlow', w * 0.08, h * 0.60, d * 0.04, [0, -h * 0.80, fz + 0.05], { ch: 0 });

  // ÁO CHOÀNG SƯƠNG ĐEN SAU LƯNG (Cape)
  b.slab('fogCloth', w * 1.30, h * 1.20, d * 0.08, [0, -h * 0.35, -fz - 0.08], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUẦN ÁM KIM (Legs)
// ─────────────────────────────────────────────────────────────────────────────
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.12, [0, 0, 0]);
    b.cover('umbraBlack', w, h, d, 1.14, 0.92, 1.16, [0, 0, 0]);
    b.slab('umbraSteel', w * 0.40, h * 0.30, d * 0.08, [0, h * 0.22, d * 0.59], { ch: 0 });
    b.slab('darkVoidGlow', w * 0.10, h * 0.22, d * 0.08, [0, h * 0.22, d * 0.62], { ch: 0 });
    return b.build();
  }

  b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.12, [0, 0, 0]);
  b.cover('umbraBlack', w, h, d, 1.14, 0.95, 1.16, [0, 0, 0]);
  b.slab('umbraSteel', w * 0.42, h * 0.35, d * 0.08, [0, 0, d * 0.59], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GIÀY ÁM KIM (Feet)
// ─────────────────────────────────────────────────────────────────────────────
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('innerSuit', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);
  b.cover('umbraBlack', w, h, d, 1.16, 1.35, 1.42, [0, h * 0.18, d * 0.08]);
  b.slab('umbraSteel', w * 0.44, h * 0.14, d * 0.38, [0, h * 0.15, d * 0.60], { ch: 0 });
  return b.build();
}

export const UMBRANIUM_ARMOR = { head, body, legs, feet };
```
