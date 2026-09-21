# Base 0 — Summoners: Đạo Bào Triệu Hồi Sư (Talisman Caller)

Bộ đồ KHỞI ĐẦU (base0) của lớp **Summoners** (khoá nội bộ `summoner`, cầm Pandora Box). Ảnh tham chiếu: `base0-ref/summoners.png`.

- **Vai trò**: support điều binh, chỉ số cân bằng — đạo bào võ hiệp, nhẹ, nhiều phụ kiện bùa.
- **Chất liệu**: vải ngọc lục (jade) + kem, viền vàng, dây thừng vàng, giấy bùa vàng có ấn đỏ, châu linh hồn xanh ngọc PHÁT SÁNG.
- **Nhận diện**: mũ bát giác ngọc lục có ấn âm dương + tua rua · bùa giấy dán trán · cổ áo vàng bản rộng · dây thừng vàng quanh eo + phiến ngọc · 3 lá bùa treo eo + 3 châu linh hồn · tà áo giữa có hoa vàng · quần thụng rộng · ủng quấn băng.
- **Quy cách (chuẩn 2026-09-08)**: 4 món Mũ / Áo (torso + upperArm + forearm) / Quần (thigh + shin) / Giày (foot).
- **Lưu ý**: builder `forearm` không phân biệt tay trái/phải nên bracer ngọc-vàng + khối phát sáng nhỏ gắn ĐỐI XỨNG cả 2 tay. Găng Pandora Box lớn ở ảnh tham chiếu là **vũ khí** (model riêng), không nằm trong bộ giáp.
- **Chống lộ da**: tà áo phủ hông/đũng, cổ áo chéo cao, quần thụng phủ kín chân; mặt nhân vật vẫn lộ (bùa chỉ che trán).

```javascript
// Base 0 - SUMMONERS. Sẵn có piece() từ armorKit.

const M = (pal) => ({
  jade:    { color: 0x3f8f80, metalness: 0.08, roughness: 0.85 }, // vai ngoc luc
  jadeDk:  { color: 0x1f4f4c, metalness: 0.08, roughness: 0.88 }, // ngoc luc dam (mu, ung)
  cream:   { color: 0xe8e0c8, metalness: 0.03, roughness: 0.92 }, // vai kem
  creamLo: { color: 0xc9c0a4, metalness: 0.03, roughness: 0.94 }, // kem toi (bong, bang quan)
  gold:    { color: 0xd0a640, metalness: 0.75, roughness: 0.34 }, // vien vang
  rope:    { color: 0xb8963a, metalness: 0.20, roughness: 0.70 }, // day thung vang
  paper:   { color: 0xe6c15a, metalness: 0.02, roughness: 0.92 }, // giay bua
  seal:    { color: 0xc0392b, metalness: 0.05, roughness: 0.80 }, // an do
  navy:    { color: 0x1b2a30, metalness: 0.10, roughness: 0.80 }, // bo tay xanh den
  glow:    { color: 0x4de8d0, metalness: 0.10, roughness: 0.25, emissive: 0x20d8c0, emissiveIntensity: 1.2 }, // chau linh hon
  wrap:    { color: 0xd8d0b8, metalness: 0.02, roughness: 0.95 }, // bang quan chan
});

// La bua giay (dung o mu, dai eo)
function talisman(b, x, y, z, w, h) {
  b.slab('paper', w, h, w * 0.30, [x, y, z], { ch: w * 0.05 });
  b.box('seal', w * 0.52, w * 0.52, w * 0.10, [x, y - h * 0.22, z + w * 0.17]);
  b.box('seal', w * 0.14, h * 0.34, w * 0.10, [x, y + h * 0.16, z + w * 0.17]);
  return b;
}

// 1. MU BAT GIAC + BUA TRAN (Head)
export function head(w, h, d, pal) {
  const b = piece(M(pal));
  b.slab('jade', w * 1.10, h * 0.44, d * 1.10, [0, h * 0.30, 0], { ch: h * 0.06 });                 // than mu
  b.bandStack('jade', { w: w * 0.66, h: h * 0.40, d: d * 0.66, y: h * 0.66, count: 3, taper: 0.55, liner: false }); // chom bat giac (tang tren nho, day 1.02w)
  b.slab('gold', w * 1.12, h * 0.09, d * 1.12, [0, h * 0.20, 0], { ch: h * 0.02 });                 // vanh vang
  // An am duong tren tran mu
  b.cyl('gold', w * 0.17, w * 0.17, d * 0.08, [0, h * 0.42, d * 0.56], { rot: [Math.PI / 2, 0, 0], seg: 10 });
  b.cyl('jadeDk', w * 0.10, w * 0.10, d * 0.10, [0, h * 0.42, d * 0.60], { rot: [Math.PI / 2, 0, 0], seg: 10 });
  // Bua giay dan tran (chi che tran, khong che mat)
  talisman(b, 0, h * 0.24, d * 0.56, w * 0.20, h * 0.36);
  // Tua rua hai ben
  b.both((sx) => {
    b.cyl('gold', w * 0.02, w * 0.02, h * 0.34, [sx * w * 0.50, h * 0.02, d * 0.30], { seg: 5 });
    b.box('gold', w * 0.08, w * 0.08, w * 0.08, [sx * w * 0.50, -h * 0.18, d * 0.30], { rot: [0.6, 0.6, 0] });
    b.box('jade', w * 0.06, h * 0.16, w * 0.06, [sx * w * 0.50, -h * 0.32, d * 0.30]);
    b.slab('jade', w * 0.12, h * 0.70, d * 0.96, [sx * w * 0.56, -h * 0.02, -d * 0.02], { ch: w * 0.02 });  // ve tai
  });
  b.slab('jadeDk', w * 1.08, h * 0.86, d * 0.20, [0, -h * 0.02, -d * 0.54], { ch: d * 0.03 });     // gay mu
  return b.build();
}

// Bracer ngoc-vang + khoi phat sang nho (doi xung ca 2 tay)
function bracer(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('cream', w, h, d, 1.36, 1.02, 1.36, [0, 0, 0]);                                           // ong tay ao rong mau kem
  b.slab('jadeDk', w * 1.46, h * 0.28, d * 1.46, [0, -h * 0.30, 0], { ch: h * 0.04 });              // bo tay xanh den
  b.slab('gold', w * 1.50, h * 0.06, d * 1.50, [0, -h * 0.15, 0], { ch: 0 });
  b.slab('gold', w * 0.70, h * 0.36, d * 0.14, [0, -h * 0.02, d * 0.80], { ch: h * 0.04 });          // mieng bracer truoc
  b.box('glow', w * 0.26, h * 0.20, d * 0.12, [0, -h * 0.02, d * 0.90]);                            // loi phat sang
  b.slab('navy', w * 1.04, h * 0.26, d * 1.06, [0, -h * 0.52, 0], { ch: h * 0.04 });                // gang xanh den (che mu ban tay)
  return b.build();
}

// 2. DAO BAO (Body)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.cover('cream', w, h, d, 1.36, 1.04, 1.36, [0, 0, 0]);
    b.slab('gold', w * 1.44, h * 0.05, d * 1.44, [0, -h * 0.36, 0], { ch: 0 });
    b.slab('jade', w * 1.40, h * 0.10, d * 1.40, [0, -h * 0.28, 0], { ch: h * 0.02 });
    return b.build();
  }
  if (slot === 'forearm') return bracer(w, h, d, pal);

  const b = piece(mats);
  const fz = d * 0.58;
  // Ao lot kem + ao jade cheo co
  b.cover('cream', w, h, d, 1.22, 1.04, 1.26, [0, 0, 0]);
  b.slab('jade', w * 0.62, h * 0.86, d * 0.10, [0, h * 0.06, fz + d * 0.06], { ch: h * 0.02 });
  b.slab('cream', w * 0.14, h * 0.90, d * 0.14, [w * 0.14, h * 0.10, fz + d * 0.10], { rot: [0, 0, 0.55], ch: h * 0.02 });
  b.slab('cream', w * 0.14, h * 0.90, d * 0.14, [-w * 0.14, h * 0.10, fz + d * 0.10], { rot: [0, 0, -0.55], ch: h * 0.02 });
  b.slab('jadeDk', w * 0.52, h * 0.36, d * 0.60, [0, h * 0.62, 0], { ch: h * 0.05 });               // co ao cao
  // Co ao vang ban rong tren vai
  b.both((sx) => {
    b.slab('cream', w * 0.46, h * 0.20, d * 1.42, [sx * w * 0.60, h * 0.46, 0], { ch: h * 0.05 });
    b.slab('gold', w * 0.48, h * 0.05, d * 1.44, [sx * w * 0.60, h * 0.55, 0], { ch: 0 });
    b.slab('jade', w * 0.40, h * 0.14, d * 1.38, [sx * w * 0.62, h * 0.30, 0], { ch: h * 0.04 });
    b.box('gold', w * 0.10, h * 0.10, d * 0.08, [sx * w * 0.60, h * 0.42, fz + d * 0.06]);            // van xoan vang
  });
  // Day thung vang quanh eo + phien ngoc
  b.slab('jadeDk', w * 1.22, h * 0.16, d * 1.26, [0, -h * 0.46, 0], { ch: h * 0.03 });
  b.slab('rope', w * 1.27, h * 0.07, d * 1.31, [0, -h * 0.46, 0], { ch: h * 0.02 });                  // day thung vang om eo
  b.cyl('jade', w * 0.14, w * 0.14, d * 0.10, [0, -h * 0.46, fz + d * 0.10], { rot: [Math.PI / 2, 0, 0], seg: 8 });
  b.cyl('gold', w * 0.15, w * 0.15, d * 0.05, [0, -h * 0.46, fz + d * 0.06], { rot: [Math.PI / 2, 0, 0], seg: 8 });
  // 3 la bua treo eo + day tua
  talisman(b, -w * 0.20, -h * 0.90, fz + d * 0.10, w * 0.15, h * 0.52);
  talisman(b, 0, -h * 0.92, fz + d * 0.10, w * 0.15, h * 0.52);
  talisman(b, w * 0.20, -h * 0.90, fz + d * 0.10, w * 0.15, h * 0.52);
  // 3 chau linh hon phat sang ben phai hong
  for (let i = 0; i < 3; i++) {
    b.cyl('gold', w * 0.012, w * 0.012, h * 0.18, [w * 0.46, -h * (0.62 + i * 0.28), fz - d * 0.02], { seg: 5 });
    b.sphere('glow', w * 0.075, [w * 0.46, -h * (0.74 + i * 0.28), fz - d * 0.02], { seg: 8, segV: 6 });
  }
  // Ta ao phu hong / dung
  b.slab('cream', w * 1.24, h * 0.62, d * 1.30, [0, -h * 0.86, 0], { ch: h * 0.03 });
  b.slab('cream', w * 1.22, h * 0.40, d * 1.28, [0, -h * 1.32, 0], { ch: h * 0.03 });
  // Tam ta giua ngoc luc vien vang + hoa vang
  b.frame('gold', w * 0.58, h * 0.88, fz + d * 0.10, { t: w * 0.03, d: d * 0.05, y: -h * 1.06 });
  b.slab('jade', w * 0.52, h * 0.82, d * 0.05, [0, -h * 1.06, fz + d * 0.09], { ch: 0 });
  b.cyl('gold', w * 0.11, w * 0.11, d * 0.05, [0, -h * 1.22, fz + d * 0.13], { rot: [Math.PI / 2, 0, 0], seg: 8 });
  b.cyl('jadeDk', w * 0.06, w * 0.06, d * 0.06, [0, -h * 1.22, fz + d * 0.15], { rot: [Math.PI / 2, 0, 0], seg: 8 });
  b.both((sx) => { b.slab('jadeDk', w * 0.04, h * 0.90, d * 1.30, [sx * w * 0.56, -h * 1.08, 0], { ch: 0 }); });
  return b.build();
}

// 3. QUAN THUNG RONG (Legs)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));

  if (slot === 'shin') {
    b.cover('cream', w, h, d, 1.30, 1.02, 1.34, [0, h * 0.06, 0], { chMax: h * 0.06 });
    // Bang quan chan (3 vong) + mep ung xanh den
    for (let i = 0; i < 3; i++) b.slab('wrap', w * 1.20, h * 0.08, d * 1.24, [0, -h * (0.16 + i * 0.12), 0], { ch: h * 0.015 });
    b.slab('jadeDk', w * 1.28, h * 0.22, d * 1.32, [0, -h * 0.42, 0], { ch: h * 0.03 });
    return b.build();
  }
  b.cover('cream', w, h, d, 1.32, 1.03, 1.38, [0, 0, 0]);
  // Hoa van chu "hoi" xanh o gan goi
  b.box('jadeDk', w * 0.32, h * 0.18, d * 0.08, [w * 0.20, -h * 0.20, d * 0.72]);
  b.box('cream', w * 0.14, h * 0.08, d * 0.09, [w * 0.20, -h * 0.20, d * 0.73]);
  b.slab('jade', w * 1.40, h * 0.06, d * 1.46, [0, h * 0.40, 0], { ch: 0 });
  return b.build();
}

// 4. UNG QUAN BANG (Feet)
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('jadeDk', w, h, d, 1.20, 1.40, 1.46, [0, h * 0.22, d * 0.10]);
  b.slab('gold', w * 0.60, h * 0.16, d * 0.36, [0, h * 0.34, d * 0.66], { ch: h * 0.03 });          // mieng vang hoa van
  b.box('jade', w * 0.22, h * 0.10, d * 0.08, [0, h * 0.34, d * 0.86]);
  b.cover('creamLo', w, h, d, 1.22, 0.50, 1.50, [0, -h * 0.50, d * 0.10]);                          // de kem
  return b.build();
}

export const BASE0_SUMMONERS = { head, body, legs, feet };
```
