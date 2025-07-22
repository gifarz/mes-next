import { Pool } from 'pg';

export const db = new Pool({
    host: process.env.DB_HOST,     // e.g. 'localhost'
    user: process.env.DB_USER,     // e.g. 'postgres'
    password: process.env.DB_PASS, // your password
    database: process.env.DB_NAME, // your DB name
    port: 5432,                    // default PostgreSQL port
});