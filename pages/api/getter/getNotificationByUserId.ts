import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { user_id } = req.body;

        try {
            const result = await db.query(
                `SELECT * FROM mes.notifications WHERE created_by = $1`,
                [user_id]
            );

            console.log('result', result.rows)

            if (result.rowCount && result.rowCount > 0) {
                res.status(200).json({ message: 'Notification Found', data: result.rows });
            } else {
                res.status(403).json({ message: 'Notification Not found' });
            }

        } catch (error) {
            console.error('Fetching error:', error);
            res.status(500).json({ error: 'Failed to Fetch Notification' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
