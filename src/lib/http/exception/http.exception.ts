export class HttpException {

  constructor(
    public readonly message: string,
    public readonly code: number,
    public readonly response: Response
  ) {
  }
}

export class BadRequestException extends HttpException {

  static CODE = 400;

  constructor(message: string, response: Response) {
    super(message, BadRequestException.CODE, response);
  }

}

export class UnauthorizedException extends HttpException {

  static CODE = 401;

  constructor(message: string, response: Response) {
    super(message, UnauthorizedException.CODE, response);
  }

}

export class ForbiddenException extends HttpException {

  static CODE = 403;

  constructor(message: string, response: Response) {
    super(message, ForbiddenException.CODE, response);
  }

}

export class NotFoundException extends HttpException {

  static CODE = 404;

  constructor(message: string, response: Response) {
    super(message, NotFoundException.CODE, response);
  }

}

export class UnprocessableEntityException extends HttpException {

  static CODE = 422;

  constructor(message: string, response: Response) {
    super(message, UnprocessableEntityException.CODE, response);
  }

}

export class ServerErrorException extends HttpException {

  constructor(message: string, response: Response) {
    super(message, response.status, response);
  }

}

export class NoContentException extends HttpException{

  static CODE = 204;

  constructor(message: string, response: Response) {
    super(message, NoContentException.CODE, response);
  }

}