# Group Debt Manager

A web application for managing shared expenses and debts within a group. Built with Next.js, TypeScript, Prisma, and MySQL.

## Features

- 👥 User Management: Add, edit, and delete group members
- 🏪 Restaurant Management: Add, edit, and delete restaurants
- 🍽️ Menu Items: Manage food and drink items with prices and restaurant associations
- 💰 Debt Tracking: Record and track who owes money to whom
- 📊 Group Overview: View total debts for the entire group
- 👤 Individual View: Check detailed debts for each person

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

### Adding New Features

1. **Database Changes**
   - Update `prisma/schema.prisma`
   - Run `npx prisma migrate dev`
   - Update affected API routes

2. **API Routes**
   - Add new routes in `app/api/`
   - Follow RESTful conventions
   - Include proper error handling

3. **Frontend Components**
   - Create new components in `app/components/`
   - Use TypeScript interfaces for props
   - Follow existing styling patterns

4. **Pages**
   - Add new pages in appropriate directories
   - Use server components where possible
   - Include proper loading and error states

### Testing

1. Run the development server:
```bash
npm run dev
```

2. Test the application:
   - Add and manage users through the Users page
   - Create and manage restaurants through the Restaurants page
   - Create menu items with restaurant associations
   - Record debts
   - View group and individual summaries

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

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
