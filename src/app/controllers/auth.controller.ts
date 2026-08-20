import type { Request, Response } from "express";
import { User } from "../models/user.model.js";
import { response } from "../utils/apiResponse.js";
import { AuthService } from "../services/auth.services.js";
import { compareHash } from "../utils/hashUtils.js";
import { generateToken, verifyToken } from "../utils/jwtUtils.js";
import { env } from "../config/env.js";
import { RefreshToken } from "../models/refresh-token.model.js";
import { logger } from "../utils/logger.js";

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await AuthService.findUserByEmail(email);
    if (!user) {
      return response.error(res, {
        message: "Invalid email or password",
        statusCode: 401,
      });
    }

    const isPasswordValid = await compareHash(password, user.password as string);
    if (!isPasswordValid) {
      return response.error(res, {
        message: "Invalid email or password",
        statusCode: 401,
      });
    }

    const accessToken = await generateToken(
      {
        id: user._id.toString(),
        email: user.email
      },
      env.accessTokenSecret,
      env.accessTokenExpiration
    );

    const refreshToken = await generateToken(
      {
        id: user._id.toString(),
        email: user.email
      },
      env.refreshTokenSecret,
      env.refreshTokenExpiration
    );

    await RefreshToken.create({
      userId: user._id,
      refreshToken
    });

    const userWithPermissions = await AuthService.getUserWithPermissions(user.email);

    return response.success(res, {
      message: "User logged in successfully",
      data: {
        user: userWithPermissions,
      },
      statusCode: 200,
      cookie: AuthService.getCookieConfig([
        {
          name: "accessToken",
          value: accessToken,
          expiration: env.accessTokenExpiration,
        },
        {
          name: "refreshToken",
          value: refreshToken,
          expiration: env.refreshTokenExpiration,
        },
      ]),
    });
  } catch (err: any) {
    logger.error(`[login] ${err.message || err}`);
    return response.error(res, {
      message: "An error occurred during login",
      statusCode: 500,
    });
  }
};

const register = async (req: Request, res: Response) => {
  try {
    const existingUser = await AuthService.findUserByEmail(req.body.email);
    if (existingUser) {
      return response.error(res, {
        message: "User with this email already exists",
        statusCode: 400,
      });
    }

    const { role: _role, ...userData } = req.body;
    const user = await User.create(userData);

    const accessToken = await generateToken(
      {
        id: user._id.toString(),
        email: user.email
      },
      env.accessTokenSecret,
      env.accessTokenExpiration
    );

    const refreshToken = await generateToken(
      {
        id: user._id.toString(),
        email: user.email
      },
      env.refreshTokenSecret,
      env.refreshTokenExpiration
    );

    await RefreshToken.create({
      userId: user._id,
      refreshToken
    });

    const userWithPermissions = await AuthService.getUserWithPermissions(user.email);

    return response.success(res, {
      message: "User registered successfully",
      data: {
        user: userWithPermissions,
      },
      statusCode: 201,
      cookie: AuthService.getCookieConfig([
        {
          name: "accessToken",
          value: accessToken,
          expiration: env.accessTokenExpiration,
        },
        {
          name: "refreshToken",
          value: refreshToken,
          expiration: env.refreshTokenExpiration,
        },
      ]),
    });
  } catch (err: any) {
    logger.error(`[register] ${err.message || err}`);
    return response.error(res, {
      message: "An error occurred during registration",
      statusCode: 500,
    });
  }
};

const verifyAuth = async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken) {
    if (refreshToken) {
      return response.error(res, {
        message: "Access token expired. Refresh required.",
        statusCode: 401,
      });
    }
    return response.success(res, {
      message: "Authentication token missing",
      data: {
        user: null,
        isGuest: true,
      },
      statusCode: 200,
    });
  }

  try {
    const payload = await verifyToken(accessToken, env.accessTokenSecret);

    const user = await AuthService.getUserWithPermissions(payload.email);

    if (!user) {
      return response.error(res, {
        message: "User not found or unauthorized",
        statusCode: 401,
        cookie: AuthService.getLogoutCookieConfig(["accessToken", "refreshToken"]),
      });
    }

    return response.success(res, {
      message: "Authentication verified",
      data: {
        user,
      },
    });
  } catch (err: any) {
    logger.error(`[verifyAuth] Error during verification: ${err.message || err}`);
    return response.error(res, {
      message: err.message || "Invalid token",
      statusCode: 401,
    });
  }
};

const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return response.warning(res, {
      message: "No active session found.",
      statusCode: 400,
    });
  }

  try {
    try {
      const payload = await verifyToken(refreshToken, env.refreshTokenSecret);
      const userId = payload.id;
      if (userId) {
        const sessions = await RefreshToken.find({ userId });
        for (const session of sessions) {
          if (await compareHash(refreshToken, session.refreshToken)) {
            await RefreshToken.deleteOne({ _id: session._id });
            break;
          }
        }
      }
    } catch {
      // Signature invalid or expired — cookies are still cleared below
    }

    return response.success(res, {
      message: "Logged out successfully",
      cookie: AuthService.getLogoutCookieConfig(["accessToken", "refreshToken"]),
    });
  } catch (err: any) {
    logger.error(`[logout] ${err.message || err}`);
    return response.error(res, {
      message: "An error occurred during logout",
      statusCode: 500,
    });
  }
}

const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken, accessToken } = req.cookies;
  const logout = AuthService.getLogoutCookieConfig(["accessToken", "refreshToken"]);

  // 1. First check if the session is active or not
  if (!refreshToken) {
    return response.error(res, { message: "Session expired", statusCode: 401, cookie: logout });
  }

  // 2. If the access token is still valid and not expired, return it as-is without rotating
  if (accessToken) {
    try {
      await verifyToken(accessToken, env.accessTokenSecret);
      return response.success(res, {
        message: "Access token is still valid",
        cookie: AuthService.getCookieConfig([
          {
            name: "accessToken",
            value: accessToken,
            expiration: env.accessTokenExpiration,
          },
        ]),
      });
    } catch {
      // Access token is invalid or expired, proceed with refresh
    }
  }

  // 2. Verify the refresh token signature
  let payload;
  try {
    payload = await verifyToken(refreshToken, env.refreshTokenSecret);
  } catch {
    return response.error(res, {
      message: "Invalid or expired session",
      statusCode: 401,
      cookie: logout,
    });
  }

  try {
    // 3. Stateful check: confirm the session still exists in the DB
    const sessions = await RefreshToken.find({ userId: payload.id });

    let session = null;
    for (const s of sessions) {
      if (await compareHash(refreshToken, s.refreshToken)) {
        session = s;
        break;
      }
    }

    if (!session) {
      return response.error(res, {
        message: "Session has been revoked. Please login again.",
        statusCode: 401,
        cookie: logout,
      });
    }

    // 4. Ensure the user still exists before minting new tokens
    const user = await AuthService.findUserByEmail(payload.email);
    if (!user) {
      return response.error(res, {
        message: "User no longer exists. Please login again.",
        statusCode: 401,
        cookie: logout,
      });
    }

    // 5. Rotate tokens: issue new tokens and revoke the old refresh token
    const newAccessToken = await generateToken(
      { id: payload.id, email: payload.email },
      env.accessTokenSecret,
      env.accessTokenExpiration
    );

    const newRefreshToken = await generateToken(
      { id: payload.id, email: payload.email },
      env.refreshTokenSecret,
      env.refreshTokenExpiration
    );

    await RefreshToken.deleteOne({ _id: session._id });
    await RefreshToken.create({
      userId: user._id,
      refreshToken: newRefreshToken,
    });

    return response.success(res, {
      message: "Token refreshed",
      cookie: AuthService.getCookieConfig([
        {
          name: "accessToken",
          value: newAccessToken,
          expiration: env.accessTokenExpiration,
        },
        {
          name: "refreshToken",
          value: newRefreshToken,
          expiration: env.refreshTokenExpiration,
        },
      ]),
    });
  } catch (err: any) {
    logger.error(`[refreshAccessToken] ${err.message || err}`);
    return response.error(res, {
      message: "An error occurred during token refresh",
      statusCode: 500,
    });
  }
};

export { login, register, verifyAuth, logout, refreshAccessToken };
