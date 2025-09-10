import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { insertUserLog } from '@/lib/userLogsHelper';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { identifier, number, name, description, capacity, type } = req.body;

        const cookieHeader = req.headers.cookie || ""
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {
            const result = await db.query(
                `UPDATE mes.machines SET  number = $1, name = $2, description = $3, capacity = $4, type = $5 WHERE identifier = $6 RETURNING *`,
                [number, name, description, capacity, type, identifier]
            );

            if (result.rowCount && result.rows.length > 0) {
                const payload = {
                    api: "UPDATE_MACHINE",
                    resultCode: "00",
                    resultDesc: "Success",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(200).json({ message: 'Machine Updated', data: result.rows[0] });
            } else {
                const payload = {
                    api: "UPDATE_MACHINE",
                    resultCode: "15",
                    resultDesc: 'Machine Not Found or No Changes Applied',
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(404).json({ message: 'Machine Not Found or No Changes Applied' });
            }
        } catch (error) {
            const payload = {
                api: "UPDATE_MACHINE",
                resultCode: "99",
                resultDesc: "Error Catch Update Machine : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Machine' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}