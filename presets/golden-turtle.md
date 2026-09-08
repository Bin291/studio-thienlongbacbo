# Bộ Giáp Kim Quy Hoàng Triều (Golden Turtle Dynasty Set)

Bộ giáp hoàng kim lấy cảm hứng từ Thần Kim Quy và hoa văn Đại Việt cổ điển.
- **Phong cách**: `armorKit` vát cạnh 45 độ, đan xen phiến giáp vàng kim và ngọc lục bảo.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).
- **Ghi chú**: Cẳng tay gộp vào Áo giáp (`slot === 'forearm'`), Giày (`feet`) có hàm riêng.

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// BỘ GIÁP KIM QUY HOÀNG TRIỀU (Golden Turtle Dynasty Set)
// Chuẩn kiến trúc 2026-09-08: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).
// ═══════════════════════════════════════════════════════════════════════════

const M = (pal) => ({
  gold:     { color: 0xd4af37, metalness: 0.88, roughness: 0.32 },
  goldDark: { color: 0x8a6d1a, metalness: 0.82, roughness: 0.45 },
  jade:     { color: 0x1f7a4d, metalness: 0.15, roughness: 0.35, emissive: 0x0a3820, emissiveIntensity: 0.4 },
  cloth:    { color: 0x6e1b24, metalness: 0.05, roughness: 0.92 },
  steel:    { color: 0x9ba2ad, metalness: 0.92, roughness: 0.30 },
  glow:     { color: 0x54e8cf, metalness: 0.1,  roughness: 0.2, emissive: 0x54e8cf, emissiveIntensity: 0.9 },
});

// 1. MŨ (Head)
export function head(w, h, d, pal) {
  const b = piece(M(pal));
  b.bandStack('gold', { w: w * 1.12, h: h * 1.25, d: d * 1.24, y: h * 0.18, count: 4, taper: 0.08, trim: 'goldDark' });
  b.cover('gold', w, h, d, 0.95, 0.22, 1.05, [0, h * 0.86, 0]);
  b.slab('jade', w * 0.64, h * 0.24, d * 0.14, [0, h * 0.42, d * 0.65], { ch: h * 0.04 });
  b.slab('glow', w * 0.22, h * 0.14, d * 0.08, [0, h * 0.42, d * 0.72], { ch: h * 0.02 });

  b.both((sx) => {
    b.slab('gold', w * 0.18, h * 0.82, d * 1.05, [sx * w * 0.48, -h * 0.12, d * 0.05], { ch: h * 0.06 });
  });

  b.slab('goldDark', w * 0.86, h * 0.28, d * 0.22, [0, -h * 0.45, d * 0.54], { ch: h * 0.05 });
  return b.build();
}

// Helper cẳng tay (gộp vào Áo giáp theo chuẩn 2026-09-08)
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('cloth', w, h, d, 1.12, 1.05, 1.12, [0, 0, 0]);
  b.bandStack('gold', { w: w * 1.25, h: h * 0.78, d: d * 1.25, y: -h * 0.1, count: 3, taper: 0.04, trim: 'goldDark' });
  b.slab('jade', w * 0.36, h * 0.32, d * 0.16, [0, -h * 0.15, d * 0.65], { ch: h * 0.03 });
  return b.build();
}

// 2. ÁO GIÁP (Body) — gồm Ngực/thân + Bắp tay (upperArm) + Cẳng tay (forearm)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.bandStack('gold', { w: w * 1.24, h: h * 0.85, d: d * 1.24, y: -h * 0.22, count: 3, taper: 0.05, trim: 'goldDark' });
    b.slab('goldDark', w * 1.28, h * 0.08, d * 1.28, [0, -h * 0.62, 0], { ch: h * 0.02 });
    b.slab('gold', w * 1.15, h * 0.48, d * 0.92, [0, h * 0.24, 0], { ch: h * 0.04 });
    b.slab('jade', w * 0.32, h * 0.28, d * 0.14, [0, h * 0.46, d * 0.60], { ch: h * 0.03 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);
  b.slab('cloth', w * 0.48, h * 0.42, d * 0.75, [0, h * 0.62, 0], { ch: h * 0.08 });
  b.slab('goldDark', w * 0.52, h * 0.08, d * 0.80, [0, h * 0.52, 0], { ch: h * 0.02 });
  b.cover('gold', w, h, d, 1.22, 1.05, 1.25, [0, 0, 0]);

  b.both((sx) => {
    b.slab('gold', w * 0.48, h * 0.35, d * 1.28, [sx * w * 0.58, h * 0.42, 0], { ch: h * 0.06 });
    b.slab('jade', w * 0.24, h * 0.22, d * 0.15, [sx * w * 0.58, h * 0.48, d * 0.58], { ch: h * 0.03 });
  });

  b.slab('jade', w * 0.38, h * 0.38, d * 0.18, [0, h * 0.15, d * 0.64], { ch: h * 0.04 });
  b.slab('glow', w * 0.16, h * 0.16, d * 0.10, [0, h * 0.15, d * 0.72], { ch: h * 0.02 });

  const sy = -h * 0.82;
  b.slab('goldDark', w * 1.16, h * 0.15, d * 1.20, [0, -h * 0.48, 0], { ch: h * 0.02 });
  b.slab('cloth', w * 0.75, h * 0.52, d * 0.12, [0, sy - h * 0.05, d * 0.60], { ch: h * 0.03 });
  b.slab('gold', w * 0.55, h * 0.38, d * 0.14, [0, sy, d * 0.62], { ch: h * 0.03 });
  b.slab('cloth', w * 0.95, h * 0.62, d * 0.12, [0, sy - h * 0.08, -d * 0.60], { ch: h * 0.03 });

  return b.build();
}

// 3. QUẦN (Legs) — Đùi (thigh) & Cẳng chân (shin)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));
  if (slot === 'shin') {
    b.cover('cloth', w, h, d, 1.08, 1.02, 1.16, [0, h * 0.10, 0]);
    b.bandStack('gold', { w: w * 1.20, h: h * 0.78, d: d * 1.24, y: -h * 0.1, count: 3, taper: 0.03, trim: 'goldDark' });
    b.slab('jade', w * 0.34, h * 0.35, d * 0.15, [0, h * 0.25, d * 0.62], { ch: h * 0.03 });
    return b.build();
  }
  // đùi (thigh / default)
  b.cover('cloth', w, h, d, 1.08, 1.04, 1.18, [0, 0, 0]);
  b.slab('gold', w * 1.18, h * 0.14, d * 1.20, [0, h * 0.35, 0], { ch: h * 0.02 });
  b.slab('jade', w * 0.35, h * 0.28, d * 0.15, [0, -h * 0.25, d * 0.62], { ch: h * 0.04 });
  return b.build();
}

// 4. GIÀY (Feet) — Bàn chân / Ủng riêng
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('gold', w, h, d, 1.18, 1.42, 1.48, [0, h * 0.22, d * 0.12]);
  b.slab('jade', w * 0.45, h * 0.15, d * 0.40, [0, h * 0.18, d * 0.65], { ch: h * 0.02 });
  b.cover('goldDark', w, h, d, 1.20, 0.65, 1.50, [0, -h * 0.52, d * 0.10]);
  return b.build();
}

export const GOLDEN_TURTLE = { head, body, legs, feet };

```
