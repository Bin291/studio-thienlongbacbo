# Bộ Giáp Carbonsteel Blade (Bóng Đêm Thép Carbon)

Bộ giáp thép carbon Grade 2 theo chuẩn Armor-Roadmap 3.0 (Dùng chung cho cả 3 lớp).
- **Chất liệu**: Thép carbon đen mun Titan, viền nẹp bạc xước, lõi xanh Cyan.
- **Điểm nhấn**: Kính Visor lõi đôi song song, biểu tượng Lưỡi Kiếm Chéo áp sát ngực, cầu vai vát góc nhọn.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// GRADE 2 — CARBONSTEEL BLADE (Bóng Đêm Thép Carbon) — Thép Carbon.
// 2026-09-08: bộ CHÍNH THỨC theo Armor-Roadmap 3.0 — DÙNG CHUNG cho cả 3 lớp (xem LL-AR-001 §3.5c).
// Tông đen mun carbon Titan, ký hiệu Lưỡi Kiếm Chéo áp sát ngực, cầu vai vát góc nhọn, visor lõi đôi.
// ═══════════════════════════════════════════════════════════════════════════

const M = (pal) => ({
  carbonMain: { color: 0x1a1d24, metalness: 0.88, roughness: 0.25 }, // Thép Carbon đen mun Titan
  carbonHi:   { color: 0x38414e, metalness: 0.92, roughness: 0.18 }, // Mặt vát xám thép bắt sáng
  carbonDark: { color: 0x0f1115, metalness: 0.80, roughness: 0.40 }, // Khung sắt đen thẫm
  silverTrim: { color: 0x78869b, metalness: 0.95, roughness: 0.15 }, // Viền nẹp bạc xước
  innerSuit:  { color: 0x08090c, metalness: 0.05, roughness: 0.95 }, // Áo lót siêu đen
  bladeGlow:  { color: 0x00d2ff, metalness: 0.20, roughness: 0.20, emissive: 0x0088cc, emissiveIntensity: 0.90 }, // Lõi xanh Cyan
});

// 1. MŨ CARBONSTEEL (Head) — Kính Visor Lõi Đôi Song Song + Vành Trán Cạnh Vát
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // Khối mũ trùm chính bằng thép carbon
  b.cover('carbonMain', w, h, d, 1.12, 1.05, 1.12, [0, h * 0.04, 0]);

  // Nẹp trán vát cạnh góc nhọn
  b.slab('carbonHi', w * 1.14, h * 0.10, d * 0.18, [0, h * 0.40, d * 0.55], { ch: h * 0.02 });

  // KÍNH VISOR LÕI ĐÔI SONG SONG
  b.slab('bladeGlow', w * 0.55, h * 0.06, d * 0.06, [0, h * 0.22, d * 0.58], { ch: 0 });
  b.slab('bladeGlow', w * 0.55, h * 0.06, d * 0.06, [0, h * 0.12, d * 0.58], { ch: 0 });

  // Giáp che cằm
  b.slab('carbonDark', w * 0.85, h * 0.28, d * 0.12, [0, -h * 0.35, d * 0.52], { ch: 0 });

  return b.build();
}

// Helper cẳng tay: Tấm nẹp vát lưỡi thép sắc nhọn
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('carbonMain', w, h, d, 1.12, 1.02, 1.12, [0, 0, 0]);
  b.slab('carbonHi', w * 0.25, h * 0.60, d * 0.10, [0, 0, d * 0.58], { ch: h * 0.03 });
  b.slab('bladeGlow', w * 0.08, h * 0.30, d * 0.08, [0, 0, d * 0.64], { ch: 0 });
  return b.build();
}

// 2. ÁO GIÁP CARBONSTEEL (Body) — Cầu vai vát nhọn + Ký hiệu LƯỠI KIẾM CHÉO áp sát ngực
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('carbonMain', w, h, d, 1.14, 0.95, 1.14, [0, -h * 0.05, 0]);
    b.slab('carbonHi', w * 1.16, h * 0.10, d * 1.16, [0, h * 0.36, 0], { ch: 0 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);

  // Tọa độ Z tấm ngực: fz = d * 0.56, độ dày = d * 0.10
  // Bề mặt ngực chính xác ở Z = d * 0.61. Vệt phát sáng dán đè Z = d * 0.615
  const chestZ = d * 0.56;
  const glowZ = d * 0.615;

  // Khung áo lót tối màu
  b.cover('carbonDark', w, h, d, 1.12, 1.02, 1.14, [0, 0, 0]);

  // CẦU VAI VÁT GÓC NHỌN (Angular Pauldrons)
  b.both((sx) => {
    b.slab('carbonHi', w * 0.48, h * 0.24, d * 1.22, [sx * w * 0.58, h * 0.42, 0], { ch: h * 0.05 });
    b.slab('silverTrim', w * 0.12, h * 0.26, d * 1.24, [sx * w * 0.78, h * 0.42, 0], { ch: 0 });
  });

  // Tấm thép Carbon ngực chính
  b.slab('carbonMain', w * 0.85, h * 0.48, d * 0.10, [0, h * 0.08, chestZ], { ch: 0 });

  // BIỂU TƯỢNG "LƯỠI KIẾM VÁT CHÉO" PHÁT SÁNG (Dán sát 100% vào ngực, thay thế chữ H)
  b.both((sx) => {
    // Vệt kiếm chéo
    b.slab('bladeGlow', w * 0.08, h * 0.30, d * 0.01, [sx * w * 0.12, h * 0.08, glowZ], { ch: 0, rot: [0, 0, sx * -0.4] });
  });
  // Tâm lõi vuông kết nối
  b.slab('bladeGlow', w * 0.12, h * 0.12, d * 0.01, [0, h * 0.08, glowZ + 0.002], { ch: 0 });

  // Đai thắt lưng thép
  b.slab('silverTrim', w * 1.10, h * 0.14, d * 1.12, [0, -h * 0.42, 0], { ch: 0 });

  // Cổ giáp cao (khử hở cổ) + tà giáp phủ hông/đũng (khử hở da giữa Áo giáp và Quần)
  b.slab('carbonDark', w * 0.55, h * 0.4, d * 0.55, [0, h * 0.62, 0], { ch: 0 });
  b.slab('carbonMain', w * 1.14, h * 0.55, d * 1.16, [0, -h * 0.82, 0], { ch: 0 });
  for (const sz of [1, -1]) b.slab('carbonMain', w * 0.55, h * 0.34, d * 0.16, [0, -h * 1.02, sz * (d * 0.56) * 0.55], { ch: 0 });

  return b.build();
}

// 3. QUẦN CARBONSTEEL (Legs)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('carbonMain', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);
    b.slab('carbonHi', w * 0.38, h * 0.28, d * 0.10, [0, h * 0.22, d * 0.58], { ch: h * 0.03 });
    return b.build();
  }

  b.cover('carbonMain', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);
  b.slab('carbonHi', w * 0.42, h * 0.38, d * 0.10, [0, 0, d * 0.58], { ch: h * 0.03 });

  return b.build();
}

// 4. GIÀY CARBONSTEEL (Feet)
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('carbonMain', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);
  b.slab('silverTrim', w * 0.42, h * 0.14, d * 0.35, [0, h * 0.15, d * 0.60], { ch: 0 });
  b.cover('carbonDark', w, h, d, 1.16, 0.50, 1.42, [0, -h * 0.48, d * 0.06]);
  return b.build();
}

export const CARBONSTEEL_BLADE = { head, body, legs, feet };

```
