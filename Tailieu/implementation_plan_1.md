# Kế Hoạch Hoàn Thiện Dự Án (End-to-End & Packaging)

Dự án hiện đã hoàn thiện phần User Flow tạo thiệp, hiển thị thiệp, admin tùy chỉnh giao diện và quản lý khách mời. Để đạt mục tiêu "đóng gói hoàn thiện" và triển khai như một nền tảng SaaS thực thụ (Phase 2b & Phase 3), chúng ta cần bổ sung hệ thống người dùng (Authentication) và chuẩn bị cấu hình triển khai.

## Trạng Thái Hiện Tại
- ✅ **Templates**: Đã hoàn thiện 4 mẫu thiệp chuyên nghiệp với đầy đủ tính năng.
- ✅ **Wizard Tạo Thiệp (`tao-thiep.html`)**: Tạo thiệp dễ dàng qua 3 bước.
- ✅ **Admin CMS (`admin.html`)**: Quản lý nội dung, upload ảnh, RSVP, cấu hình QR code tự động.
- ❌ **Auth (Chưa có)**: Bất kỳ ai cũng có thể vào `admin` và chỉnh sửa thiệp nếu biết URL. Không có tính năng quản lý tài khoản.
- ❌ **Packaging (Chưa có)**: Chưa có Dockerfile, script khởi chạy production.

---

## Các Thay Đổi Đề Xuất

### 1. Hệ thống Xác thực (Authentication)
*Sử dụng `bcryptjs` và `jsonwebtoken` đã cài đặt.*
- Tạo file lưu trữ người dùng `data/users.json`.
- Thêm các API endpoints vào `server.js`:
  - `POST /api/auth/register` (Đăng ký tài khoản).
  - `POST /api/auth/login` (Đăng nhập, trả về JWT).
  - `GET /api/auth/me` (Lấy thông tin user hiện tại).
- Tạo middleware `verifyToken` trong `server.js` để bảo vệ các API thay đổi dữ liệu thiệp (chỉ chủ sở hữu mới được sửa).

### 2. Giao diện Đăng Nhập & Dashboard
- **[NEW] `public/login.html` & `public/register.html`**: Giao diện đăng nhập/đăng ký với phong cách thiết kế hiện đại, đồng nhất với Landing page.
- **[NEW] `public/dashboard.html`**: Trang quản lý dành riêng cho user sau khi đăng nhập. Tại đây user có thể:
  - Xem danh sách các thiệp cưới mình đã tạo.
  - Xem nhanh tổng quan lượt xem, RSVP của từng thiệp.
  - Nút chuyển đến trang `admin.html` để chỉnh sửa thiệp.
- **[MODIFY] `public/tao-thiep.html`**: Yêu cầu người dùng phải đăng nhập trước khi nhấn "Tạo Thiệp Ngay" ở bước cuối.

### 3. Cập nhật `admin.html` & API Thiệp Cưới
- **[MODIFY] `admin.html`**: Bổ sung logic kiểm tra token JWT (chuyển hướng về `/login` nếu chưa đăng nhập). Tự động lấy slug thiệp từ URL (ví dụ `?slug=huy-va-duyen`) để load dữ liệu.
- **[MODIFY] `server.js`**: Cập nhật API `POST /api/wedding-config/:slug` để liên kết `slug` thiệp cưới với `userId`.

### 4. Đóng gói & Triển khai (Packaging)
- **[NEW] `Dockerfile` & `docker-compose.yml`**: Chứa môi trường Node.js chuẩn để dễ dàng deploy lên bất kỳ VPS nào.
- **[NEW] `.env.example`**: Định nghĩa các biến môi trường (PORT, JWT_SECRET).
- **[MODIFY] `package.json`**: Cập nhật scripts start (có thể tích hợp PM2).
- **[NEW] `README.md`**: Hướng dẫn cài đặt và vận hành hệ thống.

---

> [!WARNING]
> Việc tích hợp Auth sẽ thay đổi luồng hoạt động hiện tại: user **phải** tạo tài khoản thì mới có thể lưu và quản lý thiệp cưới. 

> [!IMPORTANT]
> Dữ liệu vẫn được lưu trữ dưới dạng JSON Flat Files (`/data/`) nhằm mục đích dễ vận hành và sao lưu cho phiên bản MVP này. Nếu sau này lượng truy cập lớn, ta sẽ nâng cấp lên MongoDB/PostgreSQL ở Phase 4.

## Ý Kiến Phản Hồi

Bạn có đồng ý với kế hoạch bổ sung Xác thực (Login/Register/Dashboard) và Đóng gói Docker như trên không? Hãy phản hồi để tôi có thể bắt đầu code ngay!
