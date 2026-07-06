import express from "express";
import type { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet"
import cookieParser from "cookie-parser";
import { logger } from "./app/utils/logger.js";
import { response } from "./app/utils/apiResponse.js";
import { env } from "./app/config/env.js";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import router from "./app/routes/routes.js";

const app = express();

if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

// -----------------------------
// Middleware
// -----------------------------
// CORS setup
const allowedOrigins = [
  env.clientUrl,
  "http://localhost:3000",
  "http://localhost:5173"
];

// Extract the base domain from CLIENT_URL to allow subdomains
let clientRootDomain: string | null = null;
try {
  const parsedUrl = new URL(env.clientUrl);
  const parts = parsedUrl.hostname.split(".");
  if (parts.length >= 2 && parsedUrl.hostname !== "localhost") {
    clientRootDomain = parts.slice(-2).join(".");
  }
} catch (error) {
  logger.warn(`Failed to parse client URL "${env.clientUrl}": ${error instanceof Error ? error.message : String(error)}`);
}

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowed = allowedOrigins.includes(origin);
      const hostname = origin.split("://")[1]?.split("/")[0]?.split(":")[0];
      const isSubdomain = !!(hostname && clientRootDomain && hostname.endsWith("." + clientRootDomain));

      if (!isAllowed && !isSubdomain) {
        logger.warn(`[CORS BLOCKED] Origin: "${origin}"`);
        callback(null, false);
        return;
      }

      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// Parse JSON bodies
app.use(helmet());
app.use(express.json());

// rate limiter
// const limiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 10,
//   keyGenerator: (req: Request) => {
//     return `${ipKeyGenerator(req.ip || "")}:${req.originalUrl}`;
//   },
// });
// app.use(limiter);

// Parse cookies
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Morgan logging
const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { stream: morganStream }));
}

// -----------------------------
// Routes
// -----------------------------
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use("/api", router);

// -----------------------------
// Global error handler
// -----------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  response.error(res, { message: err.message || "Internal Server Error" });
});

export default app;
