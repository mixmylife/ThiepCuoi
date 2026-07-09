# ThiepCuoiViet Platform v3.0

Nền tảng tạo thiệp cưới online end-to-end, hỗ trợ tạo thiệp, quản lý khách mời (RSVP, Guestbook), cấu hình QR Bank tự động và xuất báo cáo. Hệ thống sử dụng flat-file database (`/data`) để dễ dàng triển khai mà không cần cài đặt database ngoài.

## Tính năng (Features)
- 🎨 **Wizard Tạo Thiệp**: Chọn mẫu và điền thông tin nhanh gọn.
- 🔐 **Hệ Thống User**: Đăng ký, đăng nhập và quản lý các thiệp cá nhân qua Dashboard.
- ⚙️ **CMS Admin**: Quản lý ảnh bìa, gallery, chuyện tình yêu, lịch trình tiệc cưới.
- 📊 **Quản Lý Khách Mời (RSVP)**: Xem danh sách, trạng thái tham dự và xuất CSV.
- 💰 **Auto-generate QR Ngân Hàng**: Tự động tạo mã QR từ số tài khoản để khách mời mừng cưới.
- 📦 **Docker Ready**: Có sẵn Dockerfile và `docker-compose.yml` để dễ dàng deploy lên VPS.

## Cấu Trúc Thư Mục
```text
/
├── data/              # Lưu trữ JSON (users, config, rsvp)
├── public/            # Giao diện frontend (HTML/CSS/JS)
│   ├── landing.html   # Trang chủ giới thiệu
│   ├── tao-thiep.html # Wizard tạo thiệp
│   ├── login.html     # Đăng nhập
│   ├── register.html  # Đăng ký
│   ├── dashboard.html # Bảng điều khiển người dùng
│   ├── admin.html     # Quản trị nội dung thiệp
│   └── templates/     # Các mẫu thiệp cưới
├── uploads/           # Lưu trữ ảnh upload
├── server.js          # Main Node.js API server
└── package.json       # Config thư viện Node
```

## Yêu cầu Hệ thống
- Node.js 18+
- Hoặc Docker & Docker Compose

## Hướng dẫn chạy ở Local (Development)

1. **Cài đặt thư viện**
   ```bash
   npm install
   ```
2. **Khởi động server**
   ```bash
   npm start
   ```
3. **Truy cập**
   - Trang chủ: `http://localhost:3000`
   - Đăng nhập/Đăng ký để tạo thiệp.

## Hướng dẫn Triển Khai (Production Deploy bằng Docker)

1. **Sao chép `.env`**
   ```bash
   cp .env.example .env
   # Sửa JWT_SECRET bên trong file .env thành 1 chuỗi bảo mật
   ```
2. **Chạy bằng Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

Dữ liệu sẽ được tự động map ra thư mục `./data` và `./uploads` bên ngoài để không bị mất khi restart container.

---
*Chúc bạn vận hành dự án nền tảng cưới thành công!*
