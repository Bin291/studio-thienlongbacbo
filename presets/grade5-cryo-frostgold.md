# Bộ Giáp Hoàng Kim Bão Tuyết (Cryo Frostgold Set)

Bộ giáp Grade 5 chính thức theo "Bảng dựng 13 bộ giáp" — DÙNG CHUNG cả 3 lớp.
- **Chất liệu**: Bằng Tinh Kim (`cryoPlate`) bạc xám băng, nẹp Thái Dương Kim hoàng kim (`auriTrim`), viền băng bắt sáng (`cryoHi`), khung titan băng tối (`cryoDark`), lụa dạ đêm (`innerSuit`), lõi băng phát sáng (`frostGlow`).
- **Phong cách**: Kỹ thuật tạo hình Trim-layering (§14) — thanh thoát, bay nhảy nhưng sang trọng, nẹp vát 45° bắt sáng sắc nét.
- **Điểm nhấn**: Mũ visor băng giá đơn sắc, cầu vai lướt gió Winged Feather, giáp ngực đính lõi năng lượng băng, tà hông dáng bay nhảy.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// GRADE 5 — GIÁP HOÀNG KIM BÃO TUYẾT (Cryonium Frostgold) — Bạc Băng & Hoàng Kim.
// 2026-09-08: bộ CHÍNH THỨC theo "Bảng dựng 13 bộ" — DÙNG CHUNG cả 3 lớp (xem LL-AR-001 §3.5c).
// Chất liệu: Bằng Tinh Kim (Cryonium) phối Thái Dương Kim (Aurinium) + lụa tuyết tối.
// Triết lý: thanh thoát/bay nhảy nhưng sang trọng — nẹp vát 45° bắt sáng sắc nét, phom mảnh mai.
// Kỹ thuật (HUONG-DAN §14): nẹp mỏng d≈0.02 tách góc Z chống z-fighting; ~75 khối / ~4.5k tam giác.
// ═══════════════════════════════════════════════════════════════════════════

// Bảng vật liệu Bằng Tinh Kim (Cryonium) & Thái Dương Kim (Aurinium) - Grade 5
const M = (pal) => ({
  cryoPlate: { color: 0x94a3b8, metalness: 0.95, roughness: 0.15 }, // Bằng Tinh Kim bạc xám băng
  cryoHi:    { color: 0xe2e8f0, metalness: 0.98, roughness: 0.08 }, // Viền băng bắt sáng cực độ
  auriTrim:  { color: 0xf59e0b, metalness: 0.92, roughness: 0.20 }, // Nẹp Thái Dương Kim hoàng kim
  cryoDark:  { color: 0x334155, metalness: 0.85, roughness: 0.35 }, // Khung titan băng tối
  innerSuit: { color: 0x0f172a, metalness: 0.05, roughness: 0.92 }, // Vải lót dạ đêm
  frostGlow: { color: 0x38bdf8, metalness: 0.10, roughness: 0.10, emissive: 0x0284c7, emissiveIntensity: 0.90 }, // Lõi băng phát sáng
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. MŨ CRYO-FROSTGOLD (Head) - Vát cạnh thanh thoát + Visor Băng Giá
// ─────────────────────────────────────────────────────────────────────────────
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // Mũ trùm chính Bằng Tinh Kim
  b.cover('cryoPlate', w, h, d, 1.12, 1.05, 1.12, [0, h * 0.04, 0]);

  // Nẹp trán Hoàng Kim vát chéo
  b.slab('auriTrim', w * 1.14, h * 0.08, d * 0.15, [0, h * 0.40, d * 0.55], { ch: h * 0.02 });

  // Visor băng giá đơn sắc cực kỳ sắc nét
  b.slab('frostGlow', w * 0.55, h * 0.10, d * 0.06, [0, h * 0.18, d * 0.58], { ch: 0 });

  // Giáp che cằm & gáy sau
  b.slab('cryoDark', w * 0.85, h * 0.28, d * 0.12, [0, -h * 0.35, d * 0.52], { ch: 0 });
  b.slab('cryoDark', w * 0.85, h * 0.25, d * 0.08, [0, -h * 0.25, -d * 0.54], { ch: 0 });

  return b.build();
}

// Helper cẳng tay: Găng tay thanh thoát hỗ trợ linh hoạt
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  // Ống cẳng tay + BAO BÀN TAY riêng (palm là mesh dưới forearm, cover ky không với tới → phải wrap thêm).
  // kx/kz nới bù occlusion sArm=0.82.
  b.cover('innerSuit', w, h, d, 1.14, 1.15, 1.14, [0, h * 0.05, 0]);
  b.cover('cryoPlate', w, h, d, 1.16, 1.15, 1.16, [0, h * 0.08, 0]);   // ống cẳng tay
  b.cover('cryoPlate', w, h, d, 1.26, 0.66, 1.32, [0, -h * 0.58, 0]);  // bao BÀN TAY (to/thấp, khử hở da khi vung)
  b.slab('cryoHi', w * 1.3, h * 0.28, d * 0.55, [0, -h * 0.52, d * 0.46], { ch: h * 0.05 }); // giáp mu bàn tay nhô trước
  b.slab('auriTrim', w * 1.24, h * 0.06, d * 1.3, [0, -h * 0.82, 0], { ch: 0 }); // viền vàng đầu bàn tay

  // Nẹp Bằng Tinh Kim viền Hoàng Kim mỏng nhẹ
  b.slab('auriTrim', w * 0.25, h * 0.60, d * 0.08, [0, 0, d * 0.62], { ch: h * 0.03 });
  b.slab('cryoHi', w * 0.15, h * 0.50, d * 0.09, [0, 0, d * 0.64], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ÁO GIÁP CRYO-FROSTGOLD (Body) - Cầu vai lướt gió + Ngực đa tầng thanh lịch
// ─────────────────────────────────────────────────────────────────────────────
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('innerSuit', w, h, d, 1.12, 1.15, 1.12, [0, 0, 0]);   // ky>1 phủ kín bắp tay (khử hở vai)
    b.cover('cryoPlate', w, h, d, 1.16, 1.05, 1.16, [0, 0, 0]);
    b.slab('auriTrim', w * 1.18, h * 0.08, d * 1.18, [0, h * 0.35, 0], { ch: 0 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);
  const fz = d * 0.58;

  // Khung lót tối bọc kín
  b.cover('innerSuit', w, h, d, 1.18, 1.12, 1.20, [0, -h * 0.05, 0]);
  b.cover('cryoPlate', w, h, d, 1.22, 1.04, 1.24, [0, 0, 0]);

  // CẦU VAI TẠO DÁNG LƯỚT GIÓ (Winged Feather Pauldrons)
  b.both((sx) => {
    b.slab('cryoHi', w * 0.52, h * 0.25, d * 1.26, [sx * w * 0.60, h * 0.44, 0], { ch: h * 0.05 });
    b.slab('auriTrim', w * 0.18, h * 0.20, d * 1.28, [sx * w * 0.78, h * 0.48, 0], { ch: 0 });
  });

  // TẤM GIÁP NGỰC BẰNG TINH KIM NẸP HOÀNG KIM
  b.slab('auriTrim', w * 0.80, h * 0.40, d * 0.08, [0, h * 0.10, fz + 0.01], { ch: h * 0.03 });
  b.slab('cryoHi', w * 0.70, h * 0.34, d * 0.08, [0, h * 0.10, fz + 0.04], { ch: 0 });
  b.slab('frostGlow', w * 0.16, h * 0.16, d * 0.04, [0, h * 0.10, fz + 0.08], { ch: 0 }); // Lõi năng lượng băng thanh thoát

  // GIÁP LƯNG SAU (Back Armor Plate)
  b.slab('cryoDark', w * 0.78, h * 0.42, d * 0.08, [0, h * 0.08, -fz - 0.01], { ch: h * 0.03 });
  b.slab('auriTrim', w * 0.14, h * 0.55, d * 0.06, [0, h * 0.05, -fz - 0.06], { ch: 0 });

  // ĐAI THẮT LƯNG VÒNG TRÒN 360 ĐỘ
  b.slab('auriTrim', w * 1.24, h * 0.14, d * 1.26, [0, -h * 0.44, 0], { ch: 0 });

  // TÀ HÔNG DÁNG BAY NHẢY
  b.both((sx) => {
    b.slab('auriTrim', w * 0.35, h * 0.40, d * 0.08, [sx * w * 0.45, -h * 0.68, fz + 0.01], { ch: h * 0.02 });
    b.slab('cryoPlate', w * 0.28, h * 0.32, d * 0.08, [sx * w * 0.45, -h * 0.68, fz + 0.04], { ch: 0 });
  });

  // PHỦ HÔNG/ĐŨNG (khử hở shorts/da giữa Áo giáp và Quần) — nới bù occlusion sTorso=0.92.
  b.slab('cryoPlate', w * 1.2, h * 0.5, d * 1.22, [0, -h * 0.82, 0], { ch: h * 0.05 });
  for (const sz of [1, -1]) b.slab('cryoPlate', w * 0.55, h * 0.34, d * 0.16, [0, -h * 1.02, sz * fz * 0.55], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUẦN CRYO-FROSTGOLD (Legs) - Linh hoạt, gọn nhẹ
// ─────────────────────────────────────────────────────────────────────────────
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('innerSuit', w, h, d, 1.10, 1.06, 1.12, [0, 0, 0]);
    b.cover('cryoPlate', w, h, d, 1.14, 1.04, 1.16, [0, 0, 0]);   // ky>1 để chồng khớp gối (khử hở)

    // Nẹp cẳng chân trước
    b.slab('auriTrim', w * 0.38, h * 0.28, d * 0.08, [0, h * 0.22, d * 0.59], { ch: 0 });
    b.slab('cryoHi', w * 0.30, h * 0.22, d * 0.08, [0, h * 0.22, d * 0.62], { ch: 0 });
    return b.build();
  }

  // Đùi
  b.cover('innerSuit', w, h, d, 1.10, 1.06, 1.12, [0, 0, 0]);
  b.cover('cryoPlate', w, h, d, 1.14, 1.05, 1.16, [0, 0, 0]);     // ky>1 để chồng khớp gối + đũng (khử hở)
  b.slab('auriTrim', w * 0.40, h * 0.32, d * 0.08, [0, 0, d * 0.59], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GIÀY CRYO-FROSTGOLD (Feet) - Ủng nhẹ hỗ trợ bay nhảy
// ─────────────────────────────────────────────────────────────────────────────
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('innerSuit', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);
  b.cover('cryoPlate', w, h, d, 1.16, 1.35, 1.42, [0, h * 0.18, d * 0.08]);
  b.slab('auriTrim', w * 0.42, h * 0.14, d * 0.38, [0, h * 0.15, d * 0.60], { ch: 0 });
  return b.build();
}

export const CRYO_FROSTGOLD = { head, body, legs, feet };
```
