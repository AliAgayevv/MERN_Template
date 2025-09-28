import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errorHandler.js";
import ResponseHandler from "../utils/responseHandler.js";

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  if (err.name === "ValidationError") {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(", ");

    return ResponseHandler.validationError(res, [message]);
  }

  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const value = (err as any).keyValue[field];
    return ResponseHandler.conflict(
      res,
      `${field}: '${value}' artıq mövcuddur`
    );
  }

  if (err.name === "CastError") {
    return ResponseHandler.badRequest(res, "Yanlış ID formatı");
  }

  if (err.name === "JsonWebTokenError") {
    return ResponseHandler.unauthorized(res, "Yanlış token");
  }

  if (err.name === "TokenExpiredError") {
    return ResponseHandler.unauthorized(res, "Token vaxtı bitib");
  }

  if (err instanceof AppError) {
    return ResponseHandler.error(res, err.message, err.statusCode);
  }

  const message =
    process.env.NODE_ENV === "production"
      ? "Daxili server xətası"
      : err.message;

  return ResponseHandler.error(res, message, 500);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, res: Response) => {
  return ResponseHandler.notFound(res, `Route ${req.originalUrl} tapılmadı`);
};
