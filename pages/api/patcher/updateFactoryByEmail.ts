import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
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

        console.log('req.body', req.body)

        try {
            const cookieHeader = req.headers.cookie || ""
            const token = getCookieFromServer(cookieHeader, "accessToken")
            const decodedJwt = decodeJWT(token as string)
            const created_by = decodedJwt.email

            const result = await db.query(
                `UPDATE mes.factories SET 
                name = $1,
                type = $2,
                production_model = $3,
                operation_start = $4,
                operation_end = $5,
                overtime_start = $6,
                overtime_end = $7,
                operation_day = $8,
                productivity_optimization = $9,
                work_utilization = $10,
                standard_machine_efficiency = $11,
                acceptable_waste = $12,
                reschedule_interval = $13
                WHERE created_by = $14 RETURNING *`,
                [name, type, production_model, operation_start, operation_end, overtime_start, overtime_end, operation_day, productivity_optimization, work_utilization, standard_machine_efficiency, acceptable_waste, reschedule_interval, created_by]
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