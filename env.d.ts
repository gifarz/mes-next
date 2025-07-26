declare namespace NodeJS {
    interface ProcessEnv {
        DB_HOST: string;
        DB_USER: string;
        DB_PASS: string;
        DB_NAME: string;
        JWT_SECRET: string;
    }
}