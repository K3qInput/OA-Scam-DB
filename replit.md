# replit.md

## Overview

This is a full-stack web application built for OwnersAlliance, a case management database portal for tracking fraud and scam reports. The application follows a client-server architecture with a React frontend and Express.js backend, utilizing PostgreSQL as the primary database with Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for build tooling
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom dark theme (OwnersAlliance branding)
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Upload**: Multer for handling evidence file uploads
- **Email**: Nodemailer for sending approval notifications

### Database Schema
The application uses PostgreSQL with the following key entities:
- **Users**: Authentication and role management (admin, staff, user)
- **Cases**: Main fraud/scam reports with status tracking
- **Evidence**: File attachments linked to cases
- **Appeals**: User appeals for case decisions
- **Alt Accounts**: Alternative account tracking
- **Password Reset Requests**: Admin-approved password reset system

## Key Components

### Authentication System
- JWT token-based authentication stored in localStorage
- Role-based access control (admin, staff, user)
- Password reset requires admin approval via email

### Case Management
- Comprehensive case creation with evidence upload
- Status workflow: pending → verified → resolved/rejected → appealed
- Case types: financial_scam, identity_theft, fake_services, account_fraud, other
- Priority levels: low, medium, high, critical

### File Management
- Evidence files stored locally in uploads directory
- File type restrictions: images, PDFs, text files
- 10MB file size limit

### Email System
- Nodemailer integration for admin notifications
- Password reset approval workflow
- SMTP configuration via environment variables

## Data Flow

1. **User Registration/Login**: JWT token generation and storage
2. **Case Creation**: Form validation → file upload → database insertion
3. **Case Management**: Status updates → email notifications → audit trail
4. **Evidence Upload**: File validation → storage → database reference
5. **Password Reset**: User request → admin email → approval workflow

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM)
- UI components (Radix UI, Lucide icons)
- Form handling (React Hook Form, Hookform Resolvers)
- HTTP client (React Query)
- Styling (Tailwind CSS, Class Variance Authority)

### Backend Dependencies
- Express.js framework
- Drizzle ORM with Neon PostgreSQL driver
- Authentication (bcrypt, jsonwebtoken)
- File upload (multer)
- Email (nodemailer)
- Development tools (tsx, esbuild)

### Database
- Neon PostgreSQL serverless database
- Connection via DATABASE_URL environment variable

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Express server with tsx for TypeScript execution
- Database schema managed via Drizzle migrations

### Production Build
- Frontend: Vite build to dist/public
- Backend: esbuild compilation to dist/index.js
- Static file serving from Express

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `EMAIL_USER`/`SMTP_USER`: Email service username
- `EMAIL_PASS`/`SMTP_PASS`: Email service password
- `SMTP_HOST`: Email server host (default: smtp.gmail.com)
- `SMTP_PORT`: Email server port (default: 587)
- `BASE_URL`: Application base URL for email links

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── uploads/         # File upload storage
├── migrations/      # Database migrations
└── dist/           # Production build output
```

The application is designed for deployment on platforms like Replit, with database migrations handled via `npm run db:push` and the production server starting with `npm start`.