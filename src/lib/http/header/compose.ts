export const composeHeaders = (...headersList: HeadersInit[]): Headers => {
  const headers = new Headers();

  for (const headersListItem of headersList) {
    const itemHeaders = new Headers(headersListItem);

    itemHeaders.forEach(
      (value, key) => headers.append(key, value)
    );
  }

  return headers;
};