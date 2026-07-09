# Đánh Giá Trạng Thái Dự Án (Status & Roadmap)

Tránh tình trạng "thêm code chắp vá vô tội vạ" khiến bạn mất phương hướng, dưới đây là bản đánh giá trung thực và minh bạch nhất về những gì hệ thống đã hoàn thiện 100%, và những gì còn thiếu có thể nâng cấp trong tương lai (Roadmap).

---

## 1. Những Cốt Lõi Đã Hoàn Thiện (Completed & Stable)

Đây là những Module đã được code xong xuôi, ổn định, logic đã khoá chặt và **sẽ không cần đập đi viết lại** trong các bản cập nhật sau:

- **Hệ Thống Templates (Giao diện Mẫu):** Cơ chế chia template thành các thư mục độc lập ở `/public/templates/` cực kỳ thông minh. Việc thêm mới hay sửa 1 mẫu thiệp sẽ không bao giờ làm hỏng các mẫu khác.
- **CMS Builder (Màn hình Admin cấu hình):** Live Preview mượt mà, lưu thông tin bằng file JSON nhẹ nhàng, hỗ trợ đầy đủ upload ảnh, đổi nhạc.
- **Hệ Thống User & Authentication:** Đăng nhập, Đăng ký, Cấp JWT Token, Mã hoá mật khẩu. Đã khoá chặt bảo mật: không có tài khoản thì không sửa được thiệp.
- **Tiện Ích Guest (RSVP & Lời Chúc & QR Bank):** Hoàn thiện luồng lưu lời chúc, xuất danh sách RSVP ra file Excel (CSV) cho chủ tiệc và Auto Generate mã QR ngân hàng.
- **Cơ sở hạ tầng Docker:** Sẵn sàng cho việc đem đi thương mại hóa ngay lập tức.

---

## 2. Những Thứ Còn Thiếu (Roadmap / Future Features)

Hệ thống hiện tại đã là một phiên bản MVP (Minimum Viable Product - Sản phẩm khả thi tối thiểu) cực kỳ xuất sắc. Tuy nhiên, nếu bạn muốn biến nó thành "Trùm cuối" cạnh tranh với các nền tảng thương mại lớn, đây là những tính năng chúng ta **chưa có** và nên ưu tiên làm tiếp:

### A. Quản Lý File Tập Trung (Media Library)
- **Hiện tại:** User upload ảnh bìa hoặc ảnh Gallery, nó sẽ bay thẳng vào mục `/uploads` và trả về link. 
- **Còn thiếu:** Chưa có màn hình quản lý (Thư Viện Ảnh). User không thể biết mình đã up bao nhiêu ảnh, không thể xóa bớt ảnh cũ gây rác server theo thời gian.

### B. Nâng Cấp Trang "Tạo Thiệp Nhanh" (`tao-thiep.html`)
- **Phản hồi của bạn:** "Trang tạo thiệp chưa ưng ý, chưa chi tiết."
- **Thực tế:** Trang `tao-thiep.html` hiện tại chỉ là trang thu thập thông tin cơ bản nhất (Tên, ngày tháng, chọn mẫu) để sinh ra thiệp nháp nhanh. Việc điền chi tiết (nhạc, chuyện tình yêu, sổ ngân hàng...) đều dồn hết vào `admin.html`. 
- **Giải pháp tiếp theo:** Gom 2 luồng này làm một, hoặc thiết kế lại trang `tao-thiep.html` thành dạng Onboarding Wizard mượt mà 5-7 bước như setup máy tính mới.

### C. Gói Cước & Thanh Toán (Pricing & Billing)
- **Hiện tại:** Dán nhãn "PRO" hay "Miễn phí" trên web `landing.html` chỉ để làm cảnh. Bất kì ai tạo tài khoản cũng dùng được mẫu PRO.
- **Còn thiếu:** Tích hợp Cổng thanh toán (Momo, VNPay). Phải nâng cấp VIP thì mới được dùng mẫu VIP, hoặc mới được cho phép bật Sổ lưu bút, Bật mã QR...

### D. Tuỳ Chỉnh Tên Miền (Custom Domain)
- **Hiện tại:** Link thiệp cưới bị dính với tên miền của platform (Ví dụ: `thiepcuoiviet.com/thiep/huy-duyen`).
- **Nâng cấp cao:** Cho phép user trỏ tên miền riêng của họ (ví dụ `damcuoihuyduyen.vn`) về thẳng thiệp cưới của họ thông qua CNAME/Nginx.
