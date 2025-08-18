const getDatabaseConfig = (connectionType = 'content') => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailwayProduction = process.env.RAILWAY_ENVIRONMENT === 'production';
    
    console.log(`🔧 Database Config - Environment: ${process.env.NODE_ENV || 'development'}, Railway: ${process.env.RAILWAY_ENVIRONMENT || 'not set'}`);
    
    if (isProduction || isRailwayProduction) {
        // Production: Local PostgreSQL on server
        console.log('🚀 Production environment detected - using local PostgreSQL');
        
        // Use different databases for main and content connections
        if (connectionType === 'content') {
            // 🚀 JSONB Migration: Using Neon for content database
            const neonUrl = process.env.NEON_CONTENT_URL || 'postgresql://neondb_owner:npg_jbzp4wqldAu7@ep-wild-feather-ad1lx42k.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
            console.log('🌟 Using Neon cloud database for JSONB dropdowns');
            return {
                connectionString: neonUrl,
                ssl: { rejectUnauthorized: false }
            };
        } else {
            return {
                connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bankim_core',
                ssl: false // Local connections don't need SSL
            };
        }
    } else {
        // Development: Railway PostgreSQL
        console.log('🛠️ Development environment detected - using Railway PostgreSQL');
        
        if (connectionType === 'content') {
            // Content database: shortline (bankim_content) - Contains CMS content, translations, dropdowns
            return {
                connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
                ssl: false // Railway doesn't require SSL for proxy connections
            };
        } else {
            // Main database: maglev (bankim_core) - Contains user data, authentication, client information
            return {
                connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
                ssl: false // Railway doesn't require SSL for proxy connections
            };
        }
    }
};