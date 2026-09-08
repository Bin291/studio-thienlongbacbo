# Bộ Giáp Titanium Blade (Đông Phương Sát Thủ Set)

Bộ giáp titan Grade 3 theo chuẩn Armor-Roadmap 3.0 (Dùng chung cho cả 3 lớp).
- **Chất liệu**: Thép Titan đen mờ, viền đồng hun chạm khắc cổ, lụa đỏ rực rủ đai, mắt thú đỏ phát sáng.
- **Điểm nhấn**: Nón lá thép chỏm nhọn, cầu vai giáp thú 2 đầu gai nhọn, đai vải lụa đỏ rủ dài trước đùi.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// GRADE 3 — TITANIUM BLADE (Đông Phương Sát Thủ Set) — Titan.
// 2026-09-08: bộ CHÍNH THỨC theo Armor-Roadmap 3.0 — DÙNG CHUNG cho cả 3 lớp (xem LL-AR-001 §3.5c).
// Mũ nón lá thép chỏm nhọn, cầu vai giáp thú 2 đầu gai nhọn, đai vải đỏ thẫm rủ hông.
// ═══════════════════════════════════════════════════════════════════════════

const M = (pal) => ({
  titanPlate: { color: 0x242830, metalness: 0.88, roughness: 0.28 }, // Thép Titan đen mờ
  titanHi:    { color: 0x64748b, metalness: 0.95, roughness: 0.18 }, // Viền kim loại xước bắt sáng
  bronzeTrim: { color: 0xb8860b, metalness: 0.90, roughness: 0.25 }, // Đồng hun chạm khắc cổ
  redCloth:   { color: 0x991b1b, metalness: 0.05, roughness: 0.85 }, // Vải lụa đỏ rực rủ đai
  innerSuit:  { color: 0x0f1115, metalness: 0.05, roughness: 0.92 }, // Vải lót đen mun
  glowRed:    { color: 0xef4444, metalness: 0.10, roughness: 0.20, emissive: 0xb91c1c, emissiveIntensity: 0.85 }, // Lõi mắt thú phát sáng
});

// 1. MŨ NÓN LÁ TITAN (Head) — Nón lá kim loại có chỏm cao
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // Mũ trùm nền đen bọc kín đầu
  b.cover('innerSuit', w, h, d, 1.12, 1.05, 1.12, [0, h * 0.04, 0]);

  // Vành nón lá kim loại xòe rộng
  b.slab('titanPlate', w * 2.20, h * 0.12, d * 2.20, [0, h * 0.35, 0], { ch: h * 0.08 });
  b.slab('bronzeTrim', w * 2.24, h * 0.04, d * 2.24, [0, h * 0.31, 0], { ch: 0 });

  // Chỏm nón lá vát nhọn vươn cao
  b.slab('titanHi', w * 0.45, h * 0.35, d * 0.45, [0, h * 0.55, 0], { ch: h * 0.06 });
  b.slab('bronzeTrim', w * 0.18, h * 0.30, d * 0.18, [0, h * 0.82, 0], { ch: 0 });

  // Khăn che cằm & nẹp mặt nạ
  b.slab('titanPlate', w * 0.85, h * 0.30, d * 0.15, [0, -h * 0.35, d * 0.52], { ch: 0 });

  return b.build();
}

// Helper cẳng tay: găng tay giáp nẹp đồng quấn dây đỏ
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('innerSuit', w, h, d, 1.10, 1.02, 1.10, [0, 0, 0]);
  b.cover('titanPlate', w, h, d, 1.15, 0.85, 1.15, [0, -h * 0.02, 0]);

  // Tấm nẹp cẳng tay chạm hoa văn đồng
  b.slab('bronzeTrim', w * 0.30, h * 0.65, d * 0.12, [0, 0, d * 0.60], { ch: h * 0.03 });
  b.slab('redCloth', w * 1.18, h * 0.08, d * 1.18, [0, h * 0.25, 0], { ch: 0 });
  b.slab('redCloth', w * 1.18, h * 0.08, d * 1.18, [0, -h * 0.25, 0], { ch: 0 });

  return b.build();
}

// 2. ÁO GIÁP TITANIUM (Body) — Cầu vai 2 đầu giáp thú + Đai lụa đỏ
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('innerSuit', w, h, d, 1.10, 1.02, 1.10, [0, 0, 0]);
    b.cover('titanPlate', w, h, d, 1.15, 0.92, 1.15, [0, -h * 0.04, 0]);
    b.slab('redCloth', w * 1.18, h * 0.10, d * 1.18, [0, -h * 0.35, 0], { ch: 0 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);
  const fz = d * 0.58;

  // Lót giáp đen bọc kín chống hở da
  b.cover('innerSuit', w, h, d, 1.18, 1.12, 1.20, [0, -h * 0.05, 0]);
  b.cover('titanPlate', w, h, d, 1.22, 1.04, 1.24, [0, 0, 0]);

  // CẦU VAI GIÁP THÚ 2 ĐẦU GỜ NỔI (Monster Skull Pauldrons)
  b.both((sx) => {
    // Khối giáp vai chính
    b.slab('titanHi', w * 0.58, h * 0.32, d * 1.28, [sx * w * 0.62, h * 0.44, 0], { ch: h * 0.06 });
    // Đầu thú 1 (gai ngoài)
    b.slab('bronzeTrim', w * 0.25, h * 0.28, d * 0.30, [sx * w * 0.85, h * 0.52, d * 0.30], { ch: h * 0.04 });
    // Đầu thú 2 (gai trong)
    b.slab('bronzeTrim', w * 0.25, h * 0.28, d * 0.30, [sx * w * 0.85, h * 0.52, -d * 0.30], { ch: h * 0.04 });
    // Mắt đỏ phát sáng trên đầu thú
    b.slab('glowRed', w * 0.10, h * 0.10, d * 0.10, [sx * w * 0.92, h * 0.55, d * 0.30], { ch: 0 });
    b.slab('glowRed', w * 0.10, h * 0.10, d * 0.10, [sx * w * 0.92, h * 0.55, -d * 0.30], { ch: 0 });
  });

  // Tấm ngực chạm rồng / hoa văn đồng
  b.slab('bronzeTrim', w * 0.78, h * 0.42, d * 0.10, [0, h * 0.10, fz + 0.02], { ch: h * 0.04 });
  b.slab('titanHi', w * 0.40, h * 0.25, d * 0.06, [0, h * 0.10, fz + 0.08], { ch: 0 });

  // ĐAI VẢI LỤA ĐỎ THẮT LƯNG RỦ DẢI GIỮA
  b.slab('redCloth', w * 1.26, h * 0.18, d * 1.28, [0, -h * 0.44, 0], { ch: 0 });
  b.slab('bronzeTrim', w * 0.30, h * 0.22, d * 0.12, [0, -h * 0.44, fz + 0.05], { ch: 0 });

  // Dải lụa đỏ rủ dài xuống đùi
  b.slab('redCloth', w * 0.32, h * 0.80, d * 0.06, [0, -h * 0.85, fz + 0.03], { ch: 0 });

  return b.build();
}

// 3. QUẦN TITANIUM (Legs) — Giáp đùi xếp lớp kiểu Đông Phương
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.12, [0, 0, 0]);
    b.cover('titanPlate', w, h, d, 1.14, 0.92, 1.16, [0, 0, 0]);
    b.slab('bronzeTrim', w * 0.38, h * 0.28, d * 0.10, [0, h * 0.22, d * 0.60], { ch: 0 });
    b.slab('redCloth', w * 1.16, h * 0.06, d * 1.18, [0, h * 0.40, 0], { ch: 0 });
    return b.build();
  }

  // Đùi
  b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.12, [0, 0, 0]);
  b.cover('titanPlate', w, h, d, 1.14, 0.95, 1.16, [0, 0, 0]);
  b.slab('bronzeTrim', w * 0.42, h * 0.35, d * 0.10, [0, 0, d * 0.60], { ch: 0 });

  return b.build();
}

// 4. GIÀY TITANIUM (Feet) — Ủng da đen bịt đồng cổ điển
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('innerSuit', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);
  b.slab('bronzeTrim', w * 0.42, h * 0.15, d * 0.38, [0, h * 0.15, d * 0.62], { ch: 0 });
  b.slab('redCloth', w * 1.16, h * 0.08, d * 1.18, [0, h * 0.35, 0], { ch: 0 });
  return b.build();
}

export const TITANIUM_BLADE = { head, body, legs, feet };

```
