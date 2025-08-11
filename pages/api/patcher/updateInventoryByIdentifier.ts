import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            name,
            code,
            cost,
            quantity,
            identifier
        } = req.body;

        try {
            const result = await db.query(
                `UPDATE mes.inventories SET name = $1, code = $2, cost = $3, quantity = $4 WHERE identifier = $5 RETURNING *`,
                [name, code, cost, quantity, identifier]
            );

            console.log(result.rows)

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Inventory Updated', data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'Inventory Not Found or No Changes Applied' });
            }
        } catch (error) {
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Inventory' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}