# 🌸 Kế Hoạch Phát Triển: Wedding Platform - ThiepCuoi.vn

## 📋 Tổng Quan

Bạn đang có một **MVP (Minimum Viable Product)** khá tốt với nền tảng Node.js/Express + HTML/CSS/JS. Sau khi phân tích code hiện tại và nghiên cứu chuyên sâu **chungdoi.com** + nhiều nền tảng quốc tế, đây là bản kế hoạch phát triển thành một platform hoàn chỉnh, cạnh tranh trực tiếp.

---

## 🔍 Phân Tích Hiện Trạng

### ✅ Bạn Đã Có (Điểm Mạnh)
| Module | Trạng Thái | Ghi Chú |
|--------|-----------|---------|
| Thiệp cưới template (Boho Floral Green) | ✅ Hoàn chỉnh | UI đẹp, đầy đủ sections |
| Admin CMS cơ bản | ✅ Hoạt động | 7 panels: General, Parents, Story, Events, Gallery, Banking, RSVP |
| Backend API | ✅ Express.js | CRUD config + RSVP guests |
| Database | ✅ JSON file | Đơn giản, hoạt động được |
| RSVP E2E | ✅ Hoạt động | Khách mời → Admin dashboard |
| Banking QR | ✅ Có | Toggle on/off |
| Countdown Timer | ✅ Có | Realtime |
| Scroll Animations | ✅ Có | Fade-in effect |

### ❌ Thiếu So Với Chungdoi.com & Đối Thủ
| Feature | Chungdoi | Bạn | Ưu Tiên |
|---------|----------|-----|---------|
| Landing page thương hiệu | ✅ | ❌ | 🔴 Cao |
| Multi-template (nhiều mẫu) | ✅ 50+ mẫu | ❌ 1 mẫu | 🔴 Cao |
| Hệ thống User / Đăng nhập | ✅ | ❌ | 🔴 Cao |
| Quản lý nhiều thiệp | ✅ | ❌ | 🔴 Cao |
| Preview realtime split-screen | ✅ | ❌ | 🟡 Trung bình |
| Toggle on/off từng section | ✅ | ❌ | 🟡 Trung bình |
| Upload ảnh thực (không phải URL) | ✅ | ❌ | 🟡 Trung bình |
| Dress Code section | ✅ | ❌ | 🟢 Thấp |
| Wedding Timeline | ✅ | ❌ | 🟢 Thấp |
| Guestbook (Sổ lưu bút) | ✅ | ❌ | 🟡 Trung bình |
| Nhạc nền background | ✅ | ❌ | 🟡 Trung bình |
| Phong bì (Envelope) | ✅ | ❌ | 🟢 Thấp |
| Custom URL (slug) | ✅ | ❌ | 🔴 Cao |
| Share link đẹp | ✅ | ❌ | 🔴 Cao |
| Statistics (lượt xem) | ✅ | ❌ | 🟡 Trung bình |
| Mobile responsive perfect | ✅ | 🟡 Partial | 🔴 Cao |

---

## 🚀 Lộ Trình Phát Triển (3 Giai Đoạn)

---

## GIAI ĐOẠN 1: NỀN TẢNG (Ưu tiên thực hiện ngay)
**Timeline: Tuần 1-2**

### 1.1 Landing Page Thương Hiệu (`/`)
Xây dựng trang chủ marketing chuyên nghiệp thay thế trang thiệp hiện tại:

#### [NEW] `landing.html` — Trang Chủ
- **Hero Section**: Tagline mạnh + CTA "Tạo Thiệp Ngay"
- **Template Gallery**: Showcase 3-5 mẫu thiệp đẹp nhất
- **How It Works**: 3 bước đơn giản
- **Social Proof**: Số cặp đôi đã dùng, testimonials
- **Pricing**: Miễn phí cơ bản / Premium nâng cao
- **FAQ Section**
- **Footer** đầy đủ

#### [MODIFY] `server.js` — Routing
- Route `/` → `landing.html`
- Route `/thiep/:slug` → `index.html` (template thiệp)
- Route `/admin` → `admin.html`
- Route `/create` → Trang tạo thiệp mới

### 1.2 Hệ Thống Multi-Template
Thêm ít nhất **3 template** khác nhau:

#### [NEW] `templates/boho-floral-green/` — Template 1 (hiện tại)
#### [NEW] `templates/luxury-gold/` — Template 2: Sang trọng vàng đen
#### [NEW] `templates/minimalist-white/` — Template 3: Tối giản trắng
#### [NEW] `templates/romantic-pink/` — Template 4: Lãng mạn hồng

Mỗi template gồm: `index.html` + `styles.css`

### 1.3 Routing Theo Slug
```
GET /thiep/huy-va-duyen → Load database.json của couple đó
POST /api/wedding/:slug/config → Update config cho slug đó
POST /api/wedding/:slug/rsvp → RSVP cho slug đó
```

---

## GIAI ĐOẠN 2: TÍNH NĂNG NÂNG CAO (Ưu tiên thứ 2)
**Timeline: Tuần 3-4**

### 2.1 Admin CMS Nâng Cấp
#### [MODIFY] `admin.html` → Admin CMS 2.0
- **Chọn Template**: Dropdown/visual picker
- **Toggle Sections**: Bật/tắt từng section như chungdoi
- **Live Preview Panel**: Preview realtime bên phải (split-screen)
- **Upload Ảnh**: Thực sự upload file (Multer) thay vì nhập URL
- **Sections Mới**:
  - Dress Code
  - Wedding Timeline / Lịch trình
  - Guestbook / Sổ lưu bút
  - Background Music (danh sách nhạc preset)
  - Custom Slug / URL thiệp
  - Cài đặt Thống Kê

### 2.2 Guestbook (Sổ Lưu Bút)
#### [NEW] Guestbook section trong `index.html`
- Khách mời có thể gửi lời chúc
- Hiển thị lời chúc trên thiệp (real-time hoặc sau khi admin approve)
- Admin có thể xét duyệt/xóa lời chúc

### 2.3 Background Music
- Danh sách nhạc preset (5-10 bài nhạc cưới phổ biến)
- Auto-play khi khách vào xem thiệp
- Nút bật/tắt nhạc ở corner

### 2.4 Statistics Dashboard
- Số lượt xem thiệp
- Số RSVP (Yes/No)
- Số lời chúc
- Chart đơn giản

---

## GIAI ĐOẠN 3: PLATFORM FEATURES (Cạnh tranh đầy đủ)
**Timeline: Tuần 5+**

### 3.1 Hệ Thống User (Authentication)
- Đăng ký / Đăng nhập (email + password)
- JWT tokens
- Mỗi user có thể tạo nhiều thiệp
- Dashboard "Thiệp Của Tôi"

### 3.2 Database Thực Sự
Chuyển từ JSON file → **SQLite** (nhẹ, không cần setup) hoặc **PostgreSQL**:
- Table `users` (id, email, password_hash, created_at)
- Table `invitations` (id, user_id, slug, template, config, views, published_at)
- Table `rsvp_guests` (id, invitation_id, name, phone, attendance, message)
- Table `guestbook` (id, invitation_id, name, message, approved)

### 3.3 Pricing Model (Monetization)
- **Free**: 1 thiệp, template cơ bản, watermark nhỏ
- **Pro (49k-99k/tháng)**: Unlimited thiệp, all templates, no watermark, analytics
- **Lifetime (299k)**: Mua một lần, dùng mãi

---

## 🛠️ Kế Hoạch Kỹ Thuật Chi Tiết

### Stack Công Nghệ (Giữ nguyên, mở rộng dần)
```
Frontend:  HTML + CSS + Vanilla JS (không cần framework)
Backend:   Node.js + Express.js
Database:  JSON files → SQLite (giai đoạn 3)
Storage:   Local uploads → Cloudinary (giai đoạn 3)
Auth:      JWT + bcrypt (giai đoạn 3)
```

### Cấu Trúc Thư Mục Mới
```
DamCuoi/
├── public/                    # Static files
│   ├── landing.html           # [NEW] Trang chủ thương hiệu
│   ├── templates/             # [NEW] Multi-template system
│   │   ├── boho-floral-green/
│   │   │   ├── index.html
│   │   │   └── style.css
│   │   ├── luxury-gold/
│   │   │   ├── index.html
│   │   │   └── style.css
│   │   └── minimalist-white/
│   │       ├── index.html
│   │       └── style.css
│   ├── admin.html             # [MODIFY] CMS nâng cấp
│   ├── script.js              # [MODIFY] Nâng cấp
│   └── styles.css             # Giữ nguyên (template 1)
├── uploads/                   # [NEW] Upload ảnh
├── data/                      # [NEW] Tổ chức lại data
│   ├── invitations/           # Mỗi thiệp = 1 file JSON
│   │   └── huy-va-duyen.json
│   └── guests/
│       └── huy-va-duyen.json
├── server.js                  # [MODIFY] Nâng cấp routes
├── package.json               # [MODIFY] Thêm multer, uuid
└── database.json              # Giữ nguyên (backward compat)
```

---

## 📊 So Sánh Sau Khi Hoàn Thành

| Feature | Chungdoi.com | Platform Của Bạn |
|---------|-------------|-----------------|
| Landing page | ✅ | ✅ |
| Multi-template | ✅ 50+ | ✅ 4+ (mở rộng dần) |
| Toggle sections | ✅ | ✅ |
| RSVP | ✅ | ✅ |
| Guestbook | ✅ | ✅ |
| Banking QR | ✅ | ✅ |
| Nhạc nền | ✅ | ✅ |
| Upload ảnh | ✅ | ✅ |
| Statistics | ✅ | ✅ |
| Custom URL | ✅ | ✅ |
| User system | ✅ | ✅ (giai đoạn 3) |
| Đa ngôn ngữ | ✅ | 🟡 Sau |
| Dress Code | ✅ | ✅ (giai đoạn 2) |

---

## ❓ Open Questions — Cần Bạn Quyết Định

> [!IMPORTANT]
> **Q1: Scope Phase 1** - Bạn muốn bắt đầu với phần nào trước?
> - A) Landing Page thương hiệu đẹp trước
> - B) Thêm template thứ 2, 3, 4 trước  
> - C) Nâng cấp Admin CMS (toggle sections + live preview) trước
> - D) Tất cả cùng lúc theo thứ tự kế hoạch

> [!IMPORTANT]
> **Q2: Tên thương hiệu** - Platform của bạn sẽ có tên gì?
> - "ThiepCuoi.vn" / "VietWedding" / "E2E Wedding" / Tên khác?

> [!WARNING]
> **Q3: Authentication** - Bạn có muốn xây dựng hệ thống đăng nhập ngay không?
> - Yes → Cần thêm bcrypt, JWT, SQLite (~1-2 tuần thêm)
> - No → Tiếp tục với JSON file, một admin quản lý nhiều thiệp

> [!NOTE]
> **Q4: Upload ảnh** - Bạn muốn lưu ảnh ở đâu?
> - A) Local server (đơn giản, phù hợp development)
> - B) Cloudinary free tier (tốt hơn cho production)

---

## ✅ Bước Thực Hiện Ngay (Phase 1)

Nếu bạn approve, tôi sẽ bắt đầu với thứ tự sau:

1. **[~2h] Landing Page** — Trang chủ thương hiệu đẹp hoàn toàn mới
2. **[~3h] Multi-template** — Thêm 2-3 template mới với style khác nhau
3. **[~2h] Server routing** — `/thiep/:slug` + phục vụ multi-template
4. **[~4h] Admin CMS 2.0** — Toggle sections + chọn template + preview
5. **[~1h] Guestbook + Music** — 2 features đang thiếu quan trọng
