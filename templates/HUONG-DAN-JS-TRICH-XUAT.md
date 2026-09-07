# HƯỚNG DẪN: SỬ DỤNG JAVASCRIPT TRÍCH XUẤT, QUY CHUẨN 4 Ô GIÁP (2026-09-08) & NGHỆ THUẬT THIẾT KẾ GIÁP (KHÔNG LỘ DA, KHÔNG XUYÊN THẤU)

Tài liệu này giải thích chi tiết về tab **"JavaScript Trích Xuất"** trong Armor Studio, cách mang code giáp vào game engine `ThienLongBatBo`, **quy chuẩn 4 ô giáp mới nhất (2026-09-08: Mũ / Áo / Quần / Giày)**, công cụ vòm cầu mượt mà **`b.sphere()`**, tính năng chụp full góc **.zip**, phương pháp giải quyết triệt để lỗi **lộ da thịt / xuyên thấu vai**, và kỹ thuật **tô màu texture trực tiếp lên nhân vật**.

---

## 1. TAB "JAVASCRIPT TRÍCH XUẤT" LÀ GÌ VÀ DÙNG NHƯ THẾ NÀO?

### 1.1. Tại sao lại chia làm 2 Tab: Markdown và JavaScript?
| Tab | Mục đích | Đối tượng sử dụng |
| :--- | :--- | :--- |
| **Markdown File (.md)** | Chứa toàn bộ tài liệu thiết kế: tên bộ giáp, chỉ số, lore cốt truyện, bảng màu và các khối code ```javascript```. | Dùng để con người đọc, lưu trữ tài liệu trong kho dự án, gửi cho AI hoặc chia sẻ cho team đồ họa. |
| **JavaScript Trích Xuất** | Hệ thống tự động bóc tách và lọc sạch mọi văn bản ngoài lề, chỉ giữ lại **100% mã nguồn JavaScript thuần khiết**. | Dùng để copy thẳng vào source code của game engine mà không cần xóa tay các thẻ `#`, `>`, hay ````. |

### 1.2. Cách sử dụng tab JavaScript Trích Xuất
1. **Lấy code đem vào game**:
   - Sau khi bạn nạp hoặc viết giáp ở tab Markdown, bấm chuyển sang tab **"JavaScript Trích Xuất"**.
   - Bấm `Ctrl + A` (chọn tất cả) -> `Ctrl + C` (Copy).
   - Mở dự án game chính (`ThienLongBatBo`), tạo hoặc mở file giáp (ví dụ `src/models/armorSets/myArmorSet.js`) và `Ctrl + V` (Dán) vào.
2. **Sửa code trực tiếp**:
   - Bạn hoàn toàn có thể chỉnh sửa các con số, độ dày, vị trí trực tiếp trong tab này.
   - Hệ thống tự động biên dịch lại ngay sau khi bạn gõ (Auto Live-Update). Bấm `F5` hoặc `Ctrl + Enter` để ép áp dụng ngay.
3. **Xuất file tài liệu**:
   - Bấm nút **💾 Xuất .md** ở góc trên để tải file cấu hình về máy lưu trữ bất cứ lúc nào (tên file được tự động chuẩn hoá an toàn, không dấu tiếng Việt).
4. **Chụp full góc đóng gói ZIP (Mới)**:
   - Bấm nút **📸 Chụp full góc (.zip)**: Camera sẽ tự động xoay qua 9 góc nhìn chuẩn (Trước, Góc 3/4, Hông, Sau, Cận Mũ, Cận Áo, Cận Giày, Góc từ trên xuống, Góc từ dưới lên), tự động chụp ảnh độ phân giải cao và đóng gói thành file `.zip` theo tên bộ giáp tải về máy của bạn chỉ với 1 click!

---

## 2. QUY CHUẨN 4 Ô GIÁP MỚI NHẤT (CHUẨN KIẾN TRÚC 2026-09-08)

> ⚠️ **ĐỔI QUY CHUẨN:** Trước đây hệ thống dùng "Mũ / Áo / Tay / Giày" (`head, body, hands, legs`).
> **Nay chuẩn hoá thành "Mũ / Áo / Quần / Giày" (`head, body, legs, feet`)**:
> 1. Bỏ hẳn ô "Găng tay" (`hands`) độc lập — cẳng tay giờ **gộp vào Áo giáp (`body`, slot: `'forearm'`)**, tương tự bắp tay (`upperArm`).
> 2. Ô "Quần" (`legs`) là Đùi (`thigh`) + Cẳng chân (`shin`).
> 3. Ô "Giày" (`feet`) là Bàn chân (`foot`) riêng biệt, **KHÔNG CÒN CẦN MẸO ĐOÁN** `isFoot = d > h * 1.3` nữa!

### 2.1. Bảng 4 món trang bị chuẩn
| Món (`key`) | Tên | Các mesh neo vào trên nhân vật | Số lần gọi builder | Nhiệm vụ thiết kế |
| :--- | :--- | :--- | :--- | :--- |
| **`head`** | Mũ | `parts.head` (mesh đầu) | 1 lần | Chỏm mũ, vành nón, mặt nạ, sống bờm hoặc kính bảo hộ. |
| **`body`** | Áo giáp | Thân (`torso`) + 2 bắp tay (`upperArm`) + 2 cẳng tay (`forearm`) | **5 lần** (`slot: 'torso'`, `'upperArm'`, `'forearm'`) | Tấm ngực, bụng, đai eo, cầu vai (pauldron), tà hông rủ, ống bắp tay và ống cẳng tay. |
| **`legs`** | Quần | Đùi (`thigh`) + Cẳng chân (`shin`) cả 2 bên | **4 lần** (`slot: 'thigh'`, `'shin'`) | Ống quần bó, giáp đùi, nẹp đầu gối, đai khớp gối. |
| **`feet`** | Giày / Ủng | Bàn chân (`foot`) cả 2 bên | **2 lần** (`slot: 'foot'`) | Mũi ủng, nẹp mu bàn chân, đế giày bảo hộ. |

### 2.2. Cấu trúc chuẩn 4 hàm xuất xưởng
```javascript
// 1. MŨ (Head)
export function head(w, h, d, pal) {
  const b = piece(M(pal));
  // ... dựng chỏm mũ, vành, mặt nạ
  return b.build();
}

// 2. ÁO GIÁP (Body) — Thân + Bắp tay (upperArm) + Cẳng tay (forearm)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  // Ống bắp tay (vung theo khớp vai)
  if (slot === 'upperArm') {
    const b = piece(mats);
    b.bandStack('plate', { w: w * 1.24, h: h * 0.85, d: d * 1.24, y: -h * 0.22, count: 3, taper: 0.05, trim: 'copper' });
    b.slab('plate', w * 1.15, h * 0.48, d * 0.92, [0, h * 0.24, 0], { ch: h * 0.04 }); // Thon z đỉnh
    return b.build();
  }

  // Ống cẳng tay (vung theo khớp khuỷu, thay thế 'hands' cũ)
  if (slot === 'forearm') {
    const b = piece(mats);
    b.cover('cloth', w, h, d, 1.12, 1.05, 1.12, [0, 0, 0]);
    b.bandStack('plate', { w: w * 1.25, h: h * 0.78, d: d * 1.25, y: -h * 0.1, count: 3, taper: 0.04, trim: 'copper' });
    b.slab('jade', w * 0.36, h * 0.32, d * 0.16, [0, -h * 0.15, d * 0.65], { ch: h * 0.03 });
    return b.build();
  }

  // Thân áo chính (torso)
  const b = piece(mats);
  b.cover('plate', w, h, d, 1.22, 1.05, 1.25, [0, 0, 0]);
  // Cầu vai (Pauldron) sâu z trùm cung quét bắp tay
  b.both((sx) => {
    b.slab('plate', w * 0.48, h * 0.35, d * 1.28, [sx * w * 0.58, h * 0.42, 0], { ch: h * 0.06 });
  });
  return b.build();
}

// 3. QUẦN (Legs) — Đùi (thigh) & Cẳng chân (shin)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));
  if (slot === 'shin') { // Cẳng chân
    b.cover('cloth', w, h, d, 1.08, 1.02, 1.16, [0, h * 0.10, 0]);
    b.bandStack('plate', { w: w * 1.20, h: h * 0.78, d: d * 1.24, y: -h * 0.1, count: 3, taper: 0.03, trim: 'copper' });
    return b.build();
  }
  // Đùi (slot === 'thigh' hoặc mặc định)
  b.cover('cloth', w, h, d, 1.08, 1.04, 1.18, [0, 0, 0]);
  b.slab('plate', w * 1.18, h * 0.14, d * 1.20, [0, h * 0.35, 0], { ch: h * 0.02 });
  return b.build();
}

// 4. GIÀY (Feet) — Bàn chân / Ủng riêng biệt
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('plate', w, h, d, 1.18, 1.42, 1.48, [0, h * 0.22, d * 0.12]);
  b.slab('copper', w * 0.45, h * 0.15, d * 0.40, [0, h * 0.18, d * 0.65], { ch: h * 0.02 });
  b.cover('plateLo', w, h, d, 1.20, 0.65, 1.50, [0, -h * 0.52, d * 0.10]);
  return b.build();
}

// Xuất xưởng đủ 4 món:
export const MY_SET = { head, body, legs, feet };
```

---

## 3. CÔNG CỤ TẠO HÌNH VÒM CẦU MỚI: `b.sphere()` TRONG `armorKit`

Trước đây, để làm cầu vai tròn hoặc chỏm mũ, chúng ta phải xếp nhiều tầng `slab` hoặc `bandStack`. Nay `armorKit` đã hỗ trợ trực tiếp hàm dựng **hình cầu / bán cầu vòm mượt mà**:

```javascript
b.sphere(matKey, radius, [x, y, z], {
  rot: [0, 0, 0],           // Xoay góc [rx, ry, rz]
  phiStart: 0,              // Góc bắt đầu quét ngang
  phiLength: Math.PI * 2,   // Độ dài cung quét ngang
  thetaStart: 0,            // Góc quét dọc (0 là đỉnh)
  thetaLength: Math.PI,     // Math.PI/2 nếu chỉ muốn nửa quả cầu (bán cầu mái vòm)
  liner: true,              // Tự động đệm khối lót bên trong chống nhìn xuyên
});
```

### Ví dụ ứng dụng `b.sphere`:
1. **Cầu vai tròn (Rounded Pauldron)**:
   ```javascript
   // Bán cầu úp trên đỉnh vai làm mái che vung tay
   b.sphere('gold', w * 0.32, [sx * w * 0.65, h * 0.48, 0], { thetaLength: Math.PI * 0.6 });
   ```
2. **Ngọc hộ tâm tròn nổi giữa ngực (Heart Orb)**:
   ```javascript
   // Nửa quả cầu ngọc phát sáng nhô ra khỏi tấm ngực
   b.sphere('jade', w * 0.18, [0, h * 0.15, fz + d * 0.08], { thetaLength: Math.PI * 0.5 });
   ```
3. **Chỏm mũ vòm tròn kiểu hiệp sĩ La Mã / Đại Việt**:
   ```javascript
   b.sphere('gold', w * 0.55, [0, h * 0.35, 0], { thetaLength: Math.PI * 0.5 });
   ```

---

## 4. GIẢI QUYẾT TRIỆT ĐỂ: LỖI LỘ DA THỊT & VAI XUYÊN GIÁP

Khi nhân vật chạy (`Walk/Run`) hoặc thi triển chiêu thức (`Slash`, `Thrust`, `Slam`), các khớp xương tay và chân sẽ xoay góc lớn (lên tới 45° - 90°). Nếu thiết kế không đúng quy chuẩn, da thịt màu hồng/be bên dưới sẽ bị hở hoặc chọc thủng qua giáp.

### 🌟 Giải pháp 1: Mặc Áo Lót Giáp Toàn Thân (Gambeson Under-Armor) — BẮT BUỘC
> Trong lịch sử lẫn game RPG chuẩn (The Witcher, Dark Souls, Monster Hunter), **không một hiệp sĩ nào mặc giáp sắt trực tiếp lên da trần**. Luôn luôn có lớp áo lót độn bông hoặc giáp xích (**Gambeson/Bodysuit**) bên dưới.

- **Cách dùng trong Studio**:
  - Tại thanh công cụ dưới chân nhân vật, mục **Trang phục**, chọn: **🛡️ Áo lót giáp (Kín 100% da)**.
  - Toàn bộ vùng nách, cổ, khuỷu tay, khe háng và đầu gối sẽ chuyển thành màu vải lót giáp màu đen mun (`0x14171d`) hoặc da thuộc chìm.
  - Bất kỳ cử động nào đều trông như nếp gấp giáp hoàn hảo, **0% bị lộ da thịt thô thiển**.

### 🌟 Giải pháp 2: Cơ chế chống xuyên giáp tự động (Occlusion Culling)
- Armor Studio và Game Engine đều hỗ trợ checkbox **🛡️ Chống xuyên giáp** (kích hoạt `character.setArmorOcclusion`):
```javascript
character.setArmorOcclusion({
  slimTorso: true,   // Làm thon ngực & bụng bên trong
  slimArms: true,    // Làm thon bắp tay & cẳng tay bên trong
  slimLegs: true,    // Làm thon đùi & cẳng chân bên trong
  hideHair: true,    // Ẩn tóc khi đội mũ trùm kín
});
```
- Khối cơ thể bên trong được tự động thu gọn 10-15%, **về mặt vật lý 100% không có gì để xuyên qua giáp nữa!**

### 🌟 Giải pháp 3: Quy tắc Rigging bắp tay và vai
- **Gắn đúng xương**:
  - Khối tĩnh (Pauldron trên ngực) phải có độ sâu trục Z lớn (`d * 1.3 - 1.6`) để trùm kín cung quét của cánh tay.
  - Ống bắp tay (`upperArm`) phải **thon nhỏ trục Z ở phần sát khớp vai** (`d * 0.9` thay vì `d * 1.3`).
  - Hoặc gắn trực tiếp giáp vai vào bắp tay (`slot === 'upperArm'`) để vai vung đồng bộ với cánh tay.

---

## 5. NGHỆ THUẬT MỚI: TÔ MÀU / TEXTURE TRỰC TIẾP LÊN NHÂN VẬT

Thay vì chỉ đắp các khối hộp 3D, hệ thống hỗ trợ 3 chế độ thiết kế:
- **Chế độ 1: 3D ArmorKit** — Dành cho trọng giáp nặng, mecha, robot.
- **Chế độ 2: Texture Paint (Tô màu giáp)** — Dành cho võ hiệp cổ trang, áo gấm lụa, thích khách gọn gàng:
  - 100% ôm sát đường cong nhân vật nam/nữ.
  - 0% xuyên thấu, 0% lộ da ở mọi góc cử động.
  - 0 mesh phụ, tối ưu FPS tuyệt đối.
- **Chế độ 3: Hybrid (Kết hợp Đỉnh Cao)**:
  - Thân mình, bắp tay, đùi dùng **Texture Paint** để vẽ hoa văn tinh xảo (Long phụng, vảy rồng, vân mây).
  - Điểm xuyết thêm **3D ArmorKit** ở những vị trí thực sự cần độ nổi: **Mũ chiến binh (Helmet)**, **Cặp cầu vai nhô cao (Pauldrons)**, và **Mũi hài (Boots)**.

---

## 6. QUY TRÌNH THIẾT KẾ VÀ ĐƯA VÀO GAME HOÀN CHỈNH

1. **Bước 1**: Bật **Áo lót giáp (Gambeson)** và tích chọn **🛡️ Chống xuyên giáp**.
2. **Bước 2**: Viết code 4 hàm chuẩn 2026-09-08: `head`, `body`, `legs`, `feet`.
3. **Bước 3**: Kiểm thử animation: Tích chọn **Chạy/Đi bộ** và thử các chiêu thức (`Slash`, `Thrust`, `Slam`, `Guard`).
4. **Bước 4**: Bấm **📸 Chụp full góc (.zip)** để kiểm tra toàn bộ 9 góc nhìn của sản phẩm.
5. **Bước 5**: Chuyển sang tab **"JavaScript Trích Xuất"**, sao chép toàn bộ code và dán vào file giáp trong game (`ThienLongBatBo/src/models/armorSets/<tênSet>.js`)!
