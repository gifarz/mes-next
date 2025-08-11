export interface Inventory {
    identifier: string
    factory_id: string
    name: string
    code: string
    cost: string
    quantity: string
    created_on: string
}

export type DialogInventoryProps = {
    isEdit: boolean
    inventoryData?: Inventory
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export type DataInventoryProps = {
    data: Inventory[]
    onInventoryUpdated?: () => void
    onDelete?: (inventory: Inventory) => void
}