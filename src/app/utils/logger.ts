import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine log folder relative to current file
const logDir = path.join(__dirname, "../logs");

// Create logs folder if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file path
const logFile = path.join(logDir, "app.log");

// Helper to write to log file
function writeLogToFile(message: string) {
  fs.promises.appendFile(logFile, message + "\n").catch((err) => {
    console.error("Failed to write to log file:", err);
  });
}

// Format message with timestamp
function formatMessage(level: string, message: string) {
  const time = new Date().toISOString();
  return `[${level}] [${time}] ${message}`;
}

export const logger = {
  info: (msg: string) => {
    const formatted = formatMessage("INFO", msg);
    console.log(chalk.blue(formatted));
    writeLogToFile(formatted);
  },

  warn: (msg: string) => {
    const formatted = formatMessage("WARN", msg);
    console.warn(chalk.yellow(formatted));
    writeLogToFile(formatted);
  },

  error: (msg: string) => {
    const formatted = formatMessage("ERROR", msg);
    console.error(chalk.red(formatted));
    writeLogToFile(formatted);
  },

  debug: (msg: string) => {
    if (process.env.NODE_ENV === "development") {
      const formatted = formatMessage("DEBUG", msg);
      console.debug(chalk.gray(formatted));
      writeLogToFile(formatted);
    }
  },
};
