# Bộ Giáp Quang Kim (Radianium Set)

Bộ giáp Grade 6 chính thức theo "Bảng dựng 13 bộ giáp" — DÙNG CHUNG cả 3 lớp.
- **Chất liệu**: Vàng hổ phách (`amberGold`), bạch kim Thái Dương Kim (`aurinHi`), lụa thánh trắng kem (`holySilk`), bọc lót xám tối (`innerSuit`), lõi Hổ Phách Khúc Xạ (`sunGlow`).
- **Phong cách**: Kỹ thuật tạo hình Trim-layering (§14) — Vùng Vịnh Biển Hổ Phách & Hệ Thánh Quang rực rỡ, trang nghiêm.
- **Điểm nhấn**: Mũ visor hổ phách kết hợp vương miện Thái Dương Kim, cầu vai cánh mặt trời, HÀO QUANG VÒNG sau lưng (Divine Sun Ring), tà lụa thánh rủ dọc đùi.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// GRADE 6 — GIÁP QUANG KIM (Radianium) — Vùng Vịnh Biển Hổ Phách & Hệ Thánh Quang.
// 2026-09-10: bộ CHÍNH THỨC theo "Bảng dựng 13 bộ" — DÙNG CHUNG cả 3 lớp (LL-AR-001 §3.5c).
// Chất liệu: vàng hổ phách + bạch kim Thái Dương Kim + lụa thánh + lõi hổ phách khúc xạ phát sáng.
// Chi tiết: mũ visor hổ phách + crown vương miện, cầu vai cánh mặt trời, HÀO QUANG VÒNG sau lưng,
// tà lụa thánh rủ.
// ═══════════════════════════════════════════════════════════════════════════

// Bảng vật liệu Giáp Quang Kim (Radianium)
const M = (pal) => ({
  amberGold:  { color: 0xd97706, metalness: 0.95, roughness: 0.18 }, // Vàng hổ phách nhựa cây cổ đại
  aurinHi:    { color: 0xfef08a, metalness: 0.98, roughness: 0.08 }, // Bạch kim Thái Dương Kim bắt sáng
  holySilk:   { color: 0xfffbe1, metalness: 0.10, roughness: 0.85 }, // Lụa thánh trắng kem
  innerSuit:  { color: 0x1f1910, metalness: 0.15, roughness: 0.88 }, // Bọc lót nâu xám tối chống hở da
  sunGlow:    { color: 0xfacc15, metalness: 0.10, roughness: 0.10, emissive: 0xeab308, emissiveIntensity: 1.0 }, // Lõi Hổ Phách Khúc Xạ
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. MŨ QUANG KIM (Head) - Visor Hổ Phách + Crown Vầng Thánh Quang
// ─────────────────────────────────────────────────────────────────────────────
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // Lót tối bọc kín cổ
  b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.10, [0, h * 0.04, 0]);

  // Mũ trùm giáp vàng hổ phách
  b.cover('amberGold', w, h, d, 1.14, 1.06, 1.14, [0, h * 0.04, 0]);

  // Nẹp trán Crown vương miện Thái Dương Kim vát 45°
  b.slab('aurinHi', w * 1.16, h * 0.12, d * 0.18, [0, h * 0.40, d * 0.56], { ch: h * 0.03 });

  // Visor kính hổ phách phát sáng rực rỡ
  b.slab('sunGlow', w * 0.60, h * 0.10, d * 0.06, [0, h * 0.18, d * 0.58], { ch: 0 });

  // Nẹp cằm & Gáy sau
  b.slab('amberGold', w * 0.88, h * 0.28, d * 0.12, [0, -h * 0.35, d * 0.52], { ch: 0 });
  b.slab('amberGold', w * 0.88, h * 0.25, d * 0.08, [0, -h * 0.25, -d * 0.54], { ch: 0 });

  return b.build();
}

// Helper cẳng tay: Bọc nẹp Thái Dương Kim.
// Phủ kín ống cẳng tay + BAO BÀN TAY riêng (khử hở da khuỷu/bàn tay — kỹ thuật như cryoFrostgold).
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('innerSuit', w, h, d, 1.14, 1.15, 1.14, [0, h * 0.05, 0]);   // lót phủ kín (ky>1 trùm khuỷu)
  b.cover('amberGold', w, h, d, 1.16, 1.15, 1.16, [0, h * 0.08, 0]);   // ống cẳng tay vàng hổ phách
  b.cover('amberGold', w, h, d, 1.26, 0.66, 1.32, [0, -h * 0.58, 0]);  // bao BÀN TAY (thấp/rộng, khử hở)
  b.slab('aurinHi', w * 1.3, h * 0.28, d * 0.55, [0, -h * 0.52, d * 0.46], { ch: h * 0.05 }); // giáp mu bàn tay nhô trước

  // Nẹp cẳng tay dán lõi hổ phách phát sáng
  b.slab('aurinHi', w * 0.28, h * 0.65, d * 0.08, [0, 0, d * 0.60], { ch: h * 0.03 });
  b.slab('sunGlow', w * 0.10, h * 0.55, d * 0.09, [0, 0, d * 0.62], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ÁO GIÁP QUANG KIM (Body) - HÀO QUANG VÒNG MẶT TRỜI SAU LƯNG
// ─────────────────────────────────────────────────────────────────────────────
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('innerSuit', w, h, d, 1.10, 1.02, 1.10, [0, 0, 0]);
    b.cover('amberGold', w, h, d, 1.15, 0.92, 1.15, [0, -h * 0.04, 0]);
    b.slab('aurinHi', w * 1.18, h * 0.08, d * 1.18, [0, h * 0.35, 0], { ch: 0 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);
  const fz = d * 0.58;

  // Lót giáp bọc kín không lộ da
  b.cover('innerSuit', w, h, d, 1.18, 1.12, 1.20, [0, -h * 0.05, 0]);
  b.cover('amberGold', w, h, d, 1.22, 1.04, 1.24, [0, 0, 0]);

  // CẦU VAI CÁNH MẶT TRỜI (Pauldrons)
  b.both((sx) => {
    b.slab('aurinHi', w * 0.55, h * 0.28, d * 1.28, [sx * w * 0.62, h * 0.44, 0], { ch: h * 0.05 });
    b.slab('sunGlow', w * 0.12, h * 0.20, d * 1.30, [sx * w * 0.80, h * 0.48, 0], { ch: 0 });
  });

  // TẤM GIÁP NGỰC TRƯỚC - LÕI KHÚC XẠ THỜI GIAN HỔ PHÁCH
  b.slab('aurinHi', w * 0.82, h * 0.42, d * 0.08, [0, h * 0.10, fz + 0.01], { ch: h * 0.03 });
  b.slab('sunGlow', w * 0.35, h * 0.25, d * 0.04, [0, h * 0.10, fz + 0.05], { ch: 0 });

  // 🌟 HÀO QUANG VÒNG SAU LƯNG (Divine Sun Ring)
  const haloZ = -fz - 0.12;
  b.both((sx) => {
    b.slab('sunGlow', w * 0.15, h * 0.85, d * 0.04, [sx * w * 0.45, h * 0.25, haloZ], { ch: 0, rot: [0, 0, sx * -0.35] });
    b.slab('aurinHi', w * 0.10, h * 0.75, d * 0.06, [sx * w * 0.45, h * 0.25, haloZ - 0.01], { ch: 0, rot: [0, 0, sx * -0.35] });
  });
  b.slab('sunGlow', w * 0.90, h * 0.12, d * 0.04, [0, h * 0.65, haloZ], { ch: 0 });

  // ĐAI THẮT LƯNG VÀNG & TÀ LỤA THÁNH VẬN
  b.slab('aurinHi', w * 1.25, h * 0.14, d * 1.28, [0, -h * 0.44, 0], { ch: 0 });
  b.slab('holySilk', w * 0.38, h * 0.85, d * 0.06, [0, -h * 0.85, fz + 0.02], { ch: 0 });
  b.slab('sunGlow', w * 0.12, h * 0.65, d * 0.04, [0, -h * 0.85, fz + 0.06], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUẦN QUANG KIM (Legs)
// ─────────────────────────────────────────────────────────────────────────────
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.12, [0, 0, 0]);
    b.cover('amberGold', w, h, d, 1.14, 0.92, 1.16, [0, 0, 0]);
    b.slab('aurinHi', w * 0.40, h * 0.30, d * 0.08, [0, h * 0.22, d * 0.59], { ch: 0 });
    b.slab('sunGlow', w * 0.15, h * 0.20, d * 0.08, [0, h * 0.22, d * 0.62], { ch: 0 });
    return b.build();
  }

  b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.12, [0, 0, 0]);
  b.cover('amberGold', w, h, d, 1.14, 0.95, 1.16, [0, 0, 0]);
  b.slab('aurinHi', w * 0.42, h * 0.35, d * 0.08, [0, 0, d * 0.59], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GIÀY QUANG KIM (Feet)
// ─────────────────────────────────────────────────────────────────────────────
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('innerSuit', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);
  b.cover('amberGold', w, h, d, 1.16, 1.35, 1.42, [0, h * 0.18, d * 0.08]);
  b.slab('aurinHi', w * 0.44, h * 0.14, d * 0.38, [0, h * 0.15, d * 0.60], { ch: 0 });
  return b.build();
}

export const RADIANIUM_ARMOR = { head, body, legs, feet };
```
