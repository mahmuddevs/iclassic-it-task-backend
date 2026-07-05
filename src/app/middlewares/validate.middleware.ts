import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod";
import fs from "node:fs/promises";

export const validate =
  (schema: ZodType) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const isRequestSchema =
          schema &&
          "shape" in schema &&
          typeof schema.shape === "object" &&
          schema.shape !== null &&
          ("body" in schema.shape || "file" in schema.shape || "query" in schema.shape || "params" in schema.shape);

        let targetToValidate: unknown = req.body;
        if (isRequestSchema) {
          targetToValidate = {
            body: req.body,
            file: req.file,
            query: req.query,
            params: req.params,
          };
        }

        const parsed: any = await schema.parseAsync(targetToValidate);

        if (isRequestSchema) {
          req.body = parsed.body ?? req.body;
        } else {
          req.body = parsed;
        }

        next();
      } catch (error) {
        if (req.file) {
          try {
            await fs.unlink(req.file.path);
          } catch { }
        }
        if (req.files) {
          try {
            if (Array.isArray(req.files)) {
              for (const file of req.files) {
                await fs.unlink(file.path);
              }
            } else if (typeof req.files === "object") {
              const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
              for (const key of Object.keys(filesMap)) {
                const filesArray = filesMap[key];
                if (Array.isArray(filesArray)) {
                  for (const file of filesArray) {
                    await fs.unlink(file.path);
                  }
                }
              }
            }
          } catch { }
        }

        if (error instanceof ZodError) {
          return res.status(400).json({
            status: "fail",
            errors: error.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          });
        }
        next(error);
      }
    };