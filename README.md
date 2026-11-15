# Việc Nhanh – bản build 3 luồng demo

Web app (React 18 + Vite + TypeScript) dựng từ file Figma "Bounty Hunters – Designathon 2026".
Chạy như một mobile app trong khung điện thoại, tự co giãn theo cửa sổ: laptop, màn hình lớn, TV 4K;
mở trên điện thoại thật thì chạy toàn màn hình, không có khung.

## Chạy

```bash
npm install
npm run dev            # chạy local, tự mở trình duyệt (http://localhost:5173)
npm run build          # bản production trong dist/  →  npm run preview để xem
npm run build:single   # dist-single/index.html: 1 file duy nhất, bấm đúp là chạy, không cần server
```

Cần Node 18 trở lên.

## 3 luồng

| # | Luồng | Màn hình |
|---|-------|----------|
| 1 | Sign-up | Splash (video) → Intro (3 slide) → Số điện thoại → Mã xác thực → Preferences → Thêm giấy tờ + quét thẻ → Kiểm tra thông tin → Home |
| 2 | First job | Thông báo WhatsApp trên màn hình khoá → Job offer (đồng ý + ký tay) → Xác nhận chữ ký bằng mã → Job accepted → Payment details → Home khi đang làm |
| 3 | AI Q&A | Q&A → Câu trả lời (hiện dần như AI đang viết) → Where to get help → Đặt phiên dịch → Request sent |

## Điều khiển khi trình chiếu

- `1` `2` `3`: chuyển luồng · `←` `→`: màn trước / sau · `R`: chạy lại luồng
- `H`: ẩn hai bảng bên, chỉ còn điện thoại · `F`: toàn màn hình
- Bảng bên phải: bấm vào bước bất kỳ để nhảy thẳng tới màn đó.

## Cấu trúc

```
src/
  App.tsx              khung trình chiếu, co giãn theo màn hình, phím tắt, chuyển cảnh
  state.tsx            điều hướng, dữ liệu dùng chung, định nghĩa 3 luồng
  ui.tsx               component dùng chung (Button, Header, Sheet, OTP, BottomNav, Icon…)
  styles.css           design token + toàn bộ style
  screens/
    onboarding.tsx     Splash, Intro, 05–10
    home.tsx           11 Home, 17 Home while working
    job.tsx            12–16
    qa.tsx             Q1–Q5
  assets/              icon, ảnh, video splash
```

## Ghi chú

- Dữ liệu và "AI" là mô phỏng, chưa có backend. Mã xác thực tự điền sau khoảng 1 giây (giả lập mã về từ WhatsApp), vẫn gõ tay được.
- Icon và ảnh được render từ Figma ở độ phân giải cao (icon 8x, ảnh 2–6x) vì phiên làm việc không tải được file export trực tiếp. Nếu có file export gốc (SVG), thay vào `src/assets/` và giữ nguyên tên.
- Hình nền màn hình khoá được lấy từ frame Figma rồi xoá chữ và thẻ thông báo để dựng lại bằng code.
