# Netlify Deployment Guide for OwnersAlliance

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Push your code to a GitHub repository
3. **Environment Variables**: You'll need these secrets set in Netlify

## Required Environment Variables

Set these in Netlify Dashboard > Site Settings > Environment Variables:

```
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email_username (optional)
EMAIL_PASS=your_email_password (optional)
SMTP_HOST=smtp.gmail.com (optional)
SMTP_PORT=587 (optional)
BASE_URL=https://your-site-name.netlify.app
```

## Deployment Steps

### Option 1: Auto-Deploy from Git (Recommended)

1. **Connect Repository**:
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your repository

2. **Build Settings**:
   - Build command: `vite build && node build-netlify.js`
   - Publish directory: `dist/public`
   - Node version: `20`

3. **Environment Variables**:
   - Go to Site Settings > Environment Variables
   - Add all required variables listed above

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy

### Option 2: Manual Deploy

1. **Build Locally**:
   ```bash
   npm install
   vite build
   node build-netlify.js
   ```

2. **Deploy**:
   - Drag and drop the `dist/public` folder to Netlify
   - Upload `netlify/functions/api.mjs` as a serverless function
   - Configure environment variables in site settings

## API Endpoints

The following API endpoints are available in the Netlify serverless function:

### Authentication
- `POST /api/login` - User login
- `GET /api/me` - Get current user info

### Cases
- `GET /api/cases` - List all cases (requires auth)
- `POST /api/cases` - Create new case (requires auth)

### Health Check
- `GET /api/health` - API status check

## Limitations in Netlify Version

Due to serverless constraints, some features are simplified:

1. **File Uploads**: Not supported in serverless functions
2. **Email System**: Simplified or disabled
3. **Complex Admin Features**: May be limited
4. **Database Migrations**: Must be run separately
5. **Authentication**: Uses simplified hash comparison (demo only)

## Quick Fix Applied

The build process has been streamlined:
- Removed dependency on `build:client` script
- Simplified bcrypt usage for serverless compatibility
- Added proper external dependencies configuration
- Created bundled serverless function

## Database Setup

1. **Create Neon Database**:
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new database
   - Copy the connection string

2. **Run Migrations**:
   ```bash
   # Locally with your DATABASE_URL
   npm run db:push
   ```

## Testing Your Deployment

1. **Health Check**:
   ```bash
   curl https://your-site.netlify.app/api/health
   ```

2. **Login Test**:
   ```bash
   curl -X POST https://your-site.netlify.app/api/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check Node version is set to 20
2. **API Not Working**: Verify environment variables are set
3. **Database Errors**: Ensure DATABASE_URL is correct
4. **CORS Issues**: Check that frontend is calling correct API URLs

### Debug Steps:

1. Check Netlify Function logs in dashboard
2. Test API endpoints individually
3. Verify environment variables are set
4. Check database connectivity

## Security Notes

- JWT_SECRET should be a secure random string
- Database URL should use SSL (Neon provides this by default)
- Environment variables are encrypted in Netlify
- CORS is configured for broad access - restrict in production

## Performance Considerations

- Serverless functions have cold start delays
- Database connections are pooled but limited
- Static assets are served from Netlify CDN
- Consider implementing caching for frequently accessed data