import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';
import { insertUserLog } from '@/lib/userLogsHelper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            identifier,
            customerName,
            product,
            productCode,
            quantity,
            part,
            partCode,
            deliveryDate,
        } = req.body;

        const cookieHeader = req.headers.cookie || ""
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {
            const result = await db.query(
                `UPDATE mes.orders SET customer_name = $1, product_name = $2, product_code = $3, part_name = $4, part_code = $5, quantity = $6, delivery_date = $7 WHERE identifier = $8 RETURNING *`,
                [customerName, product, productCode, part, partCode, quantity, deliveryDate, identifier]
            );

            if (result.rowCount && result.rows.length > 0) {
                const payload = {
                    api: "UPDATE_ORDER",
                    resultCode: "00",
                    resultDesc: "Success",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(200).json({ message: 'Order Updated', data: result.rows[0] });
            } else {
                const payload = {
                    api: "UPDATE_ORDER",
                    resultCode: "16",
                    resultDesc: "Order Not Found or No Changes Applied",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(404).json({ message: 'Order Not Found or No Changes Applied' });
            }
        } catch (error) {
            const payload = {
                api: "UPDATE_ORDER",
                resultCode: "99",
                resultDesc: "Error Catch Update Order : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Order' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}