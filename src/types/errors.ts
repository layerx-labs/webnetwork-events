export class BaseAPIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);

    Error.captureStackTrace(this, this.constructor);

    this.status = status;
  }
}

export class HttpBadRequestError extends BaseAPIError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
  }
}