import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { comparePassword } from '@/lib/comparePassword';
import { serialize } from 'cookie'
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            const result = await db.query(
                `SELECT * FROM mes.accounts WHERE email = $1 `,
                [email]
            );

            if (result.rowCount && result.rowCount > 0) {
                const comparedPassword = await comparePassword(password, result.rows[0].password)

                if (comparedPassword) {

                    // Generate JWT access token
                    const accessToken = jwt.sign(
                        { email: email, type: result.rows[0].type },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    // Set HttpOnly cookie
                    const cookie = serialize('accessToken', accessToken, {
                        httpOnly: process.env.NODE_ENV === 'development' ? false : true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                        maxAge: 60 * 60, // 1 hour
                    });

                    res.setHeader('Set-Cookie', cookie);

                    await db.query(
                        `INSERT INTO mes.customer_logs (email, company, service, result_code, result_desc)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING *`,
                        [email, result.rows[0].company, "LOGIN", "00", "Success"]
                    );
                    res.status(200).json({ message: 'Account Found', data: result.rows[0] });
                } else {
                    await db.query(
                        `INSERT INTO mes.customer_logs (email, company, service, result_code, result_desc)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING *`,
                        [email, result.rows[0].company, "LOGIN", "02", "Password Does Not Match"]
                    );
                    res.status(403).json({ message: 'Account Not Found', data: result.rows[0] });
                }
            } else {
                await db.query(
                    `INSERT INTO mes.customer_logs (email, company, service, result_code, result_desc)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *`,
                    [email, null, "LOGIN", "02", "Account does not exist"]
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
