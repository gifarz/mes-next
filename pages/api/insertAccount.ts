// pages/api/account.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/hashPassword';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, name, phone, password, company } = req.body;

        console.log('req.body', req.body)

        try {
            const hashedPassword = await hashPassword(password)
            const result = await db.query(
                `INSERT INTO mes.accounts (email, name, phone, password, company)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [email, name, phone, hashedPassword, company]
            );

            if (result.rowCount && result.rowCount > 0) {
                await db.query(
                    `INSERT INTO mes.customer_logs (email, company, service, result_code, result_desc)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *`,
                    [email, company, "REGISTRATION", "00", "Success"]
                );
            } else {
                await db.query(
                    `INSERT INTO mes.customer_logs (email, company, service, result_code, result_desc)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *`,
                    [email, company, "REGISTRATION", "01", "Registration failed"]
                );
            }

            res.status(200).json({ message: 'Account created', data: result.rows[0] });
        } catch (error) {
            console.error('Insert error:', error);
            res.status(500).json({ error: 'Failed to insert account' });
        }
    }

    else if (req.method === 'GET') {
        try {
            const result = await db.query(`SELECT * FROM mes.accounts ORDER BY created_on DESC`);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Fetch error:', error);
            res.status(500).json({ error: 'Failed to fetch accounts' });
        }
    }

    else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
