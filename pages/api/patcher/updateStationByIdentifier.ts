import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { identifier, machine_name, number, name } = req.body;

        console.log('req.body', req.body)
        try {
            const result = await db.query(
                `UPDATE mes.stations SET machine_name = $1, number = $2, name = $3 WHERE identifier = $4 RETURNING *`,
                [machine_name, number, name, identifier]
            );

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Station Updated', data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'Station Not Found or No Changes Applied' });
            }
        } catch (error) {
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Station' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}