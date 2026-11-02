# Drummer Profile & Sampler Store (Next.js)

Website Profile Drummer chuyên nghiệp, tích hợp hệ thống Drum Pad & Sequencer 16 bước (Web Audio API), công cụ tính phí thuê phòng tập band theo giờ, đặt lịch học trống và bán các bộ Sound Sampler với đầy đủ hệ thống quản trị **Admin Dashboard (Full CRUD)**, sẵn sàng triển khai lên **Vercel**.

---

## 🚀 Tính năng nổi bật

### 1. Giao diện người dùng (Client)
- **Hero & Trống Snare 3D**: Mặt trống snare tương tác bấm/chạm phát âm thanh trung thực được tổng hợp qua Web Audio API cùng hiệu ứng chuyển động chân thực.
- **Tiểu sử & Kỹ năng (Giới thiệu)**: Thông tin nghệ sĩ, số năm kinh nghiệm, học viên đã đào tạo, số phòng tập và các thể loại âm nhạc (Rock, Pop, Jazz, Funk, Lo-fi, Thu âm...).
- **Khoá học dạy trống**: Danh sách khoá học (Người mới, Trung cấp, Chuyên sâu), huy hiệu "Phổ biến", bảng giá học phí và nút đặt lịch học 1 kèm 1 (mở popup đặt lịch).
- **Phòng tập band & Máy tính giá thuê tự động**:
  - Lưới trang thiết bị & tiện nghi studio (Trống acoustic, ampli guitar/bass, dàn PA, máy lạnh, mở cửa 9h-23h...).
  - Thanh trượt chọn số giờ (1 - 8 giờ) với cơ chế tự động giảm giá 10% khi thuê từ 4 giờ trở lên.
  - Hiển thị tổng tiền tự động tính bằng VNĐ.
- **Bộ máy nghe thử Sampler tương tác**:
  - Hỗ trợ đổi qua lại các bộ: Rock Acoustic, Lo-fi Dusty, Electro 808...
  - **6 Drum Pad** đa năng: Kick (`Q`), Snare (`W`), Hi-hat (`E`), Tom (`A`), Clap (`S`), Crash (`D`) bấm trên màn hình hoặc dùng phím tắt trên bàn phím.
  - **16-step Sequencer**: Đèn LED chạy theo từng bước nhịp, nút "Phát beat mẫu" theo BPM của từng bộ.
  - Bảng liệt kê quyền lợi trong mỗi bộ (WAV 24-bit 48kHz, velocity layers, preset Ableton/FL Studio/Logic, 100% royalty-free).
- **Mua bộ Sampler & Form đặt hàng thông minh**:
  - Danh sách từng bộ và gói Combo 3 bộ ưu đãi giảm 20%.
  - Form tạo tin nhắn tự động theo tên, số điện thoại, phần mềm DAW.
  - Tích hợp 1 chạm: **Gửi đơn hàng trực tiếp vào Admin Database**, **Gửi qua Zalo**, **Gửi Email** và **Sao chép tin nhắn**.
- **Liên hệ**: Các thẻ gọi điện, chat Zalo, gửi email, Facebook, YouTube và địa chỉ bản đồ.

---

### 2. Trang quản trị toàn diện (`/admin`)
Đăng nhập bảo mật bằng mật khẩu Admin (mặc định: `admin123`).

- 📊 **Tổng quan (Overview)**: Thống kê số lượng đơn mới, tổng khoá học, phòng tập, sound kits, media files và danh sách đơn mới đặt gần đây.
- 👤 **Thông tin cá nhân & Trang chủ**: Chỉnh sửa họ tên, tiêu đề slogan, mô tả tiểu sử, thông số stats, thể loại nhạc và toàn bộ kênh liên hệ (SĐT, Zalo, Email, Facebook, Youtube, Địa chỉ phòng).
- 🥁 **Quản lý Khoá học (CRUD)**: Thêm mới, chỉnh sửa, xoá khoá học, cài đặt giá học phí, đơn vị tính, danh sách nội dung bài học và đánh dấu ruy-băng "Phổ biến".
- 🏢 **Quản lý Phòng tập & Tiện ích (CRUD)**: Thêm, sửa, xoá phòng tập, đơn giá mỗi giờ, sức chứa và danh sách trang thiết bị studio.
- 🎵 **Quản lý Bộ Sampler & Âm thanh (CRUD)**:
  - Thêm, sửa, xoá các sound kit.
  - Cài đặt nhịp độ BPM, giá bán, số lượng mẫu, định dạng.
  - **Tải lên hoặc gắn file âm thanh thật (WAV/MP3)** cho từng pad (Kick, Snare, Hat, Tom, Clap, Crash) và nghe thử trực tiếp trong trang quản trị.
  - Quản lý gói Combo ưu đãi cả 3 bộ.
- 📋 **Quản lý Đơn hàng & Lịch hẹn (Full Management)**:
  - Xem tất cả đơn mua sampler và yêu cầu đặt phòng/học trống từ khách hàng.
  - Lọc theo trạng thái: *Tất cả*, *Đơn mới*, *Đang xử lý*, *Hoàn tất*, *Đã huỷ*.
  - Tìm kiếm theo tên khách, số điện thoại, tên dịch vụ.
  - Xem chi tiết nội dung tin nhắn và nút mở chat Zalo trực tiếp với khách.
  - Cập nhật trạng thái hoặc xoá đơn.
- 🖼️ **Thư viện Media (Images & Audio)**:
  - Tải lên file hình ảnh và file âm thanh trống.
  - Thêm link URL online từ Google Drive, Cloudinary, CDN.
  - Trình phát nghe thử Audio ngay trên web, sao chép link 1 chạm để dán vào avatar hay sound kit.

---

## 🛠️ Hướng dẫn cài đặt & Chạy cục bộ

```bash
# 1. Cài đặt các thư viện
npm install

# 2. Chạy môi trường phát triển
npm run dev
```

Mở trình duyệt:
- **Trang chủ giao diện**: [http://localhost:3000](http://localhost:3000)
- **Trang quản trị Admin**: [http://localhost:3000/admin](http://localhost:3000/admin) (Mật khẩu: `admin123`)

---

## ☁️ Hướng dẫn đưa lên Vercel

1. **Đẩy mã nguồn lên GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete drummer profile & admin crud"
   git push origin main
   ```
2. **Triển khai trên Vercel**:
   - Truy cập [vercel.com](https://vercel.com) và chọn **Add New Project** -> Chọn repository vừa tạo.
   - Trong phần **Environment Variables**, thêm biến:
     - `ADMIN_PASSWORD`: Mật khẩu đăng nhập trang admin (ví dụ: `matkhau_cua_ban`).
   - Bấm **Deploy**. Vercel sẽ tự động build và cung cấp đường link website trực tuyến!
