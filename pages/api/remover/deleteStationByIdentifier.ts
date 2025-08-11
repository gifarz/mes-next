import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { identifier } = req.body;

        console.log('req.body', req.body)
        try {
            const result = await db.query(
                `DELETE FROM mes.stations WHERE identifier = $1 RETURNING *`,
                [identifier]
            );

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Station Deleted', data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'Station Not Found or No Changes Applied' });
            }
        } catch (error) {
            console.error('Delete Error:', error);
            res.status(500).json({ error: 'Failed to Delete Station' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}