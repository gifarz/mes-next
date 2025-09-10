import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { generateUUID } from '@/lib/uuidGenerator';
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
        const uuid = generateUUID()
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {
            const result = await db.query(
                `INSERT INTO mes.factories (
                    identifier,
                    name,
                    description,
                    operation_start,
                    operation_end,
                    overtime_start,
                    overtime_end,
                    operation_day,
                    created_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`,
                [uuid, name, description, operation_start, operation_end, overtime_start, overtime_end, operation_day, created_by]
            );

            if (result.rowCount && result.rowCount > 0) {
                const payload = {
                    api: "ADD_FACTORY",
                    resultCode: "00",
                    resultDesc: "Successfully Insert Factory",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(200).json({ message: 'Successfully Insert Factory', data: result.rows[0] });

            } else {
                const payload = {
                    api: "ADD_FACTORY",
                    resultCode: "05",
                    resultDesc: "Failed to Insert Factory",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(500).json({ message: 'Failed to Insert Factory' });
            }

        } catch (error) {
            const payload = {
                api: "ADD_FACTORY",
                resultCode: "99",
                resultDesc: "Error Catch Add Factory : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Factory' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
