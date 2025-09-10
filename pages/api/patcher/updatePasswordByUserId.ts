import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/hashPassword';
import { insertUserLog } from '@/lib/userLogsHelper';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { user_id, newPassword } = req.body;

        if (!user_id && !newPassword) {
            return res.status(400).json({ error: 'Invalid Parameter' });
        }

        const cookieHeader = req.headers.cookie || ""
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {
            const hashedPassword = await hashPassword(newPassword)
            const result = await db.query(
                `UPDATE mes.accounts SET password = $1 WHERE user_id = $2 RETURNING *`,
                [hashedPassword, user_id]
            );

            if (result.rowCount && result.rows.length > 0) {
                const payload = {
                    api: "UPDATE_PASSWORD",
                    resultCode: "00",
                    resultDesc: "Success",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(200).json({ message: 'Password Updated', data: result.rows[0] });
            } else {
                const payload = {
                    api: "UPDATE_PASSWORD",
                    resultCode: "17",
                    resultDesc: "Account Not Found or No Changes Applied",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(404).json({ message: 'Account Not Found or No Changes Applied' });
            }
        } catch (error) {
            const payload = {
                api: "UPDATE_PASSWORD",
                resultCode: "99",
                resultDesc: "Error Catch Update Password : " + error,
                user_id: created_by
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