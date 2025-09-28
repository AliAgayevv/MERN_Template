import {
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/errorMiddleware.js";
import express from "express";
import { fileURLToPath } from "url";
import path from "path";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import Database from "./config/db.js";
import { validateEnv, envConfig } from "./config/env.js";

import ResponseHandler from "./utils/responseHandler.js";

import session from "express-session";
import MongoStore from "connect-mongo";

dotenv.config();

class App {
  public app: express.Application;
  private database: Database;

  constructor() {
    this.app = express();
    this.database = Database.getInstance();

    this.validateEnvironment();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private validateEnvironment(): void {
    try {
      validateEnv();
    } catch (error) {
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );

    // CORS configuration
    const corsOptions = {
      origin: true, // Bütün origin-ləri qəbul et
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    };

    this.app.use(cors(corsOptions));

    this.app.use(
      session({
        secret: process.env.SESSION_SECRET || "vape-management-secret-key",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl:
            process.env.MONGODB_URI ||
            "mongodb://localhost:27017/vape-management",
          ttl: 24 * 60 * 60, // 24 saat
        }),
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "lax",
          domain: undefined, // IP üçün domain set etmə
        },
      })
    );

    // Morgan logging
    if (envConfig.NODE_ENV === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(
        morgan("combined", {
          stream: {
            write: (message: string) => {},
          },
        })
      );
    }

    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  }

  private initializeRoutes(): void {
    this.app.get("/health", (req, res) => {
      const dbStatus = this.database.getConnectionStatus();
      const healthData = {
        status: dbStatus ? "OK" : "Error",
        timestamp: new Date().toISOString(),
        database: dbStatus ? "Qoşulub" : "Qoşulmayıb",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: envConfig.NODE_ENV,
        version: process.env.npm_package_version || "1.0.0",
      };

      if (dbStatus) {
        res.status(200).json(healthData);
      } else {
        res.status(503).json(healthData);
      }
    });

    this.app.get("/api", (req, res) => {
      const apiInfo = {
        name: "TOOD",
        version: "1.0.0",
        description: "TODO",
        timestamp: new Date().toISOString(),
        endpoints: {
          auth: "POST /api/auth/login - Admin girişi",
        },
        documentation:
          envConfig.NODE_ENV === "development"
            ? `http://localhost:${envConfig.PORT}/api/docs`
            : "APİ sənədləri üçün Əli ilə əlaqə saxlayın",
      };

      return ResponseHandler.success(res, apiInfo, "API Information");
    });

    // Protected API Routes - yalnız admin girişi olanlar
    // this.app.use("/api/customers", requireAuth, customerRoutes);
    this.app.use("/api/test", (req, res) => {
      res.json({ message: "Test endpoint is working!" });
    });

    // Test file upload endpoint for debugging

    // 404 handler - must be last
    this.app.use("*", notFoundHandler);
  }

  private initializeErrorHandling(): void {
    // Upload error handler

    // Global error handler
    this.app.use(globalErrorHandler);
  }

  public async start(): Promise<void> {
    try {
      await this.database.connect();

      // Development data seeding
      if (
        envConfig.NODE_ENV === "development" &&
        process.argv.includes("--seed")
      ) {
      }

      const server = this.app.listen(envConfig.PORT, () => {
        if (envConfig.NODE_ENV === "development") {
          console.log("\n=== DEVELOPMENT ENDPOINTS ===");
          console.log(
            `🔗 Health check: http://localhost:${envConfig.PORT}/health`
          );
          console.log(`🔗 API Info: http://localhost:${envConfig.PORT}/api`);
          console.log(
            `🔗 Auth Login: http://localhost:${envConfig.PORT}/api/auth/login`
          );
        }
      });

      const gracefulShutdown = async (signal: string) => {
        server.close(async () => {
          await this.database.disconnect();
          process.exit(0);
        });

        setTimeout(() => {
          process.exit(1);
        }, 10000);
      };

      process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
      process.on("SIGINT", () => gracefulShutdown("SIGINT"));

      process.on("uncaughtException", (error) => {
        process.exit(1);
      });

      process.on("unhandledRejection", (reason, promise) => {
        process.exit(1);
      });
    } catch (error) {
      console.error("❌ Başlatma zamanı xətası:", error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new App();
  app.start();
}

export default App;
