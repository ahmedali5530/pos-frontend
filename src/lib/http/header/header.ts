export const contentTypeHeader = (contentType: string): HeadersInit => ({
  'content-type': contentType
});

export const acceptHeader = (accept: string): HeadersInit => ({
  'accept': accept
});
