import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { insertUserLog } from '@/lib/userLogsHelper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { name, user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'Invalid Parameter' });
        }

        try {
            const result = await db.query(
                `UPDATE mes.accounts SET name = $1 WHERE user_id = $2 RETURNING *`,
                [name, user_id]
            );

            if (result.rowCount && result.rows.length > 0) {
                const payload = {
                    api: "UPDATE_ACCOUNT",
                    resultCode: "00",
                    resultDesc: "Success",
                    user_id: user_id
                }
                insertUserLog(payload)
                res.status(200).json({ message: 'Account Updated', data: result.rows[0] });
            } else {
                const payload = {
                    api: "UPDATE_ACCOUNT",
                    resultCode: "11",
                    resultDesc: "'Account Not Found or No Changes Applied'",
                    user_id: user_id
                }
                insertUserLog(payload)
                res.status(404).json({ message: 'Account Not Found or No Changes Applied' });
            }
        } catch (error) {
            const payload = {
                api: "UPDATE_ACCOUNT",
                resultCode: "99",
                resultDesc: "Error Catch Update Account : " + error,
                user_id: user_id
            }
            insertUserLog(payload)
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Account' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}