// pages/api/account.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, name, phone, password, company } = req.body;

        console.log('req.body', req.body)

        try {
            const result = await db.query(
                `INSERT INTO mes.accounts (email, name, phone, password, company)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [email, name, phone, password, company]
            );

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
