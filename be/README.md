# Ecommerce Backend

Backend cho dự án Ecommerce, xây dựng bằng NestJS, Prisma và PostgreSQL.

## Công nghệ sử dụng

- NestJS
- Prisma 7
- PostgreSQL
- Passport
- JWT
- Google OAuth 2.0
- Swagger

## Chức năng hiện có

- Kết nối PostgreSQL bằng Prisma
- Đăng nhập bằng Google OAuth
- Sinh JWT sau khi đăng nhập thành công
- Xác thực route bằng Bearer Token
- Tài liệu API với Swagger

## Cấu trúc thư mục

```text
src/
  app.module.ts
  main.ts
  auth/
    auth.controller.ts
    auth.module.ts
    auth.service.ts
    google.strategy.ts
    jwt.strategy.ts
    roles/
      roles.decorator.ts
      roles.guard.ts
  prisma/
    prisma.module.ts
    prisma.service.ts

prisma/
  schema.prisma
  migrations/

prisma.config.ts
```

## Yêu cầu môi trường

- Node.js 20+
- PostgreSQL
- npm

## Biến môi trường

Tạo file `.env` trong thư mục `be`:

```env
PORT=3000

DATABASE_URL=postgresql://postgres:123456@localhost:5432/ecommerce_db?schema=public

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

JWT_SECRET=your_jwt_secret
```

## Cài đặt

```bash
npm install
```

Nếu PowerShell chặn script, dùng:

```bash
cmd /c npm install
```

## Prisma 7

Project này đang dùng Prisma 7, nên:

- Không khai báo `url` trong `prisma/schema.prisma`
- Connection string được lấy từ `prisma.config.ts`
- `PrismaClient` phải khởi tạo với adapter trong `PrismaService`

Nếu thay đổi schema, chạy:

```bash
cmd /c npx prisma generate
```

Khi cần tạo migration:

```bash
cmd /c npx prisma migrate dev
```

## Chạy project

```bash
npm run start:dev
```

Hoặc:

```bash
cmd /c npm run start:dev
```

Mặc định server chạy tại:

```text
http://localhost:3000
```

## Swagger

Swagger UI:

```text
http://localhost:3000/api/docs
```

## Authentication flow

### 1. Đăng nhập Google

```http
GET /auth/google
```

Route này chuyển hướng người dùng tới trang đăng nhập Google.

### 2. Google callback

```http
GET /auth/google/callback
```

Sau khi Google xác thực thành công:

- Backend kiểm tra user theo email
- Nếu chưa có thì tạo user mới
- Sinh `access_token`
- Trả về JSON chứa token

Ví dụ response:

```json
{
  "access_token": "your_jwt_token"
}
```

### 3. Lấy profile

```http
GET /auth/profile
Authorization: Bearer <access_token>
```

Ví dụ response:

```json
{
  "userId": 1,
  "role": "USER"
}
```

## Scripts

```bash
npm run build
npm run start
npm run start:dev
npm run start:debug
npm run start:prod
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

## Ghi chú

- Hiện tại backend mới tập trung phần auth và kết nối database
- Google login đang trả token dạng JSON ở callback
- Sau này có thể đổi sang redirect về frontend và gửi token qua cookie hoặc query params
- Trong schema hiện có các model chính như `User`, `Address`, `Category`, `Product`, `SKU`, `CartItem`, `Order`, `OrderItem`

## Hướng phát triển tiếp theo

- Hoàn thiện module sản phẩm
- Hoàn thiện giỏ hàng
- Hoàn thiện đơn hàng
- Thêm phân quyền admin
- Thêm validate DTO
- Thêm refresh token
- Thêm logging và exception filter
