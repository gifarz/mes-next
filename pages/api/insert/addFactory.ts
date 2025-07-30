import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { generateUUID } from '@/lib/uuidGenerator';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            name,
            type,
            production_model,
            operation_start,
            operation_end,
            overtime_start,
            overtime_end,
            operation_day,
            productivity_optimization,
            work_utilization,
            standard_machine_efficiency,
            acceptable_waste,
            reschedule_interval,
        } = req.body;

        try {
            const cookieHeader = req.headers.cookie || ""
            const uuid = generateUUID()
            const token = getCookieFromServer(cookieHeader, "accessToken")
            const decodedJwt = decodeJWT(token as string)
            const created_by = decodedJwt.email

            const result = await db.query(
                `INSERT INTO mes.factories (
                    identifier,
                    name,
                    type,
                    production_model,
                    operation_start,
                    operation_end,
                    overtime_start,
                    overtime_end,
                    operation_day,
                    productivity_optimization,
                    work_utilization,
                    standard_machine_efficiency,
                    acceptable_waste,
                    reschedule_interval,
                    created_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING *`,
                [uuid, name, type, production_model, operation_start, operation_end, overtime_start, overtime_end, operation_day, productivity_optimization, work_utilization, standard_machine_efficiency, acceptable_waste, reschedule_interval, created_by]
            );

            if (result.rowCount && result.rowCount > 0) {
                res.status(200).json({ message: 'Successfully Inserted Factory', data: result.rows[0] });
            } else {
                res.status(500).json({ message: 'Failed to Insert Factory' });
            }

        } catch (error) {
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Factory' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
