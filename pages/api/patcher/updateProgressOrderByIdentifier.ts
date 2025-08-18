import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { identifier, defect, done, completed, actual_end, duration, status, checked_by } = req.body;

        try {
            const result = await db.query(
                `UPDATE mes.orders SET defect_item = $1, done_item = $2, completed = $3, actual_end = $4, duration = $5, status = $6, checked_by = $7 WHERE identifier = $8 RETURNING *`,
                [defect, done, completed, actual_end, duration, status, checked_by, identifier]
            );

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Order Updated!', data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'Order Not Found or No Changes Applied' });
            }
        } catch (error) {
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Order' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}