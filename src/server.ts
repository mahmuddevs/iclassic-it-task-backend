import dns from "node:dns";
import { env } from "./app/config/env.js";
import app from "./app.js";
import connectDB from "./app/config/db-config.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = env.port;

connectDB()
  .then(() => {
    console.log("Database connection successful.");
    app.listen(PORT, () => {
      console.log(`Server is live`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed!");
    console.error(err.message);
    process.exit(1);
  });