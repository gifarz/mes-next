// pages/api/account.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/hashPassword';
import { generateUUID } from '@/lib/uuidGenerator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, name, phone, password, company } = req.body;

        const uuid = generateUUID()

        try {
            const hashedPassword = await hashPassword(password)
            const result = await db.query(
                `INSERT INTO mes.accounts (identifier, email, name, type, phone, password, company)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [uuid, email, name, "USER", phone, hashedPassword, company]
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
                    [email, company, "REGISTRATION", "01", "Registration Failed"]
                );
            }

            res.status(200).json({ message: 'Account Created', data: result.rows[0] });
        } catch (error) {
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Account' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
