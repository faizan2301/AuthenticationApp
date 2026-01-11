
export class ApiError extends Error {
  constructor(message, statusCode = null, originalError = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.originalError = originalError;
    Error.captureStackTrace(this, this.constructor);
  }
}


export class NetworkError extends ApiError {
  constructor(message = 'Network error. Please check your connection.', originalError = null) {
    super(message, null, originalError);
  }
}


export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed', statusCode = 401, originalError = null) {
    super(message, statusCode, originalError);
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', statusCode = 400, originalError = null) {
    super(message, statusCode, originalError);
  }
}


export class ServerError extends ApiError {
  constructor(message = 'Server error', statusCode = 500, originalError = null) {
    super(message, statusCode, originalError);
  }
}


export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', statusCode = 404, originalError = null) {
    super(message, statusCode, originalError);
  }
}
