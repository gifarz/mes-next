import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { insertUserLog } from '@/lib/userLogsHelper';
import { getCookieFromServer } from '@/lib/cookie';
import { decodeJWT } from '@/lib/decodeJWT';

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

        const cookieHeader = req.headers.cookie || ""
        const token = getCookieFromServer(cookieHeader, "accessToken")
        const decodedJwt = decodeJWT(token as string)
        const created_by = decodedJwt.user_id

        try {
            const result = await db.query(
                `UPDATE mes.products SET name = $1, code = $2, description = $3, part_name = $4, part_code = $5, part_material = $6, part_material_quantity = $7 WHERE identifier = $8 RETURNING *`,
                [productName, productCode, productDescription, partName, partCode, partRawMaterial, partRawMaterialQuantity, identifier]
            );

            if (result.rowCount && result.rows.length > 0) {
                const payload = {
                    api: "UPDATE_PRODUCT",
                    resultCode: "00",
                    resultDesc: "Success",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(200).json({ message: 'Product Updated', data: result.rows[0] });
            } else {
                const payload = {
                    api: "UPDATE_PRODUCT",
                    resultCode: "18",
                    resultDesc: "Product Not Found or No Changes Applied",
                    user_id: created_by
                }
                insertUserLog(payload)
                res.status(404).json({ message: 'Product Not Found or No Changes Applied' });
            }
        } catch (error) {
            const payload = {
                api: "UPDATE_PRODUCT",
                resultCode: "99",
                resultDesc: "Error Catch Update Product : " + error,
                user_id: created_by
            }
            insertUserLog(payload)
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to Update Product' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}