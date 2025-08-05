# Content Database Setup - Second Database Connection

## 🎯 Overview

A second database connection has been successfully added to the application for content management. This allows you to separate content data from the main application data.

## ✅ Implementation Status

### ✅ Database Connections
- **Main Database**: `pool` - For primary application data (users, banks, applications, etc.)
- **Content Database**: `contentPool` - For content management (use only when told to)

### ✅ Environment Variables
The content database uses these environment variables in order of priority:
1. `CONTENT_DATABASE_URL` (dedicated content database)
2. `DATABASE_PUBLIC_URL` (public database URL from Railway)
3. `DATABASE_URL` (fallback to main database)

### ✅ Completed Tasks
- [x] Added second database connection (`contentPool`)
- [x] Deleted `test-content` table (if it existed)
- [x] Added helper function `queryContentDB()`
- [x] Created health check endpoint `/api/content-db/health`
- [x] Added test endpoint `/api/content-db/test`
- [x] Added cleanup endpoint `/api/content-db/cleanup`

## 🚀 Usage

### 1. Direct Connection Usage
```javascript
// Direct query using contentPool
const result = await contentPool.query('SELECT * FROM your_content_table');

// Or use the helper function
const result = await queryContentDB('SELECT * FROM your_content_table', [param1, param2]);
```

### 2. Global Access
The content database is available globally:
```javascript
// Available anywhere in the application
global.contentPool
global.queryContentDB
```

### 3. API Endpoints

#### Health Check
```bash
GET /api/content-db/health
# Returns content database status and version
```

#### Test Endpoint (for verification)
```bash
GET /api/content-db/test
# Creates test table, inserts data, and returns results
```

#### Cleanup Test Data
```bash
DELETE /api/content-db/cleanup
# Removes test table created by test endpoint
```

## 🔧 Configuration

### Railway Environment Variables
To use a separate content database, set in Railway dashboard:
```bash
CONTENT_DATABASE_URL=postgresql://user:pass@host:port/content_db
```

### Local Development
Create or update your `.env` file:
```bash
CONTENT_DATABASE_URL=postgresql://postgres:password@localhost:5432/content_db
```

## 📝 Code Examples

### Creating Content Tables
```javascript
// Example: Create a content table
app.post('/api/content/create-table', async (req, res) => {
    try {
        await contentPool.query(`
            CREATE TABLE IF NOT EXISTS articles (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                author_id INTEGER,
                published BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        res.json({ status: 'success', message: 'Articles table created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Content CRUD Operations
```javascript
// Create content
app.post('/api/content/articles', async (req, res) => {
    const { title, content, author_id } = req.body;
    try {
        const result = await queryContentDB(
            'INSERT INTO articles (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
            [title, content, author_id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read content
app.get('/api/content/articles', async (req, res) => {
    try {
        const result = await queryContentDB('SELECT * FROM articles WHERE published = true');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## 🛡️ Important Notes

1. **Protected File**: `server-db.js` is a protected file. Only modify when explicitly requested.

2. **Use Cases**: The content database should only be used when specifically told to. Examples:
   - Articles and blog posts
   - CMS content
   - Media metadata
   - Content templates
   - Static page content

3. **Separation**: Keep content data separate from application data for better organization and potential scaling.

4. **Testing**: Always test content database operations using the health check endpoint first.

## 🔍 Verification

To verify the setup is working:

```bash
# 1. Check main database
curl http://localhost:8003/api/health

# 2. Check content database
curl http://localhost:8003/api/content-db/health

# 3. Test content database functionality
curl http://localhost:8003/api/content-db/test

# 4. Clean up test data
curl -X DELETE http://localhost:8003/api/content-db/cleanup
```

## 📊 Database Schema Separation

```
Main Database (pool):
├── users
├── clients  
├── banks
├── loan_applications
├── banking_standards
└── ... (application data)

Content Database (contentPool):
├── articles
├── pages
├── media
├── templates
└── ... (content data)
```

---

**Last Updated**: January 16, 2025  
**Status**: ✅ Ready for Use  
**Next Steps**: Use content database only when specifically requested 