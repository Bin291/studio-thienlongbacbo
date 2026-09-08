# Bộ Giáp Huyền Vũ Chiến Thần (Black Tortoise War God Set)

Bộ chiến giáp cận chiến hạng nặng phong cách Huyền Vũ (Chiến Binh - Warrior).
- **Chất liệu**: Thép đen Titan, viền đồng hun cổ, ngọc lục bảo phát quang, lụa tím hoàng gia.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// BỘ GIÁP HUYỀN VŨ CHIẾN THẦN (Black Tortoise War God Set)
// Chuẩn kiến trúc 2026-09-08: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).
// ═══════════════════════════════════════════════════════════════════════════

const M = (pal) => ({
  plate:    { color: 0x15181e, metalness: 0.85, roughness: 0.38 },
  plateLo:  { color: 0x0c0e12, metalness: 0.75, roughness: 0.52 },
  plateHi:  { color: 0x2b313d, metalness: 0.90, roughness: 0.30 },
  copper:   { color: 0xc68a4c, metalness: 0.95, roughness: 0.28 },
  jade:     { color: 0x2ecc71, metalness: 0.15, roughness: 0.35, emissive: 0x1b7943, emissiveIntensity: 0.6 },
  cloth:    { color: 0x4a154b, metalness: 0.05, roughness: 0.92 },
  leather:  { color: 0x3d271d, metalness: 0.08, roughness: 0.85 },
  glow:     { color: 0x54e8cf, metalness: 0.10, roughness: 0.20, emissive: 0x54e8cf, emissiveIntensity: 0.95 },
});

// 1. MŨ (Head)
export function head(w, h, d, pal) {
  const b = piece(M(pal));
  b.bandStack('plate', { w: w * 1.14, h: h * 1.28, d: d * 1.26, y: h * 0.16, count: 4, taper: 0.07, trim: 'plateLo' });
  b.cover('plateHi', w, h, d, 0.92, 0.22, 1.05, [0, h * 0.86, 0]);
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const segH = h * (0.42 - 0.15 * t);
    const z = d * (0.35 - 0.7 * t);
    b.slab('copper', w * 0.14, segH, d * 0.2, [0, h * 0.62 + segH / 2, z], { ch: h * 0.03 });
  }
  b.slab('copper', w * 1.18, h * 0.12, d * 0.2, [0, h * 0.38, d * 0.62], { ch: h * 0.03 });
  b.slab('jade', w * 0.38, h * 0.16, d * 0.12, [0, h * 0.38, d * 0.72], { ch: h * 0.03 });
  b.slab('glow', w * 0.14, h * 0.10, d * 0.08, [0, h * 0.38, d * 0.78], { ch: h * 0.02 });
  b.both((sx) => {
    b.slab('plate', w * 0.2, h * 0.84, d * 1.08, [sx * w * 0.48, -h * 0.12, d * 0.06], { ch: h * 0.06 });
    b.slab('copper', w * 0.06, h * 0.62, d * 0.08, [sx * w * 0.48, -h * 0.22, d * 0.6], { ch: h * 0.02 });
  });
  b.slab('plateLo', w * 0.92, h * 0.38, d * 0.22, [0, -h * 0.42, d * 0.54], { ch: h * 0.06 });
  return b.build();
}

// Helper cẳng tay (gộp vào Áo giáp theo chuẩn 2026-09-08)
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('cloth', w, h, d, 1.12, 1.05, 1.12, [0, 0, 0]);
  b.bandStack('plate', { w: w * 1.26, h: h * 0.80, d: d * 1.26, y: -h * 0.1, count: 3, taper: 0.04, trim: 'plateLo' });
  b.slab('copper', w * 1.28, h * 0.08, d * 1.28, [0, h * 0.28, 0], { ch: h * 0.02 });
  b.slab('jade', w * 0.36, h * 0.32, d * 0.16, [0, -h * 0.15, d * 0.65], { ch: h * 0.03 });
  b.slab('glow', w * 0.12, h * 0.12, d * 0.10, [0, -h * 0.15, d * 0.72], { ch: h * 0.02 });
  return b.build();
}

// 2. ÁO GIÁP (Body) — gồm Ngực/thân + Bắp tay (upperArm) + Cẳng tay (forearm)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);
  if (slot === 'upperArm') {
    const b = piece(mats);
    b.bandStack('plate', { w: w * 1.25, h: h * 0.84, d: d * 1.25, y: -h * 0.24, count: 3, taper: 0.04, trim: 'plateLo' });
    b.slab('copper', w * 1.28, h * 0.08, d * 1.28, [0, -h * 0.64, 0], { ch: h * 0.02 });
    b.slab('plate', w * 1.16, h * 0.48, d * 0.92, [0, h * 0.24, 0], { ch: h * 0.04 });
    b.slab('jade', w * 0.32, h * 0.28, d * 0.14, [0, h * 0.46, d * 0.60], { ch: h * 0.03 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);
  b.slab('cloth', w * 0.48, h * 0.44, d * 0.78, [0, h * 0.62, 0], { ch: h * 0.08 });
  b.slab('copper', w * 0.52, h * 0.08, d * 0.82, [0, h * 0.54, 0], { ch: h * 0.02 });
  b.cover('plate', w, h, d, 1.24, 1.06, 1.26, [0, 0, 0]);

  b.both((sx) => {
    b.slab('plateHi', w * 0.52, h * 0.38, d * 1.30, [sx * w * 0.58, h * 0.42, 0], { ch: h * 0.06 });
    b.slab('copper', w * 0.14, h * 0.42, d * 1.32, [sx * w * 0.78, h * 0.44, 0], { ch: h * 0.03 });
    b.slab('jade', w * 0.24, h * 0.22, d * 0.15, [sx * w * 0.58, h * 0.48, d * 0.60], { ch: h * 0.03 });
  });

  b.slab('copper', w * 0.42, h * 0.42, d * 0.18, [0, h * 0.15, d * 0.64], { ch: h * 0.04 });
  b.slab('jade', w * 0.24, h * 0.24, d * 0.12, [0, h * 0.15, d * 0.72], { ch: h * 0.03 });
  b.slab('glow', w * 0.10, h * 0.10, d * 0.08, [0, h * 0.15, d * 0.78], { ch: h * 0.02 });

  const sy = -h * 0.82;
  b.slab('leather', w * 1.18, h * 0.16, d * 1.22, [0, -h * 0.46, 0], { ch: h * 0.02 });
  b.slab('copper', w * 0.32, h * 0.20, d * 0.14, [0, -h * 0.46, d * 0.63], { ch: h * 0.02 });

  b.slab('cloth', w * 0.78, h * 0.54, d * 0.12, [0, sy - h * 0.05, d * 0.60], { ch: h * 0.03 });
  b.slab('plate', w * 0.56, h * 0.40, d * 0.14, [0, sy, d * 0.62], { ch: h * 0.03 });
  b.slab('copper', w * 0.12, h * 0.42, d * 0.15, [0, sy, d * 0.68], { ch: h * 0.02 });
  b.slab('cloth', w * 0.96, h * 0.64, d * 0.12, [0, sy - h * 0.08, -d * 0.60], { ch: h * 0.03 });

  return b.build();
}

// 3. QUẦN (Legs) — Đùi (thigh) & Cẳng chân (shin)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));
  if (slot === 'shin') {
    b.cover('cloth', w, h, d, 1.08, 1.02, 1.16, [0, h * 0.10, 0]);
    b.bandStack('plate', { w: w * 1.22, h: h * 0.80, d: d * 1.25, y: -h * 0.1, count: 3, taper: 0.03, trim: 'plateLo' });
    b.slab('copper', w * 0.36, h * 0.36, d * 0.16, [0, h * 0.25, d * 0.62], { ch: h * 0.03 });
    b.slab('jade', w * 0.20, h * 0.20, d * 0.12, [0, h * 0.25, d * 0.68], { ch: h * 0.02 });
    return b.build();
  }
  // đùi (thigh / default)
  b.cover('cloth', w, h, d, 1.08, 1.04, 1.18, [0, 0, 0]);
  b.slab('copper', w * 1.20, h * 0.14, d * 1.22, [0, h * 0.36, 0], { ch: h * 0.02 });
  b.slab('plate', w * 0.48, h * 0.34, d * 0.18, [0, -h * 0.22, d * 0.60], { ch: h * 0.04 });
  b.slab('jade', w * 0.24, h * 0.22, d * 0.12, [0, -h * 0.22, d * 0.68], { ch: h * 0.03 });
  return b.build();
}

// 4. GIÀY (Feet) — Bàn chân / Ủng riêng
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('plate', w, h, d, 1.20, 1.45, 1.50, [0, h * 0.22, d * 0.12]);
  b.slab('copper', w * 0.48, h * 0.16, d * 0.42, [0, h * 0.18, d * 0.66], { ch: h * 0.02 });
  b.slab('glow', w * 0.14, h * 0.12, d * 0.10, [0, h * 0.18, d * 0.78], { ch: h * 0.02 });
  b.cover('plateLo', w, h, d, 1.22, 0.66, 1.52, [0, -h * 0.52, d * 0.10]);
  return b.build();
}

export const BLACK_TORTOISE = { head, body, legs, feet };

```
