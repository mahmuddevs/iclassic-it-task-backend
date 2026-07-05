import { Worker } from "node:worker_threads";

export interface WorkerErrorMessage {
  message: string;
  statusCode?: number;
  isWarning?: boolean;
}

export interface WorkerSuccessMessage<T> {
  result: T;
  error?: never;
}

export interface WorkerFailMessage {
  error: WorkerErrorMessage;
  result?: never;
}

export type WorkerMessage<T> = WorkerSuccessMessage<T> | WorkerFailMessage;

export function runWorker<T = unknown, U = unknown>(
  workerPath: string,
  workerData: U
): Promise<T> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, { workerData });

    worker.on("message", (message: WorkerMessage<T>) => {
      if (message.error) {
        reject(message.error);
      } else {
        resolve(message.result);
      }
    });

    worker.on("error", (err: Error) => {
      reject({
        message: err.message || "Worker experienced an internal error.",
        statusCode: 500,
      } as WorkerErrorMessage);
    });

    worker.on("exit", (code: number) => {
      if (code !== 0) {
        reject({
          message: `Worker stopped with exit code ${code}`,
          statusCode: 500,
        } as WorkerErrorMessage);
      }
    });
  });
}
