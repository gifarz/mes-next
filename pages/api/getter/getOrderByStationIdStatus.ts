import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { station_id, status, not_status, not_status_2 } = req.body;

        try {
            let query = `SELECT * FROM mes.orders WHERE station_id = $1`;
            const params = [station_id];
            let paramIndex = 2;

            if (status) {
                query += ` AND status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }

            if (not_status) {
                query += ` AND status <> $${paramIndex}`;
                params.push(not_status);
                paramIndex++;
            }

            if (not_status_2) {
                query += ` AND status <> $${paramIndex}`;
                params.push(not_status_2);
                paramIndex++;
            }

            const result = await db.query(query, params);

            if (result.rowCount && result.rowCount > 0) {
                res.status(200).json({ message: 'Order Found', data: result.rows });
            } else {
                res.status(404).json({ message: 'Order Not found' });
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
