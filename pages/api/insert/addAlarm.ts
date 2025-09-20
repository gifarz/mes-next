import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { generateUUID } from '@/lib/uuidGenerator';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';
import { insertUserLog } from '@/lib/userLogsHelper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            alarm,
            open_date,
            status,
            note,
        } = req.body;

        console.log('req.body', req.body)

        const cookieHeader = req.headers.cookie || ""
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {
            const getFactory = await db.query(`SELECT * FROM mes.factories`);

            if (getFactory.rowCount && getFactory.rowCount > 0) {
                const result = await db.query(
                    `INSERT INTO mes.alarm (
                        alarm,
                        open_date,
                        open_by,
                        status,
                        note
                    )
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *`,
                    [alarm, open_date, created_by, status, note]
                );

                if (result.rowCount && result.rowCount > 0) {
                    const payload = {
                        api: "ADD_ALARM",
                        resultCode: "00",
                        resultDesc: "Successfully Insert Alarm",
                        user_id: created_by
                    }
                    insertUserLog(payload)
                    res.status(200).json({ message: 'Successfully Insert Alarm', data: result.rows[0] });
                } else {
                    const payload = {
                        api: "ADD_MACHINE",
                        resultCode: "06",
                        resultDesc: "Failed to Insert Alarm",
                        user_id: created_by
                    }
                    insertUserLog(payload)
                    res.status(500).json({ message: 'Failed to Insert Alarm' });
                }

            } else {
                res.status(500).json({ message: 'The User Has Not Factory Yet' });
            }


        } catch (error) {
            const payload = {
                api: "ADD_ALARM",
                resultCode: "99",
                resultDesc: "Error Catch Add Alarm : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Alarm' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
