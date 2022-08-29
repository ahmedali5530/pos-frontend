import * as qs from 'qs';

export interface ParsedQuery {
  [key: string]: string | string[];
}

export class QueryString {

  static parse(queryString: string) {
    const leadingChar = queryString[0];

    if (leadingChar === '?' || leadingChar === '#') {
      queryString = queryString.substr(1);
    }

    return qs.parse(queryString) as ParsedQuery;
  }

  static stringify(object: unknown): string {
    return qs.stringify(object);
  }

}
