# Bộ Giáp Chiến Thần Spartan (Spartan War God Set - Hy Lạp Cổ Đại)

> Bộ chiến giáp huyền thoại của Chiến Thần Hy Lạp / Đấu Sĩ Spartan cổ đại (Ancient Greek Spartan Hoplite / Roman Centurion).
> - **Chất liệu**: Đồng thau cổ đại ánh kim hoàng gia (`bronze`), đồng vàng đúc nổi bắt sáng (`bronzeHi`), đồng hun cổ tối (`bronzeDk`), vải đỏ thẫm Spartan (`spartanRed`), bờm lông ngựa đỏ tươi (`spartanRedHi`), da thuộc đai chiến binh Pteruges (`leather`), đinh tán bọc vàng ròng (`goldTrim`), giáp xích lót tối (`mail`).
> - **Quy cách (Chuẩn 2026-09-08)**: 4 món hoàn chỉnh: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).
> - **Đặc trưng thiết kế**:
>   - **Mũ (Head)**: Mũ Corinthian đồng cổ đại với khe hở chữ T (Barbute / Corinthian T-Face) lộ rõ toàn bộ mắt, mũi, miệng, đỉnh mũ mang bờm lông ngựa đỏ rực hình quạt uốn lượn uy dũng (Transverse Horsehair Crest).
>   - **Áo giáp (Body)**: Giáp ngực đồng cơ bắp vạm vỡ đối xứng 100% (Anatomical Muscle Cuirass / Thorax), dải khăn choàng đỏ vắt ngang ngực (Chlamys), cầu vai đồng vòm chạm khắc hoa văn kèm tua da rủ che khớp vai, thắt lưng da mặt khóa đầu sư tử vàng, váy chiến binh 2 tầng (váy đỏ xếp ly Spartan + dải tua da Pteruges chóp giọt nước mạ vàng), áo choàng đỏ buông dài sau lưng.
>   - **Quần (Legs)**: Quần đùi da chiến binh, giáp ống chân đồng thau chạm khắc Hy Lạp (Knides / Greaves) với ốp đầu gối phù điêu mặt Sư tử hoàng kim và sống gờ dọc ống chân.
>   - **Giày (Feet)**: Chiến hài Caligae La Mã/Hy Lạp với mũi bọc đồng phân đốt, dây đai da đan chéo cổ chân và đế da dày chống trượt.

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// BỘ GIÁP CHIẾN THẦN SPARTAN (Spartan War God Set)
// Chuẩn kiến trúc 2026-09-08: head, body, legs, feet
// ═══════════════════════════════════════════════════════════════════════════

const M = (pal) => ({
  bronze:       { color: 0xc49a32, metalness: 0.88, roughness: 0.30 }, // Đồng thau vàng kim cổ đại (nền chính)
  bronzeHi:     { color: 0xedc760, metalness: 0.94, roughness: 0.20 }, // Đồng vàng sáng bắt sáng phù điêu
  bronzeDk:     { color: 0x735515, metalness: 0.82, roughness: 0.45 }, // Đồng hun cổ tối trong rãnh
  spartanRed:   { color: 0x9e1724, metalness: 0.08, roughness: 0.85 }, // Vải đỏ Spartan / Bờm lông ngựa
  spartanRedHi: { color: 0xc92434, metalness: 0.10, roughness: 0.80 }, // Đỏ tươi ngọn bờm lông ngựa
  spartanRedDk: { color: 0x5a0b13, metalness: 0.05, roughness: 0.92 }, // Đỏ thẫm nếp gấp áo choàng
  leather:      { color: 0x321e14, metalness: 0.10, roughness: 0.82 }, // Da bò nâu đậm (dải tua Pteruges)
  leatherHi:    { color: 0x523324, metalness: 0.12, roughness: 0.78 }, // Da nâu sáng
  goldTrim:     { color: 0xf3c846, metalness: 0.96, roughness: 0.18 }, // Vàng ròng nẹp viền & chóp tua
  mail:         { color: 0x242830, metalness: 0.75, roughness: 0.45 }, // Giáp lót tối
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. MŨ CHIẾN BINH SPARTAN / CORINTHIAN HELMET (Head)
// Khung mũ hở mặt hình chữ T (Corinthian Open T-Face) — Lộ rõ mắt, mũi, miệng
// Bờm lông ngựa đỏ uốn lượn hình quạt từ trán ra gáy (Transverse Crest)
// ─────────────────────────────────────────────────────────────────────────────
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // 1. Nóc mũ vòm đồng thau che đỉnh đầu
  b.slab('bronze', w * 1.15, h * 0.36, d * 1.16, [0, h * 0.38, 0], { ch: h * 0.08 });
  b.slab('bronzeHi', w * 0.14, h * 0.42, d * 1.10, [0, h * 0.48, 0], { ch: h * 0.03 }); // sống mũ giữa

  // 2. Phần gáy và đầu sau bọc kín (Nape Guard)
  b.slab('bronze', w * 1.15, h * 0.78, d * 0.62, [0, -h * 0.05, -d * 0.28], { ch: h * 0.06 });
  b.slab('bronzeDk', w * 1.10, h * 0.36, d * 0.52, [0, -h * 0.34, -d * 0.32], { ch: h * 0.05 });

  // 3. Hai bên thái dương & vành tai bọc kín (Sides)
  b.both((sx) => {
    b.slab('bronze', w * 0.22, h * 0.72, d * 1.05, [sx * w * 0.48, -h * 0.05, -d * 0.04], { ch: h * 0.04 });
  });

  // 4. Vành trán trên mắt (Forehead Brow) có hoa văn nẹp vàng
  b.slab('bronze', w * 1.15, h * 0.16, d * 0.24, [0, h * 0.26, d * 0.47], { ch: h * 0.03 });
  b.slab('bronzeHi', w * 1.17, h * 0.07, d * 0.26, [0, h * 0.19, d * 0.48], { ch: h * 0.015 }); // gờ vàng nẹp trán
  // Đỉnh nẹp trán nhọn chữ V nhẹ giữa 2 chân mày (không che mắt, mũi, miệng)
  b.slab('bronzeHi', w * 0.14, h * 0.07, d * 0.10, [0, h * 0.165, d * 0.52], { ch: w * 0.02 });

  // 5. Hai tấm ốp má Corinthian tạo khe hở chữ T lộ rõ mặt (Cheek Guards forming T-Opening)
  // Khe hở giữa 2 má mở rộng: Mắt, mũi, miệng, cằm ở giữa hoàn toàn LỘ RÕ, KHÔNG BỊ CHE!
  const cheekW = w * 0.22;
  const cheekH = h * 0.54;
  const cheekX = w * 0.46;
  const cheekY = -h * 0.14;
  const cheekZ = d * 0.54;

  b.both((sx) => {
    b.slab('bronze', cheekW, cheekH, d * 0.12, [sx * cheekX, cheekY, cheekZ], { ch: h * 0.04 });
    // Viền vàng chạm khắc dọc mép trong ốp má
    b.slab('goldTrim', w * 0.04, cheekH * 0.95, d * 0.13, [sx * (cheekX - cheekW * 0.42), cheekY, cheekZ], { ch: 0 });
    // Viền vàng vát đáy quai hàm
    b.slab('goldTrim', cheekW, h * 0.05, d * 0.13, [sx * cheekX, cheekY - cheekH * 0.45, cheekZ], { ch: 0 });
  });

  // 6. Vòng nẹp cổ chân mũ bằng đồng ôm gáy
  b.slab('bronzeDk', w * 1.18, h * 0.08, d * 0.90, [0, -h * 0.46, -d * 0.14], { ch: h * 0.02 });

  // 7. BỜM LÔNG NGỰA SPARTAN ĐỎ RỰC VĨ ĐẠI (Massive Transverse Horsehair Crest)
  // Khay giữ chân bờm bằng đồng thau vàng (Crest Channel Holder)
  b.slab('bronzeHi', w * 0.16, h * 0.18, d * 1.30, [0, h * 0.56, 0], { ch: h * 0.03 });
  b.slab('goldTrim', w * 0.18, h * 0.05, d * 1.32, [0, h * 0.64, 0], { ch: 0 });

  // Các phiến bờm lông ngựa đỏ rực uốn lượn hình quạt từ trán ra sau gáy
  // Tầng 1: Đỉnh bờm trước trán vươn cao
  b.slab('spartanRed', w * 0.12, h * 0.44, d * 0.38, [0, h * 0.78, d * 0.42], { rot: [0.38, 0, 0], ch: w * 0.02 });
  b.slab('spartanRedHi', w * 0.06, h * 0.46, d * 0.36, [0, h * 0.80, d * 0.42], { rot: [0.38, 0, 0], ch: 0 });

  // Tầng 2: Đỉnh vòm bờm cao nhất ở trung tâm
  b.slab('spartanRed', w * 0.13, h * 0.58, d * 0.48, [0, h * 0.95, 0], { rot: [0.05, 0, 0], ch: w * 0.02 });
  b.slab('spartanRedHi', w * 0.07, h * 0.60, d * 0.46, [0, h * 0.97, 0], { rot: [0.05, 0, 0], ch: 0 });

  // Tầng 3: Bờm uốn lượn cong đổ về sau gáy
  b.slab('spartanRed', w * 0.12, h * 0.50, d * 0.42, [0, h * 0.82, -d * 0.40], { rot: [-0.35, 0, 0], ch: w * 0.02 });
  b.slab('spartanRedHi', w * 0.06, h * 0.52, d * 0.40, [0, h * 0.84, -d * 0.40], { rot: [-0.35, 0, 0], ch: 0 });

  // Tầng 4: Đuôi bờm ngựa buông dài ra sau lưng
  b.slab('spartanRed', w * 0.10, h * 0.38, d * 0.32, [0, h * 0.55, -d * 0.68], { rot: [-0.70, 0, 0], ch: w * 0.02 });
  b.slab('spartanRedDk', w * 0.08, h * 0.32, d * 0.28, [0, h * 0.32, -d * 0.82], { rot: [-0.90, 0, 0], ch: 0 });

  return b.build();
}

// Helper cẳng tay (slot === 'forearm')
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  // Ống cẳng tay đồng thau chạm khắc Hy Lạp (Greek Vambrace)
  b.cover('bronze', w, h, d, 1.18, 1.15, 1.18, [0, -h * 0.04, 0]);
  // Viền vàng khuỷu tay và cổ tay
  b.slab('goldTrim', w * 1.22, h * 0.09, d * 1.22, [0, h * 0.36, 0], { ch: h * 0.02 });
  b.slab('goldTrim', w * 1.22, h * 0.08, d * 1.22, [0, -h * 0.44, 0], { ch: h * 0.02 });
  // Phù điêu nổi vàng bắt sáng trên mu cẳng tay
  b.slab('bronzeHi', w * 0.70, h * 0.62, d * 0.10, [0, -h * 0.04, d * 0.58], { ch: h * 0.04 });
  b.slab('goldTrim', w * 0.25, h * 0.40, d * 0.12, [0, -h * 0.04, d * 0.61], { ch: w * 0.03 });
  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ÁO GIÁP CHIẾN THẦN SPARTAN (Body)
// Ngực cơ bắp đồng thau chạm phù điêu + Khăn choàng Chlamys + Váy Pteruges + Áo choàng đỏ
// ─────────────────────────────────────────────────────────────────────────────
export function body(w, h, d, pal, slot) {
  if (slot === 'forearm') return forearmArmor(w, h, d, pal);

  if (slot === 'upperArm') {
    const b = piece(M(pal));
    // Tay áo lót đỏ Spartan
    b.cover('spartanRed', w, h, d, 1.14, 1.45, 1.14, [0, h * 0.06, 0]);
    // Vòng nẹp đồng bắp tay trên
    b.slab('bronzeHi', w * 1.18, h * 0.12, d * 1.18, [0, h * 0.40, 0], { ch: h * 0.02 });
    // Tua da Pteruges rủ quanh bắp tay
    b.both((sz) => {
      b.slab('leather', w * 0.40, h * 0.48, d * 0.08, [0, h * 0.12, sz * d * 0.56], { ch: w * 0.04 });
      b.slab('goldTrim', w * 0.28, h * 0.10, d * 0.09, [0, -h * 0.14, sz * d * 0.56], { ch: 0 });
    });
    return b.build();
  }

  const b = piece(M(pal));
  const fz = d * 0.58;

  // ── 1. Cốt thân đồng thau bọc kín 360° (Muscle Cuirass Base) ──
  b.slab('bronzeDk', w * 0.56, h * 0.44, d * 0.86, [0, h * 0.64, 0], { ch: h * 0.08 }); // cổ giáp cao
  b.slab('goldTrim', w * 0.64, h * 0.09, d * 0.94, [0, h * 0.46, 0], { ch: h * 0.02 });     // vòng cổ vàng
  b.cover('bronze', w, h, d, 1.24, 1.06, 1.26, [0, 0, 0]);                                // thân giáp chính
  b.slab('bronze', w * 1.18, h * 0.65, d * 1.20, [0, -h * 0.82, 0], { ch: h * 0.06 });     // bụng dưới nối váy

  // ── 2. KHĂN CHOÀNG ĐỎ VẮT QUA VAI & NGỰC (Chlamys Drape) ──
  b.slab('spartanRed', w * 0.92, h * 0.18, d * 0.18, [0, h * 0.36, fz + d * 0.06], { rot: [0.08, 0, 0], ch: h * 0.04 });
  b.slab('spartanRedDk', w * 0.80, h * 0.12, d * 0.14, [0, h * 0.26, fz + d * 0.08], { ch: h * 0.03 });

  // ── 3. GIÁP NGỰC CƠ BẮP ĐỒNG THAU CHẠM PHÙ ĐIÊU (Embossed Muscle Thorax) ──
  const pecW = w * 0.42;
  const pecH = h * 0.36;
  const pecX = w * 0.24;
  const pecY = h * 0.16;

  b.both((sx) => {
    // Tấm cơ ngực đồng đúc nổi
    b.slab('bronzeHi', pecW, pecH, d * 0.18, [sx * pecX, pecY, fz + d * 0.02], { ch: h * 0.06 });
    // Hoa văn chạm nổi hoàng kim ôm bờ trên cơ ngực
    b.slab('goldTrim', pecW * 0.95, h * 0.08, d * 0.08, [sx * pecX, pecY + pecH * 0.38, fz + d * 0.08], {
      rot: [0, 0, -sx * 0.20],
      ch: h * 0.02
    });
    // Gờ nẹp đồng ôm chân cơ ngực
    b.slab('bronzeDk', pecW * 0.90, h * 0.06, d * 0.08, [sx * pecX, pecY - pecH * 0.42, fz + d * 0.08], {
      rot: [0, 0, sx * 0.12],
      ch: h * 0.015
    });
  });

  // Cơ bụng 6 múi đúc đồng sắc nét (2 cột x 3 hàng)
  const abW = w * 0.20;
  const abH = h * 0.11;
  const abX = w * 0.13;
  const abRowY = [-h * 0.12, -h * 0.24, -h * 0.36];

  abRowY.forEach((ry) => {
    b.both((sx) => {
      b.slab('bronzeHi', abW, abH, d * 0.14, [sx * abX, ry, fz + d * 0.02], { ch: h * 0.025 });
    });
  });

  // Rãnh sống ngực và rãnh bụng trung tâm chạm chỉ đồng tối
  b.slab('bronzeDk', w * 0.06, h * 0.60, d * 0.08, [0, -h * 0.08, fz + d * 0.06], { ch: 0 });
  b.both((sx) => {
    b.slab('bronzeDk', w * 0.32, h * 0.04, d * 0.06, [sx * (w * 0.20), h * 0.01, fz + d * 0.06], { rot: [0, 0, sx * 0.12], ch: 0 });
  });

  // ── 4. CẦU VAI ĐỒNG THAU CHẠM HOA VĂN & TUA DA (Spaulders with Pteruges) ──
  b.both((sx) => {
    // Tầng đệm vai che nách
    b.slab('bronzeDk', w * 0.52, h * 0.68, d * 1.50, [sx * w * 0.88, h * 0.06, 0], { ch: h * 0.08 });
    // Tấm vòm cầu vai chính chạm khắc sư tử
    b.slab('bronze', w * 0.62, h * 0.36, d * 1.62, [sx * w * 0.80, h * 0.44, 0], { ch: h * 0.10 });
    b.slab('bronzeHi', w * 0.52, h * 0.24, d * 1.45, [sx * w * 0.78, h * 0.62, 0], { ch: h * 0.08 });
    b.slab('goldTrim', w * 0.66, h * 0.06, d * 1.64, [sx * w * 0.80, h * 0.28, 0], { ch: h * 0.02 });

    // Tua da Pteruges rủ từ cầu vai che bắp tay
    b.slab('leather', w * 0.18, h * 0.52, d * 0.40, [sx * w * 0.94, h * 0.10, d * 0.30], { ch: w * 0.02 });
    b.slab('leather', w * 0.18, h * 0.56, d * 0.40, [sx * w * 0.96, h * 0.08, 0], { ch: w * 0.02 });
    b.slab('leather', w * 0.18, h * 0.52, d * 0.40, [sx * w * 0.94, h * 0.10, -d * 0.30], { ch: w * 0.02 });
    // Khuy vàng chóp tua da vai
    b.slab('goldTrim', w * 0.12, h * 0.08, d * 0.38, [sx * w * 0.95, -h * 0.18, 0], { ch: 0 });

    // Khuy cài áo choàng vai tròn mạ vàng (Fibula Clasp)
    b.cyl('goldTrim', w * 0.14, w * 0.14, d * 0.08, [sx * w * 0.44, h * 0.44, fz + d * 0.06], { rot: [Math.PI / 2, 0, 0] });
    b.sphere('bronzeHi', w * 0.06, [sx * w * 0.44, h * 0.44, fz + d * 0.11]);
  });

  // ── 5. THẮT LƯNG CHIẾN BINH & VÁY TUA PTERUGES HY LẠP ──
  const beltZ = d * 0.62;
  b.slab('leather', w * 1.24, h * 0.16, d * 1.25, [0, -h * 0.46, 0], { ch: h * 0.02 });
  // Mặt khóa thắt lưng chạm đầu sư tử vàng
  const buckleW = w * 0.28;
  const buckleH = h * 0.20;
  b.slab('goldTrim', buckleW, buckleH, d * 0.05, [0, -h * 0.46, beltZ], { ch: h * 0.04 });
  b.sphere('bronzeHi', w * 0.08, [0, -h * 0.46, beltZ + 0.03]); // ngọc tâm mặt khóa

  // TẦNG 1 VÁY: Váy vải đỏ Spartan xếp ly bên trong (Crimson Pleated War Tunic)
  b.slab('spartanRed', w * 1.16, h * 0.82, d * 1.18, [0, -h * 0.92, 0], { ch: h * 0.04 });
  b.slab('spartanRedDk', w * 1.18, h * 0.06, d * 1.20, [0, -h * 1.34, 0], { ch: 0 }); // gấu váy tua đỏ

  // TẦNG 2 VÁY: Các dải tua da Pteruges phủ ngoài với chóp vàng hình giọt nước
  const stripW = w * 0.18;
  const stripH = h * 0.80;
  const stripZ = beltZ + 0.01;
  const stripY = -h * 0.92;

  // 5 dải tua da phía trước
  for (let i = -2; i <= 2; i++) {
    const sx = i * w * 0.21;
    b.slab('leather', stripW, stripH, d * 0.04, [sx, stripY, stripZ], { ch: stripW * 0.15 });
    // Chóp bọc vàng đính hạt ở đầu dải da
    b.slab('goldTrim', stripW * 0.70, h * 0.14, d * 0.05, [sx, stripY - stripH * 0.42, stripZ + 0.005], { ch: w * 0.02 });
    b.sphere('goldTrim', w * 0.035, [sx, stripY - stripH * 0.38, stripZ + 0.015]);
  }

  // Tà da hai bên hông
  b.both((sx) => {
    b.slab('leather', stripW, stripH * 0.90, d * 0.04, [sx * w * 0.56, stripY, 0], { rot: [0, Math.PI / 2, 0], ch: stripW * 0.15 });
    b.slab('goldTrim', stripW * 0.70, h * 0.14, d * 0.05, [sx * w * 0.56, stripY - stripH * 0.38, 0], { rot: [0, Math.PI / 2, 0], ch: w * 0.02 });
  });

  // Tà da phía sau lưng
  for (let i = -2; i <= 2; i++) {
    const sx = i * w * 0.21;
    b.slab('leather', stripW, stripH * 0.85, d * 0.04, [sx, stripY, -stripZ], { ch: stripW * 0.15 });
  }

  // Tấm đũng trong che hở
  for (const sz of [1, -1]) {
    b.slab('leather', w * 0.46, h * 0.42, d * 0.14, [0, -h * 1.48, sz * d * 0.3], { ch: h * 0.04 });
  }

  // ── 6. ÁO CHOÀNG ĐỎ CHIẾN THẦN SPARTAN SAU LƯNG (Flowing Spartan Cape) ──
  const capeZ = -fz - d * 0.05;
  b.slab('spartanRed', w * 1.20, h * 0.18, d * 0.20, [0, h * 0.42, capeZ + d * 0.04], { ch: h * 0.03 });
  b.both((sx) => {
    b.slab('spartanRed', w * 0.62, h * 1.75, d * 0.08, [sx * w * 0.38, -h * 0.36, capeZ], { ch: h * 0.04, rot: [0.06, 0, 0] });
  });
  b.slab('spartanRed', w * 0.65, h * 1.70, d * 0.08, [0, -h * 0.36, capeZ - 0.01], { ch: h * 0.04, rot: [0.06, 0, 0] });
  // Nếp gấp tà áo choàng mềm mại
  b.slab('spartanRedDk', w * 1.22, h * 0.10, d * 0.09, [0, -h * 1.25, capeZ], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUẦN & ỐP ỐNG CHÂN CHIẾN BINH (Legs)
// Đùi quấn đai da chiến binh + Ốp ống chân Greaves đồng thau chạm đầu Sư tử
// ─────────────────────────────────────────────────────────────────────────────
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    // Ống cẳng chân
    b.cover('mail', w, h, d, 1.08, 1.02, 1.14, [0, 0, 0]);

    // Giáp ống chân đồng thau chạm khắc Hy Lạp (Greek Greaves - Knides)
    b.cover('bronze', w, h, d, 1.16, 1.06, 1.20, [0, 0, 0]);

    // Đầu gối phù điêu mặt Sư tử hoàng kim (Lion Knee Guard / Poleyn)
    b.slab('bronzeHi', w * 0.76, h * 0.42, d * 0.18, [0, h * 0.44, d * 0.62], { ch: h * 0.06 });
    b.sphere('goldTrim', w * 0.20, [0, h * 0.46, d * 0.72]); // chỏm nổi mặt sư tử
    b.slab('bronzeDk', w * 0.45, h * 0.10, d * 0.06, [0, h * 0.36, d * 0.74], { ch: 0 });

    // Sống giáp cẳng chân vuốt nhọn chạy dọc ống chân
    b.slab('bronzeHi', w * 0.22, h * 0.68, d * 0.10, [0, -h * 0.08, d * 0.62], { ch: w * 0.03 });
    b.slab('goldTrim', w * 0.08, h * 0.60, d * 0.11, [0, -h * 0.08, d * 0.64], { ch: 0 });

    // Vòng nẹp đồng cổ chân
    b.slab('goldTrim', w * 1.20, h * 0.08, d * 1.24, [0, -h * 0.42, 0], { ch: h * 0.02 });
    return b.build();
  }

  // Đùi (thigh / default)
  b.cover('mail', w, h, d, 1.08, 1.04, 1.12, [0, 0, 0]);
  // Gấu váy đỏ lót chạm chân đùi
  b.slab('spartanRed', w * 1.16, h * 0.18, d * 1.18, [0, h * 0.40, 0], { ch: h * 0.02 });
  // Dây đai da quấn đùi chiến binh
  b.slab('leather', w * 1.14, h * 0.10, d * 1.16, [0, h * 0.10, 0], { ch: h * 0.02 });
  b.slab('goldTrim', w * 0.18, h * 0.12, d * 0.08, [0, h * 0.10, d * 0.60], { ch: 0 }); // khuy đồng
  b.slab('leather', w * 1.14, h * 0.08, d * 1.16, [0, -h * 0.20, 0], { ch: h * 0.02 });
  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GIÀY CHIẾN BINH SPARTAN / CALIGAE SANDALS (Feet)
// Chiến hài cổ đại — Mũi đồng phân đốt + Dây đan da chéo mu chân + Đế chống trượt
// ─────────────────────────────────────────────────────────────────────────────
export function feet(w, h, d, pal) {
  const b = piece(M(pal));

  // Lót mu bàn chân
  b.cover('leather', w, h, d, 1.16, 1.35, 1.45, [0, h * 0.20, d * 0.10]);

  // Mũi ủng bọc đồng vàng chiến binh
  b.slab('bronze', w * 1.14, h * 0.48, d * 0.46, [0, h * 0.02, d * 0.70], { ch: h * 0.10 });
  b.slab('bronzeHi', w * 1.16, h * 0.12, d * 0.40, [0, h * 0.20, d * 0.72], { ch: h * 0.02 });
  b.slab('goldTrim', w * 0.45, h * 0.14, d * 0.22, [0, h * 0.02, d * 0.90], { ch: h * 0.02 });

  // Dây đai da đan chéo cổ chân (Caligae Strapping)
  b.slab('leather', w * 1.20, h * 0.10, d * 1.22, [0, h * 0.42, 0], { ch: h * 0.02 });
  b.slab('goldTrim', w * 0.18, h * 0.12, d * 0.06, [0, h * 0.42, d * 0.62], { ch: 0 });

  // Đế da đúc dày chống trượt
  b.cover('bronzeDk', w, h, d, 1.18, 0.65, 1.50, [0, -h * 0.50, d * 0.08]);

  return b.build();
}

export const SPARTAN_WAR_GOD = { head, body, legs, feet };
```
