import { Response } from "express";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
  timestamp: Date;
}

class ResponseHandler {
  static success<t>(
    res: Response,
    data: t,
    message: string = "Əməliyyat uğurla başa çatdı",
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<t> = {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date(),
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = "Xəta baş verdi",
    statusCode: number = 500,
    error?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error,
      message,
      statusCode,
      timestamp: new Date(),
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    meessage: string = "Uğurla yaradıldı"
  ): Response {
    return this.success(res, data, meessage, 201);
  }

  static notFound(
    res: Response,
    message: string = "Tapılmadı",
    statusCode: number = 404
  ): Response {
    return this.error(res, message, statusCode);
  }

  static badRequest(
    res: Response,
    message: string = "Səhv sorğu",
    error?: string
  ): Response {
    return this.error(res, message, 400, error);
  }

  static unauthorized(
    res: Response,
    message: string = "Giriş icazəsi yoxdur"
  ): Response {
    return this.error(res, message, 401);
  }

  static forbidden(
    res: Response,
    message: string = "Qadağan edildi"
  ): Response {
    return this.error(res, message, 403);
  }

  static conflict(res: Response, message: string = "Münaqişə"): Response {
    return this.error(res, message, 409);
  }

  static validationError(
    res: Response,
    errors: any[],
    message: string = "Doğrulama xətası"
  ): Response {
    return this.error(res, message, 422, errors.join(", "));
  }

  static internalServerError(
    res: Response,
    message: string = "Daxili server xətası",
    error?: string
  ): Response {
    return this.error(res, message, 500, error);
  }
}

export default ResponseHandler;
