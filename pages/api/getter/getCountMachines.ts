import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {

        try {
            const result = await db.query(
                `SELECT * FROM mes.machines`
            );

            if (result.rowCount && result.rowCount > 0) {
                res.status(200).json({ message: 'Machine Found', data: result.rowCount });
            } else {
                res.status(403).json({ message: 'Machine Not found' });
            }

        } catch (error) {
            console.error('Fetching error:', error);
            res.status(500).json({ error: 'Failed to Fetch Machine' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
