export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Doğrulama xətası") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Mənbə") {
    super(`${message} tapılmadı`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Mənbə artıq mövcuddur") {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Giriş icazəsi yoxdur") {
    super(message, 401);
  }
}
export class ForbiddenError extends AppError {
  constructor(message: string = "Qadağan edildi") {
    super(message, 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Səhv sorğu") {
    super(message, 400);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Daxili server xətası") {
    super(message, 500);
  }
}
