import { Server as SocketServer, Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { verifyToken } from "../utils/jwtUtils.js";
import { env } from "../config/env.js";
import { User } from "../models/user.model.js";
import { RefreshToken } from "../models/refresh-token.model.js";
import { Message } from "../models/message.model.js";
import { compareHash } from "../utils/hashUtils.js";
import { logger } from "../utils/logger.js";

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

export class SocketService {
  private static io: SocketServer | null = null;

  public static init(server: HttpServer, allowedOrigins: string[]) {
    this.io = new SocketServer(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    // 1. Wrap and register cookie-parser as a socket middleware
    const cookieParserMiddleware = cookieParser();
    this.io.use((socket, next) => {
      cookieParserMiddleware(
        socket.request as unknown as RequestWithCookies,
        {} as Response,
        (err?: unknown) => {
          if (err) {
            return next(err instanceof Error ? err : new Error(String(err)));
          }
          next();
        }
      );
    });

    // 2. Connection Authentication Middleware (Dual-Token Auth Flow)
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const cookies = (socket.request as unknown as RequestWithCookies).cookies || {};
        const { accessToken, refreshToken } = cookies;

        let userId: string | null = null;
        let userEmail: string | null = null;

        // Try validating Access Token first
        if (accessToken) {
          try {
            const decoded = await verifyToken(accessToken, env.accessTokenSecret);
            userId = decoded.id;
            userEmail = decoded.email;
          } catch (err: unknown) {
            // Fall through to refreshToken check on expiration. Reject on malformed tokens.
            const error = err as Error & { code?: string };
            const isExpired = error?.code === "ERR_JWT_EXPIRED" || error?.name === "JWTExpired" || error?.name === "TokenExpiredError";
            if (!isExpired) {
              return next(new Error("Invalid access token."));
            }
          }
        }

        // Fall back to Refresh Token validation if access token is missing or expired
        if (!userId && refreshToken) {
          try {
            const decoded = await verifyToken(refreshToken, env.refreshTokenSecret);
            const sessions = await RefreshToken.find({ userId: decoded.id }).lean();

            let activeSession = null;
            for (const session of sessions) {
              if (await compareHash(refreshToken, session.refreshToken)) {
                activeSession = session;
                break;
              }
            }

            if (activeSession) {
              userId = decoded.id;
              userEmail = decoded.email;
            }
          } catch (err) {
            logger.warn(`[Socket Auth] Refresh token verification failed: ${err}`);
          }
        }

        if (!userId || !userEmail) {
          return next(new Error("Authentication failed. Session invalid or expired."));
        }

        // Fetch user document to resolve full name and role (optimized lean query with projections)
        const user = await User.findById(userId)
          .select("firstName lastName role email")
          .lean();

        if (!user) {
          return next(new Error("User account not found."));
        }

        socket.user = {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        };

        next();
      } catch (err) {
        logger.error(`[Socket Auth Error]: ${err instanceof Error ? err.message : err}`);
        next(new Error("Authentication server error."));
      }
    });

    // 2. Main Socket Connection Listener
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      logger.info(`[Socket Connected] User: ${socket.user?.name} (${socket.user?.role}) [ID: ${socket.id}]`);

      // Event: Send Message
      socket.on("send_message", async (data: { text: string }) => {
        try {
          if (!data.text || !data.text.trim()) return;

          // Save message to database
          const message = await Message.create({
            senderId: socket.user?.id,
            senderName: socket.user?.name,
            senderRole: socket.user?.role,
            text: data.text,
          });

          // Broadcast message to all connected users
          this.io?.emit("new_message", {
            id: message._id,
            senderId: message.senderId,
            senderName: message.senderName,
            senderRole: message.senderRole,
            text: message.text,
            createdAt: message.createdAt,
          });
        } catch (err) {
          logger.error(`[Socket Send Message Error]: ${err}`);
        }
      });

      socket.on("disconnect", () => {
        logger.info(`[Socket Disconnected] User: ${socket.user?.name} [ID: ${socket.id}]`);
      });
    });
  }
}
