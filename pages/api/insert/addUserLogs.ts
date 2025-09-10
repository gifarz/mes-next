import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            api,
            resultCode,
            resultDesc,
            user_id
        } = req.body;

        try {

            const result = await db.query(
                `INSERT INTO mes.user_logs (user_id, service, result_code, result_desc)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [user_id, api, resultCode, resultDesc]
            );

            if (result.rowCount && result.rowCount > 0) {
                res.status(200).json({ message: 'Successfully Insert Logs', data: result.rows[0] });
            } else {
                res.status(500).json({ message: 'Failed to Insert Logs' });
            }

        } catch (error) {
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Logs' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
