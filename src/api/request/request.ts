import { request as httpRequest } from '../../lib/http/request';
import { fetchConfig } from '../config/fetch.config';
import { composeHeaders } from '../../lib/http/header/compose';
import {formContentTypeHeader, jsonAcceptHeader, jsonContentTypeHeader} from './header';
import Cookies from 'js-cookie';

/**
 * @see httpRequest
 */
export const request = async (input: RequestInfo, init: RequestInit = {}): Promise<Response> => {
  const defaultHeaders = fetchConfig.headers || {};
  const initHeaders = init.headers || {};
  const authHeader = {
    'Authorization': 'Bearer ' + Cookies.get('JWT') || ''
  };

  init = {
    ...fetchConfig,
    ...init,
    headers: composeHeaders(defaultHeaders, initHeaders, authHeader)
  };

  return httpRequest(input, init);
};

/**
 * @see httpRequest
 */
export const jsonRequest = async (input: RequestInfo, init: RequestInit = {}) => {
  const initHeaders = init.headers || {};

  const headers = composeHeaders(
    initHeaders, jsonContentTypeHeader()
  );

  init = {
    ...init,
    headers
  };

  return request(input, init);
};

export const fetchJson = async (input: RequestInfo, init: RequestInit = {}) => {

  const response = await jsonRequest(input, init);
  return await response.json();
};

export const formRequest = async (input: RequestInfo, init: RequestInit = {}) => {
  const initHeaders = init.headers || {};

  const headers = composeHeaders(
    initHeaders, formContentTypeHeader(), jsonAcceptHeader()
  );

  init = {
    ...init,
    headers
  };

  return request(input, init);
};
