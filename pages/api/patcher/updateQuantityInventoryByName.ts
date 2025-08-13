import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            product_name,
            quantity,
            created_by
        } = req.body;

        console.log('updaetQuantityInventory', req.body)

        try {
            // Subtraction flow for quantity in inventory table
            const dataProduct = await db.query(
                `SELECT * FROM mes.products WHERE name = $1`,
                [product_name]
            );

            const dataInventory = await db.query(
                `SELECT * FROM mes.inventories WHERE name = $1`,
                [dataProduct.rows[0].part_material]
            );

            const updateQuantityInventory = await db.query(
                `UPDATE mes.inventories
                    SET quantity = GREATEST((quantity::integer - $1::integer), 0)::varchar
                    WHERE identifier = $2 RETURNING *`,
                [quantity, dataInventory.rows[0].identifier]
            )

            if (updateQuantityInventory.rowCount && updateQuantityInventory.rowCount > 0) {

                const updatedInventory = updateQuantityInventory.rows[0]

                // Check the quantity of Inventory for notification alert
                if (Number(updatedInventory.quantity) > 5 || Number(updatedInventory.quantity) <= 20) {
                    await db.query(
                        `INSERT INTO mes.notifications (inventory_id, type, detail, created_by)
                            VALUES ($1, $2, $3, $4)
                            RETURNING *`,
                        [updatedInventory.identifier, "Warning", `${updatedInventory.name} is low stock`, created_by]
                    );
                } else if (Number(updatedInventory.quantity) <= 5) {
                    await db.query(
                        `INSERT INTO mes.notifications (inventory_id, type, detail, created_by)
                            VALUES ($1, $2, $3, $4)
                            RETURNING *`,
                        [updatedInventory.identifier, "Critical", `${updatedInventory.name} is going out of stock`, created_by]
                    );
                }

                res.status(200).json({
                    message: 'Successfully Update Quantity',
                    data: updateQuantityInventory.rows[0]
                });

            } else {
                res.status(500).json({ message: 'Failed to Update Inventory' });
            }

        } catch (error) {
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Inventory' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
