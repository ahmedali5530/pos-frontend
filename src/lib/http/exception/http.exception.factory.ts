import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  ServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException
} from './http.exception';

export class HttpExceptionFactory {

  static createFromResponse(response: Response) {
    if (response.ok) {
      return null;
    }

    if (response.status >= 500 && response.status < 600) {
      return new ServerErrorException(response.statusText, response);
    }

    switch (response.status) {
      case BadRequestException.CODE:
        return new BadRequestException(response.statusText, response);
      case UnauthorizedException.CODE:
        return new UnauthorizedException(response.statusText, response);
      case ForbiddenException.CODE:
        return new ForbiddenException(response.statusText, response);
      case NotFoundException.CODE:
        return new NotFoundException(response.statusText, response);
      case UnprocessableEntityException.CODE:
        return new UnprocessableEntityException(response.statusText, response);
      default:
        return new HttpException(response.statusText, response.status, response);
    }
  }

}