# E-Commerce Backend Platform

## 📋 Giới thiệu

E-Commerce Backend Platform là một hệ thống backend hiện đại được xây dựng với NestJS, cung cấp đầy đủ tính năng cho một nền tảng thương mại điện tử. Hệ thống hỗ trợ quản lý người dùng, shop, sản phẩm, xác thực và nhiều tính năng khác.

## 🚀 Tính năng chính

### 🔐 Xác thực & Phân quyền
- **Đăng ký/Đăng nhập**: Hỗ trợ đăng ký bằng email và OAuth2 (Google, Facebook)
- **JWT Authentication**: Bảo mật với JWT tokens và refresh tokens
- **Xác thực 2 bước**: Gửi mã xác thực qua email
- **Phân quyền**: Hệ thống role-based với các vai trò: ROOT, ADMINISTRATOR, SUPPORTER, COLLABORATOR, SELLER, USER
- **Guard bảo mật**: Rate limiting, role-based access control

### 👤 Quản lý người dùng
- **Hồ sơ người dùng**: Quản lý thông tin cá nhân, avatar, địa chỉ
- **Phân loại khách hàng**: Diamond, Gold, Silver, Copper customer tiers
- **Quản lý thanh toán**: Lưu trữ thông tin credit card
- **Trạng thái tài khoản**: Active, banned, locked, verified status

### 🏪 Quản lý Shop
- **Tạo và quản lý shop**: Đăng ký shop, xác thực shop
- **Hồ sơ shop**: Logo, banner, mô tả, thông tin liên hệ
- **Đánh giá shop**: Hệ thống rating và review
- **Trạng thái shop**: Pending, approved, rejected, suspended

### 📦 Quản lý sản phẩm
- **SPU/SKU Model**: Standard Product Unit và Stock Keeping Unit
- **Phân loại sản phẩm**: Hệ thống category có cấp bậc
- **Thương hiệu**: Quản lý brand với logo và website
- **Thuộc tính sản phẩm**: Màu sắc, kích thước, material, v.v.
- **Quản lý kho**: Inventory tracking và stock management

### 🔍 Tìm kiếm & Phân tích
- **Elasticsearch**: Tìm kiếm sản phẩm nhanh và chính xác
- **Full-text search**: Tìm kiếm theo tên, mô tả, thương hiệu
- **Analytics**: Theo dõi lượt tìm kiếm và hành vi người dùng

### 📧 Hệ thống Email
- **Queue-based email**: Sử dụng RabbitMQ để gửi email bất đồng bộ
- **Email templates**: Các mẫu email cho xác thực, thông báo
- **Notification system**: Thông báo đăng ký, đổi mật khẩu, phát hiện thiết bị mới

### 📄 API Documentation
- **Swagger UI**: Tài liệu API tự động tại `/docs`
- **GraphQL**: Hỗ trợ GraphQL endpoint với playground
- **RESTful API**: Thiết kế API theo chuẩn REST

## 🛠️ Công nghệ sử dụng

### Backend Framework
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **GraphQL** - Query language và runtime

### Database & ORM
- **PostgreSQL** - Primary database
- **Prisma** - Modern database ORM
- **Redis** - Caching và session storage

### Search & Analytics
- **Elasticsearch** - Full-text search engine
- **Kibana** (optional) - Data visualization

### Authentication & Security
- **JWT** - JSON Web Tokens
- **Passport.js** - Authentication middleware
- **Argon2** - Password hashing
- **Rate limiting** - Request throttling

### File Upload & Storage
- **Multer** - File upload handling
- **Static file serving** - Express static middleware

### Message Queue
- **RabbitMQ** - Message broker cho email service
- **AMQP** - Advanced Message Queuing Protocol

### Validation & Documentation
- **Class Validator** - DTO validation
- **Class Transformer** - Object transformation
- **Swagger** - API documentation
- **ESLint & Prettier** - Code formatting

## 📁 Cấu trúc dự án

```
backend/
├── prisma/                    # Database schema và migrations
│   ├── schema/               # Prisma schema files
│   │   ├── auth.prisma      # Authentication models
│   │   ├── user.prisma      # User models
│   │   ├── shop.prisma      # Shop models
│   │   ├── product.prisma   # Product models
│   │   └── role.prisma      # Role & permission models
│   └── generated/           # Generated Prisma client
├── src/
│   ├── common/              # Shared utilities
│   │   ├── config/         # Configuration files
│   │   ├── decorator/      # Custom decorators
│   │   ├── enum/           # Enum definitions
│   │   └── guard/          # Auth guards
│   ├── email/              # Email service module
│   ├── modules/            # Feature modules
│   │   ├── auth/          # Authentication module
│   │   ├── user/          # User management
│   │   ├── shop/          # Shop management
│   │   ├── product/       # Product management
│   │   ├── file/          # File upload handling
│   │   ├── elasticsearch/ # Search functionality
│   │   ├── redis/         # Caching service
│   │   └── eventbus/      # Event handling
│   ├── prisma/            # Prisma service và seeding
│   ├── scripts/           # Utility scripts
│   └── task/              # Scheduled tasks
├── test/                  # E2E tests
├── docker-compose.yml     # Docker services
└── upload/                # Static file storage
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- **Node.js** >= 18.x
- **PostgreSQL** >= 13.x
- **Redis** >= 6.x
- **Elasticsearch** >= 8.x
- **RabbitMQ** >= 3.x
- **pnpm** (package manager)

### 1. Clone repository

```bash
git clone <repository-url>
cd e-commerce/backend
```

### 2. Cài đặt dependencies

```bash
pnpm install
```

### 3. Thiết lập môi trường

Tạo file `.env` trong thư mục `backend/`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Elasticsearch
ELASTICSEARCH_NODE="http://localhost:9200"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# OAuth2
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"

# RabbitMQ
RABBITMQ_URL="amqp://localhost:5672"

# File Upload
UPLOAD_DEST="./upload"
MAX_FILE_SIZE=5242880  # 5MB
```

### 4. Chạy services với Docker

```bash
# Chạy Elasticsearch
docker-compose up -d

# Hoặc chạy tất cả services (nếu có cấu hình đầy đủ)
docker-compose up -d elasticsearch redis rabbitmq
```

### 5. Thiết lập database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed database với dữ liệu mẫu
pnpm run seed

# Hoặc seed với Elasticsearch sync
pnpm run seed:full
```

### 6. Chạy ứng dụng

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

Ứng dụng sẽ chạy tại:
- **API Server**: http://localhost:4000
- **API Documentation**: http://localhost:4000/docs
- **GraphQL Playground**: http://localhost:4000/graphql

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/auth/login` | Đăng nhập | ❌ |
| POST | `/auth/verify-account-with-code` | Xác thực tài khoản bằng mã | ❌ |
| POST | `/auth/refresh` | Refresh JWT token | ❌ |
| POST | `/auth/change-password` | Đổi mật khẩu | ✅ |
| POST | `/auth/logout` | Đăng xuất | ✅ |
| GET | `/auth/google` | Đăng nhập Google OAuth2 | ❌ |
| GET | `/auth/facebook` | Đăng nhập Facebook OAuth2 | ❌ |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Lấy thông tin profile | ✅ |
| PATCH | `/user/profile` | Cập nhật profile | ✅ |
| POST | `/user/avatar` | Upload avatar | ✅ |
| GET | `/user/shops` | Lấy danh sách shop của user | ✅ |

### Shop Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/shop` | Tạo shop mới | ✅ |
| GET | `/shop/:id` | Lấy thông tin shop | ❌ |
| PATCH | `/shop/:id` | Cập nhật shop | ✅ |
| GET | `/shop` | Tìm kiếm shop | ❌ |
| POST | `/shop/:id/verify` | Xác thực shop (Admin) | ✅ |

### Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/product/spu` | Tạo SPU mới | ✅ |
| GET | `/product/spu/:id` | Lấy thông tin SPU | ❌ |
| PATCH | `/product/spu/:id` | Cập nhật SPU | ✅ |
| POST | `/product/sku` | Tạo SKU mới | ✅ |
| GET | `/product/search` | Tìm kiếm sản phẩm | ❌ |
| GET | `/product/categories` | Lấy danh sách category | ❌ |
| GET | `/product/brands` | Lấy danh sách brand | ❌ |

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
```

## 🔧 Scripts có sẵn

```bash
# Development
pnpm run start:dev          # Chạy ở chế độ development với hot reload
pnpm run start:debug        # Chạy ở chế độ debug

# Production
pnpm run build             # Build ứng dụng
pnpm run start:prod        # Chạy ở chế độ production

# Database
pnpm run seed              # Seed database với dữ liệu mẫu
pnpm run seed:full         # Seed database và sync với Elasticsearch
pnpm run sync-es           # Sync dữ liệu với Elasticsearch

# Code Quality
pnpm run lint              # Chạy ESLint
pnpm run format            # Format code với Prettier
```

## 🐳 Docker Support

### Chạy toàn bộ hệ thống với Docker

```bash
# Build và chạy tất cả services
docker-compose up --build

# Chỉ chạy external services
docker-compose up elasticsearch redis rabbitmq

# Chạy ở background
docker-compose up -d
```

### Docker Services

- **Elasticsearch**: Port 9200, 9300
- **Redis**: Port 6379
- **RabbitMQ**: Port 5672, 15672 (Management UI)
- **PostgreSQL**: Port 5432 (nếu cấu hình)

## 🔐 Security Features

### Authentication & Authorization
- **JWT-based authentication** với access và refresh tokens
- **Role-based access control (RBAC)** với nhiều cấp độ quyền
- **OAuth2 integration** với Google và Facebook
- **2FA support** qua email verification

### Data Protection
- **Password hashing** với Argon2
- **Input validation** với class-validator
- **SQL injection protection** qua Prisma ORM
- **Rate limiting** để chống DDoS và brute force

### API Security
- **CORS configuration** 
- **Helmet.js** cho security headers
- **Trust proxy** configuration
- **File upload validation** và size limits

## 📊 Monitoring & Logging

### Application Monitoring
- **Health check endpoints**
- **Performance metrics** 
- **Error tracking**
- **Request logging**

### Database Monitoring
- **Prisma query logging**
- **Connection pool monitoring**
- **Slow query detection**

### Search Analytics
- **Elasticsearch cluster health**
- **Search performance metrics**
- **User search behavior tracking**

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
```env
NODE_ENV=production
DATABASE_URL="your-production-db-url"
REDIS_URL="your-production-redis-url"
ELASTICSEARCH_NODE="your-production-es-url"
```

2. **Build và Deploy**
```bash
# Build application
pnpm run build

# Run database migrations
npx prisma migrate deploy

# Start production server
pnpm run start:prod
```

3. **PM2 Process Manager**
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/main.js --name "ecommerce-backend"

# Monitor
pm2 monit
```

## 🤝 Contributing

### Development Workflow

1. **Fork và clone repository**
2. **Tạo feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Tạo Pull Request**

### Code Standards

- **TypeScript strict mode**
- **ESLint configuration** với Prettier
- **Conventional Commits** format
- **Unit tests** cho logic quan trọng
- **API documentation** trong Swagger

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@ecommerce-platform.com
- **Documentation**: [Full API Docs](http://localhost:4000/docs)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

## 🔄 Changelog

### Version 1.0.0
- ✅ Initial release
- ✅ User authentication và authorization
- ✅ Shop management system
- ✅ Product catalog với search
- ✅ Email notification system
- ✅ File upload handling
- ✅ API documentation

---

Made with ❤️ by [Your Team Name]
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
