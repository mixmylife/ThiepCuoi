# Kế Hoạch Nâng Cấp Hoạt Ảnh "Song Long Đỏ"

Để biến mẫu thiệp "Song Long Đỏ" trở thành một tuyệt tác đúng chuẩn các thiệp cưới cao cấp trên thị trường (Premium Online Wedding Invitations), tôi đã nghiên cứu các xu hướng UI/UX hiện tại và đề xuất một cuộc "đại tu" về mặt hiệu ứng thị giác như sau.

## User Review Required
> [!IMPORTANT]
> Việc nâng cấp này sẽ thay đổi khá nhiều về cảm giác tương tác (UX) của người dùng khi xem thiệp. Vui lòng xem kỹ các đề xuất dưới đây và cho tôi biết bạn có ưng ý với hướng đi này không, hoặc bạn muốn thêm/bớt hiệu ứng nào?

## Các Nâng Cấp Đề Xuất

# Nâng cấp tính năng RSVP & Lưu bút (Guestbook)

Dạ hoàn toàn được ạ! Đây là một ý tưởng vô cùng hiện đại và thú vị. Việc khách mời có thể gửi lời chúc bằng **Giọng nói (Voice)** và **Nhãn dán/Emoji** sẽ làm cho chiếc thiệp cưới trở nên cực kỳ sinh động và mang đậm dấu ấn cá nhân.

Dưới đây là kế hoạch triển khai chi tiết:

## Các tính năng sẽ được thêm vào:

1. **Phần RSVP (Gửi riêng cho Cô Dâu/Chú Rể):**
   - Tích hợp tính năng **Ghi âm (Voice Record)** trực tiếp trên thiệp bằng Microphone của điện thoại/máy tính.
   - Thêm nút **Chọn Emoji/Nhãn dán (Stickers)** để chèn vào lời chúc.
   - Giao diện có thêm nút bấm ghi âm (Bấm để ghi, bấm để dừng, nghe lại trước khi gửi).

2. **Phần Lưu Bút (Guestbook - Công khai trên thiệp):**
   - Chỉ tích hợp nút **Chọn Emoji/Nhãn dán** (Giúp giao diện lưu bút nhẹ nhàng, sạch sẽ như bạn yêu cầu).
   - Lời chúc được hiển thị công khai kèm theo các Emoji sinh động.

3. **Cập nhật Backend & Trang Quản trị (Admin):**
   - Lưu trữ dữ liệu Voice (dưới dạng Base64 Audio) và các Emoji.
   - Tại trang Quản trị (Admin), thêm nút **Play (Phát nhạc)** để Cô Dâu/Chú Rể có thể nghe lại các lời chúc bằng giọng nói của khách mời.

---

> [!WARNING]
> **Về việc Lưu trữ File Ghi âm:** 
> Do hệ thống hiện tại đang lưu dữ liệu dưới dạng file văn bản (JSON) chứ không phải Cloud Storage/Database chuyên dụng (như AWS S3 hay Firebase), việc lưu trữ các đoạn ghi âm dài sẽ làm file JSON khá nặng. 
> 
> **Giải pháp:** Tôi sẽ giới hạn mỗi đoạn ghi âm tối đa **30 giây** hoặc **1 phút**, đồng thời nén file âm thanh lại trước khi gửi để đảm bảo hệ thống vẫn chạy siêu mượt mà. Bạn có đồng ý với giới hạn thời gian này không?

## Open Questions

- Bạn muốn giới hạn thời lượng ghi âm tối đa của khách mời là bao nhiêu giây? (Khuyến nghị: 30s hoặc 60s để tránh làm nặng file).
- Bạn có muốn sử dụng bộ Emoji mặc định của hệ điều hành, hay muốn tôi tích hợp một bộ Emoji/Sticker có thiết kế riêng biệt? (Khuyến nghị: Bộ Emoji mặc định sẽ nhẹ web và dễ dùng nhất).

---

Nếu bạn đồng ý với kế hoạch trên, hãy phản hồi lại ý kiến để tôi bắt tay vào code ngay lập tức nhé!
