# HƯỚNG DẪN: SỬ DỤNG JAVASCRIPT TRÍCH XUẤT & NGHỆ THUẬT THIẾT KẾ GIÁP (KHÔNG LỘ DA, KHÔNG XUYÊN THẤU)

Tài liệu này giải thích chi tiết về tab **"JavaScript Trích Xuất"** trong Armor Studio, cách mang code giáp vào game, đồng thời hướng dẫn phương pháp giải quyết triệt để lỗi **lộ da thịt / xuyên thấu vai**, và kỹ thuật **tô màu texture trực tiếp lên nhân vật** thay vì chỉ ghép khối 3D hộp.

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
   - Mở dự án game chính (`ThienLongBatBo`), mở file giáp (ví dụ `src/armor/myArmorSet.js`) và `Ctrl + V` (Dán) vào.
2. **Sửa code trực tiếp**:
   - Bạn hoàn toàn có thể chỉnh sửa các con số, độ dày, vị trí trực tiếp trong tab này.
   - Hệ thống sẽ tự động biên dịch lại ngay sau khi bạn gõ (Auto Live-Update 150ms).
3. **Xuất file**:
   - Bấm nút **💾 Xuất .md** ở góc trên để tải file cấu hình về máy lưu trữ bất cứ lúc nào.

---

## 2. GIẢI QUYẾT TRIỆT ĐỂ: LỖI LỘ DA THỊT & VAI XUYÊN GIÁP

Khi nhân vật chạy (`Walk/Run`) hoặc thi triển chiêu thức (`Slash`, `Thrust`, `Slam`), các khớp xương tay và chân sẽ xoay góc lớn (lên tới 45° - 90°). Nếu chỉ gắn vài phiến hộp 3D lơ lửng, **da thịt màu hồng/be bên dưới chắc chắn sẽ bị hở hoặc chọc thủng qua giáp**.

### 🌟 Giải pháp 1: Mặc Áo Lót Giáp Toàn Thân (Gambeson Under-Armor) — BẮT BUỘC
> Trong lịch sử lẫn game RPG chuẩn (The Witcher, Dark Souls, Monster Hunter), **không một hiệp sĩ nào mặc giáp sắt trực tiếp lên da trần**. Luôn luôn có lớp áo lót độn bông hoặc giáp xích (**Gambeson/Bodysuit**) bên dưới.

- **Cách dùng trong Studio**:
  - Tại thanh công cụ dưới chân nhân vật, mục **Trang phục**, chọn: **🛡️ Áo lót giáp (Kín 100% da)**.
  - Toàn bộ vùng nách, cổ, khuỷu tay, khe háng và đầu gối sẽ chuyển thành màu vải lót giáp màu đen mun (`0x14171d`) hoặc da thuộc chìm.
  - Lúc này, bất kỳ khe hở nào khi cử động đều trông như một nếp gấp giáp hoàn hảo, **0% bị lộ da thịt thô thiển**.

### 🌟 Giải pháp 2: Ẩn Lưới Da Bị Giáp Bọc (Occlusion Culling)
- Trong code game, khi một nhân vật trang bị Áo Giáp (`body`), ta sẽ **ẩn hoàn toàn mesh ngực và bụng gốc** của nhân vật, hoặc thu nhỏ bắp tay (`scale.set(0.80, 0.92, 0.80)`):
```javascript
// Khi mặc Áo Giáp (body):
character.setArmorOcclusion({
  hideTorso: true,   // Ẩn ngực, bụng, quần lót bên trong
  hideHands: true,   // Ẩn cẳng tay nếu đã có ống tay giáp
  hideLegs: true,    // Ẩn đùi và cẳng chân nếu đã có giáp chân
});
```
- Vì khối thịt bên trong đã bị ẩn hoặc làm thon nhỏ, **về mặt vật lý 100% không có gì để xuyên qua giáp nữa!**

### 🌟 Giải pháp 3: Sửa lỗi cầu vai (Pauldron) bị tay đâm xuyên
- **Sai lầm thường gặp**: Đặt phiến giáp vai vào hàm ngực (`torso`). Khi cánh tay vung về phía trước, bắp tay sẽ chém xuyên qua phiến giáp vai đang đứng yên trên ngực!
- **Chuẩn xác**: Cầu vai bảo hộ **phải được gắn vào `slot === 'upperArm'`**:
```javascript
export function body(w, h, d, pal, slot) {
  const mats = M(pal);
  
  if (slot === 'upperArm') {
    const b = piece(mats);
    // Cầu vai gắn vào bắp tay -> Khi tay vung, cầu vai sẽ vung theo!
    b.slab('gold', w * 1.35, h * 0.35, d * 1.35, [0, h * 0.45, 0], { ch: h * 0.08 });
    b.slab('cyanCore', w * 0.40, h * 0.30, d * 0.15, [0, h * 0.45, d * 0.65]);
    return b.build();
  }

  // Phần thân áo ngực (chỉ bao phủ ngực và bụng)
  const b = piece(mats);
  b.cover('plate', w, h, d, 1.12, 1.05, 1.18, [0, 0, 0]);
  return b.build();
}
```

---

## 3. NGHỆ THUẬT MỚI: TÔ MÀU / TEXTURE TRỰC TIẾP LÊN NHÂN VẬT

> Người dùng hỏi: *"Kiểu ghép khối 3D hộp này bị thô và xấu, có cách nào chỉ cần tô màu lên nhân vật cho đẹp không?"*

**CÂU TRẢ LỜI LÀ: CỰC KỲ ĐƯỢC VÀ ĐÂY LÀ PHƯƠNG PHÁP TỐI ƯU NHẤT CỦA CÁC GAME LOW-POLY/MMORPG!**

Thay vì phải đắp hàng chục khối hộp 3D nặng nề khiến nhân vật trông cồng kềnh như robot đồ chơi, chúng ta sử dụng kỹ thuật **Texture Canvas Painting**:

### 3.1. Ưu điểm vượt trội của Giáp Tô Màu (Texture Paint)
1. **Ôm sát 100% vóc dáng**: Không bị lồi lõm, không góc cạnh thô ráp, tôn trọn vóc dáng nam vạm vỡ hoặc nữ đường cong mềm mại.
2. **0% Xuyên thấu & 0% Lộ da**: Vì hoa văn giáp nằm ngay trên bề mặt da/áo của nhân vật, khi nhân vật xoay khớp, gập gối, vung kiếm, giáp co giãn theo khớp tự nhiên 100%.
3. **Hiệu năng siêu nhẹ**: 0 mesh phụ, 0 draw calls thừa, đạt chuẩn mượt 60 FPS trên cả điện thoại yếu.
4. **Họa tiết phong phú**: Vẽ được rồng vàng uốn lượn, hoa văn vân mây cổ phong, ngọc hộ tâm phát sáng, múi cơ giáp thép và đai da nạm đinh tán.

### 3.2. Ba chế độ thiết kế trong Studio
Hệ thống hiện hỗ trợ 3 chế độ:
- **Chế độ 1: 3D ArmorKit** — Dành cho các bộ giáp nặng (Trọng giáp, Mecha, Robot).
- **Chế độ 2: Texture Paint (Tô màu giáp)** — Dành cho võ hiệp cổ trang, thích khách, áo giáp lụa, giáp da nhẹ, không có khối hộp thừa.
- **Chế độ 3: Hybrid (Kết hợp Đỉnh Cao)**:
  - Thân mình, bắp tay, đùi dùng **Texture Paint** ôm sát để vẽ hoa văn tinh xảo.
  - Điểm xuyết thêm **3D ArmorKit** ở những vị trí thực sự cần độ nổi: **Mũ chiến binh (Helmet)**, **Mũi hài (Boots)**, và **Cặp cầu vai nhô cao (Pauldrons)**.
  - Đây chính là công thức tạo nên các bộ giáp đẹp mắt nhất trong ngành game hiện đại!

---

## 4. TỔNG KẾT QUY TRÌNH THIẾT KẾ HOÀN HẢO
1. **Bước 1**: Bật chế độ **Áo lót giáp (Gambeson)** hoặc kích hoạt **Ẩn da thịt**.
2. **Bước 2**: Thiết kế hoa văn thân áo bằng Texture hoặc dùng `piece()` với độ dôi `scale >= 1.10`.
3. **Bước 3**: Luôn gắn cầu vai vào `upperArm` để xoay đồng bộ với cánh tay.
4. **Bước 4**: Kiểm thử animation chạy (`Walk`) và chém kiếm (`Slash`) để đảm bảo không một góc nào bị hở.
5. **Bước 5**: Chuyển sang tab **"JavaScript Trích Xuất"**, sao chép code và đưa thẳng vào game!
