interface ImportMetaEnv {
  readonly VITE_WEBSITE_NAME: string
  readonly VITE_API_HOST: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_BASE_URL: string

  readonly VITE_CURRENCY: string
  readonly VITE_LOCALE: string
  readonly VITE_APP_TYPE: string

  readonly VITE_DATE_FORMAT: string
  readonly VITE_TIME_FORMAT: string
  readonly VITE_DATE_TIME_FORMAT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'react-mousetrap';
declare module 'mousetrap';
