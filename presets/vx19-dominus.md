# Bộ Giáp Titan VX-19 Dominus (Sci-Fi Assault Armor Set)

> Bộ giáp chiến binh Titan công nghệ cao thế hệ mới dựa trên bản thiết kế concept **VX-19 -DOMINUS-** (Class: Assault, Role: Titan, Unit: Vanguard).
> - **Chất liệu**: Sợi Carbon đen nhám Titan (`carbonPlate`), gờ vát thép rèn titan xám bắt sáng (`carbonHi`), khe rãnh tối sâu (`carbonDark`), nẹp chỉ mạ vàng kim hoàng gia (`goldAccent`), vàng sáng đỉnh huy hiệu V-Wings (`goldHi`), kính ngắm HUD vàng hổ phách rực sáng (`goldGlow`), thép rèn xám nẹp khớp (`steelTrim`), và bộ đồ lót sợi tổng hợp đen tuyền (`innerSuit`).
> - **Quy cách (Chuẩn 2026-09-08)**: 4 món hoàn chỉnh: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).
> - **Đặc trưng thiết kế tinh chỉnh theo phản hồi**:
>   - **Mũ Full Face Kín 100% & Mắt Chữ V (Head)**: Mặt nạ bọc kín trọn vẹn đầu, cằm và cổ, không lộ da. Hốc mắt khoét chìm với cặp kính ngắm phát sáng tạo hình chữ V sắc lạnh hướng xuống (`\ /`), có gờ mí titan đen nẹp trên và viền mạ vàng đỡ dưới; huy hiệu V-Wings hoàng gia trên trán và bộ lọc khí thở cằm góc cạnh.
>   - **Áo giáp (Body)**: Hai bên ngực là 2 khối giáp titan nguyên khối liền mạch, bề mặt vát đa diện nam tính vững chắc (đã lược bỏ toàn bộ các thanh ghép hình thoi chéo), rãnh xương ức xẻ dọc phân tách sắc nét cùng huy hiệu V-Wings mạ vàng trang nhã; cơ bụng công nghệ nhiều tầng; cầu vai thon gọn ôm khớp; khung xương sống lưng exoskeleton và tà giáp chiến thuật.
>   - **Quần (Legs)**: Giáp đùi carbon phân lớp nẹp chỉ vàng, ốp đầu gối lục giác góc cạnh, giáp ống chân chiseled greaves vuốt sắc và ốp bắp chân sau.
>   - **Giày (Feet)**: Giày giáp chiến đấu Sabatons mũi phân đốt bọc thép titan, nẹp mu chân và đế cao su gai chống trượt.

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// BỘ CHIẾN GIÁP TITAN VX-19 DOMINUS (Sci-Fi Assault Armor Set)
// Chuẩn kiến trúc 2026-09-08: head, body, legs, feet
// ═══════════════════════════════════════════════════════════════════════════

const M = (pal) => ({
  carbonPlate: { color: 0x181b22, metalness: 0.65, roughness: 0.45 }, // Giáp sợi Carbon đen nhám Titan
  carbonHi:    { color: 0x2e3542, metalness: 0.80, roughness: 0.30 }, // Gờ vát titan xám bắt sáng
  carbonDark:  { color: 0x0d0f14, metalness: 0.50, roughness: 0.60 }, // Khe rãnh tối sâu
  innerSuit:   { color: 0x080a0d, metalness: 0.15, roughness: 0.92 }, // Bộ áo lót sợi tổng hợp đen tuyền
  goldAccent:  { color: 0xd4a438, metalness: 0.94, roughness: 0.20 }, // Nẹp chỉ mạ vàng kim hoàng gia
  goldHi:      { color: 0xf5cf58, metalness: 0.96, roughness: 0.15 }, // Vàng sáng đỉnh huy hiệu & chốt
  goldGlow:    { color: 0xffcc33, metalness: 0.10, roughness: 0.15, emissive: 0xffaa00, emissiveIntensity: 2.5 }, // Kính ngắm & đèn tín hiệu HUD vàng
  steelTrim:   { color: 0x5a6577, metalness: 0.88, roughness: 0.25 }, // Thép rèn xám nẹp khớp
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. MŨ CHIẾN BINH TITAN FULL FACE (Head)
// Kín mặt & cổ 100% + Mắt kính HUD chữ V (\ /) + Hốc mắt & nẹp mí + Huy hiệu trán
// ─────────────────────────────────────────────────────────────────────────────
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // 1. Vỏ mũ bọc kín 100% đầu & gáy, kéo sâu xuống che trọn cổ (không lộ da)
  b.cover('carbonPlate', w, h, d, 1.16, 1.14, 1.18, [0, -h * 0.02, 0]);

  // Nóc vòm mũ carbon và gờ sống giữa
  b.slab('carbonHi', w * 1.12, h * 0.30, d * 1.14, [0, h * 0.44, 0], { ch: h * 0.08 });
  b.slab('carbonHi', w * 0.16, h * 0.42, d * 1.10, [0, h * 0.48, 0], { ch: h * 0.03 });
  b.slab('goldAccent', w * 0.04, h * 0.44, d * 0.95, [0, h * 0.50, 0], { ch: 0 }); // chỉ vàng dọc đỉnh

  // 2. Mặt nạ Full Face phẳng mượt kín 100%
  b.slab('carbonPlate', w * 0.92, h * 0.72, d * 0.18, [0, -h * 0.04, d * 0.52], { ch: h * 0.06 });

  // Ốp má đa diện hai bên ôm gọn mặt nạ
  b.both((sx) => {
    b.slab('carbonHi', w * 0.24, h * 0.60, d * 0.16, [sx * w * 0.40, -h * 0.06, d * 0.50], {
      rot: [0, -sx * 0.25, 0],
      ch: h * 0.04
    });
    // Khe tản nhiệt má viền vàng
    b.slab('goldAccent', w * 0.03, h * 0.35, d * 0.17, [sx * w * 0.44, -h * 0.08, d * 0.52], {
      rot: [0, -sx * 0.25, 0],
      ch: 0
    });
  });

  // 3. HỐC KÍNH NGẮM VÀ KÍNH CHỮ V CHUẨN ĐẸP (True V-Visor & Socket)
  // Hốc kính tối hình chữ V chìm nhẹ tạo chiều sâu cho mắt
  b.slab('carbonDark', w * 0.70, h * 0.22, d * 0.06, [0, h * 0.08, d * 0.60], { ch: h * 0.04 });

  // Cặp mắt kính chữ V phát sáng rực rỡ (chếch xuống gặp nhau ở đáy giữa: \ /)
  const eyeWingW = w * 0.28;
  const eyeWingH = h * 0.07;
  const eyeAngle = 0.32; // Góc nghiêng tạo dáng chữ V
  b.both((sx) => {
    b.slab('goldGlow', eyeWingW, eyeWingH, d * 0.04, [sx * w * 0.16, h * 0.09, d * 0.63], {
      rot: [0, 0, sx * eyeAngle],
      ch: 0
    });
    // Gờ nẹp mí mắt titan đen trên mí mắt V
    b.slab('carbonHi', eyeWingW * 0.95, h * 0.03, d * 0.05, [sx * w * 0.16, h * 0.13, d * 0.63], {
      rot: [0, 0, sx * eyeAngle],
      ch: 0
    });
    // Viền vàng mảnh đỡ dưới mắt
    b.slab('goldAccent', eyeWingW * 0.85, h * 0.02, d * 0.05, [sx * w * 0.16, h * 0.05, d * 0.63], {
      rot: [0, 0, sx * eyeAngle],
      ch: 0
    });
  });
  // Đỉnh nhọn kết nối ở đáy chữ V
  b.slab('goldGlow', w * 0.07, h * 0.06, d * 0.05, [0, h * 0.04, d * 0.635], { ch: 0 });

  // Huy hiệu V-Wings mạ vàng trên trán (Dominus Insignia)
  b.both((sx) => {
    b.slab('goldHi', w * 0.12, h * 0.03, d * 0.03, [sx * w * 0.07, h * 0.20, d * 0.60], {
      rot: [0, 0, -sx * 0.32],
      ch: 0
    });
  });
  b.slab('goldHi', w * 0.04, h * 0.05, d * 0.035, [0, h * 0.18, d * 0.605], { ch: 0 });

  // 4. Khối cằm và bộ lọc khí thở bọc kín cổ (Chin Respirator)
  b.slab('carbonHi', w * 0.72, h * 0.32, d * 0.22, [0, -h * 0.36, d * 0.52], { ch: h * 0.05 });
  b.slab('steelTrim', w * 0.36, h * 0.16, d * 0.14, [0, -h * 0.36, d * 0.58], { ch: h * 0.03 });
  b.slab('goldAccent', w * 0.20, h * 0.04, d * 0.15, [0, -h * 0.40, d * 0.59], { ch: 0 });

  // 5. Cổng giao tiếp âm thanh tròn hai bên thái dương (Comm Ear Ports)
  b.both((sx) => {
    b.push([sx * w * 0.52, h * 0.06, 0], [0, 0, sx * Math.PI / 2]);
    b.cyl('goldAccent', w * 0.14, w * 0.14, d * 0.06, [0, 0, 0], { seg: 12 });
    b.cyl('carbonDark', w * 0.10, w * 0.10, d * 0.07, [0, 0, 0], { seg: 12 });
    b.pop();
  });

  // 6. Nẹp cổ chân mũ và đốt giáp gáy phủ sâu kín cổ áo (Nape Exoskeleton)
  b.slab('carbonHi', w * 1.16, h * 0.14, d * 0.94, [0, -h * 0.48, -d * 0.12], { ch: h * 0.02 });
  b.slab('goldAccent', w * 0.20, h * 0.32, d * 0.12, [0, -h * 0.20, -d * 0.58], { ch: 0 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ÁO GIÁP TITAN CHIẾN ĐẤU (Body)
// Ngực nguyên khối 2 bên + Huy hiệu V-Wings + Cầu vai thon gọn + Khung xương sống lưng
// ─────────────────────────────────────────────────────────────────────────────
export function body(w, h, d, pal, slot) {
  if (slot === 'forearm') {
    const b = piece(M(pal));
    b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.10, [0, 0, 0]);
    b.cover('carbonPlate', w, h, d, 1.18, 1.15, 1.18, [0, -h * 0.04, 0]);

    // Vòng nẹp thép khuỷu tay và cổ tay
    b.slab('steelTrim', w * 1.22, h * 0.08, d * 1.22, [0, h * 0.36, 0], { ch: h * 0.02 });
    b.slab('steelTrim', w * 1.22, h * 0.08, d * 1.22, [0, -h * 0.44, 0], { ch: h * 0.02 });

    // Tấm ốp cẳng tay carbon góc cạnh
    b.slab('carbonHi', w * 0.75, h * 0.62, d * 0.12, [0, -h * 0.04, d * 0.58], { ch: h * 0.04 });
    b.slab('goldAccent', w * 0.18, h * 0.55, d * 0.13, [0, -h * 0.04, d * 0.60], { ch: 0 });
    b.slab('goldHi', w * 0.08, h * 0.30, d * 0.14, [0, -h * 0.04, d * 0.61], { ch: 0 });

    // Chốt nẹp vàng mặt ngoài
    b.slab('goldAccent', w * 0.12, h * 0.08, d * 0.40, [0, h * 0.10, d * 0.58], { ch: 0 });
    return b.build();
  }

  if (slot === 'upperArm') {
    const b = piece(M(pal));
    b.cover('innerSuit', w, h, d, 1.12, 1.45, 1.12, [0, h * 0.06, 0]);
    b.slab('carbonPlate', w * 1.16, h * 0.52, d * 1.16, [0, h * 0.18, 0], { ch: h * 0.04 });
    b.slab('steelTrim', w * 1.20, h * 0.07, d * 1.20, [0, h * 0.40, 0], { ch: h * 0.02 });
    b.slab('goldAccent', w * 0.12, h * 0.42, d * 0.70, [0, h * 0.18, 0], { ch: 0 });
    return b.build();
  }

  const b = piece(M(pal));
  const fz = d * 0.58;

  // ── 1. Cốt thân carbon bọc kín 360° ──
  b.slab('innerSuit', w * 0.56, h * 0.44, d * 0.86, [0, h * 0.64, 0], { ch: h * 0.08 }); // cổ giáp cao
  b.slab('steelTrim', w * 0.64, h * 0.09, d * 0.94, [0, h * 0.46, 0], { ch: h * 0.02 }); // vòng cổ kim loại
  b.cover('carbonPlate', w, h, d, 1.22, 1.05, 1.24, [0, 0, 0]);                          // thân giáp chính
  b.slab('carbonPlate', w * 1.16, h * 0.65, d * 1.18, [0, -h * 0.82, 0], { ch: h * 0.06 });// bụng dưới & hông

  // ── 2. HAI TẤM GIÁP NGỰC NGUYÊN KHỐI 2 BÊN (Clean Solid Pectoral Plates) ──
  // (Đã xóa bỏ hoàn toàn các thanh ghép hình thoi theo yêu cầu, để 2 bên ngực nguyên khối liền mạch vững chãi)
  const pecW = w * 0.44;
  const pecH = h * 0.38;
  const pecX = w * 0.24;
  const pecY = h * 0.18;

  b.both((sx) => {
    // Tấm giáp ngực titan nguyên khối, vát cạnh mạnh mẽ
    b.slab('carbonHi', pecW, pecH, d * 0.16, [sx * pecX, pecY, fz + d * 0.02], { ch: h * 0.06 });
    // Tấm phiến ngực phụ nổi nhẹ bên trong
    b.slab('carbonPlate', pecW * 0.78, pecH * 0.72, d * 0.05, [sx * pecX, pecY, fz + d * 0.08], { ch: h * 0.04 });
    // Điểm nhấn chốt mạ vàng tinh tế ở góc vai ngoài
    b.slab('goldAccent', w * 0.06, h * 0.05, d * 0.03, [sx * (pecX + pecW * 0.30), pecY + pecH * 0.30, fz + d * 0.09], { ch: 0 });
  });

  // HUY HIỆU V-WINGS CHÍNH GIỮA XƯƠNG ỨC (Flat Dominus Emblem)
  b.both((sx) => {
    b.slab('goldHi', w * 0.09, h * 0.028, d * 0.02, [sx * w * 0.05, h * 0.22, fz + d * 0.08], {
      rot: [0, 0, -sx * 0.36],
      ch: 0
    });
  });
  b.slab('goldHi', w * 0.03, h * 0.04, d * 0.025, [0, h * 0.20, fz + d * 0.085], { ch: 0 });

  // Khe rãnh xương ức phân tách 2 bên ngực sắc nét
  b.slab('carbonDark', w * 0.05, h * 0.42, d * 0.06, [0, h * 0.18, fz + d * 0.06], { ch: 0 });

  // ── 3. CƠ BỤNG CÔNG NGHỆ NHIỀU ĐỐT (Segmented Tactical Abdomen) ──
  const abW = w * 0.20;
  const abH = h * 0.10;
  const abX = w * 0.13;
  const abRowY = [-h * 0.12, -h * 0.24, -h * 0.36];

  abRowY.forEach((ry) => {
    b.both((sx) => {
      b.slab('carbonHi', abW, abH, d * 0.14, [sx * abX, ry, fz + d * 0.02], { ch: h * 0.025 });
      // Chốt vàng hai bên múi bụng
      b.slab('goldAccent', w * 0.04, h * 0.03, d * 0.04, [sx * (abX + abW * 0.36), ry, fz + d * 0.08], { ch: 0 });
    });
    // Chốt vàng trung tâm
    b.slab('goldAccent', w * 0.04, h * 0.03, d * 0.04, [0, ry, fz + d * 0.09], { ch: 0 });
  });

  // ── 4. CẦU VAI THON GỌN ÔM KHỚP (Sleek Modular Pauldrons) ──
  // (Thiết kế thon gọn, vừa vặn, không quá to theo đúng yêu cầu của user)
  b.both((sx) => {
    // Tầng đệm vai ôm sát
    b.slab('innerSuit', w * 0.42, h * 0.46, d * 1.22, [sx * w * 0.60, h * 0.12, 0], { ch: h * 0.06 });
    // Tấm vòm cầu vai titan thon gọn
    b.slab('carbonPlate', w * 0.46, h * 0.25, d * 1.25, [sx * w * 0.58, h * 0.38, 0], { ch: h * 0.08 });
    b.slab('steelTrim', w * 0.48, h * 0.05, d * 1.28, [sx * w * 0.58, h * 0.26, 0], { ch: h * 0.02 });
    b.slab('carbonHi', w * 0.38, h * 0.18, d * 1.15, [sx * w * 0.56, h * 0.50, 0], { ch: h * 0.06 });

    // Vây nhọn vát vươn cao ở đỉnh vai ngoài
    b.slab('carbonHi', w * 0.12, h * 0.28, d * 0.32, [sx * w * 0.72, h * 0.54, 0], {
      rot: [0, 0, -sx * 0.40],
      ch: w * 0.02
    });
    // Nẹp chỉ vàng trên cầu vai
    b.slab('goldAccent', w * 0.04, h * 0.26, d * 0.34, [sx * w * 0.74, h * 0.55, 0], {
      rot: [0, 0, -sx * 0.40],
      ch: 0
    });
  });

  // ── 5. BỘ KHUNG XƯƠNG NGOÀI SAU LƯNG (Back Spine Exoskeleton) ──
  const bz = -fz - d * 0.04;
  b.slab('steelTrim', w * 0.18, h * 0.88, d * 0.10, [0, h * 0.05, bz], { ch: h * 0.03 });
  b.slab('goldAccent', w * 0.06, h * 0.82, d * 0.11, [0, h * 0.05, bz - 0.01], { ch: 0 });

  // Các khớp nối đốt sống lưng với chốt vàng đối xứng
  [-h * 0.25, -h * 0.10, h * 0.05, h * 0.20, h * 0.35].forEach((sy) => {
    b.slab('carbonHi', w * 0.36, h * 0.06, d * 0.08, [0, sy, bz], { ch: h * 0.015 });
    b.both((sx) => {
      b.slab('goldAccent', w * 0.04, h * 0.04, d * 0.09, [sx * w * 0.14, sy, bz], { ch: 0 });
    });
  });

  // ── 6. THẮT LƯNG & TÀ GIÁP HÔNG/ĐŨNG ──
  const beltZ = d * 0.62;
  b.slab('steelTrim', w * 1.22, h * 0.14, d * 1.24, [0, -h * 0.46, 0], { ch: h * 0.02 });
  // Mặt khóa thắt lưng góc cạnh với nẹp vàng
  b.slab('carbonHi', w * 0.28, h * 0.18, d * 0.06, [0, -h * 0.46, beltZ], { ch: h * 0.03 });
  b.slab('goldAccent', w * 0.18, h * 0.08, d * 0.07, [0, -h * 0.46, beltZ + 0.01], { ch: 0 });

  // Tà giáp đũng trước bảo vệ hạ bộ (Groin Guard / Codpiece)
  b.slab('carbonHi', w * 0.34, h * 0.50, d * 0.08, [0, -h * 0.78, beltZ], { ch: h * 0.04 });
  b.slab('goldAccent', w * 0.12, h * 0.30, d * 0.09, [0, -h * 0.78, beltZ + 0.01], { ch: 0 });

  // Tà giáp hông hai bên (Compact Tactical Hip Plates)
  b.both((sx) => {
    b.push([sx * w * 0.54, -h * 0.75, d * 0.06], [0, sx * 0.20, -sx * 0.08]);
    b.slab('carbonPlate', w * 0.38, h * 0.55, d * 0.12, [0, 0, 0], { ch: h * 0.04 });
    b.slab('steelTrim', w * 0.40, h * 0.05, d * 0.13, [0, -h * 0.24, 0], { ch: 0 });
    b.slab('goldAccent', w * 0.08, h * 0.35, d * 0.13, [0, 0, d * 0.05], { ch: 0 });
    b.pop();
  });

  // Tấm đũng trong che hở
  for (const sz of [1, -1]) {
    b.slab('innerSuit', w * 0.46, h * 0.42, d * 0.14, [0, -h * 1.48, sz * d * 0.3], { ch: h * 0.04 });
  }

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUẦN TITAN CHIẾN ĐẤU (Legs)
// Đùi phân lớp carbon viền vàng + Ốp gối lục giác + Ống chân Greaves vát nhọn
// ─────────────────────────────────────────────────────────────────────────────
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('innerSuit', w, h, d, 1.08, 1.02, 1.14, [0, 0, 0]);
    b.cover('carbonPlate', w, h, d, 1.16, 1.06, 1.20, [0, 0, 0]);

    // Ốp đầu gối lục giác góc cạnh (Hexagonal Knee Guard)
    b.slab('steelTrim', w * 0.74, h * 0.38, d * 0.18, [0, h * 0.44, d * 0.62], { ch: h * 0.05 });
    b.slab('carbonHi', w * 0.58, h * 0.28, d * 0.14, [0, h * 0.44, d * 0.68], { ch: h * 0.04 });
    b.slab('goldAccent', w * 0.24, h * 0.12, d * 0.06, [0, h * 0.44, d * 0.74], { ch: 0 });

    // Sống giáp cẳng chân vuốt sắc với nẹp vàng dọc (Shin Ridge)
    b.slab('carbonHi', w * 0.26, h * 0.65, d * 0.12, [0, -h * 0.08, d * 0.62], { ch: w * 0.04 });
    b.slab('goldAccent', w * 0.08, h * 0.60, d * 0.13, [0, -h * 0.08, d * 0.64], { ch: 0 });

    // Ốp bắp chân sau (Calf Armor)
    b.slab('carbonHi', w * 0.50, h * 0.45, d * 0.12, [0, -h * 0.06, -d * 0.60], { ch: h * 0.04 });
    b.slab('goldAccent', w * 0.06, h * 0.35, d * 0.13, [0, -h * 0.06, -d * 0.62], { ch: 0 });

    // Vành nẹp cổ chân
    b.slab('steelTrim', w * 1.20, h * 0.08, d * 1.24, [0, -h * 0.42, 0], { ch: h * 0.02 });
    return b.build();
  }

  // Đùi (thigh)
  b.cover('innerSuit', w, h, d, 1.08, 1.04, 1.12, [0, 0, 0]);
  b.cover('carbonPlate', w, h, d, 1.16, 1.02, 1.20, [0, 0, 0]);
  b.slab('steelTrim', w * 1.22, h * 0.10, d * 1.24, [0, h * 0.42, 0], { ch: h * 0.02 });

  // Tấm giáp đùi trước nhiều lớp
  b.slab('carbonHi', w * 0.65, h * 0.50, d * 0.16, [0, -h * 0.05, d * 0.60], { ch: h * 0.06 });
  b.slab('goldAccent', w * 0.16, h * 0.35, d * 0.06, [0, -h * 0.05, d * 0.67], { ch: 0 });
  b.both((sx) => {
    b.slab('goldAccent', w * 0.04, h * 0.08, d * 0.06, [sx * w * 0.22, -h * 0.05, d * 0.66], { ch: 0 });
  });
  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GIÀY CHIẾN BINH TITAN / ASSAULT SABATONS (Feet)
// Mũi giày phân đốt + Nẹp mu bàn chân + Đế cao su gai chống trượt
// ─────────────────────────────────────────────────────────────────────────────
export function feet(w, h, d, pal) {
  const b = piece(M(pal));

  b.cover('carbonPlate', w, h, d, 1.18, 1.40, 1.48, [0, h * 0.20, d * 0.10]);

  // Mũi giày giáp phân đốt góc cạnh
  b.slab('carbonHi', w * 1.14, h * 0.50, d * 0.48, [0, h * 0.02, d * 0.70], { ch: h * 0.12 });
  b.slab('steelTrim', w * 0.60, h * 0.18, d * 0.26, [0, h * 0.02, d * 0.90], { ch: h * 0.03 });
  b.slab('goldAccent', w * 0.20, h * 0.06, d * 0.24, [0, h * 0.04, d * 0.92], { ch: 0 });

  // Nẹp mu bàn chân
  b.slab('steelTrim', w * 1.18, h * 0.10, d * 0.42, [0, h * 0.20, d * 0.72], { ch: h * 0.02 });

  // Đai nẹp cổ chân
  b.slab('steelTrim', w * 1.22, h * 0.09, d * 1.24, [0, h * 0.42, 0], { ch: h * 0.02 });

  // Đế giày cao su gai đen chống trượt
  b.cover('carbonDark', w, h, d, 1.20, 0.65, 1.52, [0, -h * 0.50, d * 0.08]);

  return b.build();
}

export const VX19_DOMINUS = { head, body, legs, feet };
```
