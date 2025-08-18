"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { Order } from "../../../../types/plan/order"
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Product } from "../../../../types/setup/product";
import { Customer } from "../../../../types/setup/customer";
import { formattedDateOnly } from "@/lib/dateUtils";

type EditOrderTablePropd = {
    orderData: Order
    listProducts: Product[]
    listCustomers: Customer[]
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOrderUpdated?: () => void
}

export default function EditOrderTable(
    { orderData, listProducts, listCustomers, open, onOpenChange, onOrderUpdated }: EditOrderTablePropd
) {

    const [customerName, setCustomerName] = useState<string>("");
    const [product, setProduct] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("");
    const [part, setPart] = useState<string>("");
    const [partCode, setPartCode] = useState<string>("");
    const [productCode, setProductCode] = useState<string>("");
    const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const [openDate, setOpenDate] = useState<boolean>(false)

    useEffect(() => {
        if (!orderData) return

        setCustomerName(orderData.customer_name || "")
        setProduct(orderData.product_name || "")
        setProductCode(orderData.product_code || "")
        setPart(orderData.part_name || "")
        setPartCode(orderData.part_code || "")
        setQuantity(orderData.quantity || "")
        setDeliveryDate(new Date(orderData.delivery_date) || undefined)

    }, [orderData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        const payload = {
            customerName,
            product,
            productCode,
            quantity,
            part,
            partCode,
        }

        const res = await fetch("/api/patcher/updateOrderByIdentifier", {
            method: "POST",
            body: JSON.stringify({
                ...payload,
                deliveryDate: deliveryDate && formattedDateOnly(deliveryDate.toISOString()),
                identifier: orderData.identifier
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            toast.success("The Customer Updated Successfully!")
            onOrderUpdated?.()
            onOpenChange(false)
        } else {
            toast.error("Failed to Update Customer!")
        }

        setIsSubmitted(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form>
                <DialogContent className="min-w-full min-h-screen max-h-[100vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Edit Order
                        </DialogTitle>
                        <DialogDescription>
                            Please complete this form to edit the order
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <h2 className="text-2xl font-semibold mb-10 text-center">Order Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Order Number</label>
                                <Input
                                    value={orderData.order_number}
                                    placeholder="Enter Order Number"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Customer Name</label>
                                <Select value={customerName} onValueChange={setCustomerName}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listCustomers.length === 0 ?
                                            <p className="p-2 text-sm text-gray-500">No customer available</p>
                                            :
                                            listCustomers.map((customer) => (
                                                <SelectItem
                                                    value={customer.first_name + ' ' + customer.last_name}
                                                    key={customer.identifier}
                                                >
                                                    {customer.first_name + ' ' + customer.last_name}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Product Name</label>
                                <Select
                                    value={product}
                                    onValueChange={(name) => {
                                        const selectedProduct = listProducts.find(p => p.name === name);

                                        if (selectedProduct) {
                                            setProduct(selectedProduct.name);
                                            setProductCode(selectedProduct.code);
                                            setPart(selectedProduct.part_name);
                                            setPartCode(selectedProduct.part_code)
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            listProducts.length === 0 ?
                                                <p className="p-2 text-sm text-gray-500">No product available</p>
                                                :
                                                listProducts.map((product) => (
                                                    <SelectItem
                                                        value={product.name}
                                                        key={product.identifier}
                                                    >
                                                        {product.name}
                                                    </SelectItem>
                                                ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Quantity</label>
                                <Input
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    type="number"
                                    min={0}
                                    placeholder="Enter Quantity"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Delivery Date</label>
                                <Popover open={openDate} onOpenChange={setOpenDate}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-full justify-between font-normal"
                                        >
                                            {deliveryDate ? deliveryDate.toLocaleDateString() : "Select date"}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={deliveryDate}
                                            captionLayout="dropdown"
                                            onSelect={(date) => {
                                                setDeliveryDate(date)
                                                setOpenDate(false)
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="cursor-pointer"
                            type="submit"
                            onClick={handleSubmit}
                        >
                            {isSubmitted ? (
                                <>
                                    <Spinner />
                                    <span className="ml-0">Submitting</span>
                                </>
                            ) :
                                "Submit"
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
