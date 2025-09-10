import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { generateUUID } from '@/lib/uuidGenerator';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';
import { insertUserLog } from '@/lib/userLogsHelper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            number,
            name,
            description,
            type,
            capacity,
        } = req.body;

        const uuid = generateUUID()
        const cookieHeader = req.headers.cookie || ""
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {
            const getFactory = await db.query(`SELECT * FROM mes.factories`);

            if (getFactory.rowCount && getFactory.rowCount > 0) {
                const factory_id = getFactory.rows[0].identifier
                const result = await db.query(
                    `INSERT INTO mes.machines (
                        identifier,
                        factory_id,
                        number,
                        name,
                        description,
                        type,
                        capacity,
                        created_by
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *`,
                    [uuid, factory_id, number, name, description, type, capacity, created_by]
                );

                if (result.rowCount && result.rowCount > 0) {
                    const payload = {
                        api: "ADD_MACHINE",
                        resultCode: "00",
                        resultDesc: "Successfully Insert Machine",
                        user_id: created_by
                    }
                    insertUserLog(payload)
                    res.status(200).json({ message: 'Successfully Insert Machine', data: result.rows[0] });
                } else {
                    const payload = {
                        api: "ADD_MACHINE",
                        resultCode: "06",
                        resultDesc: "Failed to Insert Machine",
                        user_id: created_by
                    }
                    insertUserLog(payload)
                    res.status(500).json({ message: 'Failed to Insert Machine' });
                }

            } else {
                res.status(500).json({ message: 'The User Has Not Factory Yet' });
            }


        } catch (error) {
            const payload = {
                api: "ADD_MACHINE",
                resultCode: "99",
                resultDesc: "Error Catch Add Machine : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Machine' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
