import dns from "node:dns";
import mongoose from 'mongoose';
import { env } from './env.js';

// Configure DNS to resolve IPv4 first and use fallback public DNS servers
dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (error) {
  // Ignore if setServers is not supported in the runtime environment
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;