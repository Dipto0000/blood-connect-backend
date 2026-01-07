import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { envVars } from "./app/config/env";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";

const app: Application = express();

// ===============================
// MIDDLEWARES
// ===============================

// CORS configuration (Next.js friendly)
app.use(cors({
    origin: envVars.FRONTEND_URL,
    credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// ===============================
// ROUTES
// ===============================

// Health check
app.get("/api/v1", (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Blood Connect API is running 🩸",
        version: "1.0.0"
    });
});

// API routes
app.use("/api/v1", router);

// ===============================
// ERROR HANDLING
// ===============================

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
