# Base 0 — Heavy Gun: Giáp Xạ Thủ Hạng Nặng (Crimson Gunner)

Bộ giáp KHỞI ĐẦU (base0) của lớp **Heavy Gun** (khoá nội bộ `warrior`, cầm Launcher). Ảnh tham chiếu: `base0-ref/heavygun.png`.

- **Vai trò**: tank súng nặng — bộ giáp tấm dày, vai to, dáng "xe tăng", thấp trọng tâm.
- **Chất liệu**: thép sơn đỏ thẫm (crimson), viền sắt xám đen, chi tiết đồng cổ, đai da nâu, đạn đồng.
- **Nhận diện**: mũ vòm có khe nhìn + sống bờm đồng · hình thoi đồng giữa ngực · dây đạn chéo ngực · đai lưng có túi đạn · giáp gối đồng bát giác.
- **Quy cách (chuẩn 2026-09-08)**: 4 món Mũ (head) / Áo (body: torso + upperArm + forearm) / Quần (legs: thigh + shin) / Giày (feet).
- **Chống lộ da**: tà giáp phủ hông/đũng, cổ giáp cao, ống bắp tay và cẳng tay bọc kín.

```javascript
// Base 0 - HEAVY GUN. Sẵn có piece() từ armorKit.

const M = (pal) => ({
  red:     { color: 0xa3242c, metalness: 0.55, roughness: 0.52 }, // thep son do tham
  redLo:   { color: 0x7a1a20, metalness: 0.50, roughness: 0.60 }, // do toi (ta giap, ranh)
  iron:    { color: 0x4b4e54, metalness: 0.72, roughness: 0.48 }, // vien sat xam
  ironLo:  { color: 0x2b2d31, metalness: 0.65, roughness: 0.55 }, // sat den (gang, de)
  bronze:  { color: 0xb08a3c, metalness: 0.82, roughness: 0.34 }, // dong co
  brass:   { color: 0xd8ad3e, metalness: 0.90, roughness: 0.28 }, // dong thau (vo dan, khoa)
  leather: { color: 0x5a3a26, metalness: 0.06, roughness: 0.88 }, // dai da
  slit:    { color: 0x0c0d10, metalness: 0.10, roughness: 0.90 }, // khe nhin mu
});

// 1. MU VOM (Head)
export function head(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('red', w, h, d, 1.16, 1.10, 1.16, [0, h * 0.04, 0]);
  b.bandStack('red', { w: w * 0.76, h: h * 0.52, d: d * 0.76, y: h * 0.60, count: 3, taper: 0.47, liner: false }); // chom vom (tang tren nho, day 1.12w)
  b.slab('bronze', w * 0.12, h * 0.46, d * 0.55, [0, h * 0.86, -d * 0.02], { ch: w * 0.02 }); // song bom dong
  // Khe nhin + khung dong
  b.slab('bronze', w * 0.92, h * 0.24, d * 0.10, [0, h * 0.12, d * 0.62], { ch: h * 0.02 });
  b.slab('slit', w * 0.74, h * 0.12, d * 0.10, [0, h * 0.12, d * 0.665], { ch: 0 });
  b.slab('bronze', w * 0.14, h * 0.50, d * 0.10, [0, -h * 0.10, d * 0.62], { ch: h * 0.02 }); // gong mui chu T
  // Ap ma + che cam
  b.both((sx) => { b.slab('iron', w * 0.14, h * 0.62, d * 1.08, [sx * w * 0.56, -h * 0.06, 0], { ch: w * 0.02 }); });
  b.slab('iron', w * 0.92, h * 0.22, d * 0.14, [0, -h * 0.40, d * 0.56], { ch: h * 0.03 });
  // Vanh co (gorget)
  b.slab('iron', w * 1.06, h * 0.16, d * 1.10, [0, -h * 0.52, 0], { ch: h * 0.03 });
  return b.build();
}

// Cong tay: tay giap + bao tay sat den
function gauntlet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('red', w, h, d, 1.30, 1.06, 1.30, [0, h * 0.04, 0]);                           // ong cang tay day
  b.slab('iron', w * 1.40, h * 0.16, d * 1.40, [0, h * 0.44, 0], { ch: h * 0.03 });     // vanh khuyu
  b.slab('leather', w * 1.36, h * 0.12, d * 1.36, [0, h * 0.05, 0], { ch: h * 0.02 });  // day da giua
  b.box('brass', w * 0.22, h * 0.14, d * 0.10, [0, h * 0.05, d * 0.70]);                // khoa day
  b.slab('iron', w * 1.42, h * 0.20, d * 1.42, [0, -h * 0.30, 0], { ch: h * 0.03 });    // vanh co tay
  b.slab('ironLo', w * 1.30, h * 0.34, d * 1.30, [0, -h * 0.52, 0], { ch: h * 0.04 });  // bao tay sat den (che mu ban tay)
  return b.build();
}

// 2. AO GIAP (Body)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.bandStack('red', { w: w * 1.32, h: h * 0.86, d: d * 1.32, y: -h * 0.10, count: 3, taper: 0.03, trim: 'iron' });
    b.slab('iron', w * 1.40, h * 0.14, d * 1.20, [0, h * 0.40, 0], { ch: h * 0.03 });
    b.slab('leather', w * 1.36, h * 0.12, d * 1.36, [0, -h * 0.38, 0], { ch: h * 0.02 });
    return b.build();
  }
  if (slot === 'forearm') return gauntlet(w, h, d, pal);

  // Than ao chinh (torso)
  const b = piece(mats);
  const fz = d * 0.58;
  b.cover('red', w, h, d, 1.20, 1.03, 1.24, [0, 0, 0]);
  b.slab('iron', w * 0.62, h * 0.36, d * 0.62, [0, h * 0.62, 0], { ch: h * 0.04 });       // co giap cao
  // Hinh thoi dong giua nguc
  b.box('bronze', w * 0.20, w * 0.20, d * 0.10, [0, h * 0.14, fz + d * 0.10], { rot: [0, 0, Math.PI / 4] });
  // Cau vai to tron nhieu lop + vanh sat
  b.both((sx) => {
    b.sphere('red', w * 0.36, [sx * w * 0.60, h * 0.42, 0], { thetaLength: Math.PI * 0.62 });
    b.slab('iron', w * 0.46, h * 0.12, d * 1.34, [sx * w * 0.62, h * 0.36, 0], { ch: h * 0.03 });
    b.slab('redLo', w * 0.40, h * 0.16, d * 1.30, [sx * w * 0.66, h * 0.20, 0], { ch: h * 0.03 });
  });
  // Day dan cheo nguc (da + vo dan dong)
  b.slab('leather', w * 0.16, h * 1.20, d * 0.06, [0, h * 0.02, fz + d * 0.03], { rot: [0, 0, 0.72], ch: h * 0.01 });
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    b.cyl('brass', w * 0.045, w * 0.045, h * 0.20, [w * (0.30 - t * 0.60), h * (0.40 - t * 0.80), fz + d * 0.08], { rot: [0, 0, 0.72] });
  }
  // Dai lung + tui dan
  b.belt('leather', 'brass', { w: w * 1.16, h: h * 0.17, d: d * 1.18, y: -h * 0.46 });
  b.both((sx) => { b.pouch('leather', 'brass', w * 0.20, h * 0.26, d * 0.16, [sx * w * 0.36, -h * 0.46, fz + d * 0.06]); });
  // Ta giap phu hong / dung (khu ho da giua ao va quan)
  b.slab('redLo', w * 1.18, h * 0.56, d * 1.20, [0, -h * 0.84, 0], { ch: h * 0.03 });
  b.slab('red', w * 0.56, h * 0.58, d * 0.14, [0, -h * 1.06, fz + d * 0.02], { ch: h * 0.04 });   // tam che bung truoc
  b.slab('red', w * 0.56, h * 0.50, d * 0.14, [0, -h * 1.04, -fz], { ch: h * 0.04 });           // tam sau
  b.box('bronze', w * 0.08, h * 0.08, d * 0.06, [w * 0.18, -h * 0.98, fz + d * 0.10]);
  b.box('bronze', w * 0.08, h * 0.08, d * 0.06, [-w * 0.18, -h * 0.98, fz + d * 0.10]);
  return b.build();
}

// 3. QUAN (Legs)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('red', w, h, d, 1.16, 1.02, 1.22, [0, 0, 0]);
    // Giap goi dong bat giac
    b.slab('iron', w * 1.22, h * 0.24, d * 1.26, [0, h * 0.40, 0], { ch: h * 0.04 });
    b.slab('bronze', w * 0.70, h * 0.30, d * 0.24, [0, h * 0.36, d * 0.64], { ch: h * 0.07 });
    // Tam ong chan truoc + dinh tan
    b.slab('red', w * 0.86, h * 0.44, d * 0.12, [0, -h * 0.10, d * 0.66], { ch: h * 0.03 });
    b.slab('iron', w * 0.98, h * 0.06, d * 0.14, [0, -h * 0.34, d * 0.66], { ch: 0 });
    b.rivets('bronze', 2, w * 0.05, [-w * 0.32, -h * 0.10, d * 0.74], [w * 0.32, -h * 0.10, d * 0.74]);
    return b.build();
  }

  // Dui
  b.cover('red', w, h, d, 1.16, 1.03, 1.24, [0, 0, 0]);
  b.slab('red', w * 0.90, h * 0.62, d * 0.14, [0, h * 0.04, d * 0.68], { ch: h * 0.04 });   // tam dui truoc
  b.slab('iron', w * 1.00, h * 0.06, d * 0.16, [0, h * 0.36, d * 0.68], { ch: 0 });
  b.slab('leather', w * 1.28, h * 0.12, d * 1.36, [0, -h * 0.30, 0], { ch: h * 0.02 });
  b.box('brass', w * 0.16, h * 0.10, d * 0.10, [0, -h * 0.30, d * 0.72]);
  b.rivets('bronze', 2, w * 0.05, [-w * 0.34, h * 0.20, d * 0.76], [w * 0.34, h * 0.20, d * 0.76]);
  return b.build();
}

// 4. GIAY (Feet)
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('red', w, h, d, 1.20, 1.42, 1.48, [0, h * 0.22, d * 0.10]);
  b.slab('iron', w * 1.10, h * 0.20, d * 1.30, [0, h * 0.60, d * 0.06], { ch: h * 0.04 });   // vanh co ung
  b.slab('bronze', w * 0.50, h * 0.16, d * 0.42, [0, h * 0.22, d * 0.72], { ch: h * 0.03 }); // nep mu ban chan
  b.cover('ironLo', w, h, d, 1.22, 0.62, 1.52, [0, -h * 0.48, d * 0.10]);                    // de day
  return b.build();
}

export const BASE0_HEAVYGUN = { head, body, legs, feet };
```
