# Bộ Giáp Steel Blade (Huy Hiệu Chữ H Phát Sáng)

Bộ giáp thép Grade 1 theo chuẩn Armor-Roadmap 3.0 (Dùng chung cho cả 3 lớp).
- **Chất liệu**: Thép xám bạc sáng, nẹp thép bắt sáng, lõi xanh phát sáng.
- **Điểm nhấn**: Huy hiệu chữ H phát sáng dán dính sát bề mặt ngực giáp, cầu vai phẳng vuông vắn.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// GRADE 1 — STEEL BLADE (Chữ H dán dính ngực) — Thép.
// 2026-09-08: bộ CHÍNH THỨC theo Armor-Roadmap 3.0 — DÙNG CHUNG cho cả 3 lớp (xem LL-AR-001 §3.5c).
// Toạ độ Z tấm ngực đã tinh chỉnh để chữ H dán phẳng trực tiếp lên mặt giáp, không tách lớp lơ lửng.
// ═══════════════════════════════════════════════════════════════════════════

const M = (pal) => ({
  steelMain: { color: 0xc8d1d9, metalness: 0.90, roughness: 0.20 }, // Thép xám bạc sáng
  steelHi:   { color: 0xf0f3f6, metalness: 0.95, roughness: 0.12 }, // Viền thép bắt sáng
  steelDark: { color: 0x484f58, metalness: 0.80, roughness: 0.35 }, // Khung sắt tối
  innerSuit: { color: 0x161b22, metalness: 0.05, roughness: 0.90 }, // Áo lót tối màu
  bladeGlow: { color: 0x38bdf8, metalness: 0.20, roughness: 0.20, emissive: 0x0284c7, emissiveIntensity: 0.85 }, // Lõi xanh phát sáng
});

// 1. MŨ STEEL BLADE (Head)
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  b.cover('steelMain', w, h, d, 1.12, 1.05, 1.12, [0, h * 0.04, 0]);
  b.slab('bladeGlow', w * 0.65, h * 0.12, d * 0.08, [0, h * 0.18, d * 0.58], { ch: 0 });
  b.slab('steelDark', w * 0.85, h * 0.25, d * 0.12, [0, -h * 0.35, d * 0.52], { ch: 0 });

  return b.build();
}

// Helper cẳng tay
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('steelMain', w, h, d, 1.12, 1.02, 1.12, [0, 0, 0]);
  b.slab('bladeGlow', w * 0.20, h * 0.35, d * 0.10, [0, 0, d * 0.58], { ch: 0 });
  return b.build();
}

// 2. ÁO GIÁP STEEL BLADE (Body)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('steelMain', w, h, d, 1.14, 0.95, 1.14, [0, -h * 0.05, 0]);
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);

  // Tấm giáp ngực có độ dày d * 0.10 nằm ở fz = d * 0.56
  // Mặt trước tấm giáp ngực chính xác ở Z = fz + (d * 0.10 / 2) = d * 0.61
  const chestPlateFrontZ = d * 0.61;
  // Chữ H dày d * 0.01 dán đè trực tiếp lên mặt giáp
  const hZ = chestPlateFrontZ + 0.005;

  // Áo lót & Cầu vai
  b.cover('steelDark', w, h, d, 1.12, 1.02, 1.14, [0, 0, 0]);
  b.both((sx) => {
    b.slab('steelHi', w * 0.45, h * 0.22, d * 1.20, [sx * w * 0.55, h * 0.40, 0], { ch: 0 });
  });

  // Tấm thép ngực chính
  b.slab('steelMain', w * 0.85, h * 0.45, d * 0.10, [0, h * 0.10, d * 0.56], { ch: 0 });

  // CHỮ "H" PHÁT SÁNG DÁN DÍNH SÁT MẶT NGỰC (Khớp Z = hZ)
  const hWidth = w * 0.35;
  const hHeight = h * 0.25;
  const barThickness = w * 0.08;

  // 2 Cột dọc của chữ H
  b.both((sx) => {
    b.slab('bladeGlow', barThickness, hHeight, d * 0.01, [sx * (hWidth / 2 - barThickness / 2), h * 0.10, hZ], { ch: 0 });
  });
  // Thanh ngang của chữ H
  b.slab('bladeGlow', hWidth, barThickness, d * 0.01, [0, h * 0.10, hZ], { ch: 0 });

  // Đai thắt lưng
  b.slab('steelHi', w * 1.10, h * 0.14, d * 1.12, [0, -h * 0.42, 0], { ch: 0 });

  // Cổ giáp cao (khử hở cổ) + tà giáp phủ hông/đũng (khử hở da giữa Áo giáp và Quần)
  b.slab('steelDark', w * 0.55, h * 0.4, d * 0.55, [0, h * 0.62, 0], { ch: 0 });
  b.slab('steelMain', w * 1.14, h * 0.55, d * 1.16, [0, -h * 0.82, 0], { ch: 0 });
  for (const sz of [1, -1]) b.slab('steelMain', w * 0.55, h * 0.34, d * 0.16, [0, -h * 1.02, sz * (d * 0.56) * 0.55], { ch: 0 });

  return b.build();
}

// 3. QUẦN STEEL BLADE (Legs)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('steelMain', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);
    b.slab('steelHi', w * 0.35, h * 0.25, d * 0.10, [0, h * 0.25, d * 0.58], { ch: 0 });
    return b.build();
  }

  b.cover('steelMain', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);
  b.slab('steelHi', w * 0.40, h * 0.35, d * 0.10, [0, 0, d * 0.58], { ch: 0 });

  return b.build();
}

// 4. GIÀY STEEL BLADE (Feet)
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('steelMain', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);
  b.slab('steelHi', w * 0.40, h * 0.14, d * 0.35, [0, h * 0.15, d * 0.60], { ch: 0 });
  b.cover('steelDark', w, h, d, 1.16, 0.50, 1.42, [0, -h * 0.48, d * 0.06]);
  return b.build();
}

export const STEEL_BLADE = { head, body, legs, feet };

```
