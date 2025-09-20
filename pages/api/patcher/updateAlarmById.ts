import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { insertUserLog } from '@/lib/userLogsHelper';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { status, closed_date, id } = req.body;

        const cookieHeader = req.headers.cookie || ""
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {
            const result = await db.query(
                `UPDATE mes.alarm SET status = $1, closed_date = $2, closed_by = $3 WHERE id = $4 RETURNING *`,
                [status, closed_date, created_by, id]
            );

            console.log('result', result.rows)

            if (result.rowCount && result.rows.length > 0) {
                const payload = {
                    api: "UPDATE_ALARM",
                    resultCode: "00",
                    resultDesc: "Success",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(200).json({ message: 'Status Updated', data: result.rows[0] });
            } else {
                const payload = {
                    api: "UPDATE_ALARM",
                    resultCode: "17",
                    resultDesc: "Alarm Not Found or No Changes Applied",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(404).json({ message: 'Alarm Not Found or No Changes Applied' });
            }
        } catch (error) {
            const payload = {
                api: "UPDATE_ALARM",
                resultCode: "99",
                resultDesc: "Error Catch Update Status : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Alarm' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}