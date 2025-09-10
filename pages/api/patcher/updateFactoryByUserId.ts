import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';
import { insertUserLog } from '@/lib/userLogsHelper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            name,
            description,
            operation_start,
            operation_end,
            overtime_start,
            overtime_end,
            operation_day,
        } = req.body;

        const cookieHeader = req.headers.cookie || ""
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {

            const result = await db.query(
                `UPDATE mes.factories SET 
                name = $1,
                description = $2,
                operation_start = $3,
                operation_end = $4,
                overtime_start = $5,
                overtime_end = $6,
                operation_day = $7,
                WHERE created_by = $8 RETURNING *`,
                [name, description, operation_start, operation_end, overtime_start, overtime_end, operation_day, created_by]
            );

            if (result.rowCount && result.rows.length > 0) {
                const payload = {
                    api: "UPDATE_FACTORY",
                    resultCode: "00",
                    resultDesc: "Success",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(200).json({ message: 'Factory Updated', data: result.rows[0] });
            } else {
                const payload = {
                    api: "UPDATE_FACTORY",
                    resultCode: "13",
                    resultDesc: "'Factory Not Found or No Changes Applied'",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(404).json({ message: 'Factory Not Found or No Changes Applied' });
            }
        } catch (error) {
            const payload = {
                api: "UPDATE_FACTORY",
                resultCode: "99",
                resultDesc: "Error Catch Update Factory : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Factory' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}