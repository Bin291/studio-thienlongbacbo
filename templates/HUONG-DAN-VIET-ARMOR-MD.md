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

### 2.4 Vóc dáng mặc định (`DEFAULT_APPEARANCE`):
Nhân vật trong game có thể tùy biến qua các thanh trượt vóc dáng, nhưng giá trị mặc định là:
- `height: 1.0` (Chiều cao, phạm vi 0.80 - 1.25)
- `fat: 1.0` (Độ mập, phạm vi 0.80 - 1.40)
- `legLen: 1.0`, `torsoLen: 1.0`, `armLen: 1.0` (Độ dài chi/thân)
- `chest: 0.35` (Độ nở ngực), `bust: 0.45` (Vòng 1 nữ), `belly: 0.10` (Bụng), `butt: 0.30` (Mông)
- `gender: 'male'`, `outfit: 'shirt'` (Áo sơ mi) hoặc `'under'` (Đồ lót)

> 💡 **Quy tắc co giãn giáp:** Giáp **không đặt kích thước tuyệt đối**. Khi render, engine truyền kích thước thực tế `w, h, d` của đốt xương mà nó neo vào (đọc từ `mesh.geometry.parameters`). Code giáp chỉ cần nhân tỉ lệ (ví dụ `w * 1.15`, `h * 0.5`) là sẽ tự động ôm khít nhân vật bất kể người béo, gầy hay cao thấp!

---

## 3. Quy Chuẩn 4 Món Trang Bị & Điểm Neo (Anchors)

Một bộ giáp hoàn chỉnh luôn bao gồm đúng **4 món**:

| Món (`key`) | Tên | Các mesh neo vào trên nhân vật | Số lần gọi builder | Chỉ số cộng |
| :--- | :--- | :--- | :--- | :--- |
| **`head`** | Mũ | `parts.head` (mesh đầu) | 1 lần | Tỉ lệ chí mạng (Crit Rate) |
| **`body`** | Áo giáp | `parts.torso` (thân/ngực) + 2 bắp tay (`leftArm.mesh`, `rightArm.mesh`) | **3 lần** (`slot: 'torso'`, `'upperArm'`) | Máu tối đa (HP) |
| **`hands`** | Găng tay | 2 cẳng tay (`leftArm.forearm`, `rightArm.forearm`) | **2 lần** (`slot: 'forearm'`) | Độ chính xác (Accuracy) |
| **`legs`** | Giày/Ủng | Đùi, cẳng chân, bàn chân cả 2 bên | **6 lần** (`slot: 'thigh'`, `'shin'`, `'foot'`) | Tốc độ chạy (Move Speed) |

---

## 4. Cấu Trúc Của File Markdown Chuẩn Bị Import

Một file Markdown hợp lệ gồm:
1. **Tiêu đề (`# Tên Bộ Giáp`)**: Dùng làm tên hiển thị của bộ giáp.
2. **Mô tả & Ý tưởng thiết kế**: Ghi chép phong cách, cốt truyện hoặc bảng chỉ số.
3. **Khối code JavaScript**: Đặt trong cặp dấu ```javascript ... ``` chứa 4 hàm xuất xưởng (`head`, `body`, `hands`, `legs`).

### Cấu Trúc Hàm Builder:
Mỗi hàm builder có chữ ký:
```js
export function <tênMón>(w, h, d, pal, slot) {
  // w, h, d: Chiều ngang, chiều cao, chiều sâu của mesh neo
  // pal: Bảng màu { base, dark, trim, steel, ... }
  // slot: Nhãn phân đoạn ('torso', 'upperArm', 'thigh', 'shin', 'foot', 'forearm')
  return group; // Trả về một THREE.Group
}
```

---

## 5. Bộ Thư Viện Tạo Hình `armorKit` (Khuyên Dùng)

File Markdown được hỗ trợ sẵn bộ kit tạo hình `armorKit` hiện đại nhất của game:
- **Tấm vát mép 45 độ (`b.slab`)**: Tạo bề mặt kim loại bắt sáng cao cấp, không còn góc cạnh 90° kiểu hộp thô.
- **Tự động gộp Mesh (`b.build`)**: Gom tất cả khối cùng vật liệu thành 1 BufferGeometry duy nhất, giảm draw call từ 80 xuống còn 4-6 calls/món.

### Các hàm API chính trong `armorKit`:
```js
const b = piece(MATS); // MATS: { tênVậtLiệu: { color, metalness, roughness, emissive? } }

// 1. Tấm vát cạnh (nguyên thuỷ chính)
b.slab(matKey, w, h, d, [x, y, z], { ch, rot });

// 2. Tấm trùm kín một đoạn cơ thể (tự tính góc vát an toàn không lộ da)
b.cover(matKey, w, h, d, kx, ky, kz, [x, y, z]);

// 3. Chồng bậc thang (dùng cho mũ, cổ găng, cổ ủng, tà giáp)
b.bandStack(matKey, { w, h, d, y, z, count: 4, taper: 0.05, trim: 'trimMat' });

// 4. Khung viền kim loại ôm quanh 1 mặt phẳng
b.frame(matKey, w, h, z, { t, d, x, y });

// 5. Dựng đối xứng 2 bên (Trái x=-1, Phải x=1)
b.both((sx) => {
  b.slab(matKey, w * 0.4, h * 0.2, d, [sx * w * 0.6, y, z]);
});

// 6. Chi tiết phụ trợ
b.belt(leatherMat, buckleMat, { w, h, d, y }); // Đai thắt lưng
b.pouch(leatherMat, metalMat, w, h, d, pos);   // Túi đeo hông/đùi
b.ropeCoil(ropeMat, hookMat, r, pos, rot);      // Cuộn dây thừng + móc
b.cyl(matKey, rTop, rBot, h, pos, opts);       // Hình trụ (chốt tròn, la bàn)
b.box(matKey, w, h, d, pos, opts);             // Khối hộp nhỏ (đinh tán)

return b.build(); // Trả về THREE.Group đã gộp mesh hoàn chỉnh
```

---

## 6. Bài Học Rigging Bắt Buộc Khi Thiết Kế (Chống Xuyên Giáp)

1. **Ống bắp tay (Upper Arm)**:
   - Phải kiểm tra `if (slot === 'upperArm')`: Dựng ống bọc bắp tay gắn vào mesh bắp tay để vung cùng khớp vai.
   - Thon nhỏ trục Z ở phần trên sát khớp vai để cung quét khi vung tay không bị trồi quá cao.
2. **Giáp vai / Pauldron trên thân (Torso)**:
   - Pauldron gắn trên ngực là khối tĩnh. Do đó khối vai phải là một **mái vòm (dome) đủ sâu trục Z** (`d * 1.5 - 1.6`) để trùm kín đỉnh ống bắp tay khi tay vung ra trước và sau.
3. **Phủ kín thân dưới (Bụng & Chậu)**:
   - Tham số `h` của `body` là chiều cao mesh **Ngực**, nhưng dưới ngực còn có **Bụng** (`belly`) và **Quần đùi** (`shorts`).
   - Tọa độ áo giáp phải phủ xuống tận `y ≈ -1.4h` đến `-1.5h` (đai lưng, tà giáp trước/sau/hông và tấm đũng giữa) để không hở đồ lót.
4. **Giày và chân (`legs`)**:
   - Phân biệt bàn chân với đùi/cẳng chân bằng `slot === 'foot'` (hoặc `d > h * 1.3`).
   - Bàn chân có chiều sâu Z lớn hơn hẳn, cần dựng dạng ủng mũi vuông/mũi vát và đế dày.
   - Cẳng chân và đùi cần nẹp đầu gối hoặc đai khớp để khi co gối không bị hở da.

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
   - Dùng chuột xoay 360 độ, zoom cận cảnh từng góc (Mũ, Áo, Găng, Giày).
   - Tích chọn **Chạy/Đi bộ** và thử các chiêu thức trong ô chọn động tác để kiểm tra xem có chỗ nào bị lòi da hay xuyên giáp không.
   - Bấm **💾 Xuất .md** để lưu lại bản hoàn thiện.
