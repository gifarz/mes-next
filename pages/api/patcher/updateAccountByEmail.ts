import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { name, phone, company, email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Invalid Parameter' });
        }

        try {
            const result = await db.query(
                `UPDATE mes.accounts SET name = $1, phone = $2, company = $3 WHERE email = $4 RETURNING *`,
                [name, phone, company, email]
            );

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Account Updated', data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'Account Not Found or No Changes Applied' });
            }
        } catch (error) {
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Account' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}