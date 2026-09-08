# Bộ Giáp Iron Blade (Minecraft Style - No Gem)

Bộ giáp sắt Grade 0 theo chuẩn Armor-Roadmap 3.0 (Dùng chung cho cả 3 lớp).
- **Chất liệu**: Thép sắt bạc sáng, nẹp kim loại, lõi mắt ngọc xanh Cyan.
- **Phong cách**: Khối phẳng mượt chuẩn phong cách Minecraft Iron Armor, không góc vát cầu kỳ.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).
- **Chống lộ da**: Đã phủ tà giáp hông/đũng và cổ giáp cao.

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// GRADE 0 — IRON BLADE (Minecraft Style, không ngọc) — Sắt.
// 2026-09-08: bộ CHÍNH THỨC theo Armor-Roadmap 3.0 — DÙNG CHUNG cho cả 3 lớp (xem LL-AR-001 §3.5c).
// Thiết kế phẳng mượt, tông sắt bạc ánh kim chuẩn Minecraft Iron Armor.
// ═══════════════════════════════════════════════════════════════════════════

const M = (pal) => ({
  ironPlate: { color: 0xd0d7de, metalness: 0.88, roughness: 0.22 }, // Thép sắt bạc sáng
  ironHi:    { color: 0xf0f3f6, metalness: 0.95, roughness: 0.15 }, // Mặt viền sắt bắt sáng
  ironLo:    { color: 0x8c959f, metalness: 0.75, roughness: 0.35 }, // Rãnh sắt xám chìm
  trimMetal: { color: 0xafb8c1, metalness: 0.85, roughness: 0.25 }, // Viền nẹp kim loại
  leather:   { color: 0x3d271d, metalness: 0.08, roughness: 0.85 }, // Đai da
  cloth:     { color: 0x21262d, metalness: 0.05, roughness: 0.90 }, // Vải lót tối
  bladeCore: { color: 0x38bdf8, metalness: 0.20, roughness: 0.20, emissive: 0x0284c7, emissiveIntensity: 0.85 }, // Lõi xanh
});

// 1. MŨ SẮT PHẲNG MƯỢT (Head)
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // Khối mũ trùm vuông vắn, phẳng mượt chuẩn Minecraft
  b.cover('ironPlate', w, h, d, 1.12, 1.05, 1.12, [0, h * 0.05, 0]);
  b.slab('ironHi', w * 1.14, h * 0.10, d * 1.14, [0, h * 0.52, 0], { ch: 0 });

  // Kính chắn mắt phẳng gọn gàng
  b.slab('bladeCore', w * 0.60, h * 0.14, d * 0.10, [0, h * 0.18, d * 0.58], { ch: 0 });
  b.slab('ironLo', w * 1.14, h * 0.12, d * 0.18, [0, h * 0.32, d * 0.56], { ch: 0 });

  // Ốp má phẳng hai bên
  b.both((sx) => {
    b.slab('ironPlate', w * 0.15, h * 0.60, d * 1.05, [sx * w * 0.48, -h * 0.10, 0], { ch: 0 });
  });

  // Che cằm
  b.slab('ironLo', w * 0.85, h * 0.25, d * 0.15, [0, -h * 0.35, d * 0.52], { ch: 0 });

  return b.build();
}

// Helper cẳng tay phẳng
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('ironPlate', w, h, d, 1.16, 1.15, 1.16, [0, -h * 0.05, 0]); // ống cẳng tay, kéo nhẹ xuống che mu bàn tay
  b.slab('ironHi', w * 1.18, h * 0.12, d * 1.18, [0, h * 0.35, 0], { ch: 0 });
  b.slab('bladeCore', w * 0.25, h * 0.35, d * 0.12, [0, -h * 0.10, d * 0.62], { ch: 0 });
  return b.build();
}

// 2. ÁO GIÁP SẮT (Body)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('ironPlate', w, h, d, 1.2, 1.15, 1.2, [0, 0, 0]); // ống bắp tay (kéo dài che khuỷu)
    b.slab('ironHi', w * 1.18, h * 0.12, d * 1.18, [0, h * 0.38, 0], { ch: 0 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  // Thân áo chính
  const b = piece(mats);
  const fz = d * 0.58;

  b.cover('ironPlate', w, h, d, 1.18, 1.02, 1.20, [0, 0, 0]);
  b.slab('ironLo', w * 0.55, h * 0.4, d * 0.55, [0, h * 0.62, 0], { ch: 0 }); // cổ giáp cao (khử hở cổ)

  // Cầu vai phẳng vuông vắn kiểu khối lập phương
  b.both((sx) => {
    b.slab('ironHi', w * 0.45, h * 0.25, d * 1.22, [sx * w * 0.55, h * 0.42, 0], { ch: 0 });
  });

  // Ngực áo phẳng hoàn toàn
  b.slab('trimMetal', w * 0.50, h * 0.35, d * 0.10, [0, h * 0.12, fz], { ch: 0 });

  // Thắt lưng da & nẹp hông phẳng
  b.slab('leather', w * 1.12, h * 0.14, d * 1.14, [0, -h * 0.44, 0], { ch: 0 });
  b.slab('ironHi', w * 0.28, h * 0.16, d * 0.12, [0, -h * 0.44, d * 0.58], { ch: 0 });

  // Tà giáp phủ hông/đũng (khử hở da giữa Áo giáp và Quần)
  b.slab('ironPlate', w * 1.16, h * 0.55, d * 1.18, [0, -h * 0.82, 0], { ch: 0 });
  for (const sz of [1, -1]) b.slab('ironPlate', w * 0.55, h * 0.34, d * 0.16, [0, -h * 1.02, sz * fz * 0.55], { ch: 0 });

  return b.build();
}

// 3. QUẦN SẮT (Legs)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('ironPlate', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);
    b.slab('ironHi', w * 0.35, h * 0.25, d * 0.12, [0, h * 0.25, d * 0.58], { ch: 0 });
    return b.build();
  }

  // Đùi
  b.cover('ironPlate', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);
  b.slab('trimMetal', w * 1.12, h * 0.10, d * 1.14, [0, h * 0.38, 0], { ch: 0 });
  return b.build();
}

// 4. GIÀY SẮT (Feet)
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('ironPlate', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);
  b.slab('ironHi', w * 0.40, h * 0.14, d * 0.35, [0, h * 0.15, d * 0.60], { ch: 0 });
  b.cover('ironLo', w, h, d, 1.16, 0.50, 1.42, [0, -h * 0.48, d * 0.06]);
  return b.build();
}

export const IRON_BLADE = { head, body, legs, feet };

```
