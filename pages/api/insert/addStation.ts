import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { generateUUID } from '@/lib/uuidGenerator';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            number,
            name,
            machine_name,
        } = req.body;

        console.log('req.body', req.body)

        try {
            const uuid = generateUUID()
            const cookieHeader = req.headers.cookie || ""
            const token = getCookieFromServer(cookieHeader, "accessToken")
            const decodedJwt = decodeJWT(token as string)
            const created_by = decodedJwt.email

            const getMachineByEmail = await db.query(
                `SELECT * FROM mes.machines WHERE created_by = $1 AND name = $2`,
                [created_by, machine_name]
            );

            console.log('getMachineByEmail', getMachineByEmail)

            if (getMachineByEmail.rowCount && getMachineByEmail.rowCount > 0) {
                const factory_id = getMachineByEmail.rows[0].factory_id
                const machine_id = getMachineByEmail.rows[0].identifier

                const result = await db.query(
                    `INSERT INTO mes.stations (
                        identifier,
                        factory_id,
                        machine_id,
                        machine_name,
                        number,
                        name,
                        created_by
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *`,
                    [uuid, factory_id, machine_id, machine_name, number, name, created_by]
                );

                if (result.rowCount && result.rowCount > 0) {
                    res.status(200).json({ message: 'Successfully Insert Station', data: result.rows[0] });
                } else {
                    res.status(500).json({ message: 'Failed to Insert Station' });
                }
            }


        } catch (error) {
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Station' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
