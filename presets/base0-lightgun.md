# Base 0 — Light Gun: Trang Phục Xạ Thủ Cơ Động (Scout Marksman)

Bộ đồ KHỞI ĐẦU (base0) của lớp **Light Gun** (khoá nội bộ `assassin`, cầm Rifle). Ảnh tham chiếu: `base0-ref/lightgun.png`.

- **Vai trò**: xạ thủ nhanh, né cao — gần như KHÔNG giáp tấm, chủ yếu vải và da; chỉ 1 vai có giáp nhẹ.
- **Chất liệu**: áo khoác olive ngắn, áo lót be cát, quần cargo nâu khaki, da nâu, khoá đồng thau.
- **Nhận diện**: mũ olive có kính bảo hộ đẩy lên · khăn choàng cổ · đai chéo ngực + khoá vuông · giáp vai phải nhỏ viền đồng · bao súng ở đùi · giáp gối da · ủng cao buộc dây.
- **Quy cách (chuẩn 2026-09-08)**: 4 món Mũ / Áo (torso + upperArm + forearm) / Quần (thigh + shin) / Giày (foot).
- **Lưu ý**: mặt nhân vật vẫn lộ (mũ chỉ che đỉnh đầu + tai). Cẳng tay để lộ da, chỉ có băng da + găng hở ngón.

```javascript
// Base 0 - LIGHT GUN. Sẵn có piece() từ armorKit.

const M = (pal) => ({
  olive:   { color: 0x5b6532, metalness: 0.05, roughness: 0.92 }, // ao khoac / non
  oliveLo: { color: 0x424a25, metalness: 0.05, roughness: 0.95 }, // olive toi
  sand:    { color: 0xb39a68, metalness: 0.05, roughness: 0.90 }, // khan / bo tay ao
  tan:     { color: 0x9c8552, metalness: 0.05, roughness: 0.92 }, // ao lot / quan
  leather: { color: 0x5b3a26, metalness: 0.08, roughness: 0.85 }, // da
  leatherD:{ color: 0x3a2618, metalness: 0.08, roughness: 0.88 }, // da dam (gang, de)
  brass:   { color: 0xc9a13a, metalness: 0.85, roughness: 0.30 }, // khoa dong thau
  glass:   { color: 0x1b2026, metalness: 0.40, roughness: 0.15 }, // kinh bao ho
  steel:   { color: 0x8a8f98, metalness: 0.80, roughness: 0.35 }, // bang dan
});

// 1. NON + KINH (Head) - chi che dinh dau va tai, de lo mat
export function head(w, h, d, pal) {
  const b = piece(M(pal));
  b.slab('olive', w * 1.10, h * 0.52, d * 1.10, [0, h * 0.40, 0], { ch: h * 0.05 });         // than non
  b.slab('olive', w * 1.08, h * 0.08, d * 0.40, [0, h * 0.20, d * 0.70], { ch: h * 0.02 });  // luoi trai truoc
  b.slab('leather', w * 1.12, h * 0.10, d * 1.12, [0, h * 0.30, 0], { ch: h * 0.02 });       // day quanh non
  // Kinh bao ho day len tran non (2 mat kinh khung dong)
  b.both((sx) => {
    b.slab('brass', w * 0.36, h * 0.20, d * 0.10, [sx * w * 0.24, h * 0.48, d * 0.58], { ch: h * 0.02 });
    b.slab('glass', w * 0.28, h * 0.13, d * 0.10, [sx * w * 0.24, h * 0.48, d * 0.635], { ch: 0 });
    b.slab('olive', w * 0.12, h * 0.62, d * 0.96, [sx * w * 0.53, -h * 0.02, -d * 0.02], { ch: w * 0.02 }); // ve tai
  });
  b.slab('olive', w * 1.10, h * 0.90, d * 0.20, [0, h * 0.02, -d * 0.52], { ch: d * 0.03 });  // gay non
  return b.build();
}

// Tay: bang da + gang ho ngon (cang tay de lo da)
function bracer(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('leather', w, h * 0.46, d, 1.16, 1.0, 1.16, [0, -h * 0.02, 0]);                    // bang da nua duoi cang tay
  b.box('brass', w * 0.16, h * 0.14, d * 0.10, [0, -h * 0.02, d * 0.64]);                     // khoa
  b.slab('leatherD', w * 1.10, h * 0.30, d * 1.12, [0, -h * 0.40, 0], { ch: h * 0.03 });      // gang ho ngon (che mu ban tay)
  return b.build();
}

// 2. AO KHOAC NGAN (Body)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('olive', w, h * 0.80, d, 1.16, 1.0, 1.16, [0, h * 0.10, 0]);                     // tay ao ngan olive
    b.slab('sand', w * 1.24, h * 0.20, d * 1.24, [0, -h * 0.34, 0], { ch: h * 0.03 });       // bo tay ao be cat
    b.slab('leather', w * 1.20, h * 0.08, d * 1.20, [0, h * 0.30, 0], { ch: h * 0.015 });    // day nho quanh bap tay
    return b.build();
  }
  if (slot === 'forearm') return bracer(w, h, d, pal);

  const b = piece(mats);
  const fz = d * 0.58;
  // Ao lot be cat (nen) + ao khoac olive ngan len tren
  b.cover('tan', w, h, d, 1.14, 1.04, 1.16, [0, 0, 0]);
  b.cover('olive', w, h * 0.80, d, 1.20, 1.0, 1.24, [0, h * 0.10, 0]);
  // Khan choang co
  b.slab('sand', w * 0.96, h * 0.30, d * 1.06, [0, h * 0.60, 0], { ch: h * 0.06 });
  b.slab('sand', w * 0.50, h * 0.34, d * 0.14, [0, h * 0.40, fz + d * 0.04], { rot: [0, 0, Math.PI / 4], ch: h * 0.03 });
  // Day deo cheo nguc + khoa vuong
  b.slab('leather', w * 0.16, h * 1.16, d * 0.06, [-w * 0.02, h * 0.06, fz + d * 0.10], { rot: [0, 0, -0.70], ch: h * 0.01 });
  b.slab('brass', w * 0.22, h * 0.20, d * 0.08, [-w * 0.16, h * 0.20, fz + d * 0.14], { ch: h * 0.03 });
  // Tui nguc phai + khoa keo
  b.pouch('olive', 'brass', w * 0.30, h * 0.26, d * 0.12, [w * 0.30, h * 0.10, fz + d * 0.06]);
  b.slab('oliveLo', w * 0.05, h * 0.70, d * 0.05, [0, h * 0.10, fz + d * 0.07], { ch: 0 });
  // GIAP VAI PHAI nho vien dong (chi 1 vai)
  b.slab('sand', w * 0.44, h * 0.14, d * 1.30, [w * 0.62, h * 0.44, 0], { ch: h * 0.04 });
  b.slab('brass', w * 0.46, h * 0.05, d * 1.32, [w * 0.62, h * 0.52, 0], { ch: 0 });
  b.slab('olive', w * 0.36, h * 0.18, d * 1.26, [-w * 0.60, h * 0.42, 0], { ch: h * 0.05 }); // vai trai chi la vai ao (khong giap)
  // Dai lung + tui dan
  b.belt('leather', 'brass', { w: w * 1.14, h: h * 0.16, d: d * 1.16, y: -h * 0.46 });
  b.pouch('leather', 'brass', w * 0.16, h * 0.24, d * 0.16, [w * 0.30, -h * 0.46, fz + d * 0.05]);
  b.pouch('leather', 'brass', w * 0.16, h * 0.24, d * 0.16, [w * 0.50, -h * 0.46, fz - d * 0.10]);
  // Phu hong / dung bang vai quan (khu ho da giua ao va quan)
  b.slab('tan', w * 1.14, h * 0.54, d * 1.18, [0, -h * 0.84, 0], { ch: h * 0.03 });
  b.slab('tan', w * 0.50, h * 0.40, d * 0.14, [0, -h * 1.06, fz], { ch: h * 0.03 });
  b.slab('tan', w * 0.50, h * 0.40, d * 0.14, [0, -h * 1.06, -fz], { ch: h * 0.03 });
  return b.build();
}

// 3. QUAN CARGO (Legs)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('tan', w, h, d, 1.08, 1.02, 1.16, [0, h * 0.04, 0]);
    // Giap goi da (bat giac)
    b.slab('leather', w * 0.78, h * 0.32, d * 0.20, [0, h * 0.36, d * 0.60], { ch: h * 0.08 });
    b.slab('leatherD', w * 1.16, h * 0.08, d * 1.22, [0, h * 0.36, 0], { ch: h * 0.015 });     // day giu giap goi
    // Mieng ung cao (den giua ong chan)
    b.slab('leather', w * 1.16, h * 0.40, d * 1.22, [0, -h * 0.30, 0], { ch: h * 0.04 });
    for (let i = 0; i < 3; i++) b.box('sand', w * 0.52, h * 0.028, d * 0.05, [0, -h * (0.16 + i * 0.12), d * 0.63], { rot: [0, 0, i % 2 ? 0.5 : -0.5] });
    b.slab('sand', w * 1.18, h * 0.06, d * 1.24, [0, -h * 0.08, 0], { ch: 0 });                // mep ung
    return b.build();
  }

  // Dui
  b.cover('tan', w, h, d, 1.10, 1.03, 1.18, [0, 0, 0]);
  // Tui cargo ben ngoai phai
  b.slab('tan', w * 0.16, h * 0.34, d * 0.78, [w * 0.62, h * 0.06, 0], { ch: h * 0.02 });
  b.slab('sand', w * 0.18, h * 0.08, d * 0.82, [w * 0.63, h * 0.20, 0], { ch: 0 });
  // Bao sung ben trai + day dai
  b.slab('leather', w * 0.22, h * 0.58, d * 0.38, [-w * 0.64, h * 0.02, d * 0.08], { ch: h * 0.03 });
  b.box('steel', w * 0.10, h * 0.10, d * 0.16, [-w * 0.64, h * 0.32, d * 0.08]);           // dau bang dan lo ra
  b.slab('leather', w * 1.22, h * 0.10, d * 1.28, [0, -h * 0.20, 0], { ch: h * 0.02 });
  b.slab('brass', w * 0.16, h * 0.14, d * 0.08, [-w * 0.60, -h * 0.20, d * 0.68], { ch: h * 0.02 });
  return b.build();
}

// 4. UNG DAY BUOC (Feet)
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('leather', w, h, d, 1.16, 1.42, 1.46, [0, h * 0.22, d * 0.10]);
  b.slab('leatherD', w * 0.80, h * 0.30, d * 0.40, [0, h * 0.34, d * 0.72], { ch: h * 0.06 });   // mui ung cung
  b.cover('sand', w, h, d, 1.20, 0.56, 1.50, [0, -h * 0.50, d * 0.10]);                          // de be cat
  return b.build();
}

export const BASE0_LIGHTGUN = { head, body, legs, feet };
```
