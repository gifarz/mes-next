export interface Customer {
    identifier: string
    factory_id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string
    address: string
    created_on: string
}

export type DialogCustomerProps = {
    isEdit: boolean
    customerData?: Customer
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export type DataCustomerProps = {
    data: Customer[]
    onCustomerUpdated?: () => void
    onDelete?: (customer: Customer) => void
}