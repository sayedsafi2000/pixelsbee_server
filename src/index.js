import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import apiRouter from "./routes/index.js";

// Import models to register them with Mongoose
import "./models/userModel.js";
import "./models/productModel.js";
import "./models/userCart.js";
import "./models/userFavorite.js";
import "./models/userDownload.js";
import "./models/orderModel.js";

// Load environment variables
dotenv.config();

// Debug: Check environment variables (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment check:');
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('PORT:', process.env.PORT);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
}

// If MONGODB_URI is not loaded, use a fallback (only in development)
if (!process.env.MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.log('MONGODB_URI not found in .env, using fallback...');
  process.env.MONGODB_URI = 'mongodb+srv://safiuddin102030:102030@cluster100.yw68q.mongodb.net/pixelsbeeDB?retryWrites=true&w=majority&appName=Cluster100';
  console.log('MONGODB_URI set to fallback value');
}

// If JWT_SECRET is not loaded, use a fallback (only in development)
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.log('JWT_SECRET not found in .env, using fallback...');
  process.env.JWT_SECRET = 'pixelsbee_super_secret_jwt_key_2024_secure_12345_default_fallback';
  console.log('JWT_SECRET set to fallback value');
}

const startServer = async () => {
  try {
    console.log('Starting server...');

    // Connect to MongoDB first
    await connectDB();

    const app = express();
    
    // CORS configuration for production
    const corsOptions = {
      origin: true, // Allow all origins temporarily
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };
    app.use(cors(corsOptions));
    
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use("/api", apiRouter);

    app.get("/", (req, res) => {
      res.send("Pixelsbee API Server Running");
    });

    // Health check endpoint for deployment
    app.get("/health", (req, res) => {
      res.status(200).json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Debug CORS endpoint
    app.get("/debug-cors", (req, res) => {
      res.header('Access-Control-Allow-Origin', 'https://pixelsbee-client.vercel.app');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.json({ 
        message: "CORS test endpoint",
        origin: req.headers.origin,
        corsHeaders: {
          'Access-Control-Allow-Origin': 'https://pixelsbee-client.vercel.app',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
        }
      });
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();