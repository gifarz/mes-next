import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';

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

        console.log('req.body', req.body)

        try {
            const cookieHeader = req.headers.cookie || ""
            const token = getCookieFromServer(cookieHeader, "accessToken")
            const decodedJwt = decodeJWT(token as string)
            const created_by = decodedJwt.user_id

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

            console.log('result', result.rows)

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Factory Updated', data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'Factory Not Found or No Changes Applied' });
            }
        } catch (error) {
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Factory' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}