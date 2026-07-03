# Firestore Security Rules — dán vào Firebase Console

Vào **Firebase Console → Firestore Database → tab "Rules"**, xoá hết nội dung mặc định, dán đoạn sau vào rồi bấm **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/scores/{scoreId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Ý nghĩa:** mỗi học sinh chỉ được đọc/ghi điểm số nằm trong đúng thư mục `users/<uid-của-chính-mình>/scores/...` — không ai xem được điểm của người khác, kể cả khi biết email/tên của bạn học khác.

Nếu cô (giáo viên) muốn tự mình xem điểm của TẤT CẢ học sinh sau này (ví dụ làm trang quản trị), sẽ cần rule khác + xác thực vai trò "admin" — em có thể làm thêm phần này khi cô cần.
