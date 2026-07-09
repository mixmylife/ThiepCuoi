# Kiến Trúc và Cấu Trúc Mã Nguồn (Architecture & Directory Structure)

Dự án **ThiepCuoiViet** được thiết kế theo mô hình Client-Server tĩnh kết hợp API động (RESTful) chạy trên Node.js. Mục tiêu cốt lõi của kiến trúc này là **Sự đơn giản, dễ bảo trì, và không phụ thuộc vào Database ngoài** (dùng Flat-file JSON).

Dưới đây là giải phẫu chi tiết toàn bộ mã nguồn hiện tại:

## 1. Cấu Trúc Thư Mục Tổng Quan

```text
/ (Thư mục gốc)
├── data/              # Database cốt lõi (Flat-file JSON)
├── public/            # Chứa các file giao diện Frontend
├── uploads/           # Chứa ảnh do người dùng upload
├── server.js          # Trái tim của Backend (Node.js/Express)
├── package.json       # Danh sách thư viện & Cấu hình NPM
├── Dockerfile         # Kịch bản đóng gói ứng dụng bằng Docker
├── docker-compose.yml # Kịch bản chạy Docker
└── .env.example       # Mẫu chứa các Biến Môi Trường
```

---

## 2. Giải Phẫu Chi Tiết Các Thành Phần

### 2.1. Tầng Dữ Liệu (`/data/`)
Thay vì dùng MySQL hay MongoDB đòi hỏi cài đặt phức tạp, chúng ta dùng hệ thống file JSON để lưu trữ dữ liệu. Gồm 3 phần chính:
- `users.json`: Nơi lưu trữ thông tin Đăng ký/Đăng nhập của các chủ tiệc (Tên, Email, Mật khẩu đã được mã hóa Hash).
- `/invitations/`: Mỗi thiệp cưới khi tạo ra sẽ sinh ra một file JSON mang tên "Slug" (VD: `huy-duyen.json`). File này lưu toàn bộ cấu hình: template gì, tên cô dâu chú rể, ảnh bìa, âm nhạc...
- `/guests/`: Lưu trữ danh sách RSVP (Khách mời phản hồi) tương ứng với từng thiệp.
- `/guestbooks/`: Lưu trữ sổ lưu bút (Lời chúc mừng) của từng thiệp.

> [!TIP]
> **Tại sao lại dùng Flat-file JSON?**
> Vì cấu trúc thiệp cưới thường không đòi hỏi truy vấn phức tạp (như "tìm kiếm thiệp theo ngày"). Việc dùng JSON giúp dự án dễ dàng Backup (chỉ cần copy thư mục `/data`), đọc/ghi cực nhanh với Node.js, và rất phù hợp cho ứng dụng nhỏ/vừa (MVP).

### 2.2. Tầng Backend API (`server.js`)
Đây là bộ não điều hướng của toàn bộ hệ thống. Nhiệm vụ chính của `server.js` bao gồm:
1. **Routing Web**: Nhận request từ trình duyệt và trả về các file `.html` tương ứng trong thư mục `/public`.
2. **RESTful API**: Xử lý logic nghiệp vụ cho Frontend:
   - *Auth API* (`/api/register`, `/api/login`, `/api/me`): Kiểm tra mật khẩu, cấp phát mã `JWT` (JSON Web Token) để xác thực.
   - *Config API* (`GET/POST /api/wedding-config/:slug`): Đọc và lưu cấu hình thiệp vào `/data/invitations/`.
   - *RSVP API* (`POST /api/rsvp`): Nhận lời xác nhận tham dự.
   - *Upload API* (`POST /api/upload`): Dùng thư viện `multer` lưu ảnh vào `/uploads`.
3. **Bảo Mật (Middleware `verifyToken`)**: Hàm này đứng chặn ở các cổng API quan trọng (như lưu thiệp). Nếu phát hiện không có Token hợp lệ, nó sẽ chặn lại.

### 2.3. Tầng Giao Diện Frontend (`/public/`)
Toàn bộ Frontend sử dụng **HTML/CSS/JS thuần** (Vanilla), không dùng React hay Vue. Mục đích để tối ưu tốc độ tải trang cực nhẹ và dễ chỉnh sửa.

- `landing.html`: Trang chủ (Giới thiệu, Bảng giá, Mẫu thiệp).
- `register.html` & `login.html`: Trang đăng ký và đăng nhập, thao tác với Auth API để lấy Token lưu vào `localStorage`.
- `dashboard.html`: Trang bảng điều khiển. Nó đọc Token, gửi lên API để lấy "Danh sách các thiệp mà user này đã tạo".
- `tao-thiep.html`: Trang Wizard (3 bước) tạo thiệp nhanh. Kết thúc bước 3, nó gọi Config API để sinh ra thiệp.
- `admin.html`: Trang cấu hình nâng cao CMS (CMS Builder). Cho phép người dùng bật/tắt module, up ảnh, đổi nhạc... Nó sử dụng iFrame để hiển thị Live-Preview.

### 2.4. Các Mẫu Thiệp (`/public/templates/`)
Thư mục này chứa mã nguồn của giao diện thiệp thực tế.
- Mỗi mẫu (ví dụ: `boho-floral-green`, `luxury-gold`) chứa một file `index.html` độc lập.
- Ở cuối file `index.html`, có một đoạn script nhỏ gọi API để tải file cấu hình tương ứng (`huy-duyen.json`) và tự động thay thế tên, ảnh, ngày cưới trên giao diện.

> [!NOTE]
> Việc tách bạch các file HTML và Data JSON giúp chúng ta dễ dàng thêm 100 mẫu thiệp (Templates) mới sau này mà không cần động vào Backend `server.js`.
