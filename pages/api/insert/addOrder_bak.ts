import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { generateUUID } from '@/lib/uuidGenerator';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';
import { formattedDateOnly } from '@/lib/dateUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            order_number,
            customer_name,
            product_id,
            product_name,
            quantity,
            delivery_date,
            status
        } = req.body;

        console.log('addOrder', req.body)

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
                // Subtraction flow for quantity in inventory table
                const dataProduct = await db.query(
                    `SELECT * FROM mes.products WHERE identifier = $1`,
                    [product_id]
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

                    // Get the station id for table orders
                    const dataStation = await db.query(
                        `SELECT * FROM mes.stations WHERE name = $1`,
                        [dataProduct.rows[0].process_number]
                    );
                    const station_id = dataStation.rows[0].identifier

                    const factory_id = getFactoryByEmail.rows[0].identifier
                    const result = await db.query(
                        `INSERT INTO mes.orders (
                            identifier,
                            factory_id,
                            station_id,
                            order_number,
                            customer_name,
                            product_name,
                            quantity,
                            delivery_date,
                            status,
                            created_by
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        RETURNING *`,
                        [uuid, factory_id, station_id, order_number, customer_name, product_name, quantity, formattedDateOnly(delivery_date), status, created_by]
                    );

                    if (result.rowCount && result.rowCount > 0) {
                        res.status(200).json({ message: 'Successfully Insert Order', data: result.rows[0] });
                    } else {
                        res.status(500).json({ message: 'Failed to Insert Order' });
                    }

                } else {
                    res.status(500).json({ message: 'Failed to Update Inventory' });
                }



            } else {
                res.status(500).json({ message: 'The Email Has Not Factory Yet' });
            }


        } catch (error) {
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Order' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
