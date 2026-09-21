# Bộ Giáp Vong Kim (Necronium Set)

Bộ giáp Grade 7 chính thức theo "Bảng dựng 13 bộ giáp" — DÙNG CHUNG cả 3 lớp.
- **Chất liệu**: Thép đục xám ma quái (`necroSteel`), viền thép bắt sáng (`necroHi`), vải thảm tảo xanh sẫm (`bioGreen`), đai da nâu đất cổ (`leatherDark`), vải lót đen mun (`innerSuit`), lân tinh xanh lục phát sáng (`necroGlow`).
- **Phong cách**: Kỹ thuật tạo hình Trim-layering (§14) — Chuẩn Vùng Xanh Lá Sinh Học, ma mị và bí hiểm.
- **Điểm nhấn**: Mũ trùm Hood hở mặt (lộ rõ mắt, mũi, miệng) viền lân tinh ngang trán, cầu vai nẹp vệt lân tinh, ngực xẻ dải lân tinh phát sáng, vạt áo tà nhọn và áo choàng rủ dài sau lưng.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// GRADE 7 — GIÁP VONG KIM (Necronium) — Chuẩn Vùng Xanh Lá Sinh Học.
// 2026-09-10: bộ CHÍNH THỨC theo "Bảng dựng 13 bộ" — DÙNG CHUNG cả 3 lớp (LL-AR-001 §3.5c).
// Phối màu vùng: tông xanh lá tảo đẫm sương, thép đen ma quái viền lân tinh xanh lục phát sáng.
// Chi tiết: mũ trùm Hood vát nhọn hở mặt, ngực nẹp lân tinh chạy dải dọc, đai lưng da vuông vắn,
// áo choàng tà nhọn rủ sau lưng.
// ═══════════════════════════════════════════════════════════════════════════

// Bảng vật liệu Vong Kim (Necronium - Vùng Xanh Lá Tảo Sinh Học)
const M = (pal) => ({
  necroSteel: { color: 0x222a35, metalness: 0.88, roughness: 0.30 }, // Thép đục xám ma quái
  necroHi:    { color: 0x64748b, metalness: 0.92, roughness: 0.20 }, // Viền nẹp thép bắt sáng
  bioGreen:   { color: 0x14301d, metalness: 0.10, roughness: 0.85 }, // Vải rêu / Thảm tảo xanh lá sẫm
  leatherDark:{ color: 0x3d2516, metalness: 0.20, roughness: 0.75 }, // Đai da nâu đất cổ
  innerSuit:  { color: 0x090f0c, metalness: 0.05, roughness: 0.95 }, // Vải lót đen mun bọc kín
  necroGlow:  { color: 0x22c55e, metalness: 0.10, roughness: 0.10, emissive: 0x15803d, emissiveIntensity: 1.0 }, // Lân tinh xanh lá ma quái
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. MŨ TRÙM HOÀN TOÀN HỞ MẶT (Open-Face Hood) - KHÔNG CHE MẶT
// ─────────────────────────────────────────────────────────────────────────────
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // Vải lót ôm sau đầu & gáy (không che mặt trước)
  b.slab('innerSuit', w * 0.98, h * 0.95, d * 0.55, [0, 0, -d * 0.28], { ch: 0 });

  // CHỎM MŨ TRÙM: đỉnh đầu + trán, đáy DỪNG TRÊN MẮT (~+0.12h) để chừa mặt; phủ luôn 2 bên trên.
  b.slab('bioGreen', w * 1.18, h * 0.42, d * 1.16, [0, h * 0.31, -d * 0.02], { ch: h * 0.05 });

  // GÁY SAU: phủ kín phía sau đầu xuống cổ (khử hở tóc/gáy).
  b.slab('bioGreen', w * 1.14, h * 0.95, d * 0.52, [0, -h * 0.02, -d * 0.34], { ch: h * 0.03 });

  // 2 MÁ BÊN: phủ tai/má hai bên, CHỪA mặt trước giữa (mắt/mũi/miệng lộ ra — đúng "hở mặt").
  b.both((sx) => {
    b.slab('bioGreen', w * 0.30, h * 0.92, d * 1.04, [sx * w * 0.52, -h * 0.04, 0], { ch: h * 0.03 });
  });

  // Vành lân tinh xanh chạy ngang trán ngay TRÊN mắt (viền ma quái, không che mặt).
  b.slab('necroGlow', w * 1.14, h * 0.05, d * 0.30, [0, h * 0.12, d * 0.44], { ch: 0 });

  // Khăn xếp quàng cổ
  b.slab('bioGreen', w * 1.22, h * 0.22, d * 1.22, [0, -h * 0.42, 0], { ch: 0 });

  return b.build();
}

// Helper cẳng tay: Găng tay giáp thép nẹp vệt lân tinh.
// Phủ kín ống cẳng tay + BAO BÀN TAY riêng (palm là mesh dưới forearm — cover thường không tới,
// phải wrap thêm khối thấp/rộng), khử hở da khuỷu/bàn tay (kỹ thuật như cryoFrostgold).
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('innerSuit', w, h, d, 1.14, 1.15, 1.14, [0, h * 0.05, 0]);   // lót phủ kín (ky>1 trùm khuỷu)
  b.cover('necroSteel', w, h, d, 1.16, 1.15, 1.16, [0, h * 0.08, 0]);  // ống cẳng tay thép
  b.cover('necroSteel', w, h, d, 1.26, 0.66, 1.32, [0, -h * 0.58, 0]); // bao BÀN TAY (thấp/rộng, khử hở)
  b.slab('necroHi', w * 1.3, h * 0.28, d * 0.55, [0, -h * 0.52, d * 0.46], { ch: h * 0.05 }); // giáp mu bàn tay nhô trước

  // Nẹp cẳng tay thép + Vệt lân tinh xanh phát sáng dọc tay
  b.slab('necroHi', w * 0.28, h * 0.65, d * 0.08, [0, 0, d * 0.60], { ch: h * 0.03 });
  b.slab('necroGlow', w * 0.10, h * 0.55, d * 0.09, [0, 0, d * 0.62], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ÁO GIÁP VONG KIM (Body) - Giáp Thép Nẹp Lân Tinh Xanh + Đai Da Nâu
// ─────────────────────────────────────────────────────────────────────────────
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('innerSuit', w, h, d, 1.10, 1.02, 1.10, [0, 0, 0]);
    b.cover('necroSteel', w, h, d, 1.15, 0.92, 1.15, [0, -h * 0.02, 0]);
    b.slab('leatherDark', w * 1.18, h * 0.08, d * 1.18, [0, -h * 0.35, 0], { ch: 0 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);
  const fz = d * 0.58;

  // Lót giáp bọc kín không lộ da
  b.cover('innerSuit', w, h, d, 1.18, 1.12, 1.20, [0, -h * 0.05, 0]);
  b.cover('necroSteel', w, h, d, 1.22, 1.04, 1.24, [0, 0, 0]);

  // CẦU VAI THÉP LẮP NẸP LÂN TINH XANH (Pauldrons)
  b.both((sx) => {
    b.slab('necroSteel', w * 0.55, h * 0.28, d * 1.28, [sx * w * 0.62, h * 0.44, 0], { ch: h * 0.04 });
    b.slab('necroHi', w * 0.42, h * 0.22, d * 1.24, [sx * w * 0.62, h * 0.46, 0], { ch: 0 });
    b.slab('necroGlow', w * 0.12, h * 0.18, d * 0.10, [sx * w * 0.82, h * 0.48, d * 0.30], { ch: 0 });
  });

  // TẤM GIÁP NGỰC THÉP + DẢI LÂN TINH PHÁT SÁNG DỌC NGỰC
  b.slab('necroHi', w * 0.82, h * 0.42, d * 0.08, [0, h * 0.10, fz + 0.01], { ch: h * 0.03 });
  b.slab('necroGlow', w * 0.28, h * 0.35, d * 0.04, [0, h * 0.10, fz + 0.04], { ch: 0 });

  // ĐAI THẮT LƯNG DA NÂU VUÔNG VẮN VÀ KHÓA THÉP
  b.slab('leatherDark', w * 1.26, h * 0.16, d * 1.28, [0, -h * 0.40, 0], { ch: 0 });
  b.slab('necroHi', w * 0.18, h * 0.18, d * 0.08, [0, -h * 0.40, fz + 0.05], { ch: 0 });

  // VẠT ÁO VẢI XANH TẢO XẺ TÀ NHỌN RỦ DƯỚI ĐÙI
  b.slab('bioGreen', w * 0.48, h * 0.55, d * 0.06, [0, -h * 0.75, fz + 0.02], { ch: h * 0.04 });
  b.slab('necroGlow', w * 0.10, h * 0.45, d * 0.04, [0, -h * 0.75, fz + 0.05], { ch: 0 }); // Viền lân tinh rủ dọc vạt áo

  // ÁO CHOÀNG RỦ DÀI SAU LƯNG (Cape)
  b.slab('bioGreen', w * 1.35, h * 1.25, d * 0.08, [0, -h * 0.35, -fz - 0.08], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUẦN VONG KIM (Legs)
// ─────────────────────────────────────────────────────────────────────────────
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.12, [0, 0, 0]);
    b.cover('necroSteel', w, h, d, 1.14, 0.92, 1.16, [0, 0, 0]);

    // Giáp bảo vệ đầu gối nẹp lân tinh
    b.slab('necroHi', w * 0.40, h * 0.32, d * 0.08, [0, h * 0.20, d * 0.59], { ch: h * 0.03 });
    b.slab('necroGlow', w * 0.12, h * 0.20, d * 0.08, [0, h * 0.20, d * 0.62], { ch: 0 });
    return b.build();
  }

  // Đùi (Vải xanh lá tảo bọc kín)
  b.cover('bioGreen', w, h, d, 1.12, 0.98, 1.14, [0, 0, 0]);
  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GIÀY VONG KIM (Feet)
// ─────────────────────────────────────────────────────────────────────────────
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('innerSuit', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);
  b.cover('leatherDark', w, h, d, 1.16, 1.35, 1.42, [0, h * 0.18, d * 0.08]);
  b.slab('necroSteel', w * 0.44, h * 0.14, d * 0.38, [0, h * 0.15, d * 0.60], { ch: 0 });
  b.slab('necroGlow', w * 0.10, h * 0.10, d * 0.10, [0, h * 0.15, d * 0.70], { ch: 0 });
  return b.build();
}

export const NECRONIUM_ARMOR = { head, body, legs, feet };
```
