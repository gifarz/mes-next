import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { id } = req.body;

        try {
            const result = await db.query(
                `DELETE FROM mes.alarm WHERE id = $1 RETURNING *`,
                [id]
            );

            console.log(result.rows)

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Alarm Deleted', data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'Alarm Not Found or No Changes Applied' });
            }
        } catch (error) {
            console.error('Delete Error:', error);
            res.status(500).json({ error: 'Failed to Delete Alarm' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}