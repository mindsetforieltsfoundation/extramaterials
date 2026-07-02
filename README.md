# Bài tập tương tác — Unit 1 (4 module)

Bộ bài tập tương tác chuyển từ 4 file Word:
- `unit_1_grammar___vocab.docx` → `grammar-vocab.html` (8 bài)
- `unit_1_language_builder.docx` → `language-builder.html` (9 bài chấm điểm + 1 bài viết tự do)
- `unit_1_listening___speaking.docx` → `listening-speaking.html` (8 bài chấm điểm + 2 bài viết/nói tự do)
- `unit_1_reading___writing.docx` → `reading-writing.html` (9 bài chấm điểm + 1 bài viết tự do)

Học sinh vào `index.html` (Bảng điều khiển), chọn bất kỳ bài nào, làm theo thứ tự tùy ý. Điểm % từng bài được lưu ngay trên trình duyệt (localStorage) và hiển thị lại trên bảng điều khiển.

**Lưu ý về bài nghe (Listening):** file Word gốc không đính kèm file âm thanh (chỉ có icon loa/hình ảnh), nên các bài nghe đã được chuyển thành bài đọc tương đương (giữ nguyên nội dung hội thoại/đoạn văn). Nếu cô có file âm thanh gốc, có thể gửi thêm để em tích hợp thẻ `<audio>` vào đúng những bài này.

---

## Cách 1 — Deploy lên Netlify (nhanh nhất, không cần tài khoản GitHub)

1. Truy cập **https://app.netlify.com/drop**
2. Kéo thả **toàn bộ thư mục này** (hoặc toàn bộ các file .html/.css/.js) vào ô thả file
3. Netlify tự động cấp 1 đường link dạng `https://random-name-xxxx.netlify.app` — gửi link này cho học sinh là dùng được ngay
4. (Tuỳ chọn) Đăng ký tài khoản Netlify miễn phí để đổi tên link, hoặc gắn tên miền riêng

Không cần cài đặt gì, không cần biết lệnh git.

---

## Cách 2 — Deploy lên GitHub Pages (miễn phí, có địa chỉ cố định)

### Nếu cô có sẵn tài khoản GitHub:

```bash
# 1. Vào thư mục chứa các file này
cd duong-dan-toi-thu-muc-nay

# 2. Khởi tạo git và đẩy lên GitHub
git init
git add .
git commit -m "Bài tập tương tác Unit 1"
git branch -M main
git remote add origin https://github.com/TEN-TAI-KHOAN/TEN-REPO.git
git push -u origin main
```

### Bật GitHub Pages:
1. Vào repo trên GitHub → **Settings** → **Pages**
2. Ở mục "Build and deployment" → **Source**: chọn **Deploy from a branch**
3. **Branch**: chọn `main`, thư mục `/ (root)` → **Save**
4. Sau 1-2 phút, trang sẽ chạy tại: `https://TEN-TAI-KHOAN.github.io/TEN-REPO/`

### Nếu chưa có tài khoản GitHub:
1. Đăng ký miễn phí tại **https://github.com/signup**
2. Tạo repository mới (nút xanh "New") → đặt tên, ví dụ `unit1-exercises` → Create repository
3. Trên trang repo trống, bấm **"uploading an existing file"** → kéo thả toàn bộ file trong thư mục này vào → Commit
4. Làm tiếp bước "Bật GitHub Pages" ở trên

---

## Muốn Claude tự động đẩy lên GitHub giúp?

Việc này cần quyền truy cập tài khoản GitHub của cô. Nếu muốn Claude tự làm bước push thay vì cô làm thủ công, cô cần:
1. Tạo 1 **Personal Access Token** (Settings → Developer settings → Personal access tokens → Generate new token, chọn quyền `repo`)
2. Cho Claude biết: tên tài khoản GitHub, tên repo muốn tạo/dùng, và token đó (chỉ dùng trong phiên làm việc này, cô nên thu hồi token sau khi xong)

Nếu không muốn chia sẻ token, cách 1 (Netlify Drop) hoặc cách 2 thủ công ở trên là lựa chọn an toàn hơn.
