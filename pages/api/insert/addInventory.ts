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
            code,
            cost,
            quantity,
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
                    `INSERT INTO mes.inventories (
                        identifier,
                        factory_id,
                        name,
                        code,
                        cost,
                        quantity,
                        created_by
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *`,
                    [uuid, factory_id, name, code, cost, quantity, created_by]
                );

                if (result.rowCount && result.rowCount > 0) {
                    const payload = {
                        api: "ADD_INVENTORY",
                        resultCode: "00",
                        resultDesc: "Successfully Insert Inventory",
                        user_id: created_by
                    }
                    insertUserLog(payload)
                    res.status(200).json({ message: 'Successfully Insert Inventory', data: result.rows[0] });
                } else {
                    const payload = {
                        api: "ADD_INVENTORY",
                        resultCode: "07",
                        resultDesc: "Failed to Insert Inventory",
                        user_id: created_by
                    }
                    insertUserLog(payload)
                    res.status(500).json({ message: 'Failed to Insert Inventory' });
                }

            } else {
                res.status(500).json({ message: 'The User Has Not Factory Yet' });
            }


        } catch (error) {
            const payload = {
                api: "ADD_INVENTORY",
                resultCode: "99",
                resultDesc: "Error Catch Inventory : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Inventory' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
