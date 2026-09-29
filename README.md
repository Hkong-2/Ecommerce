# 🛒 E-Commerce Fullstack Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<br/>

Một hệ thống **E-Commerce Fullstack** hiện đại, được xây dựng với kiến trúc mạnh mẽ, hiệu suất cao và khả năng mở rộng tốt. Dự án áp dụng các công nghệ tiên tiến nhất như React 19, NestJS 11, Tailwind CSS v4 và Prisma ORM kết hợp cơ sở dữ liệu PostgreSQL.

---

## 📑 Mục lục
- [✨ Tính năng nổi bật](#-tính-năng-nổi-bật)
- [🛠️ Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [📂 Cấu trúc dự án](#-cấu-trúc-dự-án)
- [🗄️ Mô hình Cơ sở dữ liệu](#️-mô-hình-cơ-sở-dữ-liệu)
- [🚀 Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [🔑 Biến môi trường (.env)](#-biến-môi-trường-env)
- [📖 API Documentation](#-api-documentation)

---

## ✨ Tính năng nổi bật

- **Quản lý Sản phẩm linh hoạt:** Hỗ trợ sản phẩm với nhiều biến thể (SKU) như kích thước, màu sắc và lưu trữ thông số kỹ thuật một cách tự do (Dynamic Tech Specs dạng JSON).
- **Hệ thống Giỏ hàng & Đơn hàng toàn diện:** Quản lý giỏ hàng, tính toán đơn hàng và lưu "snapshot" dữ liệu lúc mua (bảo toàn lịch sử giá và thuộc tính nếu sau này sản phẩm thay đổi).
- **Web Scraping Tự động:** Tích hợp tính năng sử dụng `Puppeteer` cào dữ liệu sản phẩm, thông số kỹ thuật và hình ảnh từ các trang web nguồn.
- **Xác thực & Bảo mật:** Hỗ trợ đăng nhập truyền thống với JWT & bcrypt và tích hợp OAuth2 (Đăng nhập bằng Google).
- **Tối ưu Trải nghiệm Người dùng (UX/UI):** 
  - Quản lý API State mượt mà với `TanStack Query`.
  - Hỗ trợ đa ngôn ngữ (`i18next`).
  - Giao diện thân thiện, hiện đại, hỗ trợ Dark/Light Mode với `Shadcn UI` & `Tailwind CSS v4`.

---

## 🛠️ Công nghệ sử dụng

### 💻 FrontEnd
- **Core:** React 19, Vite, TypeScript
- **State Management:** Redux Toolkit (Client State), TanStack Query (Server API State)
- **Styling & UI:** Tailwind CSS v4, Shadcn UI (`radix-ui`), Lucide Icons, `next-themes` (Dark/Light mode)
- **Form & Validation:** react-hook-form, Zod
- **Routing:** react-router-dom v7
- **Đa ngôn ngữ:** i18next, react-i18next
- **HTTP Client:** Axios

### ⚙️ BackEnd
- **Core:** NestJS v11, TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Caching:** Redis (`ioredis`)
- **Xác thực:** Passport (JWT, Google OAuth20), bcrypt
- **Tài liệu API:** Swagger (`@nestjs/swagger`)
- **Công cụ phụ trợ:** Puppeteer (Crawl dữ liệu)

---

## 📂 Cấu trúc dự án

Dự án hoạt động dưới dạng Monorepo ảo bao gồm hai hệ thống tách biệt được đặt chung một thư mục:

```text
📦 Ecommerce
 ┣ 📂 be/                # 🔙 Mã nguồn Backend (NestJS)
 ┃ ┣ 📂 prisma/          # Cấu hình Prisma & Schema Database
 ┃ ┣ 📂 src/             # Logic chính của API (Controllers, Services, Modules)
 ┃ ┗ 📜 package.json
 ┣ 📂 FrontEnd/          # 🎨 Mã nguồn Frontend (React 19 + Vite)
 ┃ ┣ 📂 src/             # Components, Pages, Stores, API hooks, Features, v.v.
 ┃ ┗ 📜 package.json
 ┗ 📜 docker-compose.yml # 🐳 File cấu hình Docker chạy Postgres & Redis
```

---

## 🗄️ Mô hình Cơ sở dữ liệu

Kiến trúc CSDL được thiết kế chặt chẽ và chuẩn hóa để hỗ trợ Ecommerce mở rộng:
- **User & Address:** Quản lý người dùng, phân quyền (USER/ADMIN) và danh sách sổ địa chỉ đa dạng.
- **Catalog (Brand, Category, Product, SKU):** 
  - `Product`: Thông tin sản phẩm chính, lưu thông số kỹ thuật bằng kiểu dữ liệu JSON linh hoạt.
  - `SKU`: Định nghĩa biến thể cụ thể (Mã SKU, Giá, Tồn kho, Thuộc tính biến thể bằng JSON).
  - `ProductImage`: Thư viện đa phương tiện kết nối đến sản phẩm và từng SKU riêng biệt.
- **Cart & Order:** 
  - `CartItem`: Liên kết Người dùng và SKU trong giỏ tạm.
  - `Order` & `OrderItem`: Quản lý trạng thái và lưu trữ snapshot của `Product` và `SKU` ở thời điểm đặt hàng. Lưu trữ lịch sử thay đổi trạng thái đơn hàng qua `OrderStatusHistory`.

---

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- Node.js (Khuyến nghị bản v18.x hoặc v20.x trở lên)
- Docker & Docker Compose (để khởi chạy nhanh PostgreSQL và Redis)
- Git

### 2. Khởi chạy Database & Redis (thông qua Docker)
Từ thư mục gốc của dự án, mở terminal và chạy:
```bash
docker-compose up -d
```
*(Lệnh này sẽ khởi động Postgres tại cổng 5432 và Redis tại cổng 6379 dưới nền)*

### 3. Cài đặt và Chạy Backend
Mở terminal và di chuyển vào thư mục backend:
```bash
cd be

# Cài đặt dependencies
npm install

# Đẩy schema lên database và generate Prisma client
npx prisma db push
npx prisma generate

# Khởi chạy server ở chế độ dev
npm run start:dev
```
*(Server backend sẽ mặc định chạy trên cổng của NestJS, ví dụ: `http://localhost:3000`)*

### 4. Cài đặt và Chạy Frontend
Tiếp tục mở một terminal mới và di chuyển vào thư mục frontend:
```bash
cd FrontEnd

# Cài đặt dependencies
npm install

# Khởi chạy website ở chế độ dev
npm run dev
```
*(Trang web sẽ được serve ở: `http://localhost:5173`)*

---

## 🔑 Biến môi trường (.env)

Để ứng dụng có thể hoạt động hoàn chỉnh, hãy sao chép các file `.env.example` (nếu có) thành `.env` và tùy chỉnh theo cấu hình môi trường của bạn.

### Backend (`be/.env`)
```env
# Database Credentials
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=your_postgres_db_name
DB_PORT=5432

# Prisma URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}?schema=public"

# Redis
REDIS_PORT=6379

# JWT Config
JWT_SECRET="your_secret_key"
JWT_EXPIRES_IN="1d"

# Google Auth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"
```

### Frontend (`FrontEnd/.env`)
```env
VITE_API_BASE_URL="http://localhost:3000/api"
```

---

## 📖 API Documentation

Backend NestJS có tích hợp sẵn `Swagger` giúp bạn tra cứu nhanh các endpoint và test API trực tiếp trên trình duyệt.  
Sau khi khởi chạy Backend, truy cập:  
👉 **`http://localhost:3000/api`** *(hoặc đường dẫn được tùy chỉnh ở file `main.ts`)*

---

<div align="center">
  <i>Được thiết kế và phát triển với ❤️</i>
</div>
