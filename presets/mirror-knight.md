# Bộ Giáp Hiệp Sĩ Gương Tinh Thể (Crystal Mirror Knight Set)

> Bộ chiến giáp huyền ảo được chế tác hoàn toàn từ các phiến kính gương đa diện lấp lánh phản chiếu ánh sáng (Mosaic Mirror Shards / Crystal Diamond Paladin).
> - **Chất liệu**: Thép gương bạc sáng bóng đa diện (`mirrorPlate`), mặt vát pha lê kim cương bắt sáng lấp lánh (`mirrorHi`), lăng kính ánh lam kim cương phản quang (`mirrorPrism`), rãnh kim loại tối tương phản (`mirrorDark`), nẹp viền bạch kim sáng bóng (`chromeTrim`), kính mắt chữ V vàng hổ phách phát sáng rực rỡ (`visorGlow`), vải áo choàng khảm vảy gương (`capeMirror`), và bộ lót tối (`innerSuit`).
> - **Quy cách (Chuẩn 2026-09-08)**: 4 món hoàn chỉnh: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).
> - **Cải tiến thiết kế (Update 2026-09-15)**:
>   - **Mũ Full Face 100% (Head)**: Mũ giáp gương bọc kín 100% đầu và mặt (không hở da hay lộ mắt/mũi/miệng), mặt nạ gương vát đa giác góc cạnh, khe kính ngắm chữ V vàng hổ phách rực sáng (Amber V-Visor) và cặp vây tai nhọn vuốt chéo ra sau (Pointed Ear-Fin Winglets).
>   - **Màu sắc sáng bóng rực rỡ**: Tông màu bạc gương / pha lê kim cương bắt sáng lộng lẫy, tăng cường độ phản chiếu ánh kim và ánh lăng kính sapphire lam.
>   - **Cầu vai thon gọn, vừa vặn (Body)**: Thu gọn kích thước cầu vai ôm sát khớp tay, loại bỏ khối cồng kềnh, giữ lại chóp vây vát nhọn thanh thoát đúng tỷ lệ nhân vật.
>   - **Áo giáp & Áo choàng gương**: Dải sống gương kim cương trung tâm ngực & bụng đối xứng 100%, thắt lưng mặt khóa thoi gương và áo choàng gương lộng lẫy xòe rộng sau lưng.
>   - **Quần & Giày (Legs & Feet)**: Giáp đùi gương, giáp ống chân với đầu gối kim cương đa diện và giày giáp Sabatons vát mũi nhọn phản quang.

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// BỘ GIÁP HIỆP SĨ GƯƠNG TINH THỂ (Crystal Mirror Knight Set)
// Chuẩn kiến trúc 2026-09-08: head, body, legs, feet
// ═══════════════════════════════════════════════════════════════════════════

const M = (pal) => ({
  mirrorPlate: { color: 0xe6edf5, metalness: 0.68, roughness: 0.18 }, // Bạc gương sáng bóng đa diện
  mirrorHi:    { color: 0xffffff, metalness: 0.78, roughness: 0.10, emissive: 0x334455, emissiveIntensity: 0.40 }, // Pha lê kim cương siêu sáng lấp lánh
  mirrorPrism: { color: 0xb8e2fc, metalness: 0.60, roughness: 0.12, emissive: 0x2b6cb0, emissiveIntensity: 0.55 }, // Lăng kính ánh lam kim cương phản quang
  mirrorDark:  { color: 0x242d38, metalness: 0.50, roughness: 0.40 }, // Rãnh kim loại tối tương phản
  chromeTrim:  { color: 0xd5e2ef, metalness: 0.75, roughness: 0.16 }, // Nẹp viền bạch kim sáng bóng
  visorGlow:   { color: 0xfff066, metalness: 0.10, roughness: 0.10, emissive: 0xffc400, emissiveIntensity: 2.8 }, // Kính mắt chữ V vàng hổ phách rực sáng
  innerSuit:   { color: 0x141820, metalness: 0.30, roughness: 0.85 }, // Lớp lót tối kín cổ & nách
  capeMirror:  { color: 0xe0ecf8, metalness: 0.65, roughness: 0.20, emissive: 0x253545, emissiveIntensity: 0.30 }, // Áo choàng vảy gương sáng
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. MŨ GƯƠNG TINH THỂ FULL FACE (Head)
// Kín mặt 100% + Mặt nạ gương vát đa diện + Kính ngắm chữ V vàng hổ phách + Vây tai nhọn
// ─────────────────────────────────────────────────────────────────────────────
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // 1. Vỏ mũ bọc kín 100% đầu & gáy (Full Helmet Shell)
  b.cover('mirrorPlate', w, h, d, 1.15, 1.08, 1.16, [0, h * 0.04, 0]);

  // Nóc vòm mũ và sống giữa vát nhọn
  b.slab('mirrorPlate', w * 1.12, h * 0.32, d * 1.14, [0, h * 0.42, 0], { ch: h * 0.08 });
  b.slab('mirrorHi', w * 0.14, h * 0.40, d * 1.12, [0, h * 0.48, 0], { ch: h * 0.03 });

  // 2. MẶT NẠ FULL FACE BỌC KÍN 100% KHUÔN MẶT (Sleek Faceted Mirror Faceplate)
  // Tấm mặt nạ gương chính phẳng mượt che kín toàn bộ mắt, mũi, miệng (không lộ da)
  b.slab('mirrorHi', w * 0.92, h * 0.68, d * 0.18, [0, -h * 0.04, d * 0.52], { ch: h * 0.06 });

  // Tấm vát má đa diện hai bên ôm gọn mặt nạ
  b.both((sx) => {
    b.slab('mirrorPlate', w * 0.24, h * 0.60, d * 0.16, [sx * w * 0.40, -h * 0.06, d * 0.50], {
      rot: [0, -sx * 0.25, 0],
      ch: h * 0.04
    });
  });

  // Tấm cằm nhọn vát tam giác góc cạnh
  b.slab('chromeTrim', w * 0.68, h * 0.28, d * 0.20, [0, -h * 0.34, d * 0.52], { ch: h * 0.05 });
  b.slab('mirrorHi', w * 0.32, h * 0.20, d * 0.14, [0, -h * 0.36, d * 0.58], { ch: h * 0.03 });

  // 3. KÍNH NGẮM CHỮ V VÀNG HỔ PHÁCH RỰC SÁNG (Amber V-Visor)
  // Đặt nổi trực tiếp trên bề mặt mặt nạ gương (fz ~ d * 0.62)
  b.both((sx) => {
    b.slab('visorGlow', w * 0.26, h * 0.07, d * 0.04, [sx * w * 0.16, h * 0.08, d * 0.62], {
      rot: [0, 0, -sx * 0.28],
      ch: 0
    });
  });
  b.slab('visorGlow', w * 0.10, h * 0.07, d * 0.05, [0, h * 0.045, d * 0.63], { ch: 0 });

  // 4. CẶP VÂY TAI NHỌN VUỐT CHÉO RA SAU (Pointed Ear-Fin Winglets)
  b.both((sx) => {
    b.push([sx * w * 0.54, h * 0.36, -d * 0.08], [-0.18, sx * 0.10, sx * 0.38]);
    b.slab('mirrorHi', w * 0.10, h * 0.46, d * 0.36, [0, h * 0.15, 0], { ch: w * 0.03 });
    b.slab('chromeTrim', w * 0.04, h * 0.50, d * 0.38, [0, h * 0.15, 0], { ch: 0 });
    b.slab('mirrorPrism', w * 0.08, h * 0.22, d * 0.24, [0, h * 0.26, 0], { ch: 0 });
    b.pop();
  });

  // 5. Nẹp cổ chân mũ bọc kín gáy
  b.slab('chromeTrim', w * 1.16, h * 0.08, d * 0.90, [0, -h * 0.46, -d * 0.14], { ch: h * 0.02 });

  return b.build();
}

// Helper cẳng tay (slot === 'forearm')
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.10, [0, 0, 0]);
  b.cover('mirrorPlate', w, h, d, 1.18, 1.15, 1.18, [0, -h * 0.04, 0]);

  // Đai nẹp chrome khuỷu và cổ tay
  b.slab('chromeTrim', w * 1.22, h * 0.08, d * 1.22, [0, h * 0.36, 0], { ch: h * 0.02 });
  b.slab('chromeTrim', w * 1.22, h * 0.08, d * 1.22, [0, -h * 0.44, 0], { ch: h * 0.02 });

  // Tấm mu cẳng tay khảm vảy gương đa diện
  b.slab('mirrorHi', w * 0.75, h * 0.62, d * 0.12, [0, -h * 0.04, d * 0.58], { ch: h * 0.04 });
  b.slab('mirrorPrism', w * 0.25, h * 0.50, d * 0.08, [0, -h * 0.04, d * 0.62], { ch: w * 0.04 });
  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ÁO GIÁP GƯƠNG TINH THỂ (Body)
// Cầu vai thon gọn vừa vặn + Ngực vảy gương đối xứng 100% + Dải sống kim cương + Áo choàng
// ─────────────────────────────────────────────────────────────────────────────
export function body(w, h, d, pal, slot) {
  if (slot === 'forearm') return forearmArmor(w, h, d, pal);

  if (slot === 'upperArm') {
    const b = piece(M(pal));
    b.cover('innerSuit', w, h, d, 1.12, 1.45, 1.12, [0, h * 0.06, 0]);
    b.slab('mirrorPlate', w * 1.16, h * 0.50, d * 1.16, [0, h * 0.20, 0], { ch: h * 0.04 });
    b.slab('chromeTrim', w * 1.20, h * 0.07, d * 1.20, [0, h * 0.42, 0], { ch: h * 0.02 });
    b.slab('mirrorHi', w * 0.14, h * 0.44, d * 0.65, [0, h * 0.20, 0], { ch: h * 0.03 });
    return b.build();
  }

  const b = piece(M(pal));
  const fz = d * 0.58;

  // ── 1. Cốt thân gương bọc kín 360° ──
  b.slab('innerSuit', w * 0.56, h * 0.44, d * 0.86, [0, h * 0.64, 0], { ch: h * 0.08 }); // cổ giáp cao
  b.slab('chromeTrim', w * 0.64, h * 0.09, d * 0.94, [0, h * 0.46, 0], { ch: h * 0.02 }); // vòng cổ chrome
  b.cover('mirrorPlate', w, h, d, 1.22, 1.05, 1.24, [0, 0, 0]);                           // thân giáp chính
  b.slab('mirrorPlate', w * 1.16, h * 0.65, d * 1.18, [0, -h * 0.82, 0], { ch: h * 0.06 });// bụng dưới & hông

  // ── 2. TẤM NGỰC KHẢM GƯƠNG ĐA DIỆN ĐỐI XỨNG 100% ──
  const pecW = w * 0.40;
  const pecH = h * 0.36;
  const pecX = w * 0.23;
  const pecY = h * 0.18;

  b.both((sx) => {
    // Khối cơ ngực vát gương
    b.slab('mirrorHi', pecW, pecH, d * 0.16, [sx * pecX, pecY, fz + d * 0.02], { ch: h * 0.06 });
    // Nẹp viền chrome ôm xương đòn
    b.slab('chromeTrim', pecW * 0.96, h * 0.07, d * 0.08, [sx * pecX, pecY + pecH * 0.40, fz + d * 0.08], {
      rot: [0, 0, -sx * 0.24],
      ch: h * 0.02
    });
    // Gờ nẹp tối đáy cơ ngực
    b.slab('mirrorDark', pecW * 0.90, h * 0.05, d * 0.08, [sx * pecX, pecY - pecH * 0.40, fz + d * 0.08], {
      rot: [0, 0, sx * 0.14],
      ch: h * 0.015
    });
    // Phiến gương lăng kính trung tâm ngực
    b.slab('mirrorPrism', pecW * 0.50, pecH * 0.50, d * 0.05, [sx * (pecX - w * 0.03), pecY, fz + d * 0.09], {
      rot: [0, 0, sx * 0.20],
      ch: h * 0.02
    });
  });

  // ── 3. DẢI SỐNG GƯƠNG HÌNH HỌC TRUNG TÂM (Central Geometric Mirror Spine) ──
  b.slab('chromeTrim', w * 0.14, h * 0.82, d * 0.08, [0, -h * 0.05, fz + d * 0.06], { ch: 0 });
  b.slab('mirrorHi', w * 0.08, h * 0.78, d * 0.07, [0, -h * 0.05, fz + d * 0.08], { ch: 0 });

  // Chuỗi họa tiết kim cương dọc sống ngực
  const diamondY = [h * 0.26, h * 0.12, -h * 0.02, -h * 0.16, -h * 0.30];
  diamondY.forEach((dy) => {
    b.slab('mirrorPrism', w * 0.11, w * 0.11, d * 0.03, [0, dy, fz + d * 0.095], {
      rot: [0, 0, Math.PI / 4],
      ch: w * 0.02
    });
  });

  // ── 4. CƠ BỤNG KHẢM GƯƠNG ĐA DIỆN 6 MÚI ──
  const abW = w * 0.19;
  const abH = h * 0.10;
  const abX = w * 0.13;
  const abRowY = [-h * 0.12, -h * 0.24, -h * 0.36];

  abRowY.forEach((ry) => {
    b.both((sx) => {
      b.slab('mirrorHi', abW, abH, d * 0.14, [sx * abX, ry, fz + d * 0.02], { ch: h * 0.025 });
    });
  });

  // ── 5. CẦU VAI THON GỌN VỪA VẶN & CÁNH VÂY SẮC BÉN (Sleek Compact Pauldrons) ──
  // (Đã tinh chỉnh thu gọn kích thước vai, ôm sát khớp vai, không còn bị to cồng kềnh)
  b.both((sx) => {
    // Tầng đệm vai ôm gọn vai
    b.slab('innerSuit', w * 0.42, h * 0.48, d * 1.25, [sx * w * 0.62, h * 0.12, 0], { ch: h * 0.06 });
    // Tấm vòm cầu vai chính thon gọn
    b.slab('mirrorPlate', w * 0.46, h * 0.26, d * 1.28, [sx * w * 0.60, h * 0.38, 0], { ch: h * 0.08 });
    b.slab('chromeTrim', w * 0.48, h * 0.05, d * 1.30, [sx * w * 0.60, h * 0.26, 0], { ch: h * 0.02 });
    b.slab('mirrorHi', w * 0.38, h * 0.18, d * 1.18, [sx * w * 0.58, h * 0.50, 0], { ch: h * 0.06 });

    // Vây nhọn vát vươn cao nhẹ nhàng ở đỉnh vai ngoài (Sleek Angular Fin)
    b.slab('mirrorHi', w * 0.12, h * 0.30, d * 0.34, [sx * w * 0.74, h * 0.56, 0], {
      rot: [0, 0, -sx * 0.42],
      ch: w * 0.02
    });
    b.slab('chromeTrim', w * 0.06, h * 0.32, d * 0.36, [sx * w * 0.76, h * 0.57, 0], {
      rot: [0, 0, -sx * 0.42],
      ch: 0
    });
  });

  // ── 6. THẮT LƯNG & TÀ GIÁP HÔNG/ĐŨNG ──
  const beltZ = d * 0.62;
  b.slab('chromeTrim', w * 1.22, h * 0.14, d * 1.24, [0, -h * 0.46, 0], { ch: h * 0.02 });
  // Mặt khóa thắt lưng hình thoi gương
  b.slab('mirrorPlate', w * 0.26, h * 0.20, d * 0.06, [0, -h * 0.46, beltZ], { ch: h * 0.04 });
  b.slab('mirrorHi', w * 0.16, w * 0.16, d * 0.05, [0, -h * 0.46, beltZ + 0.02], { rot: [0, 0, Math.PI / 4], ch: w * 0.03 });
  b.slab('mirrorPrism', w * 0.07, w * 0.07, d * 0.06, [0, -h * 0.46, beltZ + 0.03], { rot: [0, 0, Math.PI / 4], ch: 0 });

  // Tà giáp đũng trước kéo dài dải kim cương
  b.slab('mirrorPlate', w * 0.36, h * 0.82, d * 0.06, [0, -h * 0.94, beltZ - 0.01], { ch: h * 0.03 });
  b.slab('chromeTrim', w * 0.38, h * 0.04, d * 0.07, [0, -h * 1.34, beltZ - 0.01], { ch: 0 });
  b.slab('mirrorHi', w * 0.11, w * 0.11, d * 0.03, [0, -h * 0.80, beltZ + 0.02], { rot: [0, 0, Math.PI / 4], ch: 0 });
  b.slab('mirrorHi', w * 0.11, w * 0.11, d * 0.03, [0, -h * 1.05, beltZ + 0.02], { rot: [0, 0, Math.PI / 4], ch: 0 });

  // Tà giáp hông hai bên
  b.both((sx) => {
    b.push([sx * w * 0.54, -h * 0.94, d * 0.08], [0, sx * 0.25, -sx * 0.10]);
    b.slab('mirrorPlate', w * 0.42, h * 0.76, d * 0.12, [0, 0, 0], { ch: h * 0.05 });
    b.slab('chromeTrim', w * 0.44, h * 0.05, d * 0.13, [0, -h * 0.35, 0], { ch: 0 });
    b.slab('mirrorHi', w * 0.20, h * 0.52, d * 0.06, [0, 0, d * 0.05], { ch: 0 });
    b.pop();
  });

  // Tấm đũng trong che hở
  for (const sz of [1, -1]) {
    b.slab('innerSuit', w * 0.46, h * 0.42, d * 0.14, [0, -h * 1.48, sz * d * 0.3], { ch: h * 0.04 });
  }

  // ── 7. ÁO CHOÀNG GƯƠNG LỘNG LẪY (Majestic Mirror Shard Cloak) ──
  const capeZ = -fz - d * 0.05;
  b.slab('chromeTrim', w * 1.20, h * 0.16, d * 0.18, [0, h * 0.42, capeZ + d * 0.04], { ch: h * 0.03 });

  // Tà chính giữa
  b.slab('capeMirror', w * 0.65, h * 1.70, d * 0.08, [0, -h * 0.36, capeZ - 0.01], { ch: h * 0.04, rot: [0.06, 0, 0] });

  // Tà gương hai bên xòe rộng bay bổng đối xứng
  b.both((sx) => {
    b.slab('capeMirror', w * 0.62, h * 1.75, d * 0.08, [sx * w * 0.38, -h * 0.36, capeZ], { ch: h * 0.04, rot: [0.06, 0, sx * 0.04] });
    b.slab('mirrorHi', w * 0.45, h * 1.55, d * 0.06, [sx * w * 0.64, -h * 0.34, capeZ - d * 0.05], {
      ch: h * 0.03,
      rot: [0.08, 0, -sx * 0.12]
    });
  });

  // Các phiến vảy gương bắt sáng lấp lánh ở mép áo choàng
  for (let i = -3; i <= 3; i++) {
    b.slab('mirrorHi', w * 0.12, h * 0.18, d * 0.05, [i * w * 0.17, -h * 1.22, capeZ], { rot: [0, 0, Math.PI / 4], ch: 0 });
  }

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUẦN GƯƠNG TINH THỂ (Legs)
// Đùi khảm vảy gương + Ốp ống chân Greaves chiseled với đầu gối kim cương đa diện
// ─────────────────────────────────────────────────────────────────────────────
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('innerSuit', w, h, d, 1.08, 1.02, 1.14, [0, 0, 0]);
    b.cover('mirrorPlate', w, h, d, 1.16, 1.06, 1.20, [0, 0, 0]);

    // Ốp đầu gối kim cương đa diện (Faceted Diamond Knee Guard)
    b.slab('chromeTrim', w * 0.74, h * 0.40, d * 0.18, [0, h * 0.44, d * 0.62], { ch: h * 0.05 });
    b.slab('mirrorHi', w * 0.58, h * 0.30, d * 0.14, [0, h * 0.44, d * 0.68], { ch: h * 0.04 });
    b.slab('mirrorPrism', w * 0.22, w * 0.22, d * 0.05, [0, h * 0.44, d * 0.73], { rot: [0, 0, Math.PI / 4], ch: w * 0.02 });

    // Sống giáp cẳng chân vát sắc (Chiseled Shin Ridge)
    b.slab('mirrorHi', w * 0.24, h * 0.65, d * 0.12, [0, -h * 0.08, d * 0.62], { ch: w * 0.04 });
    b.slab('chromeTrim', w * 0.08, h * 0.60, d * 0.13, [0, -h * 0.08, d * 0.64], { ch: 0 });

    // Vành nẹp cổ chân
    b.slab('chromeTrim', w * 1.20, h * 0.08, d * 1.24, [0, -h * 0.42, 0], { ch: h * 0.02 });
    return b.build();
  }

  // Đùi (thigh)
  b.cover('innerSuit', w, h, d, 1.08, 1.04, 1.12, [0, 0, 0]);
  b.cover('mirrorPlate', w, h, d, 1.16, 1.02, 1.20, [0, 0, 0]);
  b.slab('chromeTrim', w * 1.22, h * 0.10, d * 1.24, [0, h * 0.42, 0], { ch: h * 0.02 });

  // Tấm giáp đùi trước đa diện
  b.slab('mirrorHi', w * 0.65, h * 0.48, d * 0.16, [0, -h * 0.05, d * 0.60], { ch: h * 0.06 });
  b.slab('mirrorPrism', w * 0.22, w * 0.22, d * 0.05, [0, -h * 0.05, d * 0.67], { rot: [0, 0, Math.PI / 4], ch: w * 0.02 });
  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GIÀY GƯƠNG TINH THỂ / SABATONS (Feet)
// Mũi giày giáp vát kim cương nhọn + Nẹp chrome cổ chân + Đế kim loại chống trượt
// ─────────────────────────────────────────────────────────────────────────────
export function feet(w, h, d, pal) {
  const b = piece(M(pal));

  b.cover('mirrorPlate', w, h, d, 1.18, 1.40, 1.48, [0, h * 0.20, d * 0.10]);

  // Mũi giày giáp vát đa giác nhọn (Angular Faceted Sabatons)
  b.slab('mirrorHi', w * 1.14, h * 0.50, d * 0.48, [0, h * 0.02, d * 0.70], { ch: h * 0.12 });
  b.slab('mirrorPrism', w * 0.55, h * 0.16, d * 0.26, [0, h * 0.02, d * 0.90], { ch: h * 0.03 });
  b.slab('chromeTrim', w * 1.18, h * 0.10, d * 0.42, [0, h * 0.20, d * 0.72], { ch: h * 0.02 });

  // Đai nẹp cổ chân
  b.slab('chromeTrim', w * 1.22, h * 0.09, d * 1.24, [0, h * 0.42, 0], { ch: h * 0.02 });

  // Đế giày kim loại tối chống trượt
  b.cover('mirrorDark', w, h, d, 1.20, 0.65, 1.52, [0, -h * 0.50, d * 0.08]);

  return b.build();
}

export const MIRROR_KNIGHT = { head, body, legs, feet };
```
