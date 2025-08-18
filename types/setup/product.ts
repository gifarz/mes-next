export interface Product {
    identifier: string
    name: string
    code: string
    cost: string
    description: string
    part_name: string
    part_code: string
    part_material: string
    part_material_quantity: string
    created_on: string
}

export type DialogProductProps = {
    isEdit: boolean
    productData?: Product
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export type DataProductProps = {
    data: Product[]
    onProductUpdated?: () => void
    onDelete?: (product: Product) => void
}
