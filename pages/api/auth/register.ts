import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/hashPassword';
import { generateUUID } from '@/lib/uuidGenerator';
import { insertUserLog } from '@/lib/userLogsHelper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { user_id, name, role, password } = req.body;

        console.log('req.body', req.body);

        try {
            const uuid = generateUUID()
            const result = await db.query(
                `SELECT * FROM mes.accounts WHERE user_id = $1 `,
                [user_id]
            );

            if (result.rowCount && result.rowCount > 0) {
                res.status(404).json({ message: 'Account Already Exist', data: result.rows[0] });

            } else {
                const hashedPassword = await hashPassword(password)
                const result = await db.query(
                    `INSERT INTO mes.accounts (identifier, user_id, name, role, password)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                    [uuid, user_id, name, role, hashedPassword]
                );

                if (result.rowCount && result.rowCount > 0) {
                    const payload = {
                        api: "REGISTRATION",
                        resultCode: "00",
                        resultDesc: "Success",
                        user_id
                    }
                    insertUserLog(payload)

                    res.status(200).json({ message: 'Successfully Created the Account', data: result.rows[0] });
                } else {
                    const payload = {
                        api: "REGISTRATION",
                        resultCode: "01",
                        resultDesc: "Registration Failed",
                        user_id
                    }
                    insertUserLog(payload)

                    res.status(500).json({ message: 'Fail to Create the Account' });
                }
            }

        } catch (error) {
            const payload = {
                api: "REGISTRATION",
                resultCode: "99",
                resultDesc: "Error Catch Registration : " + error,
                user_id
            }
            insertUserLog(payload)
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Account' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
