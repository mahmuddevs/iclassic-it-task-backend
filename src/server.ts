import { createServer } from "http";
import { env } from "./app/config/env.js";
import app, { allowedOrigins } from "./app.js";
import connectDB from "./app/config/db-config.js";
import { SocketService } from "./app/services/socket.services.js";

const PORT = env.port;

const httpServer = createServer(app);

SocketService.init(httpServer, allowedOrigins);

connectDB()
  .then(() => {
    console.log("Database connection successful.");
    httpServer.listen(PORT, () => {
      console.log(`Server is live`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed!");
    console.error(err.message);
    process.exit(1);
  });