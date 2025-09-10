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
import { useI18n } from "@/components/i18n/provider";

export default function OrderCard() {
    const [orderNumber, setOrderNumber] = useState<string>("");
    const [customerName, setCustomerName] = useState<string>("");
    const [product, setProduct] = useState<string>("");
    const [productId, setProductId] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("");
    const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
    const [part, setPart] = useState<string>("");
    const [productCode, setProductCode] = useState<string>("");
    const [cost, setCost] = useState<string>("");
    const [totalLength, setTotalLength] = useState<string>("");
    const [strippingFront, setStrippingFront] = useState<string>("");
    const [strippingRear, setStrippingRear] = useState<string>("");
    const [strippingHalfFront, setStrippingHalfFront] = useState<string>("");
    const [strippingHalfRear, setStrippingHalfRear] = useState<string>("");
    const [cable, setCable] = useState<string>("");
    const [color, setColor] = useState<string>("");
    const [pinA, setPinA] = useState<string>("");
    const [pinB, setPinB] = useState<string>("");
    const [diameterCore, setDiameterCore] = useState<string>("");
    const [settingPieces, setSettingPieces] = useState<string>("");
    const [currentPieces, setCurrentPieces] = useState<string>("");

    const [listCustomers, setListCustomers] = useState<Customer[]>([]);
    const [listProducts, setListProducts] = useState<Product[]>([]);

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const [refreshKey, setRefreshKey] = useState<number>(0)
    const [open, setOpen] = useState(false)

    const user_id = useUserStore((state) => state.user_id)
    const { t } = useI18n();

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
            stripping_half_front: strippingHalfFront,
            stripping_half_rear: strippingHalfRear,
            diameter_core: diameterCore,
            setting_pieces: settingPieces,
            current_pieces: currentPieces,
            delivery_date: deliveryDate,
            status: "Waiting",
        }

        // DISABLED FOR CHECKING QUANTITY TO INVENTORY
        // const response = await fetch("/api/getter/getInventoryByName", {
        //     method: "POST",
        //     body: JSON.stringify({ name: partMaterial }),
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // });

        // const inventoryData = await response.json()

        // if (Number(inventoryData.data[0].quantity) >= Number(quantity)) {
        // } else {
        //     toast.error("The Request Quantity More Than Quantity Available in Inventory")
        //     setIsSubmitted(false)
        // }

        const res = await fetch("/api/insert/addOrder", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            toast.success(t("successOrder"))
        } else {
            toast.error(t("failOrder"))
        }
        setIsSubmitted(false)

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
            strippingHalfFront: strippingHalfFront,
            strippingHalfRear: strippingHalfRear,
            diameterCore: diameterCore,
            settingPieces: settingPieces,
            currentPieces: currentPieces,
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
                            <h2 className="text-2xl font-semibold mb-6 text-center">{t("createOrder")}</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="customer_name">{t("customerName")}</Label>
                            <Select value={customerName} onValueChange={setCustomerName}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t("customerNamePlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {listCustomers.length === 0 ?
                                        <p className="p-2 text-sm text-gray-500">{t("noData")}</p>
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
                            <Label>{t("productName")}</Label>
                            <Select
                                value={product}
                                onValueChange={(name) => {
                                    const selectedProduct = listProducts.find(p => p.name === name);

                                    if (selectedProduct) {
                                        setProductId(selectedProduct.identifier)
                                        setProduct(selectedProduct.name);
                                        setProductCode(selectedProduct.code);
                                        setPart(selectedProduct.part_name);
                                        setCost(selectedProduct.cost);
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t("productNamePlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        listProducts.length === 0 ?
                                            <p className="p-2 text-sm text-gray-500">{t("noData")}</p>
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
                            <Label>{t("quantity")}</Label>
                            <Input
                                placeholder={t("quantityPlaceholder")}
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("totalLength")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("totalLengthPlaceholder")}
                                value={totalLength}
                                onChange={(e) => setTotalLength((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("strippingFront")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("strippingFrontPlaceholder")}
                                value={strippingFront}
                                onChange={(e) => setStrippingFront((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("strippingRear")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("strippingRearPlaceholder")}
                                value={strippingRear}
                                onChange={(e) => setStrippingRear((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("strippingHalfFront")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("strippingHalfFrontPlaceholder")}
                                value={strippingHalfFront}
                                onChange={(e) => setStrippingHalfFront((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("strippingHalfRear")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("strippingHalfRearPlaceholder")}
                                value={strippingHalfRear}
                                onChange={(e) => setStrippingHalfRear((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("cable")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("cablePlaceholder")}
                                value={cable}
                                onChange={(e) => setCable((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("color")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("colorPlaceholder")}
                                value={color}
                                onChange={(e) => setColor((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("pinA")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("pinAPlaceholder")}
                                value={pinA}
                                onChange={(e) => setPinA((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("pinB")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("pinBPlaceholder")}
                                value={pinB}
                                onChange={(e) => setPinB((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("diameterCore")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("diameterCorePlaceholder")}
                                value={diameterCore}
                                onChange={(e) => setDiameterCore((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("settingPieces")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("settingPiecesPlaceholder")}
                                value={settingPieces}
                                onChange={(e) => setSettingPieces((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("currentPieces")}</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder={t("currentPiecesPlaceholder")}
                                value={currentPieces}
                                onChange={(e) => setCurrentPieces((e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t("deliveryDate")}</Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="date"
                                        className="w-full justify-between font-normal"
                                    >
                                        {deliveryDate ? deliveryDate.toLocaleDateString() : t("deliveryDatePlaceholder")}
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
                                        <span className="ml-0">{t("submitting")}</span>
                                    </>
                                ) : t("addToSchedule")
                            }
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full cursor-pointer"
                            onClick={handlePDF}
                        >
                            {t("printOrderReport")}
                        </Button>
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>
                            <h2 className="text-2xl font-semibold mb-6 text-center">{t("detailOrder")}</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 divide-y">
                            <InfoRow label={t("orderNumber")} value={orderNumber} />
                            <InfoRow label={t("customerName")} value={customerName ? customerName : "N/A"} />
                            <InfoRow label={t("productName")} value={product ? product : "N/A"} />
                            <InfoRow label={t("productCode")} value={productCode ? productCode : "N/A"} />
                            <InfoRow label={t("productPart")} value={part ? part : "N/A"} />
                            <InfoRow label={t("actualQuantity")} value={quantity ? quantity : "N/A"} />
                            <InfoRow label={t("totalLength")} value={totalLength ? totalLength : "N/A"} />
                            <InfoRow label={t("strippingFront")} value={strippingFront ? strippingFront : "N/A"} />
                            <InfoRow label={t("strippingRear")} value={strippingRear ? strippingRear : "N/A"} />
                            <InfoRow label={t("strippingHalfFront")} value={strippingHalfFront ? strippingHalfFront : "N/A"} />
                            <InfoRow label={t("strippingHalfRear")} value={strippingHalfRear ? strippingHalfRear : "N/A"} />
                            <InfoRow label={t("cable")} value={cable ? cable : "N/A"} />
                            <InfoRow label={t("color")} value={color ? color : "N/A"} />
                            <InfoRow label={t("pinA")} value={pinA ? pinA : "N/A"} />
                            <InfoRow label={t("pinB")} value={pinB ? pinB : "N/A"} />
                            <InfoRow label={t("diameterCore")} value={diameterCore ? diameterCore : "N/A"} />
                            <InfoRow label={t("settingPieces")} value={settingPieces ? settingPieces : "N/A"} />
                            <InfoRow label={t("currentPieces")} value={currentPieces ? currentPieces : "N/A"} />
                            <InfoRow
                                label={t("deliveryDate")}
                                value={deliveryDate ? formattedDateOnly(deliveryDate.toISOString()) : "N/A"}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}