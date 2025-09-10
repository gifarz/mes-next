import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { insertUserLog } from '@/lib/userLogsHelper';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            name,
            code,
            cost,
            quantity,
            identifier
        } = req.body;

        const cookieHeader = req.headers.cookie || ""
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {
            const result = await db.query(
                `UPDATE mes.inventories SET name = $1, code = $2, cost = $3, quantity = $4 WHERE identifier = $5 RETURNING *`,
                [name, code, cost, quantity, identifier]
            );

            if (result.rowCount && result.rows.length > 0) {
                const payload = {
                    api: "UPDATE_INVENTORY",
                    resultCode: "00",
                    resultDesc: "Success",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(200).json({ message: 'Inventory Updated', data: result.rows[0] });
            } else {
                const payload = {
                    api: "UPDATE_INVENTORY",
                    resultCode: "14",
                    resultDesc: "Inventory Not Found or No Changes Applied",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(404).json({ message: 'Inventory Not Found or No Changes Applied' });
            }
        } catch (error) {
            const payload = {
                api: "UPDATE_INVENTORY",
                resultCode: "99",
                resultDesc: "Error Catch Update Inventory : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Inventory' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}