import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/hashPassword';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, newPassword } = req.body;

        if (!email && !newPassword) {
            return res.status(400).json({ error: 'Invalid Parameter' });
        }

        try {
            const hashedPassword = await hashPassword(newPassword)
            const result = await db.query(
                `UPDATE mes.accounts SET password = $1 WHERE email = $2 RETURNING *`,
                [hashedPassword, email]
            );

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Password Updated', data: result.rows[0] });
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