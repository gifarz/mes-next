import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { station_id, user_id } = req.body;

        try {
            const result = await db.query(
                `SELECT * FROM mes.orders WHERE ($1 IS NULL OR station_id = $1) and created_by = $2`,
                [station_id, user_id]
            );

            if (result.rowCount && result.rowCount > 0) {
                res.status(200).json({ message: 'Order Found', data: result.rows });
            } else {
                res.status(403).json({ message: 'Order Not found' });
            }

        } catch (error) {
            console.error('Fetching error:', error);
            res.status(500).json({ error: 'Failed to Fetch Order' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
