# Hướng Dẫn Định Dạng Markdown & Quy Luật Thiết Kế Armor Cho Game (Three.js)

> Tài liệu chuẩn dành cho việc thiết kế, viết code và import trang bị giáp (Armor) vào game thông qua công cụ **3D Armor Studio** (`npm run armor`).

---

## 1. Bản Chất Hệ Thống Giáp Trong Game

Game **không sử dụng file 3D tĩnh** (`.glb`, `.fbx`) hay ảnh texture UV-map ngoài. 
- Toàn bộ nhân vật, quái vật và các bộ giáp đều được **dựng trực tiếp bằng Three.js bằng code procedural** (các khối hộp ghép `THREE.BoxGeometry`, tấm vát cạnh `ExtrudeGeometry`, và vật liệu chuẩn `THREE.MeshStandardMaterial`).
- **Icon trang bị trong túi đồ và cửa hàng được render tự động 100%** từ chính code 3D này qua một canvas ngầm. Do đó, chỉ cần viết code 3D chuẩn là game sẽ tự có icon chính xác tương ứng.
- **"Tạo 1 bộ giáp" = Viết 1 file Markdown (`.md`)** chứa đoạn code JavaScript định nghĩa hình khối cho 4 bộ phận.

---

## 2. Tỉ Lệ & Kích Thước Nhân Vật Mặc Định

Nhân vật được tính toán theo đơn vị chuẩn **`STUD = 0.2`**.
Tổng chiều cao nhân vật mặc định (từ đỉnh đầu tới mặt đất) = **5 stud = 1.0 đơn vị thế giới**.

### 2.1 Chiều cao từng đốt (`B` - stud):
- **Chân (2.00 stud)**: Đùi (`thigh: 1.00`), Cẳng chân (`shin: 0.80`), Bàn chân (`foot: 0.20`).
- **Thân (2.00 stud)**: Bụng (`belly: 0.72`), Ngực (`chest: 1.00`), Cổ (`neck: 0.28`).
- **Đầu (1.00 stud)**: Đầu (`head: 1.00`).
- **Tay (2.00 stud)**: Bắp tay trên (`upperArm: 0.95`), Cẳng tay (`forearm: 0.85`), Bàn tay (`hand: 0.20`).

### 2.2 Bề ngang & bề dày từng đốt (`W` - stud):
- Ngực (`chest`): Ngang `2.05` | Dày `1.00`
- Bụng (`belly`): Ngang `1.75` | Dày `0.92`
- Cổ (`neck`): Ngang `0.55` | Dày `0.55`
- Đầu (`head`): Ngang `1.88` | Dày `1.00`
- Cánh tay (`arm`): Ngang `0.80` | Dày `0.80`
- Chân (`leg`): Ngang `0.84` | Dày `0.90`

### 2.3 Cây phả hệ khung xương (Rigging Tree):
```text
root (tâm mặt đất)
 └── hips (hông)
      ├── leftLeg / rightLeg (đùi > gối > cẳng chân > bàn chân)
      └── belly (bụng)
           └── chest (ngực)
                ├── leftArm / rightArm (vai > bắp tay > khuỷu > cẳng tay > bàn tay)
                └── neck (cổ)
                     └── head (đầu)
```

---

## 3. Quy Chuẩn 4 Món Trang Bị & Điểm Neo (Anchors) — Chuẩn Kiến Trúc 2026-09-08

Một bộ giáp hoàn chỉnh luôn bao gồm đúng **4 món**:

| Món (`key`) | Tên | Các mesh neo vào trên nhân vật | Số lần gọi builder | Nhiệm vụ |
| :--- | :--- | :--- | :--- | :--- |
| **`head`** | Mũ | `parts.head` (mesh đầu) | 1 lần | Chỏm mũ, vành nón, mặt nạ, sống bờm. |
| **`body`** | Áo giáp | `parts.torso` (thân/ngực) + 2 bắp tay (`upperArm`) + 2 cẳng tay (`forearm`) | **5 lần** (`slot: 'torso'`, `'upperArm'`, `'forearm'`) | Thân giáp, cầu vai, tà hông, ống bắp tay, ống cẳng tay (gộp cả 'hands' cũ). |
| **`legs`** | Quần | Đùi (`thigh`) + Cẳng chân (`shin`) cả 2 bên | **4 lần** (`slot: 'thigh'`, `'shin'`) | Ống quần bó, giáp đùi, nẹp đầu gối. |
| **`feet`** | Giày / Ủng | Bàn chân (`foot`) cả 2 bên | **2 lần** (`slot: 'foot'`) | Mũi ủng, nẹp mu bàn chân, đế giày. |

> 💡 **Lưu ý quan trọng**:
> - Cẳng tay **gộp vào Áo giáp (`body`)**, dispatch qua `slot === 'forearm'`.
> - Bàn chân tách thành hàm riêng **`feet(w, h, d, pal)`**, không còn cần mẹo `isFoot` đoán qua tỉ lệ.

---

## 4. Cấu Trúc Của File Markdown Chuẩn Bị Import

Một file Markdown hợp lệ gồm:
1. **Tiêu đề (`# Tên Bộ Giáp`)**: Dùng làm tên hiển thị của bộ giáp.
2. **Mô tả & Ý tưởng thiết kế**: Ghi chép phong cách, cốt truyện hoặc bảng chỉ số.
3. **Khối code JavaScript**: Đặt trong cặp dấu ```javascript ... ``` chứa 4 hàm xuất xưởng (`head`, `body`, `legs`, `feet`).

### Cấu Trúc Hàm Builder:
Mỗi hàm builder có chữ ký:
```js
export function tenMon(w, h, d, pal, slot) {
  // w, h, d: Chiều ngang, chiều cao, chiều sâu của mesh neo
  // pal: Bảng màu { base, dark, trim, steel, ... }
  // slot: Nhãn phân đoạn ('torso', 'upperArm', 'forearm', 'thigh', 'shin', 'foot')
  const b = piece(M(pal));
  // ... code dựng các khối giáp ở đây ...
  return b.build(); // Trả về một THREE.Group
}
```

---

## 5. Bộ Thư Viện Tạo Hình `armorKit` (Khuyên Dùng)

File Markdown được hỗ trợ sẵn bộ kit tạo hình `armorKit` hiện đại nhất của game:
- **Tấm vát mép 45 độ (`b.slab`)**: Tạo bề mặt kim loại bắt sáng cao cấp.
- **Khối cầu vòm mượt mà (`b.sphere`) (MỚI)**: Tạo bán cầu hoặc chỏm cầu tròn cho cầu vai, đỉnh mũ, ngọc hộ tâm.
- **Tự động gộp Mesh (`b.build`)**: Gom tất cả khối cùng vật liệu thành 1 BufferGeometry duy nhất, giảm draw call từ 80 xuống còn 4-6 calls/món.

### Các hàm API chính trong `armorKit`:
```js
function viDu(w, h, d, pal) {
  const b = piece(M(pal));

  // 1. Tấm vát cạnh (nguyên thuỷ chính)
  b.slab('gold', w, h, d, [0, 0, 0], { ch: h * 0.05, rot: [0, 0, 0] });

  // 2. Tấm trùm kín một đoạn cơ thể (tự tính góc vát an toàn không lộ da)
  b.cover('plate', w, h, d, 1.15, 1.05, 1.20, [0, 0, 0]);

  // 3. Khối cầu / Bán cầu vòm mượt mà (MỚI 2026-09-08)
  b.sphere('gold', w * 0.35, [0, h * 0.45, 0], { thetaLength: Math.PI * 0.5 });

  // 4. Chồng bậc thang (dùng cho mũ, cổ găng, cổ ủng, tà giáp)
  b.bandStack('plate', { w: w * 1.15, h: h * 0.8, d: d * 1.2, y: 0, count: 4, taper: 0.05, trim: 'copper' });

  // 5. Khung viền kim loại ôm quanh 1 mặt phẳng
  b.frame('copper', w, h, d * 0.5, { t: w * 0.05, d: 0.05, x: 0, y: 0 });

  // 6. Dựng đối xứng 2 bên (Trái x=-1, Phải x=1)
  b.both((sx) => {
    b.slab('plate', w * 0.4, h * 0.2, d, [sx * w * 0.6, 0, 0]);
  });

  // 7. Chi tiết phụ trợ
  b.belt('leather', 'copper', { w: w * 1.15, h: h * 0.15, d: d * 1.15, y: -h * 0.5 }); // Đai thắt lưng
  b.pouch('leather', 'copper', w * 0.3, h * 0.25, d * 0.15, [w * 0.5, 0, 0]);           // Túi đeo hông/đùi
  b.ropeCoil('leather', 'steel', w * 0.2, [0, 0, 0]);                                   // Cuộn dây thừng + móc
  b.cyl('steel', w * 0.1, w * 0.1, h * 0.2, [0, 0, 0]);                                  // Hình trụ (chốt tròn, la bàn)
  b.box('steel', w * 0.08, h * 0.08, d * 0.08, [0, 0, 0]);                               // Khối hộp nhỏ (đinh tán)

  return b.build(); // Trả về THREE.Group đã gộp mesh hoàn chỉnh
}
```

---

## 6. Bài Học Rigging Bắt Buộc Khi Thiết Kế (Chống Xuyên Giáp)

1. **Ống bắp tay (Upper Arm)**:
   - Kiểm tra `if (slot === 'upperArm')`: Dựng ống bọc bắp tay gắn vào mesh bắp tay để vung cùng khớp vai.
   - Thon nhỏ trục Z ở phần trên sát khớp vai để cung quét khi vung tay không bị trồi quá cao.
2. **Ống cẳng tay (Forearm)**:
   - Kiểm tra `if (slot === 'forearm')`: Dựng ống bọc cẳng tay gắn vào mesh cẳng tay để vung cùng khuỷu tay.
3. **Giáp vai / Pauldron trên thân (Torso)**:
   - Pauldron gắn trên ngực là khối tĩnh. Do đó khối vai phải là một **mái vòm (dome) đủ sâu trục Z** (`d * 1.3 - 1.6`) hoặc dùng `b.sphere()` để trùm kín đỉnh ống bắp tay khi tay vung ra trước và sau.
4. **Phủ kín thân dưới (Bụng & Chậu)**:
   - Tham số `h` của `body` là chiều cao mesh **Ngực**, nhưng dưới ngực còn có **Bụng** (`belly`) và **Quần đùi** (`shorts`).
   - Tọa độ áo giáp phải phủ xuống tận `y ≈ -1.4h` đến `-1.5h` (đai lưng, tà giáp trước/sau/hông và tấm đũng giữa) để không hở đồ lót.
5. **Giày và Quần (`legs` & `feet`)**:
   - Quần (`legs`) phủ trọn đùi và cẳng chân.
   - Giày (`feet`) là hàm riêng biệt, phủ bàn chân với đế dày và mũi bảo hộ.

---

## 7. Cách Sử Dụng Armor Studio Để Xem Trực Tiếp

1. Chạy lệnh mở bàn thử:
   ```bash
   npm run armor
   ```
   *(Trình duyệt sẽ tự mở trang `http://localhost:5173/dev/armor-studio.html`)*.
2. Bấm nút **📂 Nạp file .md** hoặc **kéo thả file `.md`** của bạn trực tiếp vào giữa màn hình 3D.
3. Nhấn **▶ Áp dụng (hoặc phím F5 / Ctrl+Enter)**:
   - Hệ thống tự động bóc tách code JS bên trong file Markdown.
   - Nhân vật 3D trên màn hình sẽ ngay lập tức mặc bộ giáp mới lên người.
4. Kiểm tra chất lượng:
   - Bật **Áo lót giáp (Gambeson)** và tích chọn **🛡️ Chống xuyên giáp** để đảm bảo 100% không lộ da thịt.
   - Dùng chuột xoay 360 độ, zoom cận cảnh từng góc (Mũ, Áo, Quần, Giày).
   - Tích chọn **Chạy/Đi bộ** và thử các chiêu thức trong ô chọn động tác để kiểm tra cử động.
   - Bấm **📸 Chụp full góc (.zip)** để tự động chụp 9 góc ảnh đóng gói ZIP tải về máy.
   - Bấm **💾 Xuất .md** để lưu lại bản hoàn thiện.
