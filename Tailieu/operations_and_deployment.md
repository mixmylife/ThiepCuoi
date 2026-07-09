# Tài Liệu Vận Hành & Cấu Hình (Operations & Deployment Guide)

Tài liệu này hướng dẫn cách cấu hình dự án, cơ chế bảo mật (Auth), và cách đóng gói toàn bộ hệ thống (Docker) để triển khai thực tế.

---

## 1. Cấu Hình Môi Trường (`.env`)

Mọi thông số nhạy cảm và quan trọng của dự án đều được quản lý thông qua biến môi trường. Khi triển khai, bạn cần tạo file `.env` từ file mẫu `.env.example`.

Các biến môi trường hiện tại bao gồm:
- `PORT`: Cổng chạy ứng dụng (Mặc định: 3000).
- `JWT_SECRET`: Chuỗi khóa bí mật dùng để mã hóa Token đăng nhập. Bạn **bắt buộc** phải đổi chuỗi này thành một đoạn mã ngẫu nhiên khó đoán khi đưa lên Server thực tế để tránh bị hack token.

## 2. Luồng Vận Hành Chữ Ký Số (JWT Authentication)

Dự án không lưu trạng thái đăng nhập trên Server (Stateless), giúp tối ưu hiệu năng. Quy trình như sau:
1. User nhập Email/Pass ở `login.html`.
2. `server.js` kiểm tra đúng sai -> Nếu đúng, tạo ra 1 đoạn mã JWT (chứa thông tin User ID) và gửi về trình duyệt.
3. Trình duyệt lưu JWT này vào `localStorage` (Bộ nhớ trình duyệt).
4. Mỗi khi User thao tác gì trên `admin.html` (như Lưu thiệp cưới), đoạn mã JS ở Admin sẽ đính kèm JWT này vào **Headers API** (`Authorization: Bearer <token>`).
5. Hàm `verifyToken` trong `server.js` giải mã JWT để biết "À, đây là anh A" và mới cho phép ghi file JSON.

## 3. Cách Đóng Gói (Packaging) & Triển Khai (Deployment)

Vì sao chúng ta không hướng dẫn cài Node.js, cài thư viện bằng tay trên Server? Vì điều đó cực kỳ dễ sinh ra lỗi "Chạy được trên máy dev nhưng lỗi trên Server". Chúng ta sử dụng **Docker**.

### Ý nghĩa của `Dockerfile`
File này chứa kịch bản đóng gói. Nó giống như một công thức nấu ăn:
1. Lấy một hệ điều hành Linux siêu nhẹ (Alpine).
2. Cài sẵn môi trường Node.js.
3. Copy toàn bộ mã nguồn của bạn vào.
4. Chạy lệnh cài thư viện (`npm install`).
5. Đóng hộp (Build Image) thành 1 cục duy nhất có thể chạy ở mọi nơi.

### Ý nghĩa của `docker-compose.yml`
File này là bản thiết kế hệ thống vận hành. Khi gõ lệnh `docker-compose up`, nó sẽ:
1. Khởi động chiếc hộp (Container) đã được tạo từ Dockerfile.
2. Mở cổng `3000` thông ra ngoài.
3. **Quan trọng nhất (Volumes):** Nó map thư mục `/data` và `/uploads` bên trong chiếc hộp *ra ngoài thư mục của máy tính thật*. Nhờ vậy, nếu bạn có vô tình Restart server hoặc nâng cấp source code, dữ liệu thiệp cưới của khách không bao giờ bị mất!

---

## Tóm Lược Vận Hành

- Khi ở máy Dev của bạn (localhost): Chạy `node server.js`
- Khi đưa lên VPS/Server (Production): Chỉ cần dùng lệnh Docker là hệ thống tự lo phần còn lại. Mọi thứ được gói gọn gàng, cách ly và an toàn tuyệt đối.
