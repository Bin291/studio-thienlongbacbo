# Bộ Giáp Huyền Vũ Chiến Thần (Black Tortoise War God Set)

> Bộ chiến giáp cận chiến hạng nặng phong cách Huyền Vũ (Chiến Binh - Warrior). 
> - **Chất liệu**: Thép đen Titan, viền đồng hun cổ, ngọc lục bảo phát quang, lụa tím hoàng gia.
> - **Quy cách**: 4 món trọn vẹn (Mũ Chiến Thần, Áo Huyền Giáp, Găng Hộ Thủ, Ủng Thiết Giáp).
> - **Chỉ số**: +HP cực lớn, +Chí mạng, +Phòng thủ, +Chính xác.

---

## 1. Thông Số Cấu Hình

- **Lớp tương thích**: Chiến Binh (Warrior) / Trọng giáp (Heavy).
- **Độ hiếm**: Tier 5 (Thần Thoại / Mythic).
- **Màu sắc chủ đạo**: Nền Đen Than `0x15181e` | Viền Đồng Đồng `0xc68a4c` | Ngọc Lục Bảo `0x2ecc71`.

---

## 2. Mã Nguồn JavaScript 3D (Three.js & ArmorKit)

```javascript
// Bảng vật liệu chuẩn của Bộ Huyền Vũ Chiến Thần
const M = (pal) => ({
  plate:    { color: 0x15181e, metalness: 0.85, roughness: 0.38 }, // Thép đen huyền vũ
  plateLo:  { color: 0x0c0e12, metalness: 0.75, roughness: 0.52 }, // Rãnh tối giữa các phiến giáp
  plateHi:  { color: 0x2b313d, metalness: 0.90, roughness: 0.30 }, // Thép bắt sáng bề mặt
  copper:   { color: 0xc68a4c, metalness: 0.95, roughness: 0.28 }, // Viền đồng hun cổ điển
  jade:     { color: 0x2ecc71, metalness: 0.15, roughness: 0.35, emissive: 0x1b7943, emissiveIntensity: 0.6 }, // Ngọc lục bảo
  cloth:    { color: 0x4a154b, metalness: 0.05, roughness: 0.92 }, // Lụa tím hoàng cung
  leather:  { color: 0x3d271d, metalness: 0.08, roughness: 0.85 }, // Da thắt lưng
  steel:    { color: 0xa0a8b2, metalness: 0.92, roughness: 0.25 }, // Thép sáng nẹp nhọn
  glow:     { color: 0x54e8cf, metalness: 0.10, roughness: 0.20, emissive: 0x54e8cf, emissiveIntensity: 0.95 }, // Viền năng lượng
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. MŨ CHIẾN THẦN (Head)
// Vương miện huyền vũ + Mặt nạ chiến trận che cằm + Kính bảo hộ + Bờm thép
// ─────────────────────────────────────────────────────────────────────────────
export function head(w, h, d, pal) {
  const b = piece(M(pal));

  // Chỏm mũ 4 bậc xếp tầng bao trọn đầu
  b.bandStack('plate', { w: w * 1.14, h: h * 1.28, d: d * 1.26, y: h * 0.16, count: 4, taper: 0.07, trim: 'plateLo' });
  b.cover('plateHi', w, h, d, 0.92, 0.22, 1.05, [0, h * 0.86, 0]); // Nắp đỉnh đầu

  // Sống bờm thép nhọn chạy dọc từ trán ra sau gáy
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const segH = h * (0.42 - 0.15 * t);
    const z = d * (0.35 - 0.7 * t);
    b.slab('copper', w * 0.14, segH, d * 0.2, [0, h * 0.62 + segH / 2, z], { ch: h * 0.03 });
  }

  // Khung viền đồng bảo vệ trán & huy hiệu ngọc lục bảo
  b.slab('copper', w * 1.18, h * 0.12, d * 0.2, [0, h * 0.38, d * 0.62], { ch: h * 0.03 });
  b.slab('jade', w * 0.38, h * 0.16, d * 0.12, [0, h * 0.38, d * 0.72], { ch: h * 0.03 });
  b.slab('glow', w * 0.14, h * 0.10, d * 0.08, [0, h * 0.38, d * 0.78], { ch: h * 0.02 });

  // Ốp má và hàm hai bên
  b.both((sx) => {
    b.slab('plate', w * 0.2, h * 0.84, d * 1.08, [sx * w * 0.48, -h * 0.12, d * 0.06], { ch: h * 0.06 });
    b.slab('copper', w * 0.06, h * 0.62, d * 0.08, [sx * w * 0.48, -h * 0.22, d * 0.6], { ch: h * 0.02 });
  });

  // Tấm che cằm phía trước (tránh hở cổ)
  b.slab('plateLo', w * 0.92, h * 0.38, d * 0.22, [0, -h * 0.42, d * 0.54], { ch: h * 0.06 });
  b.slab('copper', w * 0.5, h * 0.08, d * 0.12, [0, -h * 0.36, d * 0.65], { ch: h * 0.02 });

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ÁO HUYỀN GIÁP (Body)
// Tấm ngực vát bát giác + Ống bắp tay neo tay + Pauldron vòm vai sâu + Tà giáp lụa
// ─────────────────────────────────────────────────────────────────────────────
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  // RIGGING: Ống bắp tay neo trực tiếp vào bắp tay -> vung cùng vai khi đánh/chạy
  if (slot === 'upperArm') {
    const b = piece(mats);
    b.bandStack('plate', { w: w * 1.25, h: h * 0.84, d: d * 1.25, y: -h * 0.24, count: 3, taper: 0.04, trim: 'plateLo' });
    b.slab('copper', w * 1.28, h * 0.08, d * 1.28, [0, -h * 0.64, 0], { ch: h * 0.02 }); // Đai khuỷu tay
    b.slab('plate', w * 1.16, h * 0.48, d * 0.92, [0, h * 0.24, 0], { ch: h * 0.04 });   // Thon hẹp trục Z ở đỉnh
    b.slab('jade', w * 0.32, h * 0.28, d * 0.14, [0, h * 0.46, d * 0.60], { ch: h * 0.03 }); // Ngọc bắp tay
    return b.build();
  }

  const b = piece(mats);
  const fz = d * 0.62;

  // Cổ áo cao lồng chân mũ
  b.slab('plateLo', w * 0.56, h * 0.5, d * 0.86, [0, h * 0.66, 0], { ch: h * 0.08 });
  b.slab('copper', w * 0.6, h * 0.06, d * 0.9, [0, h * 0.44, 0], { ch: h * 0.02 });

  // Tấm ngực chính vát cạnh mai rùa
  b.slab('plate', w * 1.2, h * 0.8, d * 1.2, [0, h * 0.12, 0], { ch: h * 0.07 });
  b.frame('copper', w * 0.86, h * 0.54, fz + d * 0.02, { y: h * 0.14, t: w * 0.05 });
  b.slab('jade', w * 0.44, h * 0.36, d * 0.12, [0, h * 0.14, fz + d * 0.04], { ch: h * 0.04 });
  b.slab('glow', w * 0.16, h * 0.24, d * 0.08, [0, h * 0.14, fz + d * 0.10], { ch: h * 0.02 });

  // Bụng trên & bụng dưới (phủ kín qua shorts đến -1.5h)
  b.slab('plateLo', w * 1.14, h * 0.3, d * 1.14, [0, -h * 0.38, 0], { ch: h * 0.05 });
  b.slab('plate', w * 1.1, h * 0.28, d * 1.1, [0, -h * 0.64, 0], { ch: h * 0.05 });
  b.slab('cloth', w * 1.08, h * 0.48, d * 1.15, [0, -h * 0.96, 0], { ch: h * 0.05 });
  b.belt('leather', 'copper', { w: w * 1.15, h: h * 0.22, d: d * 1.18, y: -h * 1.16 });

  // Pauldron vòm vai (Tĩnh trên thân, DOME sâu Z để trùm trọn cung quét của bắp tay)
  b.both((sx) => {
    b.slab('plate', w * 0.55, h * 0.3, d * 1.55, [sx * w * 0.8, h * 0.44, 0], { ch: h * 0.06 }); // Lớp vòm chính
    b.slab('copper', w * 0.46, h * 0.18, d * 1.35, [sx * w * 0.78, h * 0.66, 0], { ch: h * 0.05 }); // Nắp vòm trên
    b.slab('plateLo', w * 0.5, h * 0.5, d * 1.45, [sx * w * 0.86, h * 0.08, 0], { ch: h * 0.07 });  // Váy vai rủ
    // Gai nhọn nghiêng ra ngoài
    const spike = b.slab('copper', w * 0.1, h * 0.26, d * 0.1, [sx * w * 0.98, h * 0.46, 0], { rot: [0, 0, sx * 0.45] });
  });

  // Tà giáp 4 tấm rủ che chậu và đỉnh đùi
  const sy = -h * 1.34;
  const tasset = (x, z, ry, wide) => {
    b.push([x, sy, z], [0, ry || 0, 0]);
    const wl = wide ? w * 0.84 : w * 0.44;
    b.slab('cloth', wl * 0.96, h * 0.36, d * 0.12, [0, -h * 0.16, 0], { ch: h * 0.05 });
    b.slab('plate', wl, h * 0.28, d * 0.16, [0, -h * 0.06, d * 0.02], { ch: h * 0.06 });
    b.slab('copper', wl * 0.98, h * 0.05, d * 0.18, [0, -h * 0.22, d * 0.02], { ch: h * 0.015 });
    b.pop();
  };
  tasset(0, fz * 0.92, 0, true);       // Mặt trước
  tasset(0, -fz * 0.92, 0, true);      // Mặt sau
  tasset(-w * 0.58, 0, Math.PI / 2, false); // Hông trái
  tasset(w * 0.58, 0, Math.PI / 2, false);  // Hông phải

  // Tấm đũng giữa chống hở khi dang chân
  for (const s of [1, -1]) {
    b.slab('plate', w * 0.48, h * 0.42, d * 0.14, [0, -h * 1.48, s * fz * 0.5], { ch: h * 0.05 });
  }

  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GĂNG HỘ THỦ (Hands)
// Ống cẳng tay 4 tầng + Nẹp mu bàn tay + Vòng đai đồng
// ─────────────────────────────────────────────────────────────────────────────
export function hands(w, h, d, pal) {
  const b = piece(M(pal));
  b.bandStack('plate', { w: w * 1.22, h: h * 1.15, d: d * 1.22, y: h * 0.1, count: 4, taper: -0.04, trim: 'copper', ch: h * 0.045 });
  b.slab('copper', w * 1.26, h * 0.06, d * 1.26, [0, h * 0.66, 0], { ch: h * 0.02 }); // Cổ găng
  b.slab('plateLo', w * 1.28, h * 0.48, d * 1.28, [0, -h * 0.58, 0], { ch: h * 0.04 }); // Bọc bàn tay
  b.slab('jade', w * 0.6, h * 0.35, d * 0.14, [0, -h * 0.46, d * 0.56], { ch: h * 0.04 }); // Ngọc mu bàn tay
  b.slab('glow', w * 0.2, h * 0.12, d * 0.08, [0, -h * 0.46, d * 0.63], { ch: h * 0.02 });
  return b.build();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ỦNG THIẾT GIÁP (Legs)
// Phủ trọn 3 đoạn chân (đùi, cẳng chân, bàn chân). Tự động nhận diện slot
// ─────────────────────────────────────────────────────────────────────────────
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));
  const isFoot = slot ? slot === 'foot' : d > h * 1.3;

  if (isFoot) { // Bàn chân: Ủng nặng mũi bọc đồng
    b.cover('plate', w, h, d, 1.08, 1.52, 1.26, [0, h * 0.28, d * 0.06]);
    b.slab('copper', w * 0.95, h * 0.55, d * 0.3, [0, h * 0.16, d * 0.64], { ch: h * 0.12 }); // Mũi đồng
    b.slab('glow', w * 0.9, h * 0.08, d * 0.12, [0, -h * 0.15, d * 0.8], { ch: h * 0.03 });  // Vạch phát sáng mũi
    b.cover('plateLo', w, h, d, 1.12, 0.75, 1.3, [0, -h * 0.52, d * 0.04]); // Đế ủng dày
    return b.build();
  }

  if (slot === 'shin') { // Cẳng chân
    b.cover('cloth', w, h, d, 1.08, 1.04, 1.16, [0, h * 0.12, 0]);
    b.bandStack('plate', { w: w * 1.18, h: h * 0.76, d: d * 1.24, y: -h * 0.28, count: 3, taper: 0.05, trim: 'copper', ch: h * 0.05 });
    b.slab('jade', w * 0.52, h * 0.38, d * 0.16, [0, h * 0.3, d * 0.62], { ch: h * 0.06 }); // Nẹp gối ngọc
    b.slab('glow', w * 0.2, h * 0.18, d * 0.1, [0, h * 0.3, d * 0.7], { ch: h * 0.03 });
    return b.build();
  }

  // Đùi (slot === 'thigh')
  b.cover('cloth', w, h, d, 1.08, 1.06, 1.18, [0, 0, 0]);
  b.belt('leather', 'copper', { w: w * 1.15, h: h * 0.12, d: d * 1.15, y: h * 0.3 });
  b.pouch('leather', 'copper', w * 0.32, h * 0.26, d * 0.14, [w * 0.52, -h * 0.02, d * 0.38]); // Túi đựng bùa hông
  return b.build();
}
```
