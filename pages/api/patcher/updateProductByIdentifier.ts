import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            productName,
            productSkuCode,
            productCost,
            productDescription,
            partName,
            partSkuCode,
            partDependency,
            partRawMaterial,
            partRawMaterialQuantity,
            processNumber,
            processCycleTime,
            processSetupTime,
            identifier
        } = req.body;

        try {
            const result = await db.query(
                `UPDATE mes.products SET name = $1, sku_code = $2, cost = $3, description = $4, part_name = $5, part_sku_code = $6, part_dependecy = $7, part_material = $8, part_material_quantity = $9, process_number = $10, process_cycle_time = $11, process_setup_time = $12,
                WHERE identifier = $13 RETURNING *`,
                [productName, productSkuCode, productCost, productDescription, partName, partSkuCode, partDependency, partRawMaterial, partRawMaterialQuantity, processNumber, processCycleTime, processSetupTime, identifier]
            );

            console.log(result.rows)

            if (result.rowCount && result.rows.length > 0) {
                res.status(200).json({ message: 'Product Updated', data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'Product Not Found or No Changes Applied' });
            }
        } catch (error) {
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Product' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}