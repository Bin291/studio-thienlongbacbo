# Bộ Giáp Hỏa Diệm Nham Thạch (Crimson Hellfire Knight Set)

> Bộ chiến giáp hỏa diệm nham thạch tối thượng của Chiến Binh (Warrior - Heavy Armor).
> - **Chất liệu**: Thép đỏ Ruby kim loại (`plate`), nẹp vàng hoàng kim (`gold`), ngà sừng quỷ (`hornBone`), mạng lưới dung nham phát quang trắng nóng (`magmaCore`), bờm lửa bốc cháy (`flame`) và áo choàng đỏ nhung rách tà (`cape`).
> - **Quy cách (Chuẩn 2026-09-08)**: 4 món hoàn chỉnh: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).
> - **Đặc trưng**: Mặt nạ T-Visor với cặp sừng quỷ vươn cao, cầu vai gai lửa 4 chóp nhọn, ngực cơ bắp xẻ rãnh nham thạch rực sáng, tà giáp hông dung nham, áo choàng đỏ sau lưng (đã gỡ bỏ kiếm lưng, tối ưu hóa các khối liên kết liền mạch vững chắc).

```javascript
// Sẵn có hàm piece() từ armorKit

// ═══════════════════════════════════════════════════════════════════════════
// BỘ GIÁP HỎA DIỆM NHAM THẠCH (Crimson Hellfire Knight Set)
// Chuẩn kiến trúc 2026-09-08: head, body, legs, feet
// ═══════════════════════════════════════════════════════════════════════════

const M = (pal) => ({
  plate:      { color: 0x7a121d, metalness: 0.85, roughness: 0.32 }, // Đỏ Ruby kim loại (nền chính)
  plateHi:    { color: 0x9e1c2a, metalness: 0.88, roughness: 0.24 }, // Đỏ sáng bắt sáng gờ giáp
  plateLo:    { color: 0x42080f, metalness: 0.70, roughness: 0.50 }, // Đỏ thẫm bóng tối khe giáp / gáy
  gold:       { color: 0xd49b22, metalness: 0.94, roughness: 0.22 }, // Vàng kim hoàng gia cổ điển
  goldHi:     { color: 0xf5cf58, metalness: 0.96, roughness: 0.16 }, // Vàng sáng đỉnh sừng & mũi ủng
  goldDk:     { color: 0x8f620e, metalness: 0.85, roughness: 0.38 }, // Vàng hun tối viền rãnh
  hornBone:   { color: 0xddd0bc, metalness: 0.20, roughness: 0.45 }, // Ngà sừng quỷ ngả vàng cổ
  hornBoneDk: { color: 0xa49680, metalness: 0.25, roughness: 0.50 }, // Chân sừng tối
  magma:      { color: 0xff4800, metalness: 0.15, roughness: 0.25, emissive: 0xff3300, emissiveIntensity: 1.8 }, // Dung nham phát quang
  magmaCore:  { color: 0xffde59, metalness: 0.10, roughness: 0.20, emissive: 0xffc810, emissiveIntensity: 2.2 }, // Lõi mắt & tâm nứt trắng nóng
  flame:      { color: 0xeb2608, metalness: 0.12, roughness: 0.30, emissive: 0xe01e00, emissiveIntensity: 2.0 }, // Bờm lửa đỉnh đầu
  cape:       { color: 0x580f18, metalness: 0.05, roughness: 0.92 }, // Áo choàng nỉ nhung đỏ thẫm
  leather:    { color: 0x3a2216, metalness: 0.08, roughness: 0.85 }, // Da bò nâu thắt lưng
  mail:       { color: 0x22262e, metalness: 0.75, roughness: 0.45 }, // Lưới xích đũng trước
  darkVisor:  { color: 0x12080a, metalness: 0.60, roughness: 0.40 }, // Hốc kính ngắm tối
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. MŨ HỎA LONG MA THẦN (Head)
// Khung mũ hở mặt hình chữ T (Barbute / Corinthian T-Face) — Lộ rõ mắt, mũi, miệng
// ─────────────────────────────────────────────────────────────────────────────
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // 1. Nóc mũ vòm che đỉnh đầu (Top Dome)
  b.slab('plate', w * 1.15, h * 0.34, d * 1.16, [0, h * 0.40, 0], { ch: h * 0.06 });

  // 2. Phần gáy và đầu sau bọc kín (Back of Head & Nape)
  b.slab('plate', w * 1.15, h * 0.78, d * 0.62, [0, -h * 0.05, -d * 0.28], { ch: h * 0.06 });
  b.slab('plateLo', w * 1.10, h * 0.36, d * 0.52, [0, -h * 0.34, -d * 0.32], { ch: h * 0.05 });

  // 3. Hai bên thái dương & vành tai bọc kín (Sides of Head)
  b.both((sx) => {
    b.slab('plate', w * 0.22, h * 0.72, d * 1.05, [sx * w * 0.48, -h * 0.05, -d * 0.04], { ch: h * 0.04 });
  });

  // 4. Vành trán trên mắt (Forehead Brow - Nằm TRÊN tầm mắt, không che mắt)
  b.slab('plate', w * 1.15, h * 0.16, d * 0.24, [0, h * 0.26, d * 0.47], { ch: h * 0.03 });
  b.slab('gold', w * 1.17, h * 0.06, d * 0.26, [0, h * 0.19, d * 0.48], { ch: h * 0.015 }); // gờ vàng viền ngang trên mắt

  // 5. Hai tấm ốp má hai bên tạo khe hở chữ T (Cheek Guards forming T-Opening)
  // Khe hở giữa 2 má mở rộng: Mắt, mũi, miệng, cằm ở giữa hoàn toàn LỘ RÕ, KHÔNG BỊ CHE!
  const cheekW = w * 0.22;
  const cheekH = h * 0.54;
  const cheekX = w * 0.46;
  const cheekY = -h * 0.14;
  const cheekZ = d * 0.54;

  b.both((sx) => {
    b.slab('plate', cheekW, cheekH, d * 0.12, [sx * cheekX, cheekY, cheekZ], { ch: h * 0.03 });
    b.slab('gold', w * 0.04, cheekH * 0.95, d * 0.13, [sx * (cheekX - cheekW * 0.42), cheekY, cheekZ], { ch: 0 });
    b.slab('gold', cheekW, h * 0.05, d * 0.13, [sx * cheekX, cheekY - cheekH * 0.45, cheekZ], { ch: 0 });
  });

  // 6. Vành nẹp cổ chân mũ bằng vàng ôm sau gáy và hai bên
  b.slab('gold', w * 1.18, h * 0.08, d * 0.90, [0, -h * 0.46, -d * 0.14], { ch: h * 0.02 });

  // 4. CẶP SỪNG QUỶ CONG VÚT NGUYÊN KHỐI LIỀN MẠCH (Demon Horns - Seamless Chained Cones)
  b.both((sx) => {
    // Khung định vị từ thái dương hướng ngang ra ngoài và chếch nhẹ ra trước
    b.push([sx * (w * 0.50), h * 0.14, d * 0.06], [0.12, sx * 0.22, -sx * 0.88]);

    // Vành vàng bọc chân sừng (Horn Socket Ring) gắn chặt vào mũ
    b.cyl('gold', w * 0.16, w * 0.18, h * 0.08, [0, h * 0.04, 0], { seg: 12 });

    // Đoạn 1: Gốc sừng ngà tối mọc vươn ra ngoài
    const len1 = h * 0.28;
    b.cyl('hornBoneDk', w * 0.13, w * 0.16, len1, [0, h * 0.08 + len1 / 2, 0], { seg: 12 });

    // Đoạn 2: Thân sừng uốn lượn cong vút lên trên
    b.push([0, h * 0.08 + len1, 0], [-0.10, 0, sx * 0.52]);
    const len2 = h * 0.30;
    b.cyl('hornBone', w * 0.10, w * 0.13, len2, [0, len2 / 2, 0], { seg: 12 });

    // Đoạn 3: Thân trên uốn cong vươn cao và hướng nhẹ vào trong (tạo dáng sừng trăng khuyết)
    b.push([0, len2, 0], [-0.12, 0, sx * 0.44]);
    const len3 = h * 0.34;
    b.cyl('hornBone', w * 0.065, w * 0.10, len3, [0, len3 / 2, 0], { seg: 12 });

    // Đoạn 4: Chóp nhọn vuốt sắc bọc vàng kim hoàng gia
    b.push([0, len3, 0], [-0.10, 0, sx * 0.24]);
    const len4 = h * 0.28;
    b.cyl('goldHi', 0.001, w * 0.065, len4, [0, len4 / 2, 0], { seg: 12 });

    // Pop lần lượt theo thứ tự ngược lại để giải phóng stack
    b.pop();
    b.pop();
    b.pop();
    b.pop();
  });

  // Bờm lửa đỉnh đầu (Flame Crest - Kiến trúc Voxel nhấp nhô sống động)
  // Sống vàng đỡ bờm
  b.slab('goldDk', w * 0.12, h * 0.10, d * 0.95, [0, h * 0.56, 0], { ch: h * 0.02 });
  // Tầng 1: Ngọn lửa trước trán
  b.slab('flame', w * 0.14, h * 0.22, d * 0.24, [0, h * 0.68, d * 0.25], { ch: w * 0.02, rot: [0.35, 0, 0] });
  b.slab('magmaCore', w * 0.06, h * 0.14, d * 0.16, [0, h * 0.68, d * 0.26], { ch: 0 });
  // Tầng 2: Đỉnh lửa cao nhất ở giữa
  b.slab('flame', w * 0.15, h * 0.38, d * 0.28, [0, h * 0.82, 0], { ch: w * 0.02, rot: [0.10, 0, 0] });
  b.slab('magmaCore', w * 0.07, h * 0.25, d * 0.18, [0, h * 0.82, 0.01], { ch: 0 });
  // Tầng 3: Lửa cuộn ra sau gáy
  b.slab('flame', w * 0.14, h * 0.32, d * 0.26, [0, h * 0.76, -d * 0.26], { ch: w * 0.02, rot: [-0.30, 0, 0] });
  b.slab('magmaCore', w * 0.06, h * 0.20, d * 0.16, [0, h * 0.76, -d * 0.25], { ch: 0 });
  // Tầng 4: Đuôi lửa uốn xuống gáy
  b.slab('flame', w * 0.12, h * 0.24, d * 0.22, [0, h * 0.58, -d * 0.46], { ch: w * 0.02, rot: [-0.60, 0, 0] });

  return b.build();
}

// Helper cẳng tay (slot === 'forearm')
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  // Ống cẳng tay bọc kín
  b.cover('plate', w, h, d, 1.18, 1.15, 1.18, [0, -h * 0.04, 0]);
  // Vành nẹp vàng khuỷu tay & cổ tay
  b.slab('gold', w * 1.22, h * 0.09, d * 1.22, [0, h * 0.36, 0], { ch: h * 0.02 });
  b.slab('gold', w * 1.22, h * 0.08, d * 1.22, [0, -h * 0.44, 0], { ch: h * 0.02 });
  // Tấm nẹp mu bàn tay
  b.slab('plateHi', w * 0.75, h * 0.24, d * 0.10, [0, -h * 0.48, d * 0.58], { ch: h * 0.03 });
  // Dải rãnh nham thạch rực sáng chạy dọc mặt ngoài cẳng tay
  b.slab('magma', w * 0.18, h * 0.60, d * 0.06, [0, -h * 0.04, d * 0.58], { ch: 0 });
  b.slab('magmaCore', w * 0.08, h * 0.35, d * 0.07, [0, -h * 0.04, d * 0.59], { ch: 0 });
  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ÁO GIÁP HỎA DIỆM (Body)
// Ngực cơ bắp xẻ rãnh nham thạch + Cầu vai gai lửa 4 chóp + Áo choàng đỏ sau lưng
// (Đã loại bỏ hoàn toàn thanh kiếm sau lưng, các chi tiết gắn khít 100% không rời rạc)
// ─────────────────────────────────────────────────────────────────────────────
export function body(w, h, d, pal, slot) {
  if (slot === 'forearm') return forearmArmor(w, h, d, pal);

  if (slot === 'upperArm') {
    const b = piece(M(pal));
    // Lớp vải xích tối bọc kín bắp tay (khử hở da / áo lót)
    b.cover('mail', w, h, d, 1.14, 1.45, 1.14, [0, h * 0.06, 0]);
    // Ốp giáp đỏ bắp tay trên
    b.slab('plate', w * 1.18, h * 0.50, d * 1.18, [0, h * 0.22, 0], { ch: h * 0.05 });
    b.slab('gold', w * 1.22, h * 0.08, d * 1.22, [0, h * 0.42, 0], { ch: h * 0.02 });
    b.slab('goldDk', w * 1.22, h * 0.06, d * 1.22, [0, 0, 0], { ch: h * 0.02 });
    b.slab('magma', w * 0.10, h * 0.40, d * 0.05, [0, h * 0.20, d * 0.58], { ch: 0 });
    return b.build();
  }

  const b = piece(M(pal));
  const fz = d * 0.58;

  // ── 1. Cốt lõi thân bọc kín 360 (Khử 100% hở da) ──
  b.slab('plateLo', w * 0.56, h * 0.44, d * 0.86, [0, h * 0.64, 0], { ch: h * 0.08 }); // cổ giáp cao
  b.slab('gold', w * 0.64, h * 0.09, d * 0.94, [0, h * 0.46, 0], { ch: h * 0.02 });     // vòng cổ vàng
  b.cover('plate', w, h, d, 1.24, 1.06, 1.26, [0, 0, 0]);                                // ngực thân chính
  b.slab('plate', w * 1.18, h * 0.65, d * 1.20, [0, -h * 0.82, 0], { ch: h * 0.06 });     // bụng dưới & hông

  // ── 2. GIÁP NGỰC CƠ BẮP CHIẾN THẦN (Heroic Chiseled Cuirass) ──
  // Tấm ngực cơ bắp lồi (Pectorals)
  const pecW = w * 0.42;
  const pecH = h * 0.38;
  const pecX = w * 0.24;
  const pecY = h * 0.18;

  b.both((sx) => {
    // Khối cơ ngực vạm vỡ
    b.slab('plateHi', pecW, pecH, d * 0.18, [sx * pecX, pecY, fz + d * 0.02], { ch: h * 0.06 });
    // Tấm nẹp vàng hoàng kim viền cong ôm bờ vai & xương đòn
    b.slab('gold', pecW * 0.98, h * 0.09, d * 0.10, [sx * pecX, pecY + pecH * 0.42, fz + d * 0.08], {
      rot: [0, 0, -sx * 0.22],
      ch: h * 0.025
    });
    // Gờ nẹp vàng ôm đáy cơ ngực
    b.slab('goldDk', pecW * 0.92, h * 0.06, d * 0.08, [sx * pecX, pecY - pecH * 0.42, fz + d * 0.08], {
      rot: [0, 0, sx * 0.14],
      ch: h * 0.015
    });
  });

  // Cơ bụng 6 múi (2 cột x 3 hàng, nổi khối rõ rệt)
  const abW = w * 0.20;
  const abH = h * 0.11;
  const abX = w * 0.13;
  const abRowY = [-h * 0.12, -h * 0.24, -h * 0.36];

  abRowY.forEach((ry) => {
    b.both((sx) => {
      b.slab('plate', abW, abH, d * 0.14, [sx * abX, ry, fz + d * 0.01], { ch: h * 0.025 });
    });
  });

  // ── 3. MẠNG RÃNH DUNG NHAM NÓNG CHẢY TỰ NHIÊN (Chìm trong khe giáp) ──
  // Khe dọc trung tâm (giữa 2 ngực và dọc sống bụng)
  b.slab('magma', w * 0.07, h * 0.62, d * 0.08, [0, -h * 0.08, fz + d * 0.05], { ch: 0 });
  b.slab('magmaCore', w * 0.03, h * 0.54, d * 0.09, [0, -h * 0.08, fz + d * 0.055], { ch: 0 });

  // Các nhánh dung nham phân nhánh đối xứng ôm theo thớ cơ
  b.both((sx) => {
    // Rãnh lửa ngang phân tách ngực và bụng
    b.slab('magma', w * 0.34, h * 0.045, d * 0.06, [sx * (w * 0.22), h * 0.02, fz + d * 0.05], {
      rot: [0, 0, sx * 0.14],
      ch: 0
    });
    b.slab('magmaCore', w * 0.22, h * 0.02, d * 0.07, [sx * (w * 0.20), h * 0.02, fz + d * 0.055], {
      rot: [0, 0, sx * 0.14],
      ch: 0
    });

    // Rãnh lửa giữa múi bụng tầng 1 và 2
    b.slab('magma', w * 0.26, h * 0.035, d * 0.06, [sx * (w * 0.16), -h * 0.18, fz + d * 0.05], { ch: 0 });
    // Rãnh lửa giữa múi bụng tầng 2 và 3
    b.slab('magma', w * 0.24, h * 0.035, d * 0.06, [sx * (w * 0.15), -h * 0.30, fz + d * 0.05], { ch: 0 });

    // Vết nứt dung nham xiên lên góc trên cơ ngực
    b.slab('magma', w * 0.20, h * 0.035, d * 0.06, [sx * (w * 0.24), h * 0.22, fz + d * 0.05], {
      rot: [0, 0, -sx * 0.30],
      ch: 0
    });
  });

  // ── 4. CẦU VAI GAI LỬA LỚN (Flame Spiked Pauldrons - Từng tầng khối vững chãi) ──
  b.both((sx) => {
    // Váy đệm nách che kín khớp tay áo
    b.slab('plateLo', w * 0.52, h * 0.68, d * 1.50, [sx * w * 0.88, h * 0.06, 0], { ch: h * 0.08 });
    // Tầng đế vai rộng
    b.slab('plate', w * 0.62, h * 0.34, d * 1.62, [sx * w * 0.80, h * 0.44, 0], { ch: h * 0.10 });
    // Vành nẹp vàng chạy quanh mép dưới cầu vai
    b.slab('gold', w * 0.65, h * 0.06, d * 1.64, [sx * w * 0.80, h * 0.29, 0], { ch: h * 0.02 });
    // Tầng vòm vai trên
    b.slab('plateHi', w * 0.50, h * 0.22, d * 1.42, [sx * w * 0.78, h * 0.64, 0], { ch: h * 0.08 });
    b.slab('magma', w * 0.18, h * 0.08, d * 0.35, [sx * w * 0.78, h * 0.62, d * 0.15], { ch: 0 });

    // 4 Gai lửa vàng / ngà cong vút gắn chặt vào sống vai
    b.slab('goldHi', w * 0.10, h * 0.40, d * 0.12, [sx * w * 0.94, h * 0.68, d * 0.40], { rot: [0.30, 0, -sx * 0.60], ch: w * 0.02 });
    b.slab('goldHi', w * 0.11, h * 0.48, d * 0.13, [sx * w * 0.98, h * 0.74, d * 0.14], { rot: [0.10, 0, -sx * 0.60], ch: w * 0.02 });
    b.slab('goldHi', w * 0.11, h * 0.46, d * 0.13, [sx * w * 0.98, h * 0.72, -d * 0.14], { rot: [-0.15, 0, -sx * 0.60], ch: w * 0.02 });
    b.slab('goldHi', w * 0.10, h * 0.38, d * 0.12, [sx * w * 0.94, h * 0.66, -d * 0.40], { rot: [-0.35, 0, -sx * 0.60], ch: w * 0.02 });
  });

  // ── 5. THẮT LƯNG DA & MẶT KHÓA HOÀNG GIA (Royal Buckle) ──
  const beltZ = d * 0.62;
  b.slab('leather', w * 1.24, h * 0.16, d * 1.25, [0, -h * 0.46, 0], { ch: h * 0.02 });
  // Mặt khóa vàng bát giác / bo góc cân đối
  const buckleW = w * 0.28;
  const buckleH = h * 0.20;
  b.slab('gold', buckleW, buckleH, d * 0.05, [0, -h * 0.46, beltZ], { ch: h * 0.04 });
  b.slab('goldHi', buckleW * 0.85, buckleH * 0.85, d * 0.02, [0, -h * 0.46, beltZ + 0.015], { ch: h * 0.03 });
  // Hỏa ngọc nham thạch nằm chính giữa khóa
  b.slab('magmaCore', buckleW * 0.40, buckleH * 0.40, d * 0.03, [0, -h * 0.46, beltZ + 0.025], { ch: h * 0.02 });

  // ── 6. TÀ GIÁP HÔNG & KHỐ XÍCH ĐŨNG TRƯỚC (Tassets & Tabard) ──
  // Khố xích thả giữa phía trước
  b.slab('mail', w * 0.44, h * 0.90, d * 0.06, [0, -h * 0.96, beltZ - 0.01], { ch: h * 0.03 });
  b.slab('goldDk', w * 0.46, h * 0.04, d * 0.07, [0, -h * 1.38, beltZ - 0.01], { ch: 0 });

  // Hai tà giáp hông (Side Tassets) ôm sát hông đùi
  const sy = -h * 0.96;
  b.both((sx) => {
    b.push([sx * w * 0.54, sy, d * 0.10], [0, sx * 0.28, -sx * 0.12]);
    b.slab('plate', w * 0.46, h * 0.80, d * 0.12, [0, 0, 0], { ch: h * 0.05 });
    b.slab('gold', w * 0.48, h * 0.05, d * 0.13, [0, -h * 0.38, 0], { ch: 0 });
    b.slab('gold', w * 0.04, h * 0.78, d * 0.13, [w * 0.21, 0, 0], { ch: 0 });
    b.slab('gold', w * 0.04, h * 0.78, d * 0.13, [-w * 0.21, 0, 0], { ch: 0 });
    b.slab('magma', w * 0.22, h * 0.48, d * 0.06, [0, 0, d * 0.05], { ch: 0 });
    b.pop();
  });

  // Tấm đũng giữa che hở đồ lót khi nhân vật bước
  for (const sz of [1, -1]) {
    b.slab('plateLo', w * 0.46, h * 0.42, d * 0.14, [0, -h * 1.48, sz * d * 0.3], { ch: h * 0.04 });
  }

  // ── 6. Áo choàng đỏ nhung sau lưng (Crimson Knight Cape) ──
  // Gắn trực tiếp vào gáy / lưng trên, phủ dài xuống bắp chân
  const capeZ = -fz - d * 0.04;
  b.slab('cape', w * 1.20, h * 0.16, d * 0.20, [0, h * 0.42, capeZ + d * 0.04], { ch: h * 0.03 }); // gờ cổ áo choàng
  b.both((sx) => {
    // Tà áo choàng hai bên
    b.slab('cape', w * 0.58, h * 1.70, d * 0.08, [sx * w * 0.36, -h * 0.35, capeZ], { ch: h * 0.04, rot: [0.06, 0, 0] });
  });
  // Tà áo choàng chính giữa
  b.slab('cape', w * 0.62, h * 1.65, d * 0.08, [0, -h * 0.35, capeZ - 0.01], { ch: h * 0.04, rot: [0.06, 0, 0] });
  // Tua rách răng cưa ở đuôi áo choàng
  for (let i = -3; i <= 3; i++) {
    b.slab('cape', w * 0.12, h * 0.20, d * 0.07, [i * w * 0.17, -h * 1.24, capeZ], { ch: 0 });
  }

  // (ĐÃ BỎ HOÀN TOÀN THANH KIẾM Ở ĐẰNG SAU THEO YÊU CẦU CỦA USER)

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUẦN HỎA THIẾT GIÁP (Legs)
// Đùi đỏ viền nẹp vàng + Ốp gối lục giác hoàng kim + Vệt nham thạch cẳng chân
// ─────────────────────────────────────────────────────────────────────────────
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('plate', w, h, d, 1.16, 1.08, 1.20, [0, 0, 0]); // cẳng chân chính

    // Ốp đầu gối hình lục giác viền vàng (Hexagonal Knee Guard)
    b.slab('gold', w * 0.72, h * 0.38, d * 0.18, [0, h * 0.44, d * 0.60], { ch: h * 0.05 });
    b.slab('plateHi', w * 0.56, h * 0.28, d * 0.12, [0, h * 0.44, d * 0.68], { ch: h * 0.03 });
    b.slab('magmaCore', w * 0.16, h * 0.16, d * 0.04, [0, h * 0.44, d * 0.73], { rot: [0, 0, Math.PI / 4], ch: 0 });

    // Vết nứt dung nham rực sáng chạy dọc sống chân
    b.slab('magma', w * 0.18, h * 0.65, d * 0.06, [0, -h * 0.08, d * 0.60], { ch: 0 });
    b.slab('gold', w * 1.22, h * 0.08, d * 1.25, [0, -h * 0.42, 0], { ch: h * 0.02 }); // đai vàng cổ chân
    return b.build();
  }

  // Đùi (thigh / default)
  b.cover('mail', w, h, d, 1.10, 1.04, 1.12, [0, 0, 0]); // lót xích trong
  b.cover('plate', w, h, d, 1.16, 1.02, 1.20, [0, 0, 0]); // giáp đùi chính
  b.slab('gold', w * 1.22, h * 0.10, d * 1.24, [0, h * 0.42, 0], { ch: h * 0.02 }); // đai vàng hông
  b.slab('plateHi', w * 0.65, h * 0.48, d * 0.16, [0, -h * 0.05, d * 0.60], { ch: h * 0.07 }); // giáp đùi trước
  b.slab('gold', w * 0.68, h * 0.06, d * 0.06, [0, -h * 0.26, d * 0.66], { ch: 0 });
  b.slab('magma', w * 0.20, h * 0.32, d * 0.05, [0, -h * 0.05, d * 0.66], { ch: 0 }); // nứt nham thạch đùi
  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GIÀY HỎA THIẾT ỦNG (Feet)
// Bàn chân riêng biệt — Mũi ủng vuông phân đốt bọc vàng + Đai cổ chân hoàng kim
// ─────────────────────────────────────────────────────────────────────────────
export function feet(w, h, d, pal) {
  const b = piece(M(pal));

  b.cover('plate', w, h, d, 1.18, 1.40, 1.48, [0, h * 0.20, d * 0.10]);
  // Mũi ủng vuông bọc vàng phân đốt
  b.slab('plateHi', w * 1.14, h * 0.50, d * 0.48, [0, h * 0.02, d * 0.70], { ch: h * 0.12 });
  b.slab('gold', w * 1.18, h * 0.10, d * 0.42, [0, h * 0.20, d * 0.72], { ch: h * 0.02 });
  b.slab('goldHi', w * 0.50, h * 0.12, d * 0.22, [0, h * 0.02, d * 0.92], { ch: h * 0.02 });

  // Đai cổ chân hoàng kim
  b.slab('gold', w * 1.22, h * 0.09, d * 1.24, [0, h * 0.42, 0], { ch: h * 0.02 });
  // Đế ủng tối chống trượt
  b.cover('plateLo', w, h, d, 1.20, 0.65, 1.52, [0, -h * 0.50, d * 0.08]);

  return b.build();
}

export const CRIMSON_HELLFIRE = { head, body, legs, feet };
```
