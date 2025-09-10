import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { generateUUID } from '@/lib/uuidGenerator';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';
import { adjustDayWithTime, formattedDateOnly, workloadsTime } from '@/lib/dateUtils';
import { getRandomIndex } from '@/lib/randFromArray';
import { insertUserLog } from '@/lib/userLogsHelper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            order_number,
            customer_name,
            product_id,
            product_name,
            quantity,
            total_length,
            stripping_front,
            stripping_rear,
            stripping_half_front,
            stripping_half_rear,
            diameter_core,
            setting_pieces,
            current_pieces,
            delivery_date,
            status
        } = req.body;

        const uuid = generateUUID()
        const cookieHeader = req.headers.cookie || ""
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {
            const getFactory = await db.query(`SELECT * FROM mes.factories`);

            if (getFactory.rowCount && getFactory.rowCount > 0) {
                // Subtraction flow for quantity in inventory table
                const dataProduct = await db.query(
                    `SELECT * FROM mes.products WHERE identifier = $1`,
                    [product_id]
                );

                // Select the station for randomizing station in each order
                const dataStation = await db.query(`SELECT * FROM mes.stations`);

                if (dataStation.rowCount && dataStation.rowCount > 0) {
                    const randStation = Math.floor(Math.random() * dataStation.rowCount)
                    const factory_id = getFactory.rows[0].identifier
                    const product_code = dataProduct.rows[0].code
                    const part_name = dataProduct.rows[0].part_name
                    const part_code = dataProduct.rows[0].part_code
                    const station_id = dataStation.rows[randStation].identifier
                    const station_name = dataStation.rows[randStation].name
                    const machine_name = dataStation.rows[randStation].machine_name.split(',')
                    const used_machine = machine_name.length
                    // const total_item_in_hour = await Promise.all(
                    //     machine_name.map(async (machine: string) => {
                    //         const machines = await db.query(
                    //             `SELECT capacity FROM mes.machines WHERE name = $1`,
                    //             [machine.trim()]
                    //         );
                    //         return Number(machines.rows[0]?.capacity || 0);
                    //     })
                    // ).then(capacities => capacities.reduce((sum, cap) => sum + cap, 0));
                    // const workloads = workloadsTime(Number(total_item_in_hour), Number(quantity))
                    // const operation_start = getFactory.rows[0].operation_start
                    // const estimate_start = adjustDayWithTime(new Date(), 1, operation_start + ":00")
                    // const estimate_end = adjustDayWithTime(new Date(), 1, operation_start + ":00", workloads)

                    // console.log("randStation", randStation);
                    // console.log("factory_id", factory_id);
                    // console.log("product_name", product_name);
                    // console.log("product_code", product_code);
                    // console.log("part_name", part_name);
                    // console.log("part_code", part_code);
                    // console.log("station_id", station_id);
                    // console.log("machine_name", machine_name);
                    // console.log("used_machine", used_machine);
                    // console.log("workloads", workloads);
                    // console.log("estimate_start", estimate_start);
                    // console.log("estimate_end", estimate_end);

                    const result = await db.query(
                        `INSERT INTO mes.orders (
                            identifier,
                            factory_id,
                            station_id,
                            station_name,
                            order_number,
                            customer_name,
                            product_name,
                            product_code,
                            part_name,
                            part_code,
                            quantity,
                            delivery_date,
                            used_machine,
                            total_length,
                            stripping_front,
                            stripping_rear,
                            stripping_half_front,
                            stripping_half_rear,
                            diameter_core,
                            setting_pieces,
                            current_pieces,
                            status,
                            created_by
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                        RETURNING *`,
                        [uuid, factory_id, station_id, station_name, order_number, customer_name, product_name, product_code, part_name, part_code, quantity, formattedDateOnly(delivery_date), used_machine, total_length, stripping_front, stripping_rear, stripping_half_front, stripping_half_rear, diameter_core, setting_pieces, current_pieces, status, created_by]
                    );

                    if (result.rowCount && result.rowCount > 0) {
                        const payload = {
                            api: "ADD_ORDER",
                            resultCode: "00",
                            resultDesc: "Successfully Insert Order",
                            user_id: created_by
                        }
                        insertUserLog(payload)
                        res.status(200).json({ message: 'Successfully Insert Order', data: result.rows[0] });

                    } else {
                        const payload = {
                            api: "ADD_ORDER",
                            resultCode: "09",
                            resultDesc: "Failed to Insert Order",
                            user_id: created_by
                        }
                        insertUserLog(payload)
                        res.status(500).json({ message: 'Failed to Insert Order' });
                    }

                } else {
                    const payload = {
                        api: "ADD_ORDER",
                        resultCode: "10",
                        resultDesc: "The Station Has Not Created Yet",
                        user_id: created_by
                    }
                    insertUserLog(payload)
                    res.status(403).json({ message: 'The Station Has Not Created Yet' });
                }


            } else {
                res.status(500).json({ message: 'The User Has Not Factory Yet' });
            }

        } catch (error) {
            const payload = {
                api: "ADD_ORDER",
                resultCode: "99",
                resultDesc: "Error Catch Add Order : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to Insert Order' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
