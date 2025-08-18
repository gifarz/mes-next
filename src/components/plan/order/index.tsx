"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InfoRow } from "@/components/ui/info-row";
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { customizeDateString, formattedDateOnly } from "@/lib/dateUtils";
import { useUserStore } from "../../../../store/userStore";
import { Customer } from "../../../../types/setup/customer";
import { Product } from "../../../../types/setup/product";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { pdf } from "@react-pdf/renderer";
import OrderDetailPDF from "../pdf/PDFDoc";

export default function OrderCard() {
    const [orderNumber, setOrderNumber] = useState<string>("");
    const [customerName, setCustomerName] = useState<string>("");
    const [product, setProduct] = useState<string>("");
    const [productId, setProductId] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("");
    const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
    const [part, setPart] = useState<string>("");
    const [partMaterial, setPartMaterial] = useState<string>("");
    const [productCode, setProductCode] = useState<string>("");
    const [cost, setCost] = useState<string>("");
    const [totalLength, setTotalLength] = useState<string>("");
    const [strippingFront, setStrippingFront] = useState<string>("");
    const [strippingRear, setStrippingRear] = useState<string>("");

    const [listCustomers, setListCustomers] = useState<Customer[]>([]);
    const [listProducts, setListProducts] = useState<Product[]>([]);

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const [refreshKey, setRefreshKey] = useState<number>(0)
    const [open, setOpen] = useState(false)

    const user_id = useUserStore((state) => state.user_id)

    useEffect(() => {
        setOrderNumber(customizeDateString("yyyyMMddHHmmsss"))

        const fetcher = async () => {
            const resCustomer = await fetch("/api/getter/getAllCustomers", {
                method: "GET"
            });

            const dataCustomer = await resCustomer.json()
            const fixedCustomer = Array.isArray(dataCustomer?.data)
                ? dataCustomer.data : []

            setListCustomers(fixedCustomer)

            const resProduct = await fetch("/api/getter/getAllProducts", {
                method: "GET"
            });

            const dataProduct = await resProduct.json()
            const fixedProduct = Array.isArray(dataProduct?.data)
                ? dataProduct.data : []

            setListProducts(fixedProduct)
        }

        if (user_id) fetcher()
    }, [user_id, refreshKey])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        const payload = {
            order_number: orderNumber,
            customer_name: customerName,
            product_id: productId,
            product_name: product,
            quantity: quantity,
            total_length: totalLength,
            stripping_front: strippingFront,
            stripping_rear: strippingRear,
            delivery_date: deliveryDate,
            status: "Waiting",
        }

        const response = await fetch("/api/getter/getInventoryByName", {
            method: "POST",
            body: JSON.stringify({ name: partMaterial }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const inventoryData = await response.json()

        if (Number(inventoryData.data[0].quantity) >= Number(quantity)) {
            const res = await fetch("/api/insert/addOrder", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success("The Order Added Successfully!")
            } else {
                toast.error("Failed to Add Order!")
            }
            setIsSubmitted(false)
        } else {
            toast.error("The Request Quantity More Than Quantity Available in Inventory")
            setIsSubmitted(false)
        }

        setRefreshKey((prev) => prev + 1) // Trigger to generate a new orderNumber 
    }

    const handlePDF = async () => {
        const data = {
            orderNumber: orderNumber,
            customerName: customerName,
            productName: product,
            productCode: productCode,
            productPart: part,
            actualQuantity: quantity,
            totalLength: totalLength,
            strippingFront: strippingFront,
            strippingRear: strippingRear,
            orderDuration: '-',
            deliveryDate: deliveryDate ? formattedDateOnly(deliveryDate.toISOString()) : "N/A",
            cost: (Number(cost) * Number(quantity)).toString(),
        }
        const blob = await pdf(<OrderDetailPDF order={data} />).toBlob();
        const blobUrl = URL.createObjectURL(blob);

        window.open(blobUrl);
    };

    return (
        <div>
            <Toaster position="top-right" />
            <div className="flex flex-col md:flex-row gap-4">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>
                            <h2 className="text-2xl font-semibold mb-6 text-center">Create Order</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="customer_name">Customer Name</Label>
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
                            <Label>Product</Label>
                            <Select
                                value={product}
                                onValueChange={(name) => {
                                    const selectedProduct = listProducts.find(p => p.name === name);

                                    if (selectedProduct) {
                                        setProductId(selectedProduct.identifier)
                                        setProduct(selectedProduct.name);
                                        setProductCode(selectedProduct.code);
                                        setPart(selectedProduct.part_name);
                                        setPartMaterial(selectedProduct.part_material)
                                        setCost(selectedProduct.cost);
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
                            <Label>Quantity</Label>
                            <Input
                                placeholder="Input the Quantity"
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>Total Length</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="Input the Total Length"
                                value={totalLength}
                                onChange={(e) => setTotalLength((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>Stripping Front</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="Input the Stripping Front"
                                value={strippingFront}
                                onChange={(e) => setStrippingFront((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>Stripping Rear</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="Input the Stripping Rear"
                                value={strippingRear}
                                onChange={(e) => setStrippingRear((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>Delivery Date</Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="date"
                                        className="w-full justify-between font-normal"
                                    >
                                        {deliveryDate ? deliveryDate.toLocaleDateString() : "Select Delivery Date"}
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
                                            setOpen(false)
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <Button
                            disabled={!customerName || !product || !quantity || !deliveryDate || !totalLength || !strippingFront || !strippingRear}
                            className="w-full cursor-pointer"
                            variant="outline"
                            onClick={handleSubmit}
                        >
                            {
                                isSubmitted ? (
                                    <>
                                        <Spinner />
                                        <span className="ml-0">Submitting</span>
                                    </>
                                ) : "ADD TO SCHEDULE"
                            }
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full cursor-pointer"
                            onClick={handlePDF}
                        >
                            PRINT ORDER REPORT
                        </Button>
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>
                            <h2 className="text-2xl font-semibold mb-6 text-center">Detail Order</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 divide-y">
                            <InfoRow label="Order Number" value={orderNumber} />
                            <InfoRow label="Customer Name" value={customerName ? customerName : "N/A"} />
                            <InfoRow label="Production Name" value={product ? product : "N/A"} />
                            <InfoRow label="Product Code" value={productCode ? productCode : "N/A"} />
                            <InfoRow label="Product Part" value={part ? part : "N/A"} />
                            <InfoRow label="Actual Quantity" value={quantity ? quantity : "N/A"} />
                            <InfoRow label="Total Length" value={totalLength ? totalLength : "N/A"} />
                            <InfoRow label="Stripping Front" value={strippingFront ? strippingFront : "N/A"} />
                            <InfoRow label="Stripping Rear" value={strippingRear ? strippingRear : "N/A"} />
                            <InfoRow
                                label="Delivery Date"
                                value={deliveryDate ? formattedDateOnly(deliveryDate.toISOString()) : "N/A"}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
