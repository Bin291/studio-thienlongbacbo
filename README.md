# 🛡️ 3D Armor Studio (Three.js Web RPG)

Hệ thống độc lập chuyên dụng để **thiết kế, kiểm thử 3D và xem trước trang phục (Armor)** cho game RPG (dựa trên engine nhân vật của *Thiên Long Bát Bộ*).

Hỗ trợ **kéo thả / import trực tiếp file Markdown (`.md`)** chứa code tạo giáp vào trình duyệt và mặc ngay lên nhân vật 3D trong thời gian thực.

---

## ⚡ Bắt Đầu Nhanh

### 1. Cài đặt thư viện:
Mở thư mục `armor-studio` trong terminal / PowerShell và chạy:
```bash
npm install
```

### 2. Chạy ứng dụng:
```bash
npm run dev
```
Trình duyệt sẽ tự động mở tại: **`http://localhost:5174`**

---

## 🎮 Tính Năng Chính

*   **Mannequin 3D Chuẩn Tỉ Lệ Game:**
    *   Sử dụng đúng tỉ lệ gốc của game (`STUD = 0.2`, cao 5 stud = 1.0).
    *   Hỗ trợ chuyển đổi Nam/Nữ, Áo thường/Đồ lót (để soi da), bảng tùy chỉnh vóc dáng (cao, mập, ngực, bụng...).
*   **Trình Soi Hoạt Ảnh & Chống Xuyên Giáp (Rigging Check):**
    *   Bật/tắt chuyển động **Đi bộ / Chạy** để kiểm tra mép áo, tà giáp và ống tay có bị hở da hay xuyên thấu khi khớp vung vẩy không.
    *   Hỗ trợ các chiêu thức chiến đấu: chém (`slash`), đâm (`thrust`), đập (`slam`), thủ (`guard`), lăn né (`roll`), bắn cung (`bowBig`)...
    *   Bộ nút góc nhìn nhanh: Chính diện, Sau lưng, Hông, Góc 3/4, Cận cảnh Mũ, Cận cảnh Thân, Cận cảnh Giày.
*   **Trực Tiếp Import File Markdown (`.md`):**
    *   Kéo thả trực tiếp file `.md` vào giữa màn hình 3D.
    *   Bấm nút **📂 Nạp file .md** để chọn file từ máy.
    *   Trình soạn thảo trực tiếp trên web, bấm **▶ Áp dụng (hoặc phím F5)** để cập nhật giáp ngay lập tức.
    *   Bấm **💾 Xuất .md** để tải file đã chỉnh sửa về máy.
    *   Nút **Cởi hết giáp** để đưa nhân vật về trạng thái nguyên bản.

---

## 📂 Cấu Trúc Thư Mục Repo

```text
armor-studio/
├── index.html                  # Giao diện chính của Studio 3D
├── package.json                # Cấu hình dự án (Three.js + Vite)
├── vite.config.js              # Cấu hình Vite dev server
├── src/
│   ├── appearance.js           # Thông số ngoại hình, màu da, tóc, sliders vóc dáng
│   ├── character.js            # Engine nhân vật 3D, rigging xương, hoạt ảnh chuyển động
│   ├── armorKit.js             # Bộ công cụ tạo giáp vát cạnh 45° & gộp mesh (Three.js)
│   ├── main.js                 # Logic studio, parser markdown, dynamic module execution
│   └── style.css               # Giao diện Dark-mode chuyên nghiệp
├── templates/
│   ├── HUONG-DAN-VIET-ARMOR-MD.md   # Tài liệu đặc tả quy luật tạo giáp đầy đủ
│   └── mau-bo-giap-hoan-chinh.md    # File mẫu chuẩn (Giáp Huyền Vũ Chiến Thần)
└── README.md                   # Hướng dẫn sử dụng repo
```

---

## 📐 Bảng Tỉ Lệ Nhân Vật Chuẩn (STUD = 0.2)

*   **Chiều cao từng đốt xương (`B`):**
    *   Chân: Đùi `1.00`, Cẳng chân `0.80`, Bàn chân `0.20`.
    *   Thân: Bụng `0.72`, Ngực `1.00`, Cổ `0.28`.
    *   Đầu: `1.00`.
    *   Tay: Bắp tay `0.95`, Cẳng tay `0.85`, Bàn tay `0.20`.
*   **Bề ngang & bề dày (`W`):**
    *   Ngực: `2.05 × 1.00` | Bụng: `1.75 × 0.92` | Đầu: `1.88 × 1.00`.
    *   Cánh tay: `0.80 × 0.80` | Chân: `0.84 × 0.90`.

---

## 📝 Cú Pháp Chuẩn Trong File Markdown (.md)

File Markdown cần có tiêu đề `# Tên Bộ Giáp` và 1 khối code ````javascript ... ```` chứa 4 hàm builder:

```markdown
# Bộ Giáp Hoàng Kim

Mô tả thiết kế...

```javascript
const M = (pal) => ({
  plate: { color: 0x15181e, metalness: 0.85, roughness: 0.38 },
  gold:  { color: 0xd4af37, metalness: 0.95, roughness: 0.28 },
  glow:  { color: 0x54e8cf, emissive: 0x54e8cf, emissiveIntensity: 0.9 }
});

// 1. MŨ (Head)
export function head(w, h, d, pal) {
  const b = piece(M(pal));
  b.bandStack('plate', { w: w * 1.14, h: h * 1.2, d: d * 1.2, y: h * 0.16, count: 4 });
  return b.build();
}

// 2. ÁO GIÁP (Body)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);
  // Bắp tay neo vào cánh tay để vung cùng vai
  if (slot === 'upperArm') {
    const b = piece(mats);
    b.bandStack('plate', { w: w * 1.25, h: h * 0.84, d: d * 1.25, y: -h * 0.24, count: 3 });
    return b.build();
  }
  const b = piece(mats);
  b.slab('plate', w * 1.2, h * 0.8, d * 1.2, [0, h * 0.12, 0]);
  return b.build();
}

// 3. GĂNG TAY (Hands)
export function hands(w, h, d, pal) {
  const b = piece(M(pal));
  b.bandStack('plate', { w: w * 1.2, h: h * 1.1, d: d * 1.2, y: h * 0.1, count: 4 });
  return b.build();
}

// 4. GIÀY / ỦNG (Legs)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));
  const isFoot = slot ? slot === 'foot' : d > h * 1.3;
  if (isFoot) {
    b.cover('plate', w, h, d, 1.08, 1.5, 1.25, [0, h * 0.28, d * 0.06]);
  } else {
    b.cover('plate', w, h, d, 1.08, 1.05, 1.16, [0, 0, 0]);
  }
  return b.build();
}
```
```

Xem hướng dẫn chi tiết trong file [`templates/HUONG-DAN-VIET-ARMOR-MD.md`](templates/HUONG-DAN-VIET-ARMOR-MD.md).
