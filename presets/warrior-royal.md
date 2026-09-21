# Bộ Giáp Hiệp Sĩ Bạch Kim (Warrior Royal Set)

Bộ giáp thử nghiệm phá khung Silhouette lớn phong cách Hiệp Sĩ Hoàng Gia.
- **Chất liệu**: Giáp nền trắng-ngà bạch kim, viền vàng kim hoàng gia to bản, mantle lông thú trắng quý tộc, ngọc đỏ ruby hoàng gia.
- **Điểm nhấn**: Mũ đại hiệp sĩ kín hoàn toàn (Great-Armet) với kính ngắm T-visor phát sáng, cầu vai vòm cầu đúc nổi gắn vào bắp tay swing theo khớp vai, yếm cổ cao che kín da, khớp đệm gối poleyn lồng 2 lớp chống hở khe khi gập chân.
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
// WARRIOR "Hiệp Sĩ Bạch Kim" — PHIÊN BẢN HOÀNG GIA ĐẲNG CẤP (WARRIOR ROYAL SET)
// Cải tiến toàn diện: Khử 100% khe hở khi di chuyển, vung tay, gập gối.
// ═══════════════════════════════════════════════════════════════════════════

const M = (pal) => ({
  plate:     { color: 0xf4efe4, metalness: 0.55, roughness: 0.28 }, // giáp nền trắng-ngà bạch kim
  plateHi:   { color: 0xffffff, metalness: 0.65, roughness: 0.18 }, // tấm chính bắt sáng rực rỡ
  plateLo:   { color: 0xc8c0a8, metalness: 0.45, roughness: 0.38 }, // khe/lót thép bảo vệ
  gold:      { color: 0xe0ad18, metalness: 0.85, roughness: 0.22 }, // viền vàng kim hoàng gia sắc nét
  goldDk:    { color: 0x9e7308, metalness: 0.75, roughness: 0.30 }, // vàng cổ thau đúc khóa
  mane:      { color: 0xfaf6ec, metalness: 0.05, roughness: 0.88 }, // lông thú trắng quý tộc
  maneSh:    { color: 0xd6cbb2, metalness: 0.05, roughness: 0.90 }, // nếp bóng lông thú
  dark:      { color: 0x12151b, metalness: 0.60, roughness: 0.35 }, // khe visor đen sâu thẳm
  glow:      { color: pal.trim ?? 0x00e5ff, metalness: 0.2, roughness: 0.3, emissive: pal.trim ?? 0x00e5ff, emissiveIntensity: 1.1 }, // khe mắt sáng
  gemRed:    { color: 0xd91828, metalness: 0.3, roughness: 0.2, emissive: 0xaa0e1c, emissiveIntensity: 0.8 }, // hồng ngọc hoàng kim
  glyph:     { color: 0xe0ad18, metalness: 0.75, roughness: 0.25 },
  glyphDark: { color: 0x12151b, metalness: 0.4,  roughness: 0.5 },
});

// 1. MŨ HIỆP SĨ HOÀNG GIA (Head) — Bọc kín 100%, không lòi sọ/tóc/mặt
function head(w, h, d, pal) {
  const b = piece(M(pal));

  // A. Chỏm mũ chính — dùng cover() để đảm bảo chamfer an toàn tuyệt đối không cắt xuyên sọ
  b.cover('plate', w, h, d, 1.28, 1.28, 1.30, [0, h * 0.12, -d * 0.02]);
  b.slab('plateHi', w * 1.22, h * 0.28, d * 1.24, [0, h * 0.46, -d * 0.02], { ch: h * 0.06 }); // đỉnh sọ bắt sáng

  // B. Hai bên thái dương, vành tai và má bọc kín tuyệt đối (Cheek Guards)
  b.both((sx) => {
    b.slab('plate', w * 0.24, h * 0.90, d * 1.24, [sx * w * 0.54, -h * 0.04, -d * 0.02], { ch: h * 0.04 });
    b.slab('gold', w * 0.06, h * 0.88, d * 1.26, [sx * w * 0.65, -h * 0.04, -d * 0.02], { ch: 0 }); // gờ vàng sườn mũ
    // Khe thông khí bên má
    b.slab('dark', w * 0.04, h * 0.16, d * 0.28, [sx * w * 0.66, -h * 0.18, d * 0.16], { ch: 0 });
    b.slab('dark', w * 0.04, h * 0.16, d * 0.28, [sx * w * 0.66, -h * 0.18, -d * 0.08], { ch: 0 });
  });

  // C. Giáp gáy bọc kín sau đầu và chân cổ (Nape Guard)
  b.slab('plate', w * 1.20, h * 0.74, d * 0.44, [0, -h * 0.14, -d * 0.50], { ch: h * 0.05 });
  b.slab('gold', w * 1.22, h * 0.08, d * 0.46, [0, -h * 0.48, -d * 0.50], { ch: h * 0.015 });
  b.slab('plateLo', w * 1.08, h * 0.38, d * 0.42, [0, -h * 0.56, -d * 0.48], { ch: h * 0.04 }); // che sâu xuống cổ

  // D. Yếm cằm và giáp hàm dưới bọc kín (Bevor / Chin Guard)
  b.slab('plate', w * 1.12, h * 0.48, d * 0.58, [0, -h * 0.32, d * 0.44], { ch: h * 0.06 });
  b.slab('gold', w * 1.14, h * 0.07, d * 0.60, [0, -h * 0.10, d * 0.45], { ch: h * 0.015 }); // viền vàng mép cằm trên
  b.slab('gold', w * 1.08, h * 0.06, d * 0.52, [0, -h * 0.54, d * 0.44], { ch: h * 0.015 }); // viền vàng đáy cằm
  b.slab('plateHi', w * 0.48, h * 0.40, d * 0.22, [0, -h * 0.34, d * 0.70], { ch: h * 0.04 }); // sống cằm nhô chữ V
  b.slab('gold', w * 0.12, h * 0.36, d * 0.24, [0, -h * 0.34, d * 0.72], { ch: 0 });          // sọc vàng giữa cằm

  // E. Vành trán & Vương miện hoàng gia (Royal Brow & Crown)
  b.slab('gold', w * 1.30, h * 0.12, d * 1.26, [0, h * 0.28, 0], { ch: h * 0.02 });
  b.slab('gold', w * 0.28, h * 0.24, d * 0.14, [0, h * 0.38, d * 0.60], { rot: [0, 0, Math.PI / 4], ch: h * 0.03 }); // vương miện chữ V
  b.slab('gemRed', w * 0.12, h * 0.12, d * 0.16, [0, h * 0.38, d * 0.66], { rot: [0, 0, Math.PI / 4], ch: 0 });       // hồng ngọc hoàng gia

  // F. Kính ngắm chữ T và khe mắt phát sáng (T-Visor & Glowing Eye Slit)
  b.slab('dark', w * 0.14, h * 0.44, d * 0.16, [0, -h * 0.02, d * 0.62], { ch: h * 0.02 });  // rãnh thở dọc
  b.slab('dark', w * 0.88, h * 0.12, d * 0.16, [0, h * 0.12, d * 0.62], { ch: h * 0.02 });   // rãnh mắt ngang
  b.slab('glow', w * 0.74, h * 0.06, d * 0.12, [0, h * 0.12, d * 0.67], { ch: 0 });           // khe mắt sáng rực
  b.both((sx) => {
    b.slab('dark', w * 0.05, h * 0.16, d * 0.10, [sx * w * 0.22, -h * 0.22, d * 0.68], { ch: 0 }); // khe thở mặt nạ
    b.slab('dark', w * 0.05, h * 0.16, d * 0.10, [sx * w * 0.32, -h * 0.22, d * 0.66], { ch: 0 });
  });

  // G. Bờm lược hoàng gia trắng bạc viền vàng (Royal Plume / Crest)
  b.slab('plateHi', w * 0.18, h * 0.48, d * 1.15, [0, h * 0.72, -d * 0.04], { ch: h * 0.08 });
  b.slab('gold', w * 0.08, h * 0.08, d * 1.20, [0, h * 0.98, -d * 0.04], { ch: h * 0.02 });   // gờ vàng đỉnh bờm
  b.slab('gold', w * 0.22, h * 0.14, d * 0.32, [0, h * 0.84, d * 0.42], { ch: h * 0.03 });   // chóp trước trán

  return b.build();
}

// 2. BẮP TAY & CẦU VAI HOÀNG GIA (UpperArm) — Gắn vào tay để swing theo khớp vai, không bao giờ tách rời!
function upperArm(w, h, d, pal) {
  const b = piece(M(pal));

  // A. Lớp lót bắp tay che kín 100% da
  b.cover('plateLo', w, h, d, 1.22, 1.30, 1.22, [0, h * 0.05, 0]);

  // B. Giáp trắng bọc bắp tay + viền vàng hoàng gia
  b.slab('plate', w * 1.26, h * 0.68, d * 1.26, [0, h * 0.12, 0], { ch: h * 0.06 });
  b.slab('gold', w * 1.30, h * 0.08, d * 1.30, [0, h * 0.32, 0], { ch: h * 0.02 });
  b.slab('gold', w * 1.30, h * 0.08, d * 1.30, [0, -h * 0.14, 0], { ch: h * 0.02 });

  // C. CẦU VAI VÒM CẦU HOÀNG GIA (Royal Curved Pauldron) — Đặt ngay đỉnh bắp tay, swing đồng bộ khi chạy/chém
  const domeR = Math.max(w, d) * 0.72;
  const domeY = h * 0.46;
  b.sphere('plate', domeR, [0, domeY, 0], { seg: 20, segV: 16, thetaLength: Math.PI * 0.56 });
  const ringR = domeR * Math.sin(Math.PI * 0.56);
  const ringY = domeY + domeR * Math.cos(Math.PI * 0.56);
  b.torus('gold', ringR, domeR * 0.07, [0, ringY, 0], { rot: [Math.PI / 2, 0, 0], seg: 22 });

  // Tầng đệm nổi chỏm cầu vai + huy hiệu vàng & ngọc
  b.slab('plateHi', domeR * 1.15, domeR * 0.28, domeR * 1.15, [0, domeY + domeR * 0.40, 0], { ch: domeR * 0.08 });
  b.slab('gold', domeR * 0.30, domeR * 0.30, domeR * 0.10, [0, domeY + domeR * 0.30, domeR * 0.88], { rot: [0, 0, Math.PI / 4], ch: 0.02 });
  b.slab('gemRed', domeR * 0.14, domeR * 0.14, domeR * 0.12, [0, domeY + domeR * 0.30, domeR * 0.92], { rot: [0, 0, Math.PI / 4], ch: 0 });

  return b.build();
}

// 3. CẲNG TAY & GĂNG TAY (Hands / Forearm) — Bọc kín cẳng tay và mu bàn tay
function hands(w, h, d, pal) {
  const b = piece(M(pal));

  // A. Lớp lót cẳng tay che kín da
  b.cover('plateLo', w, h, d, 1.24, 1.35, 1.24, [0, h * 0.02, 0]);

  // B. Ốp giáp cẳng tay trắng-vàng
  b.slab('plate', w * 1.28, h * 0.85, d * 1.28, [0, h * 0.12, 0], { ch: h * 0.06 });
  b.slab('gold', w * 1.32, h * 0.09, d * 1.32, [0, h * 0.46, 0], { ch: h * 0.02 });
  b.slab('gold', w * 1.32, h * 0.08, d * 1.32, [0, -h * 0.22, 0], { ch: h * 0.02 });

  // C. Giáp cổ tay & mu bàn tay (Gauntlet Cuff & Back-of-Hand)
  b.slab('plate', w * 1.20, h * 0.55, d * 1.22, [0, -h * 0.55, 0], { ch: h * 0.05 });
  b.slab('plateHi', w * 1.14, h * 0.36, d * 0.54, [0, -h * 0.65, d * 0.46], { ch: h * 0.04 }); // mu bàn tay
  b.slab('gold', w * 1.16, h * 0.06, d * 0.56, [0, -h * 0.52, d * 0.48], { ch: 0 });
  b.slab('plateLo', w * 1.12, h * 0.38, d * 1.14, [0, -h * 0.72, 0], { ch: h * 0.04 });          // lòng bàn tay

  return b.build();
}

// 4. ÁO GIÁP HOÀNG GIA (Body) — Thân, ngực, cổ lông thú, đai lưng, áo choàng và vạt tà
function body(w, h, d, pal, slot) {
  if (slot === 'upperArm') return upperArm(w, h, d, pal);
  if (slot === 'forearm') return hands(w, h, d, pal);

  const b = piece(M(pal));
  const fz = d * 0.58;

  // A. Yếm cổ cao bọc 100% da cổ (High Gorget)
  b.slab('plateLo', w * 0.62, h * 0.52, d * 0.84, [0, h * 0.62, 0], { ch: h * 0.06 });
  b.slab('gold', w * 0.66, h * 0.10, d * 0.88, [0, h * 0.56, 0], { ch: h * 0.02 });

  // B. Vòng lông thú quý tộc bao quanh cổ (Royal Fur Mantle)
  b.torus('mane', w * 0.48, h * 0.15, [0, h * 0.50, 0], { rot: [Math.PI / 2, 0, 0], seg: 20 });
  b.torus('maneSh', w * 0.44, h * 0.12, [0, h * 0.45, 0], { rot: [Math.PI / 2, 0, 0], seg: 18 });

  // C. Cốt thân chính bọc kín 360 độ (Cuirass Core)
  b.cover('plate', w, h, d, 1.26, 1.08, 1.20, [0, 0, 0]);
  b.slab('plate', w * 1.20, h * 0.55, d * 1.22, [0, -h * 0.65, 0], { ch: h * 0.08 }); // bụng
  b.slab('plate', w * 1.18, h * 0.60, d * 1.24, [0, -h * 0.95, 0], { ch: h * 0.08 }); // hông / eo dưới
  b.both((sx) => b.slab('plateLo', w * 0.32, h * 0.50, d * 1.14, [sx * w * 0.52, h * 0.28, 0], { ch: h * 0.06 })); // chèn kín nách

  // D. Cơ ngực đúc nổi chữ V & Huy hiệu hoàng gia
  b.both((sx) => {
    b.slab('plateHi', w * 0.42, h * 0.38, d * 0.16, [sx * w * 0.22, h * 0.18, fz + d * 0.02], { ch: h * 0.06 });
    b.slab('gold', w * 0.40, h * 0.08, d * 0.09, [sx * w * 0.22, h * 0.36, fz + d * 0.07], { rot: [0, 0, -sx * 0.24], ch: h * 0.02 });
  });
  b.slab('gold', w * 0.16, h * 0.98, d * 0.10, [0, -h * 0.04, fz + d * 0.04], { ch: h * 0.03 }); // dải vàng trung tâm
  attachSigil(b, 'warrior', 'glyph', 'glyphDark', 0, h * 0.15, fz + d * 0.08, h * 0.32, d * 0.05); // huy hiệu chiến binh vàng

  // E. Thắt lưng vàng & Khoá ngọc hoàng gia
  b.belt('gold', 'goldDk', { w: w * 1.22, h: h * 0.18, d: d * 1.26, y: -h * 0.82 });
  b.slab('gold', w * 0.32, h * 0.24, d * 0.12, [0, -h * 0.82, fz + d * 0.06], { ch: h * 0.03 });
  b.slab('gemRed', w * 0.14, h * 0.14, d * 0.14, [0, -h * 0.82, fz + d * 0.11], { rot: [0, 0, Math.PI / 4], ch: 0 });

  // F. Vạt tà trước 2 lớp hoàng gia (Royal Tabard)
  const sy = -h * 1.28;
  b.slab('plateLo', w * 0.82, h * 1.05, d * 0.12, [0, sy, fz + d * 0.02], { ch: h * 0.04 }); // lót trong
  b.slab('plateHi', w * 0.74, h * 0.95, d * 0.15, [0, sy, fz + d * 0.05], { ch: h * 0.04 }); // vạt chính trắng
  b.slab('gold', w * 0.16, h * 0.88, d * 0.16, [0, sy, fz + d * 0.07], { ch: h * 0.02 });     // sọc vàng trung tâm tà
  b.slab('gold', w * 0.76, h * 0.08, d * 0.17, [0, sy - h * 0.44, fz + d * 0.06], { ch: h * 0.02 }); // viền vàng đáy tà

  // G. Tà giáp hông & Giáp bảo vệ hạ bộ (Tassets & Crotch Enclosure)
  b.both((sx) => {
    b.push([sx * w * 0.60, -h * 1.20, 0], [0, 0, -sx * 0.08]);
    b.slab('plate', w * 0.32, h * 0.75, d * 1.02, [0, 0, 0], { ch: h * 0.05 });
    b.slab('gold', w * 0.34, h * 0.07, d * 1.04, [0, -h * 0.34, 0], { ch: h * 0.015 });
    b.pop();
  });
  b.slab('plate', w * 0.48, h * 0.52, d * 0.45, [0, -h * 1.20, fz * 0.6], { ch: h * 0.06 }); // khối bảo vệ hạ bộ kín

  // H. Áo choàng quý tộc sau lưng (Royal Cape)
  b.slab('plateLo', w * 1.10, h * 1.50, d * 0.12, [0, -h * 0.38, -fz - d * 0.16], { ch: h * 0.05 });
  b.slab('plateHi', w * 1.02, h * 1.40, d * 0.14, [0, -h * 0.38, -fz - d * 0.18], { ch: h * 0.05 });
  b.slab('gold', w * 1.04, h * 0.08, d * 0.16, [0, -h * 1.06, -fz - d * 0.18], { ch: h * 0.02 });

  return b.build();
}

// 5. QUẦN & KHỚP GỐI ĐỆM LỚP (Legs) — Khử 100% khe hở đầu gối khi gập chân
function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    // A. Ống cẳng chân kéo cao qua khớp gối (Shin Greave)
    b.cover('plateLo', w, h, d, 1.22, 1.30, 1.24, [0, h * 0.08, 0]);
    b.slab('plate', w * 1.26, h * 0.98, d * 1.28, [0, h * 0.02, 0], { ch: h * 0.06 });
    b.slab('gold', w * 1.30, h * 0.08, d * 1.30, [0, h * 0.46, 0], { ch: h * 0.02 });
    b.slab('gold', w * 1.30, h * 0.08, d * 1.30, [0, -h * 0.38, 0], { ch: h * 0.02 });

    // B. Khối ốp khớp gối dưới lồng vào đệm gối trên
    b.slab('plateHi', w * 1.12, h * 0.36, d * 0.34, [0, h * 0.42, d * 0.58], { ch: h * 0.05 });
    b.slab('plateHi', w * 0.20, h * 0.70, d * 0.16, [0, -h * 0.04, d * 0.65], { ch: h * 0.03 }); // sống ống chân
    return b.build();
  }

  // Mặc định: Giáp đùi (slot === 'thigh')
  b.cover('plateLo', w, h, d, 1.22, 1.22, 1.24, [0, -h * 0.06, 0]);
  b.slab('plate', w * 1.26, h * 0.86, d * 1.28, [0, h * 0.08, 0], { ch: h * 0.06 });
  b.slab('gold', w * 1.30, h * 0.09, d * 1.32, [0, h * 0.38, 0], { ch: h * 0.02 });
  b.slab('gold', w * 1.30, h * 0.08, d * 1.32, [0, -h * 0.22, 0], { ch: h * 0.02 });

  // KHỚP ĐỆM GỐI HOÀNG GIA (Articulated Knee Poleyn) — Phủ trùm xuống qua khớp gối
  const poleynY = -h * 0.48;
  b.slab('plateHi', w * 1.16, h * 0.42, d * 0.42, [0, poleynY, d * 0.58], { ch: h * 0.06 });
  b.slab('gold', w * 1.20, h * 0.08, d * 0.44, [0, poleynY + h * 0.14, d * 0.60], { ch: h * 0.02 });
  b.slab('gold', w * 0.32, h * 0.32, d * 0.45, [0, poleynY, d * 0.62], { rot: [0, 0, Math.PI / 4], ch: h * 0.03 });
  b.slab('gemRed', w * 0.14, h * 0.14, d * 0.46, [0, poleynY, d * 0.66], { rot: [0, 0, Math.PI / 4], ch: 0 });

  return b.build();
}

// 6. ỦNG HIỆP SĨ HOÀNG GIA (Feet / Sabatons) — Bọc kín bàn chân & mắt cá
function feet(w, h, d, pal) {
  const b = piece(M(pal));

  // A. Lớp lót bọc kín toàn bộ bàn chân
  b.cover('plateLo', w, h, d, 1.22, 1.52, 1.58, [0, h * 0.26, d * 0.14]);

  // B. Cổ ủng và thân ủng
  b.slab('plate', w * 1.24, h * 0.92, d * 1.56, [0, h * 0.22, d * 0.12], { ch: h * 0.08 });
  b.slab('gold', w * 1.26, h * 0.08, d * 1.58, [0, h * 0.52, d * 0.12], { ch: h * 0.02 });

  // C. Mũi ủng hiệp sĩ vát cạnh khối mạnh mẽ
  b.slab('plateHi', w * 1.16, h * 0.58, d * 0.62, [0, h * 0.02, d * 0.72], { ch: h * 0.12 });
  b.slab('gold', w * 1.18, h * 0.08, d * 0.56, [0, h * 0.24, d * 0.76], { ch: h * 0.02 });
  b.slab('gold', w * 0.24, h * 0.24, d * 0.20, [0, h * 0.12, d * 0.88], { rot: [0, 0, Math.PI / 4], ch: h * 0.02 });

  // D. Đế ủng chống trượt
  b.cover('plateLo', w, h, d, 1.26, 0.65, 1.60, [0, -h * 0.52, d * 0.12]);

  return b.build();
}

export const WARRIOR_ROYAL = { head, body, legs, feet };
```
