import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

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

        try {
            const result = await db.query(
                `UPDATE mes.customers SET first_name = $1, last_name = $2, email = $3, phone_number = $4, address = $5 WHERE identifier = $6 RETURNING *`,
                [firstName, lastName, email, phoneNumber, address, identifier]
            );

            console.log(result.rows)

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Customer Updated', data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'Customer Not Found or No Changes Applied' });
            }
        } catch (error) {
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Customer' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}