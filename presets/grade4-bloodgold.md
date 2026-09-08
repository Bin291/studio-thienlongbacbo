# Bộ Giáp Huyết Kim (Vermilium / Bloodgold Set)

Bộ giáp Grade 4 chính thức theo "Bảng dựng 13 bộ giáp" — CRAFT tier đầu tiên (Dùng chung cả 3 lớp).
- **Chất liệu**: Vermilium đỏ huyết thẫm kim loại, nẹp vàng kim cổ điển, chi tiết vàng sáng, khe visor đen bí ẩn.
- **Phong cách**: Kỹ thuật tạo hình Trim-layering (§14) — nẹp vàng đè lên nền đỏ, vát cạnh ch rộng tạo đường viền mảnh bắt sáng mà không ghép khối nhỏ.
- **Điểm nhấn**: Vành vương miện răng cưa, khung nẹp vàng quanh ngực & tà giáp, cầu vai vòm dome có váy vai rủ che khe nách, áo choàng đỏ sau lưng.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// GRADE 4 — GIÁP HUYẾT KIM (Vermilium / Bloodgold Armor) — CRAFT tier đầu tiên.
// 2026-09-08: bộ CHÍNH THỨC theo "Bảng dựng 13 bộ" — DÙNG CHUNG cả 3 lớp (xem LL-AR-001 §3.5c).
//
// TRIẾT LÝ DỰNG (theo góp ý design + HUONG-DAN §14 "chi tiết sắc nét không cần khối nhỏ"):
//   • Vermilium = đỏ huyết THẪM, KIM LOẠI (metalness cao) — "lấp lánh" đến từ metalness/envmap, KHÔNG
//     phải emissive (luật hoãn-glow: giáp gốc không tự phát sáng, glow để dành cho cấp cường hoá).
//   • Hoa văn/viền = hệ NẸP VÀNG cổ điển: tấm slab MỎNG (d≈0.02-0.05) đè lên nền → viền nổi sắc nét,
//     tối ưu 100% hiệu năng (không ghép hàng nghìn khối nhỏ).
//   • Cạnh vát `ch` rộng → mép bắt sáng thành đường viền mảnh, khối "ra chất giáp" chỉ với 1 tấm.
//   • Phẳng mượt, BỌC KÍN 360° (mũ kín có khe visor — grade cao nên sang/kín, không hở mặt).
// ═══════════════════════════════════════════════════════════════════════════

const M = () => ({
  plate:   { color: 0x7d1620, metalness: 0.82, roughness: 0.32 }, // Vermilium đỏ huyết thẫm (nền chính)
  plateHi: { color: 0xa82b30, metalness: 0.88, roughness: 0.22 }, // đỏ sáng — khối bắt sáng
  plateLo: { color: 0x430910, metalness: 0.70, roughness: 0.50 }, // đỏ tối — khe/lót/gáy
  gold:    { color: 0xd9a825, metalness: 0.92, roughness: 0.24 }, // vàng cổ điển — viền nẹp chính
  goldHi:  { color: 0xf1d268, metalness: 0.96, roughness: 0.16 }, // vàng sáng — điểm nhấn/đỉnh vương miện
  goldDk:  { color: 0x8a6410, metalness: 0.82, roughness: 0.40 }, // vàng hun tối — nẹp phụ/đáy
  dark:    { color: 0x160a0d, metalness: 0.50, roughness: 0.42 }, // khe visor / rãnh tối
});

// Viền NẸP VÀNG khung chữ nhật quanh 1 mặt phẳng (kỹ thuật trim-layering: 4 thanh mỏng nổi lên nền).
// cx/cy = tâm, fw/fh = kích thước khung, z = mặt đặt (nhô ra), t = bề dày thanh.
function goldFrame(b, cx, cy, z, fw, fh, t, mat = 'gold') {
  b.slab(mat, fw, t, 0.03, [cx, cy + fh / 2 - t / 2, z], { ch: t * 0.3 });          // thanh trên
  b.slab(mat, fw, t, 0.03, [cx, cy - fh / 2 + t / 2, z], { ch: t * 0.3 });          // thanh dưới
  b.slab(mat, t, fh - 2 * t, 0.03, [cx - fw / 2 + t / 2, cy, z], { ch: t * 0.3 });  // thanh trái
  b.slab(mat, t, fh - 2 * t, 0.03, [cx + fw / 2 - t / 2, cy, z], { ch: t * 0.3 });  // thanh phải
}

// ── 1. MŨ HUYẾT KIM (Head) — vòm đỏ kín + VƯƠNG MIỆN VÀNG trán + sống mũ vàng + khe visor tối ──
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // Vòm mũ đỏ bọc kín đầu (chamfer rộng cho mép bắt sáng mềm)
  b.cover('plate', w, h, d, 1.16, 1.08, 1.16, [0, h * 0.05, 0]);
  b.slab('plateLo', w * 1.1, h * 0.5, d * 0.55, [0, -h * 0.02, -d * 0.42], { ch: h * 0.1 }); // gáy sau che tóc
  b.slab('plate', w * 1.05, h * 0.4, d * 0.5, [0, -h * 0.34, d * 0.5], { ch: h * 0.1 });      // hàm/cằm dưới (kín)

  // VƯƠNG MIỆN VÀNG quanh trán — đai + 5 răng nhọn (trim-layering: khối mỏng nổi)
  b.slab('gold', w * 1.22, h * 0.11, d * 1.22, [0, h * 0.28, 0], { ch: h * 0.02 });
  for (let i = -2; i <= 2; i++) {
    const big = i === 0;
    b.slab(big ? 'goldHi' : 'gold', w * 0.08, h * (big ? 0.2 : 0.13), d * 0.06,
      [i * w * 0.24, h * (0.4 + (big ? 0.03 : 0)), d * 0.5], { ch: w * 0.02 });
  }

  // Sống mũ vàng chạy dọc đỉnh (ridge) + gờ sáng
  b.slab('gold', w * 0.12, h * 0.48, d * 0.92, [0, h * 0.5, -d * 0.02], { ch: h * 0.03 });
  b.slab('goldHi', w * 0.04, h * 0.06, d * 0.94, [0, h * 0.72, -d * 0.02], { ch: h * 0.015 });

  // Khe visor: thanh ngang mắt (tối) + rãnh dọc chữ T + 2 nẹp vàng kẹp trên-dưới khe
  b.slab('dark', w * 0.62, h * 0.11, d * 0.1, [0, h * 0.02, d * 0.6], { ch: h * 0.02 });
  b.slab('dark', w * 0.1, h * 0.34, d * 0.1, [0, -h * 0.12, d * 0.6], { ch: h * 0.02 });
  b.slab('gold', w * 0.66, h * 0.03, d * 0.08, [0, h * 0.1, d * 0.61], { ch: h * 0.01 });
  b.slab('goldDk', w * 0.66, h * 0.03, d * 0.08, [0, -h * 0.06, d * 0.61], { ch: h * 0.01 });

  // Nẹp má vàng mảnh 2 bên (trim-layering, ôm dọc hàm)
  b.both((sx) => b.slab('goldDk', w * 0.05, h * 0.62, d * 0.5, [sx * w * 0.56, -h * 0.06, d * 0.16], { ch: h * 0.01 }));

  return b.build();
}

// Cẳng tay (gộp vào Áo giáp, slot 'forearm') — ống đỏ + 2 đai vàng + nẹp dọc.
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('plate', w, h, d, 1.18, 1.16, 1.18, [0, -h * 0.05, 0]);          // ống cẳng tay + mu bàn tay
  b.slab('gold', w * 1.22, h * 0.09, d * 1.22, [0, h * 0.34, 0], { ch: h * 0.02 });  // đai vàng khuỷu
  b.slab('goldDk', w * 1.22, h * 0.07, d * 1.22, [0, -h * 0.42, 0], { ch: h * 0.02 }); // đai vàng cổ tay
  b.slab('goldDk', w * 0.09, h * 0.7, d * 0.06, [0, -h * 0.05, d * 0.58], { ch: h * 0.01 }); // nẹp dọc mu tay
  return b.build();
}

// ── 2. ÁO GIÁP HUYẾT KIM (Body) — ngực đỏ khung vàng + huy hiệu + pauldron dome viền vàng + tà đỏ viền vàng ──
export function body(w, h, d, pal, slot) {
  if (slot === 'forearm') return forearmArmor(w, h, d, pal);
  if (slot === 'upperArm') {
    const b = piece(M(pal));
    b.cover('plate', w, h, d, 1.2, 1.5, 1.2, [0, h * 0.1, 0]);              // ống bắp tay (bù occlusion sArm)
    b.slab('gold', w * 1.24, h * 0.09, d * 1.24, [0, h * 0.34, 0], { ch: h * 0.02 }); // đai vàng vai-tay
    return b.build();
  }

  const b = piece(M(pal));
  const fz = d * 0.58;

  // ── phủ da cốt lõi (bọc kín 360) ──
  b.slab('plateLo', w * 0.56, h * 0.44, d * 0.86, [0, h * 0.62, 0], { ch: h * 0.08 });  // cổ giáp cao
  b.slab('gold', w * 0.62, h * 0.08, d * 0.92, [0, h * 0.44, 0], { ch: h * 0.02 });      // vòng cổ vàng
  b.cover('plate', w, h, d, 1.22, 1.04, 1.24, [0, 0, 0]);                                 // thân/ngực chính
  b.slab('plate', w * 1.16, h * 0.6, d * 1.18, [0, -h * 0.82, 0], { ch: h * 0.06 });      // hông/bụng dưới (nối tà)

  // ── NGỰC: tấm lồi bắt sáng + KHUNG VÀNG cổ điển + huy hiệu kim cương ──
  b.slab('plateHi', w * 0.92, h * 0.72, d * 0.24, [0, h * 0.08, fz], { ch: h * 0.1 });    // tấm ngực lồi
  goldFrame(b, 0, h * 0.08, fz + d * 0.12, w * 0.82, h * 0.66, w * 0.06);                 // khung vàng quanh ngực
  b.slab('goldHi', w * 0.26, h * 0.26, d * 0.06, [0, h * 0.12, fz + d * 0.14], { rot: [0, 0, Math.PI / 4], ch: w * 0.05 }); // huy hiệu kim cương vàng
  b.slab('plateLo', w * 0.13, h * 0.13, d * 0.05, [0, h * 0.12, fz + d * 0.17], { rot: [0, 0, Math.PI / 4], ch: w * 0.03 }); // tâm huy hiệu (đỏ tối)

  // ── đai eo vàng + nẹp dọc bụng ──
  b.slab('gold', w * 1.24, h * 0.12, d * 1.26, [0, -h * 0.42, 0], { ch: h * 0.02 });
  b.slab('goldDk', w * 0.1, h * 0.3, d * 0.06, [0, -h * 0.6, fz], { ch: h * 0.015 });

  // ── PAULDRON: dome đỏ sâu z (bao cung vung bắp tay) + viền vàng mép + chóp vàng + váy vai rủ ──
  b.both((sx) => {
    b.slab('plateLo', w * 0.52, h * 0.66, d * 1.5, [sx * w * 0.9, h * 0.02, 0], { ch: h * 0.08 });   // VÁY VAI RỦ (che khe tay áo lộ)
    b.slab('plate', w * 0.6, h * 0.34, d * 1.6, [sx * w * 0.8, h * 0.44, 0], { ch: h * 0.1 });      // đế dome (sâu z)
    b.slab('plateHi', w * 0.5, h * 0.22, d * 1.4, [sx * w * 0.78, h * 0.66, 0], { ch: h * 0.1 });    // mái vòm trên
    b.slab('gold', w * 0.64, h * 0.06, d * 1.62, [sx * w * 0.8, h * 0.3, 0], { ch: h * 0.02 });       // viền vàng mép dưới
    b.slab('goldHi', w * 0.14, h * 0.14, d * 0.14, [sx * w * 0.86, h * 0.78, 0], { rot: [0, 0, sx * 0.5], ch: w * 0.03 }); // chóp vàng đỉnh vai
  });

  // ── ÁO CHOÀNG đỏ sau lưng (tĩnh, ngắn, lùi sâu -fz để không chạm chân khi bước) ──
  b.both((sx) => {
    b.slab('plateLo', w * 0.56, h * 1.3, d * 0.09, [sx * w * 0.4, -h * 0.1, -fz - d * 0.14], { ch: h * 0.05 });
    b.slab('gold', w * 0.56, h * 0.05, d * 0.11, [sx * w * 0.4, -h * 0.74, -fz - d * 0.14], { ch: h * 0.015 });
  });

  // ── TÀ GIÁP đỏ viền vàng (trước dài + 2 hông + sau) — tabard hoàng gia ──
  const sy = -h * 1.28;
  b.push([0, sy, fz * 0.9]);
  b.slab('plate', w * 0.84, h * 0.96, d * 0.14, [0, h * 0.1, 0], { ch: h * 0.05 });
  goldFrame(b, 0, h * 0.02, d * 0.09, w * 0.66, h * 0.78, w * 0.05);                        // khung vàng trên tà trước
  b.slab('goldHi', w * 0.18, h * 0.18, d * 0.05, [0, h * 0.12, d * 0.1], { rot: [0, 0, Math.PI / 4], ch: w * 0.04 }); // giọt kim cương giữa tà
  b.pop();
  b.both((sx) => {
    b.push([sx * w * 0.56, sy, 0], [0, Math.PI / 2, 0]);
    b.slab('plate', w * 0.5, h * 0.72, d * 0.13, [0, 0, 0], { ch: h * 0.05 });
    b.slab('gold', w * 0.52, h * 0.05, d * 0.14, [0, -h * 0.34, 0], { ch: h * 0.015 });
    b.pop();
  });
  b.push([0, sy, -fz * 0.9]);
  b.slab('plate', w * 0.8, h * 0.66, d * 0.13, [0, 0, 0], { ch: h * 0.05 });
  b.pop();
  for (const sz of [1, -1]) b.slab('plate', w * 0.46, h * 0.4, d * 0.12, [0, -h * 1.48, sz * fz * 0.5], { ch: h * 0.05 }); // đũng giữa

  return b.build();
}

// ── 3. QUẦN HUYẾT KIM (Legs) — đùi/cẳng đỏ + nẹp vàng dọc + đai gối vàng ──
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));
  if (slot === 'shin') {
    b.cover('plate', w, h, d, 1.16, 1.08, 1.2, [0, 0, 0]);
    b.slab('gold', w * 1.2, h * 0.08, d * 1.24, [0, h * 0.4, 0], { ch: h * 0.02 });          // đai gối vàng
    b.slab('goldDk', w * 0.5, h * 0.5, d * 0.06, [0, -h * 0.05, d * 0.6], { ch: h * 0.02 });   // nẹp ống chân vàng tối
    return b.build();
  }
  // đùi
  b.cover('plate', w, h, d, 1.16, 1.06, 1.2, [0, 0, 0]);
  b.slab('gold', w * 1.22, h * 0.1, d * 1.26, [0, h * 0.42, 0], { ch: h * 0.02 });            // đai hông-đùi vàng
  b.slab('plateHi', w * 0.6, h * 0.42, d * 0.2, [0, -h * 0.05, d * 0.62], { ch: h * 0.08 });   // giáp đùi trước lồi
  b.slab('goldDk', w * 0.5, h * 0.06, d * 0.08, [0, -h * 0.24, d * 0.72], { ch: h * 0.015 });  // gờ vàng đáy giáp đùi
  return b.build();
}

// ── 4. GIÀY HUYẾT KIM (Feet) — ủng đỏ mũi vuông + mũi vàng + đai cổ chân vàng ──
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('plate', w, h, d, 1.16, 1.4, 1.5, [0, h * 0.22, d * 0.12]);
  b.slab('plateHi', w * 1.12, h * 0.5, d * 0.5, [0, h * 0.02, d * 0.72], { ch: h * 0.14 });    // mũi ủng vuông lồi
  b.slab('gold', w * 1.16, h * 0.1, d * 0.42, [0, h * 0.22, d * 0.74], { ch: h * 0.02 });       // mũi vàng
  b.slab('gold', w * 1.2, h * 0.08, d * 1.24, [0, h * 0.42, 0], { ch: h * 0.02 });              // đai cổ chân vàng
  b.cover('plateLo', w, h, d, 1.18, 0.65, 1.52, [0, -h * 0.5, d * 0.1]);                        // đế ủng tối
  return b.build();
}

export const BLOODGOLD = { head, body, legs, feet };

```
