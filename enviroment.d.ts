declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";

      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;

      GOOGLE_ID: string;
      GOOGLE_SECRET: string;

      TELEGRAM_TOKEN: string;
      TELEGRAM_AUTH_TOKEN: string;

      FAUNADB_KEY: string;
      FAUNADB_KEY_DEV: string;

      CRM_URL: string;
      CRM_TOKEN: string;

      APP_URL: string;
      APP_SECRET: string;
      APP_SECRET_DEV: string;

      N8N_TOKEN: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
