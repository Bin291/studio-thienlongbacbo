# Bộ Giáp Hiệp Sĩ Bạch Kim (Warrior Royal Set)

Bộ giáp thử nghiệm phá khung Silhouette lớn phong cách Hiệp Sĩ Hoàng Gia.
- **Chất liệu**: Giáp nền trắng-ngà, viền vàng kim to bản, lông thú trắng phồng lớn, áo choàng sau lưng.
- **Điểm nhấn**: Cầu vai vòm cầu b.sphere mượt mà cong 97 độ, cổ lông thú mantle liền khối, T-visor đen và khe mắt đỏ glow.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).

```javascript
// Sẵn có hàm piece() từ armorKit
function sigilWarrior(b, g, gd, x, y, z, s, t) {
  b.slab(g, s * 0.86, s * 0.78, t, [x, y + s * 0.08, z], { ch: s * 0.22 });
  b.slab(g, s * 0.46, s * 0.46, t, [x, y - s * 0.4, z], { rot: [0, 0, Math.PI / 4], ch: s * 0.06 });
  b.slab(gd, s * 0.5, s * 0.14, t * 0.9, [x - s * 0.15, y + s * 0.12, z + t * 0.55], { rot: [0, 0, 0.62], ch: s * 0.03 });
  b.slab(gd, s * 0.5, s * 0.14, t * 0.9, [x + s * 0.15, y + s * 0.12, z + t * 0.55], { rot: [0, 0, -0.62], ch: s * 0.03 });
  b.slab(gd, s * 0.5, s * 0.14, t * 0.9, [x - s * 0.15, y - s * 0.14, z + t * 0.55], { rot: [0, 0, 0.62], ch: s * 0.03 });
  b.slab(gd, s * 0.5, s * 0.14, t * 0.9, [x + s * 0.15, y - s * 0.14, z + t * 0.55], { rot: [0, 0, -0.62], ch: s * 0.03 });
}
function attachSigil(b, classKey, g, gd, x, y, z, s, t) {
  sigilWarrior(b, g, gd, x, y, z, s, t);
}

// ═══════════════════════════════════════════════════════════════════════════
// WARRIOR "Hiệp Sĩ Bạch Kim" — PROTOTYPE PHÁ KHUNG (2026-09-07).
// Lấy mẫu từ ảnh tham chiếu lead gửi: giáp trắng-ngà + viền VÀNG KIM to bản + PAULDRON LÔNG THÚ trắng
// phồng lớn ở vai + áo choàng sau lưng + tà giáp dài trước. CHỦ ĐÍCH: im lặng bằng SILHOUETTE LỚN,
// KHÔNG chạm khắc chi tiết nhỏ (khác hẳn phong cách "khắc-tấm-mảnh" của 3 bộ base0/rarity cũ).
// Luật vẫn giữ: KHÔNG xuyên khối (mane/cape/tà đã canh khoảng hở với khớp tay/chân khi vung/bước).
// Luật NỚI: chấp nhận hở da nhỏ ở khe khớp — không cần LEAK=0 tuyệt đối như trước.
// Đây là bộ THỬ NGHIỆM (setKey 'warriorRoyal', đăng ký EXTRA_ARMOR_SETS) — CHƯA phải 1 trong 39 bộ
// chính thức theo Roadmap 2.2, chỉ để lead duyệt hướng thẩm mỹ trước khi áp dụng rộng.

const M = (pal) => ({
  plate:   { color: 0xf2ede0, metalness: 0.5,  roughness: 0.3 },   // giáp nền trắng-ngà
  plateHi: { color: 0xfffdf5, metalness: 0.55, roughness: 0.2 },   // khối chính bắt sáng
  plateLo: { color: 0xc9c2ab, metalness: 0.42, roughness: 0.42 },  // khe/lót tối hơn
  gold:    { color: 0xd9a916, metalness: 0.78, roughness: 0.26 },  // viền vàng kim (điểm nhấn chính)
  goldDk:  { color: 0x9c7209, metalness: 0.7,  roughness: 0.32 },  // vàng tối (khoá đai)
  mane:    { color: 0xf8f4e9, metalness: 0.04, roughness: 0.9 },   // lông thú trắng phồng (pauldron)
  maneSh:  { color: 0xdbd4bd, metalness: 0.04, roughness: 0.92 },  // lông thú vùng khuất bóng
  dark:    { color: 0x14171c, metalness: 0.5,  roughness: 0.35 }, // khe visor
  glow:    { color: pal.trim ?? 0xd0392b, metalness: 0.2, roughness: 0.4, emissive: pal.trim ?? 0xd0392b, emissiveIntensity: 0.85 }, // khe mắt — giữ màu ĐỎ class-identity của Warrior
  glyph:     { color: 0xd9a916, metalness: 0.5, roughness: 0.3 },
  glyphDark: { color: 0x14171c, metalness: 0.3, roughness: 0.5 },
});

// MŨ — mũ trùm kín 1 khối lớn + T-visor tối + khe mắt đỏ glow + crest lưng 1 lưỡi lớn + viền vàng.
function head(w, h, d, pal) {
  const b = piece(M(pal));
  b.slab('plate', w * 1.3, h * 1.08, d * 1.3, [0, h * 0.06, -d * 0.04], { ch: h * 0.22 });  // chỏm mũ kín 1 khối lớn (to hơn, TRÙM HẾT tóc)
  b.slab('plate', w * 1.1, h * 0.7, d * 0.55, [0, h * 0.02, -d * 0.42], { ch: h * 0.14 });  // gáy sau — phủ thêm tóc phía sau
  b.slab('plate', w * 1.04, h * 0.34, d * 0.56, [0, -h * 0.34, d * 0.52], { ch: h * 0.12 }); // hàm dưới
  b.slab('gold', w * 1.26, h * 0.09, d * 1.22, [0, h * 0.3, 0], { ch: h * 0.02 });          // đai trán vàng
  b.slab('dark', w * 0.13, h * 0.46, d * 0.15, [0, 0, d * 0.58], { ch: h * 0.02 });         // T-visor dọc
  b.slab('glow', w * 0.48, h * 0.065, d * 0.1, [0, h * 0.12, d * 0.6], { ch: h * 0.015 });  // khe mắt đỏ glow
  b.slab('plate', w * 0.18, h * 0.4, d * 0.9, [0, h * 0.68, -d * 0.02], { ch: h * 0.11 });  // crest lưng 1 lưỡi lớn — ÁP SÁT đỉnh mũ, không nổi lửng lơ
  b.slab('gold', w * 0.06, h * 0.06, d * 0.94, [0, h * 0.9, -d * 0.02], { ch: h * 0.018 }); // gờ vàng đỉnh crest
  b.slab('gold', w * 1.0, h * 0.05, d * 0.5, [0, -h * 0.46, d * 0.5], { ch: h * 0.015 });   // viền vàng cằm
  return b.build();
}

// ỐNG BẮP TAY (gắn vào tay -> vung theo vai). Tay áo trắng bậc thang + đai vàng giữa.
function upperArm(w, h, d, pal) {
  const b = piece(M(pal));
  b.bandStack('plate', { w: w * 1.28, h: h * 1.1, d: d * 1.26, y: -h * 0.36, count: 3, taper: 0.03, trim: 'plateLo' }); // kéo dài xuống che khuỷu
  b.slab('plate', w * 1.3, h * 0.5, d * 1.28, [0, h * 0.3, 0], { ch: h * 0.05 });
  b.slab('gold', w * 1.32, h * 0.08, d * 1.3, [0, h * 0.02, 0], { ch: h * 0.02 });          // đai vàng giữa tay
  return b.build();
}

// ÁO GIÁP — thân trắng-ngà + sọc vàng giữa ngực + PAULDRON LÔNG THÚ phồng lớn (điểm nhấn chính, lấy
// từ ảnh mẫu) + áo choàng sau lưng (tĩnh, ngắn vừa để không xuyên chân khi bước) + tà giáp dài trước/hông.
function body(w, h, d, pal, slot) {
  if (slot === 'upperArm') return upperArm(w, h, d, pal);
  if (slot === 'forearm') return hands(w, h, d, pal); // cẳng tay gộp vào Áo giáp (không còn slot Găng riêng)
  const b = piece(M(pal));
  const fz = d * 0.58;

  // ── phủ da cốt lõi ──
  b.slab('plateLo', w * 0.5, h * 0.46, d * 0.8, [0, h * 0.64, 0], { ch: h * 0.09 });        // cổ
  b.slab('plate', w * 1.26, h * 1.0, d * 1.14, [0, 0, 0], { ch: h * 0.08 });                 // ngực/thân chính
  b.slab('plate', w * 1.18, h * 0.42, d * 1.16, [0, -h * 0.58, 0], { ch: h * 0.08 });         // bụng — nối liền ngực↔hông (khử hở lưng)
  b.slab('plate', w * 1.14, h * 0.7, d * 1.18, [0, -h * 0.95, 0], { ch: h * 0.08 });          // hông/bụng dưới — kéo dài xuống nối tà giáp
  b.both((sx) => b.slab('plate', w * 0.28, h * 0.42, d * 1.1, [sx * w * 0.5, h * 0.34, 0], { ch: h * 0.07 })); // chèn nách
  b.belt('gold', 'goldDk', { w: w * 1.16, h: h * 0.16, d: d * 1.2, y: -h * 0.86 });          // đai vàng eo

  // ── điểm nhấn vàng + huy hiệu ──
  b.slab('gold', w * 0.15, h * 1.05, d * 0.1, [0, -h * 0.02, fz + d * 0.02], { ch: h * 0.03 }); // sọc vàng giữa ngực
  b.slab('gold', w * 0.56, h * 0.09, d * 0.86, [0, h * 0.42, 0], { ch: h * 0.02 });          // vòng cổ vàng
  attachSigil(b, 'warrior', 'glyph', 'glyphDark', 0, h * 0.14, fz + d * 0.06, h * 0.32, d * 0.05); // huy hiệu ngực

  // ── CỔ LÔNG THÚ — 1 vòng liền quanh cổ/vai (thay cụm khối cũ), đọc thành mantle liền mạch ──
  b.torus('mane', w * 0.42, h * 0.13, [0, h * 0.48, 0], { rot: [Math.PI / 2, 0, 0], seg: 20 });

  // ── VAI — 1 VÒM CẦU DUY NHẤT cong xuống ~97° (mặt cong thật, KHÔNG xếp nhiều tấm) + 1 viền vàng
  // đúng ĐƯỜNG RANH của vòm (không phải khối rời — chỉ là mép nơi vòm dừng). ──
  b.both((sx) => {
    const cx = sx * w * 0.58, cy = h * 0.34;
    const domeR = w * 0.32, domeT = Math.PI * 0.54;
    b.sphere('plate', domeR, [cx, cy, 0], { seg: 16, segV: 12, thetaLength: domeT });
    const ringR = domeR * Math.sin(domeT), ringY = cy + domeR * Math.cos(domeT);
    b.torus('gold', ringR, domeR * 0.065, [cx, ringY, 0], { rot: [Math.PI / 2, 0, 0], seg: 18 });
  });

  // ── ÁO CHOÀNG sau lưng — TĨNH, NGẮN vừa tới giữa đùi + lùi sâu -fz để KHÔNG chạm tà giáp/chân khi bước ──
  b.both((sx) => {
    b.slab('plate', w * 0.58, h * 1.3, d * 0.1, [sx * w * 0.42, -h * 0.1, -fz - d * 0.16], { ch: h * 0.05 });
    b.slab('gold', w * 0.58, h * 0.06, d * 0.12, [sx * w * 0.42, -h * 0.74, -fz - d * 0.16], { ch: h * 0.015 });
  });

  // ── TÀ GIÁP dài trước + 2 bên hông + sau ngắn (tabard kiểu ảnh mẫu) ──
  const sy = -h * 1.3;
  b.push([0, sy, fz * 0.9]);
  b.slab('plate', w * 0.86, h * 0.98, d * 0.15, [0, h * 0.1, 0], { ch: h * 0.06 });
  b.slab('gold', w * 0.15, h * 0.75, d * 0.16, [0, 0, d * 0.02], { ch: h * 0.02 });          // sọc vàng giữa tà
  b.slab('gold', w * 0.88, h * 0.06, d * 0.17, [0, -h * 0.4, 0], { ch: h * 0.02 });          // mép vàng đáy tà
  b.pop();
  b.both((sx) => {
    b.push([sx * w * 0.58, sy, 0], [0, Math.PI / 2, 0]);
    b.slab('plate', w * 0.5, h * 0.7, d * 0.14, [0, 0, 0], { ch: h * 0.05 });
    b.slab('gold', w * 0.52, h * 0.055, d * 0.15, [0, -h * 0.36, 0], { ch: h * 0.018 });
    b.pop();
  });
  b.push([0, sy, -fz * 0.9]);
  b.slab('plate', w * 0.8, h * 0.68, d * 0.14, [0, 0, 0], { ch: h * 0.05 });
  b.pop();
  for (const sz of [1, -1]) b.slab('plate', w * 0.46, h * 0.4, d * 0.12, [0, -h * 1.5, sz * fz * 0.5], { ch: h * 0.06 }); // đũng giữa

  return b.build();
}

// CẲNG TAY (gộp vào Áo giáp, slot 'forearm') — ống cẳng tay+bàn tay phủ 1 khối lớn + đai cổ tay vàng + gờ khớp tay.
function hands(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('plate', w, h, d, 1.24, 1.14, 1.24, [0, h * 0.06, 0]);
  b.slab('gold', w * 1.28, h * 0.09, d * 1.28, [0, h * 0.58, 0], { ch: h * 0.02 });
  b.slab('plateHi', w * 1.14, h * 0.42, d * 1.08, [0, -h * 0.48, 0], { ch: h * 0.14 });
  b.slab('gold', w * 1.16, h * 0.06, d * 1.1, [0, -h * 0.72, 0], { ch: h * 0.015 });
  return b.build();
}

// QUẦN — đùi/cẳng chân phủ khối trắng lớn + đai vàng khớp; gối vồng nhẹ ở đùi.
function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));
  if (slot === 'shin') {
    b.cover('plate', w, h, d, 1.16, 1.08, 1.24, [0, 0, 0]);
    b.slab('gold', w * 1.2, h * 0.08, d * 1.22, [0, h * 0.4, 0], { ch: h * 0.02 });
    return b.build();
  }
  b.cover('plate', w, h, d, 1.2, 1.06, 1.22, [0, 0, 0]);
  b.slab('gold', w * 1.24, h * 0.1, d * 1.26, [0, h * 0.42, 0], { ch: h * 0.025 });
  b.slab('plateHi', w * 0.6, h * 0.4, d * 0.2, [0, -h * 0.05, d * 0.62], { ch: h * 0.08 });     // gối vồng nhẹ
  return b.build();
}

// GIÀY — bàn chân mũi vuông + gờ vàng mu chân.
function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('plate', w, h, d, 1.2, 1.5, 1.55, [0, h * 0.26, d * 0.14]);
  b.slab('plateHi', w * 1.14, h * 0.55, d * 0.55, [0, h * 0.02, d * 0.72], { ch: h * 0.16 }); // mũi ủng vuông
  b.slab('gold', w * 1.16, h * 0.08, d * 0.5, [0, h * 0.24, d * 0.76], { ch: h * 0.02 });     // gờ vàng mu chân
  b.cover('plateLo', w, h, d, 1.22, 0.7, 1.55, [0, -h * 0.52, d * 0.12]);
  return b.build();
}

export const WARRIOR_ROYAL = { head, body, legs, feet };

```
