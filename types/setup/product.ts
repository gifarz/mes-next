export interface Product {
    identifier: string
    name: string
    sku_code: string
    cost: string
    description: string
    part_name: string
    part_sku_code: string
    part_dependency: string
    part_material: string
    part_material_quantity: string
    process_number: string
    process_cycle_time: string
    process_setup_time: string
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
