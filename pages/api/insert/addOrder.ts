import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { generateUUID } from '@/lib/uuidGenerator';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';
import { adjustDayWithTime, formattedDateOnly, workloadsTime } from '@/lib/dateUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            order_number,
            customer_name,
            product_id,
            product_name,
            quantity,
            assy_group,
            part,
            no_mode,
            total_length,
            stripping_front,
            stripping_rear,
            half_strip_front,
            half_strip_end,
            insulation_front,
            insulation_back,
            core_diameter,
            blade_move_back,
            depth_of_blade,
            length_of_mb,
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

                // Get the station id for table orders
                const dataStation = await db.query(
                    `SELECT * FROM mes.stations WHERE name = $1`,
                    [dataProduct.rows[0].process_number]
                );

                const factory_id = getFactoryByEmail.rows[0].identifier
                const product_part = dataProduct.rows[0].part_name
                const product_sku = dataProduct.rows[0].sku_code
                const station_id = dataStation.rows[0].identifier
                const station_name = dataStation.rows[0].name
                const machine_name = dataStation.rows[0].machine_name.split(',')
                const used_machine = machine_name.length
                const total_item_in_hour = await Promise.all(
                    machine_name.map(async (machine: string) => {
                        const machines = await db.query(
                            `SELECT capacity FROM mes.machines WHERE name = $1`,
                            [machine.trim()]
                        );
                        return Number(machines.rows[0]?.capacity || 0);
                    })
                ).then(capacities => capacities.reduce((sum, cap) => sum + cap, 0));
                const workloads = workloadsTime(Number(total_item_in_hour), Number(quantity))
                const operation_start = getFactoryByEmail.rows[0].operation_start
                const estimate_start = adjustDayWithTime(new Date(), 1, operation_start + ":00")
                const estimate_end = adjustDayWithTime(new Date(), 1, operation_start + ":00", workloads)

                // console.log("factory_id", factory_id);
                // console.log("product_name", product_name);
                // console.log("product_part", product_part);
                // console.log("product_sku", product_sku);
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
                        product_part,
                        product_sku,
                        quantity,
                        delivery_date,
                        used_machine,
                        workloads,
                        estimate_start,
                        estimate_end,
                        assy_group,
                        part,
                        no_mode,
                        total_length,
                        stripping_front,
                        stripping_rear,
                        half_strip_front,
                        half_strip_end,
                        insulation_front,
                        insulation_back,
                        core_diameter,
                        blade_move_back,
                        depth_of_blade,
                        length_of_mb,
                        status,
                        created_by
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
                    RETURNING *`,
                    [uuid, factory_id, station_id, station_name, order_number, customer_name, product_name, product_part, product_sku, quantity, formattedDateOnly(delivery_date), used_machine, workloads, estimate_start, estimate_end, assy_group, part, no_mode, total_length, stripping_front, stripping_rear, half_strip_front, half_strip_end, insulation_front, insulation_back, core_diameter, blade_move_back, depth_of_blade, length_of_mb, status, created_by]
                );

                if (result.rowCount && result.rowCount > 0) {
                    res.status(200).json({ message: 'Successfully Insert Order', data: result.rows[0] });
                } else {
                    res.status(500).json({ message: 'Failed to Insert Order' });
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
