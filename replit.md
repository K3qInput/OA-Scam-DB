# replit.md

## Overview

This is a comprehensive community management and collaboration platform built for OwnersAlliance. The application has evolved from a case management system into a full-featured community platform with advanced security, trust systems, AI automation, and networking tools. It follows a client-server architecture with a React frontend and Express.js backend, utilizing PostgreSQL as the primary database with Drizzle ORM for data management.

**Status**: COMPREHENSIVE COMMUNITY PLATFORM ✓ (August 2025)
- ✅ **Trust & Security**: Complete member verification, reputation profiles, report vault, blacklist database, staff transparency
- ✅ **Collaboration & Networking**: Project marketplace, community events system, team management tools
- ✅ **Server Owner Utilities**: Resource hub with curated tools, server management dashboard
- ✅ **AI & Automation**: AI tools suite including contract generation, scam detection, resource finding
- ✅ **Events & Engagement**: Community events, training webinars, competitions with prize pools
- ✅ **Advanced Security**: Anti-impersonation detection, automatic ban sync, device fingerprinting
- ✅ **Authentication**: Traditional login + Discord OAuth with comprehensive session management
- ✅ **Database**: Full schema implementation with relationships and comprehensive data models
- ✅ **All 5 Feature Categories**: Complete implementation of Trust & Security, Collaboration & Networking, Server Owner Utilities, AI & Automation, and Events & Engagement

## User Preferences

Preferred communication style: Simple, everyday language.
Credits: Made by Kiro.java - "I was too lazy 💀" (Copyright 2025)

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

## Key Features Implementation

### 1. Trust & Security Systems ✅
**Member Verification**
- Manual + automated verification checks before granting full access
- Document verification, social media verification, reputation-based verification
- Multi-level verification system (1-5 levels) with expiration support
- Staff review workflow with approval/rejection system

**Reputation & Trust Scores**
- Dynamic reputation scoring based on successful trades, feedback, and history
- Trust levels: Bronze, Silver, Gold, Platinum with automatic progression
- Public reputation profiles showing roles, feedback, trust score, past projects
- Integration with vouching system and community scoring

**Report Vault**
- Publicly visible scammer reports & dispute outcomes
- Evidence-based reporting with verification workflow
- Damage claims tracking and warning level classification
- Staff verification and community transparency

**Blacklist Database**
- Shared list of confirmed scammers/bad actors across partnered communities
- Multiple entry types: Discord IDs, emails, IP addresses, domains
- Severity levels with evidence tracking and expiration support
- Community sharing and automatic synchronization

**Staff Transparency**
- All admins/moderators listed with complete role history & contact info
- Public staff profiles with success rates, specializations, and case loads
- Contact methods and availability status for community reach-out
- Performance metrics and commendation tracking

**Anti-Impersonation & Ban Sync**
- Automatic detection of username/avatar similarity and role impersonation
- Cross-server ban synchronization for confirmed bad actors
- Evidence-based reporting with confidence scoring and automated alerts

### 2. Collaboration & Networking Tools ✅
**Project Marketplace**
- Post jobs, commissions, and partnership opportunities
- Skill-based matching and project categorization
- Payment integration and milestone tracking
- Client-freelancer communication and review system

**Community Events**
- Build competitions, dev jams, server collaborations
- Prize pools and participant management
- Registration deadlines and capacity management
- Integration with Discord channels and external platforms

**Team Creation & Management**
- Form private or public project teams on-site
- Role-based team permissions and collaboration tools
- Project tracking and milestone management

### 3. Server Owner Utilities ✅
**Resource Hub**
- Curated list of trusted plugins, scripts, and hosting deals
- Community-verified resources with ratings and reviews
- Category-based organization (plugins, hosting, services, tutorials)
- Pricing information and compatibility tracking

**Server Management Dashboard**
- Links to useful hosting tools, plugin checkers, and monitoring
- Integration with popular server management platforms
- Performance tracking and optimization recommendations

### 4. AI & Automation ✅
**AI Tools Suite**
- AI Contract Generator: Create fair commission agreements automatically
- AI Scam Checker: Analyze chat logs or offers for red flags  
- AI Resource Finder: Suggest tools, plugins, or contacts based on needs
- AI Deal Maker: Create structured deals and agreements
- AI Project Scopes: Help people scope out new projects with requirements

**Automation Features**
- Automatic alt account detection with device fingerprinting
- Automated security event monitoring and alerting
- Smart reputation calculation and trust level progression

### 5. Events & Engagement ✅
**Community Events System**
- Competitions with prize pools and ranking systems
- Dev jams and collaborative development events
- Server collaboration opportunities and partnerships
- Training workshops and webinars on running, monetizing, and securing servers

**Engagement Tools**
- Registration management with capacity limits and deadlines
- Participant tracking and submission systems
- Prize distribution and winner announcement features

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

The application is designed for deployment on platforms like Replit and Netlify, with database migrations handled via `npm run db:push` and the production server starting with `npm start`.

## Netlify Deployment

The project includes Netlify-ready configuration:
- `netlify.toml`: Build and redirect configuration
- `netlify/functions/api.js`: Serverless function for API endpoints
- `NETLIFY_DEPLOYMENT.md`: Complete deployment guide
- `.env.example`: Environment variables template

### Netlify Features
- Serverless API functions with Express.js
- PostgreSQL database support via Neon
- JWT authentication system
- CORS configured for cross-origin requests
- Health check endpoints for monitoring