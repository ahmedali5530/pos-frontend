import { ErrorException } from './exception/error.exception';
import { HttpExceptionFactory } from './exception/http.exception.factory';

/**
 * @throws ErrorException
 * @throws HttpException
 */
export const request = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  let response;

  try {
    response = await fetch(input, init);
  } catch (e: any) {
    throw new ErrorException(e);
  }

  if (!response.ok) {
    throw HttpExceptionFactory.createFromResponse(response);
  }

  return response;
};
