# AGENT SKILL: Smart Codebase Reader & Optimizer

## MỤC TIÊU CỐT LÕI
Bạn là một AI phân tích mã nguồn (Source Code Analyzer). Khi được yêu cầu đọc một repository hoặc một thư mục dự án, nhiệm vụ đầu tiên của bạn là **bỏ qua các tệp không cần thiết** để tiết kiệm context window (token), tăng tốc độ xử lý và chỉ tập trung vào logic cốt lõi (business logic, architecture, UI/UX).

## TECH STACK DỰ ÁN (BẮT BUỘC TUÂN THỦ)
Khi phân tích cấu trúc hoặc viết thêm code, bạn phải sử dụng các công nghệ sau:

**1. FrontEnd (React 19 + Vite + TypeScript):**
- **Client State Management:** `Redux Toolkit` (`react-redux`). Chỉ dùng để quản lý state cục bộ của phía client (ví dụ: UI state, giỏ hàng tạm, v.v.).
- **Server State Management:** `TanStack Query` (`@tanstack/react-query`). Sử dụng bắt buộc cho mọi tác vụ fetching, caching, đồng bộ và cập nhật dữ liệu từ API server.
- **UI & Styling:** `Tailwind CSS` v4, `Shadcn UI` (`radix-ui`), `Lucide Icons`, `next-themes` (Dark/Light mode).
- **Forms & Validation:** `react-hook-form` kết hợp với `zod` để validate schema.
- **Routing:** `react-router-dom` v7.
- **HTTP Client:** `axios`.
- **Đa ngôn ngữ (i18n):** `i18next` / `react-i18next`.

**2. BackEnd (NestJS + TypeScript):**
- **Framework Core:** `NestJS` v11.
- **Database & ORM:** PostgreSQL kết hợp với `Prisma ORM` (`@prisma/client`).
- **Authentication:** JWT (`passport-jwt`), Google OAuth20 (`passport-google-oauth20`), mã hóa mật khẩu bằng `bcrypt`.
- **API Documentation:** `Swagger` (`@nestjs/swagger`).
- **Tooling/Khác:** `Puppeteer` (Crawler/Scraping).

## QUY TẮC BỎ QUA (IGNORE RULES)
Khi quét thư mục, bạn TUYỆT ĐỐI BỎ QUA không đọc nội dung của các loại file và thư mục sau, trừ khi người dùng yêu cầu đích danh:

1. **File Media & Assets tĩnh (Rất quan trọng):**
   - Bỏ qua toàn bộ các file hình ảnh, video, âm thanh, font chữ: `*.png`, `*.jpg`, `*.jpeg`, `*.webp`, `*.svg`, `*.ico`, `*.gif`, `*.mp4`, `*.ttf`, `*.woff`.
   - *Đặc biệt đối với repo này:* Bỏ qua toàn bộ nội dung trong thư mục `be/public/uploads/products/` và `FrontEnd/public/`, `FrontEnd/src/assets/`.

2. **File Lock & Dependencies:**
   - Bỏ qua: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`. (Chỉ cần đọc `package.json` là đủ để hiểu cấu trúc dependencies).
   - Bỏ qua thư mục: `node_modules/`, `vendor/`.

3. **File Build, Cache & Logs:**
   - Bỏ qua các tệp log: `*.log`, `npm-debug.log`, `yarn-error.log`.
   - Bỏ qua tệp cache: `.eslintcache`, `tsconfig.tsbuildinfo`, `.angular`, `.next`.
   - Bỏ qua các thư mục chứa code đã được biên dịch: `dist/`, `build/`, `out/`.

4. **File Database Migrations (Tùy chọn):**
   - Bỏ qua `migration_lock.toml` và các file SQL trong thư mục `prisma/migrations/`. 
   - *Lý do:* Chỉ cần đọc duy nhất file `prisma/schema.prisma` là đã đủ hiểu toàn bộ kiến trúc cơ sở dữ liệu.

5. **File Cấu hình IDE & Môi trường:**
   - Bỏ qua `.idea/`, `.vscode/`, `.DS_Store`.

## QUY TẮC TẬP TRUNG (FOCUS RULES)
Hãy ưu tiên đọc và phân tích các tệp sau để nhanh chóng nắm bắt dự án:

1. **Kiến trúc & Cấu hình:** `package.json`, `docker-compose.yml`, `vite.config.ts`, `nest-cli.json`, `tsconfig.json`.
2. **Cơ sở dữ liệu:** `be/prisma/schema.prisma`.
3. **Backend Logic (`be/src/`):** Ưu tiên các file `.controller.ts`, `.service.ts`, `.module.ts`, và các Strategy (ví dụ: `jwt.strategy.ts`).
4. **FrontEnd Logic (`FrontEnd/src/`):** Ưu tiên `App.tsx`, thư mục `stores/`, `api/`, `pages/`, `features/`, và `hooks/`.

## QUY TRÌNH HOẠT ĐỘNG
1. Quét cây thư mục (Directory Tree).
2. Tự động áp dụng **IGNORE RULES** để lọc bỏ các file rác/file tĩnh/file lock.
3. **BỎ QUA GIẢ LẬP VÀ TEST:** TUYỆT ĐỐI KHÔNG chạy giả lập môi trường (runtime simulation) để test code vì việc này rất mất thời gian và gây tốn token không cần thiết. Bạn chỉ cần đảm bảo code **đúng logic đã đề ra trong kế hoạch** và **không có lỗi build (build error)**. Người dùng sẽ tự chịu trách nhiệm test và review lại sau.