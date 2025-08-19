import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            identifier,
            customerName,
            product,
            productCode,
            quantity,
            part,
            partCode,
            deliveryDate,
        } = req.body;

        console.log('req.body', req.body)

        try {
            const result = await db.query(
                `UPDATE mes.orders SET customer_name = $1, product_name = $2, product_code = $3, part_name = $4, part_code = $5, quantity = $6, delivery_date = $7 WHERE identifier = $8 RETURNING *`,
                [customerName, product, productCode, part, partCode, quantity, deliveryDate, identifier]
            );

            console.log(result.rows)

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Order Updated', data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'Order Not Found or No Changes Applied' });
            }
        } catch (error) {
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Order' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}