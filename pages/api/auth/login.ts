import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { comparePassword } from '@/lib/comparePassword';
import { serialize } from 'cookie'
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { user_id, password } = req.body;

        try {
            const result = await db.query(
                `SELECT * FROM mes.accounts WHERE user_id = $1 `,
                [user_id]
            );

            if (result.rowCount && result.rowCount > 0) {
                const comparedPassword = await comparePassword(password, result.rows[0].password)

                if (comparedPassword) {

                    // Generate JWT access token
                    const accessToken = jwt.sign(
                        { user_id: user_id, role: result.rows[0].role },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    // Set HttpOnly cookie
                    const cookie = serialize('accessToken', accessToken, {
                        httpOnly: false,
                        secure: false,
                        sameSite: 'lax',
                        path: '/',
                        maxAge: 60 * 60, // 1 hour
                    });

                    res.setHeader('Set-Cookie', cookie);

                    await db.query(
                        `INSERT INTO mes.customer_logs (user_id, service, result_code, result_desc)
                        VALUES ($1, $2, $3, $4)
                        RETURNING *`,
                        [user_id, "LOGIN", "00", "Success"]
                    );

                    const factory = await db.query(
                        `SELECT * FROM mes.factories WHERE created_by = $1 `,
                        [user_id]
                    );

                    res.status(200).json(
                        {
                            message: 'Account Found',
                            data: result.rows[0],
                            factory: factory.rows
                        }
                    );
                } else {
                    await db.query(
                        `INSERT INTO mes.customer_logs (user_id, service, result_code, result_desc)
                        VALUES ($1, $2, $3, $4)
                        RETURNING *`,
                        [user_id, "LOGIN", "02", "Password Does Not Match"]
                    );
                    res.status(403).json({ message: 'Account Not Found', data: result.rows[0] });
                }
            } else {
                await db.query(
                    `INSERT INTO mes.customer_logs (user_id, service, result_code, result_desc)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *`,
                    [user_id, null, "LOGIN", "02", "Account does not exist"]
                );
                res.status(403).json({ message: 'Account Not Found', data: result.rows[0] });
            }

        } catch (error) {
            console.error('Fetching Error:', error);
            res.status(500).json({ error: 'Failed to Fetch Account' });
        }
    }

    else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
