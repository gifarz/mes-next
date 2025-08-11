import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            identifier,
            status,
            actual_start
        } = req.body;

        try {
            if (!Array.isArray(identifier) || identifier.length === 0) {
                return res.status(400).json({ message: "No Row(s) Selected" });
            }

            const result = await db.query(
                `UPDATE mes.orders SET status = $1, actual_start = $2 WHERE identifier = ANY($3) RETURNING *`,
                [status, actual_start, identifier]
            );

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Order Updated', data: result.rows[0] });
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