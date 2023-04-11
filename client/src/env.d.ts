declare namespace NodeJS {
  /** Merge declaration with `process` in order to override the global-scoped env. */
  export interface ProcessEnv {
    /**
     * Built-in environment variable.
     * @see Docs https://github.com/chihab/ngx-env#ng_app_env.
     */
    readonly NG_APP_ENV: string;
    readonly NG_APP_GIPHY_API_KEY: string;
    readonly NG_APP_API_URL: string;
    readonly NG_APP_CORS_ORIGIN: string;
    readonly NG_APP_SOCKET_PATH: string;
    // Add your environment variables below
  }
}
