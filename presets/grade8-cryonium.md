# Bộ Giáp Hàn Kim (Cryonium Set)

Bộ giáp Grade 8 chính thức theo "Bảng dựng 13 bộ giáp" — DÙNG CHUNG cả 3 lớp.
- **Chất liệu**: Thép Băng Tinh Kim xanh lam (`cryoSteel`), bạch kim tuyết phản quang (`cryoHi`), lõi xanh ngọc phát sáng (`iceCyanGlow`), vải lót đêm băng giá (`frostCloth`), khối gai pha lê băng nhọn (`crystalIce`).
- **Phong cách**: Kỹ thuật tạo hình Trim-layering (§14) — Vùng Băng Xanh Ngọc hùng vĩ, sắc lạnh, băng giá vĩnh cửu.
- **Điểm nhấn**: Mũ chỏm cột băng nhọn đâm thẳng lên trời cùng visor xanh ngọc lóa mắt, cầu vai tạo hình cột băng nhọn Crystal Ice Spikes, gai băng nhọn ở khuỷu tay và đầu gối, ngực đính lõi khúc xạ băng giá.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// GRADE 8 — GIÁP HÀN KIM (Cryonium) — Vùng Băng Xanh Ngọc.
// 2026-09-10: bộ CHÍNH THỨC theo "Bảng dựng 13 bộ" — DÙNG CHUNG cả 3 lớp (LL-AR-001 §3.5c).
// Chất liệu: Thép Băng Tinh Kim xanh lam + bạch kim tuyết phản quang + lõi xanh ngọc phát sáng.
// Chi tiết: mũ chỏm cột băng nhọn + visor xanh ngọc, cầu vai gai băng vươn cao, ngực lõi khúc xạ,
// gai băng đầu gối/khuỷu tay.
// ═══════════════════════════════════════════════════════════════════════════

// Bảng vật liệu Hàn Kim / Cryonium (Grade 8 - Vùng Băng Xanh Ngọc)
const M = (pal) => ({
  cryoSteel:  { color: 0x0284c7, metalness: 0.90, roughness: 0.18 }, // Thép Băng Tinh Kim xanh lam
  cryoHi:     { color: 0xbae6fd, metalness: 0.98, roughness: 0.05 }, // Bạch kim tuyết phản quang lấp lánh
  iceCyanGlow:{ color: 0x22d3ee, metalness: 0.10, roughness: 0.10, emissive: 0x06b6d4, emissiveIntensity: 1.0 }, // Lõi xanh ngọc phát sáng lóa mắt
  frostCloth: { color: 0x0f172a, metalness: 0.05, roughness: 0.95 }, // Vải lót đêm băng giá bọc kín
  crystalIce: { color: 0xe0f2fe, metalness: 0.85, roughness: 0.10 }, // Khối gai pha lê băng nhọn
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. MŨ HÀN KIM (Head) - Chỏm Cột Băng Nhọn & Visor Xanh Ngọc Lóa Mắt
// ─────────────────────────────────────────────────────────────────────────────
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // Vải lót tối bọc kín đầu & cổ
  b.cover('frostCloth', w, h, d, 1.10, 1.05, 1.10, [0, h * 0.04, 0]);

  // Mũ trùm chính Băng Tinh Kim
  b.cover('cryoSteel', w, h, d, 1.14, 1.05, 1.14, [0, h * 0.04, 0]);

  // Crown cột băng nhọn đâm vươn thẳng lên trời
  b.slab('crystalIce', w * 0.35, h * 0.25, d * 0.25, [0, h * 0.58, 0], { ch: h * 0.08 });
  b.slab('cryoHi', w * 1.16, h * 0.08, d * 0.18, [0, h * 0.40, d * 0.56], { ch: h * 0.02 });

  // Visor xanh ngọc lóa mắt (Bão hạt băng)
  b.slab('iceCyanGlow', w * 0.60, h * 0.10, d * 0.06, [0, h * 0.18, d * 0.59], { ch: 0 });

  // Ốp cằm và gáy sau
  b.slab('cryoSteel', w * 0.85, h * 0.28, d * 0.12, [0, -h * 0.35, d * 0.52], { ch: 0 });
  b.slab('cryoSteel', w * 0.85, h * 0.25, d * 0.08, [0, -h * 0.25, -d * 0.54], { ch: 0 });

  return b.build();
}

// Helper cẳng tay: Gai băng mọc ở khuỷu tay.
// Phủ kín ống cẳng tay + BAO BÀN TAY riêng (khử hở da khuỷu/bàn tay — kỹ thuật như cryoFrostgold).
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('frostCloth', w, h, d, 1.14, 1.15, 1.14, [0, h * 0.05, 0]);   // lót phủ kín (ky>1 trùm khuỷu)
  b.cover('cryoSteel', w, h, d, 1.16, 1.15, 1.16, [0, h * 0.08, 0]);    // ống cẳng tay thép băng
  b.cover('cryoSteel', w, h, d, 1.26, 0.66, 1.32, [0, -h * 0.58, 0]);   // bao BÀN TAY (thấp/rộng, khử hở)
  b.slab('cryoHi', w * 1.3, h * 0.28, d * 0.55, [0, -h * 0.52, d * 0.46], { ch: h * 0.05 }); // giáp mu bàn tay nhô trước

  // Gai băng khuỷu tay nhọn vát 45°
  b.slab('crystalIce', w * 0.25, h * 0.40, d * 0.35, [0, h * 0.10, -d * 0.60], { ch: h * 0.05, rot: [0.3, 0, 0] });

  // Nẹp xanh ngọc bắt sáng cẳng tay
  b.slab('cryoHi', w * 0.28, h * 0.65, d * 0.08, [0, 0, d * 0.60], { ch: h * 0.03 });
  b.slab('iceCyanGlow', w * 0.10, h * 0.55, d * 0.09, [0, 0, d * 0.62], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ÁO GIÁP HÀN KIM (Body) - GAI BĂNG CẦU VAI + LÕI BĂNG KHÚC XẠ
// ─────────────────────────────────────────────────────────────────────────────
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('frostCloth', w, h, d, 1.10, 1.02, 1.10, [0, 0, 0]);
    b.cover('cryoSteel', w, h, d, 1.15, 0.92, 1.15, [0, -h * 0.04, 0]);
    b.slab('cryoHi', w * 1.18, h * 0.08, d * 1.18, [0, h * 0.35, 0], { ch: 0 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);
  const fz = d * 0.58;

  // Lót giáp đen bọc kín không hở da
  b.cover('frostCloth', w, h, d, 1.18, 1.12, 1.20, [0, -h * 0.05, 0]);
  b.cover('cryoSteel', w, h, d, 1.22, 1.04, 1.24, [0, 0, 0]);

  // CẦU VAI TẠO HÌNH CỘT BĂNG NHỌN MỌC VƯƠN CAO (Crystal Ice Spikes)
  b.both((sx) => {
    // Gai băng chính nhọn cao
    b.slab('crystalIce', w * 0.32, h * 0.50, d * 0.45, [sx * w * 0.70, h * 0.55, 0], { ch: h * 0.06, rot: [0, 0, sx * -0.3] });
    // Tấm nẹp vai đỡ phía dưới
    b.slab('cryoHi', w * 0.55, h * 0.28, d * 1.28, [sx * w * 0.62, h * 0.42, 0], { ch: h * 0.05 });
    b.slab('iceCyanGlow', w * 0.12, h * 0.20, d * 1.30, [sx * w * 0.80, h * 0.46, 0], { ch: 0 });
  });

  // TẤM GIÁP NGỰC KHÚC XẠ BĂNG & LÕI XANH NGỌC
  b.slab('cryoHi', w * 0.82, h * 0.42, d * 0.08, [0, h * 0.10, fz + 0.01], { ch: h * 0.03 });
  b.slab('iceCyanGlow', w * 0.30, h * 0.30, d * 0.05, [0, h * 0.10, fz + 0.04], { ch: 0 });

  // GIÁP SAU LƯNG (Mộc các chóp băng li ti)
  b.both((sx) => {
    b.slab('crystalIce', w * 0.18, h * 0.35, d * 0.18, [sx * w * 0.25, h * 0.15, -fz - 0.08], { ch: h * 0.04, rot: [-0.2, 0, sx * 0.2] });
  });

  // ĐAI THẮT LƯNG VÀNG BẠCH KIM & VẠT ÁO BĂNG TUYẾT RỦ
  b.slab('cryoHi', w * 1.25, h * 0.14, d * 1.28, [0, -h * 0.44, 0], { ch: 0 });
  b.both((sx) => {
    b.slab('cryoSteel', w * 0.38, h * 0.50, d * 0.06, [sx * w * 0.42, -h * 0.72, fz + 0.01], { ch: h * 0.03 });
    b.slab('iceCyanGlow', w * 0.10, h * 0.40, d * 0.04, [sx * w * 0.42, -h * 0.72, fz + 0.04], { ch: 0 });
  });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUẦN HÀN KIM (Legs) - Gai Băng Bảo Vệ Đầu Gối
// ─────────────────────────────────────────────────────────────────────────────
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('frostCloth', w, h, d, 1.10, 1.05, 1.12, [0, 0, 0]);
    b.cover('cryoSteel', w, h, d, 1.14, 0.92, 1.16, [0, 0, 0]);

    // Gai băng nhọn ở đầu gối
    b.slab('crystalIce', w * 0.30, h * 0.30, d * 0.25, [0, h * 0.22, d * 0.65], { ch: h * 0.04, rot: [0.2, 0, 0] });
    b.slab('cryoHi', w * 0.40, h * 0.30, d * 0.08, [0, h * 0.22, d * 0.59], { ch: 0 });
    b.slab('iceCyanGlow', w * 0.15, h * 0.20, d * 0.08, [0, h * 0.22, d * 0.62], { ch: 0 });
    return b.build();
  }

  // Đùi
  b.cover('frostCloth', w, h, d, 1.10, 1.05, 1.12, [0, 0, 0]);
  b.cover('cryoSteel', w, h, d, 1.14, 0.95, 1.16, [0, 0, 0]);
  b.slab('cryoHi', w * 0.42, h * 0.35, d * 0.08, [0, 0, d * 0.59], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GIÀY HÀN KIM (Feet)
// ─────────────────────────────────────────────────────────────────────────────
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('frostCloth', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);
  b.cover('cryoSteel', w, h, d, 1.16, 1.35, 1.42, [0, h * 0.18, d * 0.08]);
  b.slab('cryoHi', w * 0.44, h * 0.14, d * 0.38, [0, h * 0.15, d * 0.60], { ch: 0 });
  b.slab('iceCyanGlow', w * 0.12, h * 0.10, d * 0.10, [0, h * 0.15, d * 0.68], { ch: 0 });
  return b.build();
}

export const CRYONIUM_ARMOR = { head, body, legs, feet };
```
