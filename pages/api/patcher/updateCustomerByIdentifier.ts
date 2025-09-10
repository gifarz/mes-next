import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';
import { insertUserLog } from '@/lib/userLogsHelper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
            identifier
        } = req.body;

        const cookieHeader = req.headers.cookie || ""
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {
            const result = await db.query(
                `UPDATE mes.customers SET first_name = $1, last_name = $2, email = $3, phone_number = $4, address = $5 WHERE identifier = $6 RETURNING *`,
                [firstName, lastName, email, phoneNumber, address, identifier]
            );

            if (result.rowCount && result.rows.length > 0) {
                const payload = {
                    api: "UPDATE_CUSTOMER",
                    resultCode: "00",
                    resultDesc: "Success",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(200).json({ message: 'Customer Updated', data: result.rows[0] });
            } else {
                const payload = {
                    api: "UPDATE_CUSTOMER",
                    resultCode: "12",
                    resultDesc: "Customer Not Found or No Changes Applied",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(404).json({ message: 'Customer Not Found or No Changes Applied' });
            }
        } catch (error) {
            const payload = {
                api: "UPDATE_CUSTOMER",
                resultCode: "99",
                resultDesc: "Error Catch Update Customer : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Customer' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}