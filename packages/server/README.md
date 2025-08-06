# 🔧 Bankimonline API

**Production-Optimized Node.js Backend**

This repository contains the **production deployment** of the Bankimonline API server. This is automatically synchronized from the [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace) development monorepo.

## ⚠️ Development Notice

**🚨 DO NOT develop directly in this repository!**

- **Development**: Happens in [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace)
- **Deployment**: This repository is automatically updated via dual-push workflow
- **Issues**: Report bugs and feature requests in the workspace repository

## 🏗️ Architecture

This repository is part of the **Hybrid 4-Repository System**:

- 🔧 **bankimonline-workspace** - Development hub (source of truth)
- 🌐 **bankimonline-web** - Client deployment  
- 📍 **bankimonline-api** (this repo) - Server deployment
- 📦 **bankimonline-shared** - Shared package

## 🚀 Deployment

### Production Deployment

**Recommended Platform**: Railway (current hosting)

```bash
# Deploy via Railway CLI
railway deploy

# Or automatic deployment via Git integration
```

**Alternative Platforms**:
- Heroku
- AWS ECS
- Google Cloud Run
- Custom Docker deployment

### Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
CONTENT_DATABASE_URL=postgresql://user:password@host:port/content_db

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server Configuration  
PORT=8003
NODE_ENV=production

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://admin.domain.com

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (Optional)
SMS_API_KEY=your-sms-provider-key
SMS_FROM=+1234567890
```

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 8003
CMD ["node", "src/server.js"]
```

## 🛠️ API Architecture

### Core Services

- **🔐 Authentication API** - JWT-based authentication system
- **🏛️ Banking Services** - Mortgage and credit calculations
- **🗄️ Content Management** - Database-first content system
- **👥 User Management** - Customer and staff account management
- **🏦 Bank Integration** - Israeli bank data and offers
- **📊 Admin Dashboard** - Administrative functionality

### Database Architecture

**Dual Database System**:
- **Main Database** - User data, applications, banking information
- **Content Database** - Multi-language content and translations

### API Endpoints

#### Authentication
- `POST /api/login` - Email-based staff login
- `POST /api/sms-login` - SMS-based customer login
- `POST /api/sms-code-login` - SMS verification
- `POST /api/register` - User registration

#### Banking Services
- `POST /api/customer/compare-banks` - Bank comparison service
- `POST /api/customer/submit-application` - Application submission
- `GET /api/applications/:id/status` - Application status check
- `POST /api/refinance-mortgage` - Mortgage refinancing
- `POST /api/refinance-credit` - Credit refinancing

#### Content Management
- `GET /api/content/:screen/:language` - Dynamic content retrieval
- `GET /api/content/cache/stats` - Cache statistics
- `DELETE /api/content/cache/clear` - Cache management
- `POST /api/content` - Content creation (admin)

#### Administrative
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/applications` - Application management
- `PUT /api/admin/applications/:id/status` - Status updates

#### Bank Worker System
- `POST /api/bank-worker/invite` - Send worker invitation
- `POST /api/bank-worker/register` - Complete registration
- `GET /api/bank-worker/status/:id` - Check worker status
- `GET /api/admin/approval-queue` - Approval management

## 🗄️ Database-First Content System

### Content Architecture

**Cache → Database → File Fallback Hierarchy**:
1. **NodeCache** (5-minute TTL) - In-memory caching
2. **PostgreSQL Content Database** - Structured content storage
3. **File System** - Static translation files (fallback)
4. **Default Values** - Hardcoded fallbacks

### Content Database Schema

```sql
-- Content Items
content_items (
  id SERIAL PRIMARY KEY,
  content_key VARCHAR(255) UNIQUE,
  component_type VARCHAR(100),
  category VARCHAR(100),
  screen_location VARCHAR(100),
  status VARCHAR(50)
);

-- Content Translations  
content_translations (
  id SERIAL PRIMARY KEY,
  content_item_id INTEGER REFERENCES content_items(id),
  language_code CHAR(2),
  content_value TEXT,
  status VARCHAR(50)
);
```

### Content API Usage

```javascript
// Get content for a specific screen and language
GET /api/content/home_page/en

// Response format
{
  "status": "success",
  "screen_location": "home_page", 
  "language_code": "en",
  "content_count": 17,
  "content": {
    "title": {
      "value": "Welcome to Bankimonline",
      "component_type": "text",
      "category": "header"
    }
  }
}
```

## 🔐 Security Features

### Authentication & Authorization
- **Dual Authentication System**:
  - **SMS Authentication** - For customers (phone-based)
  - **Email Authentication** - For staff members
- **JWT Token Management** - Secure session handling with expiration
- **Role-Based Access Control** - Customer, staff, admin permissions

### Data Security
- **Input Validation** - Comprehensive request validation
- **SQL Injection Protection** - Parameterized queries only
- **CORS Configuration** - Restricted cross-origin access
- **Rate Limiting** - API endpoint protection
- **Password Hashing** - bcryptjs with salt rounds

### Database Security
- **Connection Pooling** - Secure database connections
- **Environment Variables** - Sensitive data in environment
- **Database Encryption** - Encrypted connections to PostgreSQL
- **Backup Strategy** - Regular automated backups

## 📊 Performance Features

### Caching Strategy
- **NodeCache** - 5-minute TTL for content
- **Database Connection Pooling** - Optimized connections
- **Response Compression** - Gzip compression enabled
- **Static Asset Caching** - CDN-ready headers

### Database Optimization
- **Query Optimization** - Efficient database queries
- **Index Strategy** - Proper database indexing
- **Connection Management** - Pool size optimization
- **Query Logging** - Performance monitoring

### Monitoring & Logging
- **Morgan HTTP Logging** - Request/response logging
- **Error Tracking** - Comprehensive error handling
- **Performance Metrics** - Response time monitoring
- **Health Checks** - Database connectivity monitoring

## 🛠️ Technology Stack

### Core Framework
- **Node.js 20.x** - Runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Primary database system

### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging

### Database & Caching
- **pg (node-postgres)** - PostgreSQL client
- **NodeCache** - In-memory caching
- **Connection pooling** - Database optimization

### File Handling
- **Multer** - File upload handling
- **Static file serving** - Express static middleware

### Development Tools
- **Nodemon** - Development auto-reload
- **dotenv** - Environment variable management

## 🔄 Content Management Workflow

### Content Creation Flow
1. **Content Item Creation** - Add to `content_items` table
2. **Translation Addition** - Add to `content_translations` table  
3. **Cache Invalidation** - Clear relevant cache entries
4. **API Response** - Serve updated content

### Cache Management
```javascript
// Cache hit flow
Request → NodeCache Check → Return Cached Response

// Cache miss flow  
Request → Database Query → Cache Store → Return Response

// Cache invalidation
Admin Update → Cache Clear → Next Request Rebuilds Cache
```

## 📈 Monitoring & Health Checks

### Health Check Endpoints
- `GET /api/health` - General server health
- `GET /api/content-db/health` - Content database health
- `GET /api/content/cache/stats` - Cache statistics

### Monitoring Metrics
- **Response Times** - API endpoint performance
- **Database Queries** - Query execution times
- **Cache Hit Rates** - Content caching efficiency  
- **Error Rates** - Application error tracking
- **Memory Usage** - Server resource monitoring

### Logging Strategy
- **HTTP Requests** - Morgan logging format
- **Database Queries** - Query logging with timing
- **Error Logging** - Comprehensive error capture
- **Cache Events** - Cache hit/miss logging

## 🚀 Performance Targets

### Response Time Targets
- **Authentication**: <500ms
- **Content API**: <200ms (cached), <500ms (database)
- **Banking Services**: <1000ms
- **File Uploads**: <5000ms

### Reliability Targets
- **Uptime**: 99.9% (8.7 hours downtime/year)
- **Database Connections**: <100ms connection time
- **Cache Hit Rate**: >80% for content endpoints
- **Error Rate**: <0.1% for critical endpoints

## 🗃️ Database Schema Overview

### Core Tables
- **users** - Staff account management
- **clients** - Customer account management  
- **applications** - Mortgage/credit applications
- **banks** - Israeli bank information
- **cities** - Location data for applications

### Content Management Tables
- **content_items** - Content item definitions
- **content_translations** - Multi-language translations
- **content_cache** - Cache management (logical)

### Banking Tables
- **banking_standards** - Bank-specific configuration
- **loan_calculations** - Calculation history
- **client_credit_history** - Credit tracking

## 📦 Deployment Artifacts

### Production Build
```
src/
├── server.js              # Main application entry point
├── routes/                 # API route handlers
├── controllers/            # Business logic controllers
├── services/               # Business services
├── middleware/             # Express middleware
├── models/                 # Database models
└── config/                 # Configuration files
```

### Configuration Files
- **package.json** - Dependencies and scripts
- **Dockerfile** - Container configuration
- **railway.json** - Railway deployment configuration
- **.env.example** - Environment variable template

---

## 🔗 Related Repositories

- **Development**: [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace)
- **Frontend**: [`bankimonline-web`](https://github.com/sravnenie-ipotek/bankimonline-web)
- **Shared Package**: [`bankimonline-shared`](https://github.com/sravnenie-ipotek/bankimonline-shared)

## 📞 Support

- **Issues**: Report in [`bankimonline-workspace`](https://github.com/sravnenie-ipotek/bankimonline-workspace/issues)
- **API Documentation**: See `/docs` directory in workspace
- **Deployment Help**: Check deployment configuration files

---

**🚨 Remember**: This is a deployment repository. All development happens in the workspace!

**Deployment Target**: Production  
**Last Sync**: Automatic via dual-push  
**Health Status**: [![Railway Deployment](https://img.shields.io/badge/Railway-Deployed-success)](https://railway.app)