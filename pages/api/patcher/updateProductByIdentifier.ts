import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            productName,
            productCode,
            productDescription,
            partName,
            partCode,
            partRawMaterial,
            partRawMaterialQuantity,
            identifier
        } = req.body;

        try {
            const result = await db.query(
                `UPDATE mes.products SET name = $1, code = $2, description = $3, part_name = $4, part_code = $5, part_material = $6, part_material_quantity = $7 WHERE identifier = $8 RETURNING *`,
                [productName, productCode, productDescription, partName, partCode, partRawMaterial, partRawMaterialQuantity, identifier]
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