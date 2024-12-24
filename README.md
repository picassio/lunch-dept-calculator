# Group Debt Manager

A web application for managing shared expenses and debts within a group. Built with Next.js, TypeScript, Prisma, and MySQL.

## Features

- 👥 User Management: Add, edit, and delete group members
- 🏪 Restaurant Management: Add, edit, and delete restaurants
- 🍽️ Menu Items: Manage food and drink items with prices and restaurant associations
- 💰 Debt Tracking: Record and track who owes money to whom
- 📊 Group Overview: View total debts for the entire group
- 👤 Individual View: Check detailed debts for each person

## UI/UX Features

### Navigation & Layout
- 📱 Responsive mobile menu with smooth transitions
- 🎯 Active state indicators for current page
- 📐 Consistent spacing and visual hierarchy
- 🌗 Dark mode support for better visibility

### Components & Interactions
- 🎨 Modern card-based layouts for better content organization
- 📝 Enhanced form designs with real-time validation feedback
- 📊 Responsive tables with improved data presentation
- ⚡ Loading skeletons for better user experience
- 🎭 Smooth transitions and hover effects

### Data Visualization
- 📈 Enhanced statistics cards with clear visual hierarchy
- 🎨 Color-coded indicators for financial data:
  - Green for positive balances and credits
  - Red for debts and negative balances
  - Blue for neutral information
- 📱 Mobile-optimized tables with horizontal scrolling

### User Experience Improvements
- ⏳ Loading states with skeleton animations
- ❌ Enhanced error handling with clear messages
- ✨ Immediate feedback for user actions
- 📱 Mobile-first responsive design
- 🔍 Better data organization and filtering
- 🎨 Consistent color scheme and typography

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- MySQL (runs in Docker)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd form3
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example .env file
cp env.example .env

# Update the following variables in .env:
DATABASE_URL="mysql://root:rootpassword@localhost:3306/debt_manager"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

4. Start the MySQL database using Docker:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Guide

### Project Structure

```
form3/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── lib/              # Utility functions and shared code
│   └── ...               # Page components
├── prisma/                # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── public/               # Static files
```

### Key Technologies

- **Next.js**: React framework for production
- **TypeScript**: Type-safe JavaScript
- **Prisma**: Database ORM
- **MySQL**: Database
- **Tailwind CSS**: Utility-first CSS framework
- **Docker**: Container platform for MySQL

### Database Management

- View the database schema in `prisma/schema.prisma`
- Create a new migration:
  ```bash
  npx prisma migrate dev --name <migration-name>
  ```
- Reset the database:
  ```bash
  npx prisma migrate reset
  ```
- View database with Prisma Studio:
  ```bash
  npx prisma studio
  ```

## Deployment

### Standard Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### PM2 Deployment (Recommended)

PM2 is a process manager for Node.js applications that helps you keep your app running forever, reload it without downtime, and manage it in production.

1. Configure environment variables:
```bash
# Copy the example .env file if you haven't already
cp env.example .env

# Update the following variables in .env:
PORT=8080                    # Your custom port
HOST=your-ip-or-domain      # Your custom host/IP
DATABASE_URL="mysql://root:rootpassword@localhost:3306/debt_manager"
NEXT_PUBLIC_API_URL="http://your-domain:8080/api"
```

2. Build and start with PM2:
```bash
# Build the application
npm run build

# Start with PM2
npm run pm2:start
```

3. Available PM2 Commands:
```bash
npm run pm2:start    # Start the application
npm run pm2:stop     # Stop the application
npm run pm2:restart  # Restart the application
npm run pm2:logs     # View application logs
npm run pm2:monitor  # Monitor application performance
```

PM2 Features:
- Process management
- Auto-restart on crashes
- Load balancing
- Runtime metrics
- Log management

The application will run on your specified port and host using PM2 process manager. You can monitor the application status and performance using the PM2 monitor command.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure Docker is running
   - Check if MySQL container is up
   - Verify DATABASE_URL in .env

2. **Migration Issues**
   - Reset the database: `npx prisma migrate reset`
   - Delete migration history and start fresh

3. **Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
