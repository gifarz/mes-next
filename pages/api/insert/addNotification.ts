import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { inventory_id, type, detail, created_by } = req.body;

        try {
            const result = await db.query(
                `INSERT INTO mes.notifications (inventory_id, type, detail, created_by)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [inventory_id, type, detail, created_by]
            );

            if (result.rowCount && result.rowCount > 0) {
                res.status(200).json({ message: 'Successfully Added Notification', data: result.rows[0] });

            } else {
                res.status(500).json({ message: 'Failed Added Notification' });
            }

        } catch (error) {
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Notification' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
