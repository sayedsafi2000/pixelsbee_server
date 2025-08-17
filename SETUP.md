# Server Setup Guide

## Environment Configuration

1. Create a `.env` file in the server directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pixelsbee_db

# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. Get your credentials from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Replace the placeholder values in your `.env` file

## Database Setup

1. Make sure MySQL is running
2. Create the database: `CREATE DATABASE pixelsbee_db;`
3. Run the SQL script: `mysql -u root -p pixelsbee_db < database.sql`

## Running the Server

```bash
cd server
npm install
npm run dev
```

The server will start on http://localhost:5001 