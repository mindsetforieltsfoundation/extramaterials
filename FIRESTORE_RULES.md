# Firestore Security Rules — CẬP NHẬT (có phân quyền Admin)

Vào **Firebase Console → Firestore Database → tab "Rules"**, xoá hết nội dung cũ, dán đoạn sau vào rồi bấm **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Điểm số của từng học sinh: chính học sinh đó HOẶC giáo viên (email cố định) được đọc/ghi.
    match /users/{userId}/scores/{scoreId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == userId ||
        request.auth.token.email == "duyenvth@hanu.edu.vn"
      );
    }

    // Danh sách học sinh (roster): chỉ giáo viên được đọc/ghi.
    match /students/{studentUid} {
      allow read, write: if request.auth != null &&
        request.auth.token.email == "duyenvth@hanu.edu.vn";
    }
  }
}
```

**Ý nghĩa:**
- Mỗi học sinh chỉ đọc/ghi được đúng điểm của chính mình.
- **Riêng tài khoản `duyenvth@hanu.edu.vn`** (email của cô) được đọc/ghi điểm của **TẤT CẢ** học sinh — dùng cho trang quản trị `admin.html`.
- Danh sách học sinh (`students`) chỉ giáo viên xem được, học sinh không xem được danh sách của nhau.

⚠️ **Nếu cô đổi sang dùng email khác để đăng nhập quản trị**, phải sửa lại đúng email đó ở **cả 2 chỗ** trong đoạn rule trên, đồng thời báo em để em sửa lại hằng số `ADMIN_EMAIL` trong file `auth.js` cho khớp (hiện đang đặt cứng là `duyenvth@hanu.edu.vn`).
