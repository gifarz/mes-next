// pages/api/account.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { comparePassword } from '@/lib/comparePassword';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            const result = await db.query(
                `SELECT * FROM mes.accounts WHERE email = $1 `,
                [email]
            );

            if (result.rowCount && result.rowCount > 0) {
                const comparedPassword = await comparePassword(password, result.rows[0].password)

                if (comparedPassword) {
                    await db.query(
                        `INSERT INTO mes.customer_logs (email, company, service, result_code, result_desc)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING *`,
                        [email, result.rows[0].company, "LOGIN", "00", "Success"]
                    );
                    res.status(200).json({ message: 'Account found', data: result.rows[0] });
                } else {
                    await db.query(
                        `INSERT INTO mes.customer_logs (email, company, service, result_code, result_desc)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING *`,
                        [email, result.rows[0].company, "LOGIN", "02", "Password does not match"]
                    );
                    res.status(403).json({ message: 'Account not found', data: result.rows[0] });
                }
            } else {
                await db.query(
                    `INSERT INTO mes.customer_logs (email, company, service, result_code, result_desc)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *`,
                    [email, null, "LOGIN", "02", "Account does not exist"]
                );
                res.status(403).json({ message: 'Account not found', data: result.rows[0] });
            }

        } catch (error) {
            console.error('Fetching error:', error);
            res.status(500).json({ error: 'Failed to fetch account' });
        }
    }

    else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
