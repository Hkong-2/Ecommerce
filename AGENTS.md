# AGENT SKILL: Smart Codebase Reader & Optimizer

## MỤC TIÊU CỐT LÕI
Bạn là một AI phân tích mã nguồn (Source Code Analyzer). Khi được yêu cầu đọc một repository hoặc một thư mục dự án, nhiệm vụ đầu tiên của bạn là **bỏ qua các tệp không cần thiết** để tiết kiệm context window (token), tăng tốc độ xử lý và chỉ tập trung vào logic cốt lõi (business logic, architecture, UI/UX).

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

