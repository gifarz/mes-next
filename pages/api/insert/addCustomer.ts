import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { generateUUID } from '@/lib/uuidGenerator';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';
import { resumePluginState } from 'next/dist/build/build-context';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
        } = req.body;

        try {
            const uuid = generateUUID()
            const cookieHeader = req.headers.cookie || ""
            const token = getCookieFromServer(cookieHeader, "accessToken")
            const decodedJwt = decodeJWT(token as string)
            const created_by = decodedJwt.email

            const getFactoryByEmail = await db.query(
                `SELECT * FROM mes.factories WHERE created_by = $1`,
                [created_by]
            );

            if (getFactoryByEmail.rowCount && getFactoryByEmail.rowCount > 0) {
                const factory_id = getFactoryByEmail.rows[0].identifier
                const result = await db.query(
                    `INSERT INTO mes.customers (
                        identifier,
                        factory_id,
                        first_name,
                        last_name,
                        email,
                        phone_number,
                        address,
                        created_by
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *`,
                    [uuid, factory_id, firstName, lastName, email, phoneNumber, address, created_by]
                );

                console.log('result', result.rows)

                if (result.rowCount && result.rowCount > 0) {
                    res.status(200).json({ message: 'Successfully Insert Customer', data: result.rows[0] });
                } else {
                    res.status(500).json({ message: 'Failed to Insert Customer' });
                }

            } else {
                res.status(500).json({ message: 'The Email Has Not Factory Yet' });
            }


        } catch (error) {
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Customer' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
