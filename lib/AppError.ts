class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'AppError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  static badRequest(message: string): AppError {
    return new AppError(400, message);
  }

  static unauthorized(message: string): AppError {
    return new AppError(401, message);
  }

  static forbidden(message: string): AppError {
    return new AppError(403, message);
  }

  static notFound(message: string): AppError {
    return new AppError(404, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  static internal(message: string): AppError {
    return new AppError(500, message);
  }

  static badGateway(message: string): AppError {
    return new AppError(502, message);
  }
}

export default AppError;
