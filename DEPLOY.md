# Hướng dẫn Deploy dự án DigiPro miễn phí

Tài liệu này hướng dẫn chi tiết cách triển khai (deploy) dự án DigiPro hoàn toàn miễn phí trên các nền tảng:
- **Database:** Neon.tech (PostgreSQL serverless)
- **Backend (NestJS):** Render.com (Web Service)
- **Frontend (React/Vite):** Vercel
- **Lưu trữ hình ảnh:** Cloudinary (Đã được tích hợp sẵn vào backend)

---

## Phần 1: Cài đặt Database trên Neon.tech

1. Truy cập [Neon.tech](https://neon.tech/) và đăng ký tài khoản (miễn phí).
2. Tạo một Project mới (ví dụ: `digipro-db`). Chọn region gần với bạn (như Singapore là tốt nhất).
3. Sau khi tạo xong, vào trang **Dashboard** của project.
4. Lấy chuỗi kết nối PostgreSQL (Connection string) nằm trong mục **Connection Details**. Chuỗi này thường có dạng:
   ```env
   postgresql://<username>:<password>@ep-xxx-yyy.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
   > **Lưu ý:** Nếu có tham số `?sslmode=require`, hãy giữ nguyên. Đây chính là giá trị cho biến `DATABASE_URL` trong Backend.

---

## Phần 2: Cấu hình và Deploy Backend trên Render.com

Render cung cấp gói miễn phí cho Web Service. Tuy nhiên, nó sẽ "ngủ" (spin down) sau 15 phút nếu không có traffic, dẫn đến việc mất các file trên ổ cứng. Nhờ việc đã tích hợp Cloudinary, chúng ta không sợ mất ảnh cào được.

### Bước 2.1: Chuẩn bị tài khoản Cloudinary
1. Đăng nhập [Cloudinary](https://cloudinary.com/).
2. Lấy 3 thông tin từ Dashboard (như bạn đã cung cấp hoặc tài khoản mới):
   - `Cloud Name`
   - `API Key`
   - `API Secret`

### Bước 2.2: Tạo Web Service trên Render
1. Đăng ký/Đăng nhập vào [Render.com](https://render.com/).
2. Nhấn nút **New +** và chọn **Web Service**.
3. Chọn tuỳ chọn **Build and deploy from a Git repository** và kết nối với repository GitHub của dự án này.
4. Ở phần cấu hình (Settings) của Web Service, điền các thông tin sau:
   - **Name:** Tùy ý (VD: `digipro-backend`).
   - **Root Directory:** `be` (Rất quan trọng, vì backend nằm trong thư mục `be`).
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Instance Type:** Chọn gói `Free`.

### Bước 2.3: Thêm các Biến Môi Trường (Environment Variables)
Chuyển sang tab **Environment** của Web Service trên Render, thêm các biến môi trường sau:

| Key | Value (Mẫu / Giải thích) |
|---|---|
| `DATABASE_URL` | Chuỗi kết nối lấy từ Neon.tech ở Phần 1 |
| `JWT_SECRET` | Một chuỗi bảo mật ngẫu nhiên (VD: `MySuperSecretKey123!@#`) |
| `FRONTEND_URL` | Địa chỉ tên miền sau khi deploy của Frontend (VD: `https://digipro-v1.vercel.app`). Tạm thời nếu chưa deploy Frontend, có thể để trống hoặc điền tạm `*`, sau đó quay lại cập nhật sau. |
| `GOOGLE_CLIENT_ID` | (Tùy chọn) Lấy từ Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | (Tùy chọn) Lấy từ Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://<ten-mien-backend-render>/auth/google/callback` |
| `GHN_API_TOKEN` | (Tùy chọn nếu muốn tích hợp giao hàng) |
| `GHN_SHOP_ID` | (Tùy chọn) |
| `GHN_FROM_DISTRICT_ID`| (Tùy chọn) |
| `GHN_FROM_WARD_CODE` | (Tùy chọn) |
| `VNP_TMN_CODE` | (Tùy chọn VNPay) |
| `VNP_HASH_SECRET` | (Tùy chọn VNPay) |
| `VNP_URL` | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| `VNP_API_URL` | `https://sandbox.vnpayment.vn/merchant_webapi/api/transaction` |
| `VNP_RETURN_URL` | `https://<ten-mien-frontend-vercel>/vnpay-return` |
| `CLOUDINARY_CLOUD_NAME` | Điền giá trị từ Bước 2.1 |
| `CLOUDINARY_API_KEY` | Điền giá trị từ Bước 2.1 |
| `CLOUDINARY_API_SECRET`| Điền giá trị từ Bước 2.1 |

5. Nhấn **Save Changes** và chờ Render build và deploy ứng dụng. Nếu thành công, bạn sẽ được cấp một đường dẫn (VD: `https://digipro-backend.onrender.com`). Hãy lưu lại URL này.

---

## Phần 3: Cấu hình và Deploy Frontend trên Vercel

### Bước 3.1: Deploy
1. Đăng ký/Đăng nhập vào [Vercel.com](https://vercel.com/) (Dùng tài khoản GitHub).
2. Nhấn **Add New...** -> **Project**.
3. Chọn repository GitHub của dự án.
4. Trong mục **Configure Project**, điền các thông tin:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `FrontEnd` (Rất quan trọng, vì frontend nằm trong thư mục này).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Mở phần **Environment Variables**, thêm biến môi trường sau:
   - **Key:** `VITE_API_URL`
   - **Value:** URL của Backend trên Render đã lấy ở Phần 2 (VD: `https://digipro-backend.onrender.com`). Lưu ý: không có dấu `/` ở cuối URL.
6. Nhấn **Deploy** và chờ Vercel thực hiện.

### Bước 3.2: Hoàn tất liên kết
Sau khi Vercel deploy xong, bạn sẽ có URL của Frontend (VD: `https://digipro.vercel.app`).
- **Quay lại Dashboard của Render**, vào mục Environment Variables của Web Service backend.
- Cập nhật lại biến `FRONTEND_URL` thành địa chỉ chính xác của Vercel (VD: `https://digipro.vercel.app`). Tránh việc bị lỗi CORS.
- Cập nhật `VNP_RETURN_URL` bằng `<URL_CỦA_VERCEL>/vnpay-return` (Nếu dùng VNPay).

---

## Cập nhật Database Schema
Vì chúng ta deploy cơ sở dữ liệu hoàn toàn mới trên Neon, nên cần đẩy các Schema từ Prisma lên DB đó. Bạn có 2 cách:
1. (Khuyến nghị) Dùng máy tính của bạn, kết nối bằng cách sửa `.env` ở local thành `DATABASE_URL` của Neon, rồi chạy lệnh `cd be && npx prisma db push`.
2. Truy cập tab **Shell** (hoặc Web Terminal) trên Render sau khi backend khởi chạy, và gõ lệnh `npx prisma db push`.

## Lời khuyên khi dùng Render Free
Lần truy cập đầu tiên sau 15 phút dự án có thể tải rất chậm (mất khoảng 30s-1 phút để server thức dậy). Để khắc phục phần nào, bạn có thể thiết lập một dịch vụ cron job miễn phí (như UptimeRobot) ping vào trang chủ backend (VD: `<URL_BACKEND>/api/docs`) cứ mỗi 14 phút một lần.

Chúc bạn deploy thành công!
