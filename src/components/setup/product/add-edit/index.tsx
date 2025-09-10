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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { DialogProductProps } from "../../../../../types/setup/product"
import { Inventory } from "../../../../../types/setup/inventory"
import { Station } from "../../../../../types/setup/station"
import { useUserStore } from "../../../../../store/userStore"
import { useI18n } from "@/components/i18n/provider"
import { snakeCaseFormat } from "@/lib/formatCase"

const steps = [
    { title: "productInformation" },
    { title: "partAndProcess" },
    { title: "productSummary" },
]

export default function AddEditProduct({ isEdit, productData, open, onOpenChange }: DialogProductProps) {
    const [step, setStep] = useState(0)
    const [productName, setProductName] = useState<string>("")
    const [productCode, setProductCode] = useState<string>("")
    const [productDescription, setProductDescription] = useState<string>("")
    const [partName, setPartName] = useState<string>("")
    const [partCode, setPartCode] = useState<string>("")
    const [partRawMaterial, setPartRawMaterial] = useState<string>("")
    const [partRawMaterialQuantity, setPartRawMaterialQuantity] = useState<string>("")

    const [productId, setProductId] = useState<string>("")
    const [listInventory, setListInventory] = useState<Inventory[]>([])
    const [listStation, setListStation] = useState<Station[]>([])

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const user_id = useUserStore((state) => state.user_id)
    const { t } = useI18n();

    useEffect(() => {
        const payload = {
            user_id: user_id,
        }
        const fetcher = async () => {
            const inventory = await fetch("/api/getter/getInventoryByUserId", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const dataInventory = await inventory.json()

            const inventoryResponse = Array.isArray(dataInventory?.data) ? dataInventory.data : []

            setListInventory(inventoryResponse)

            const stations = await fetch("/api/getter/getStationsByUserId", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const dataStations = await stations.json()

            const stationResponse = Array.isArray(dataStations?.data) ? dataStations.data : []

            setListStation(stationResponse)
        }

        if (productData) {
            setProductId(productData.identifier)
            setProductName(productData.name)
            setProductCode(productData.code)
            setProductDescription(productData.description)
            setPartName(productData.part_name)
            setPartCode(productData.part_code)
            setPartRawMaterial(productData.part_material)
            setPartRawMaterialQuantity(productData.part_material_quantity)

        } else {
            setProductId("");
            setProductName("");
            setProductCode("");
            setProductDescription("");
            setPartName("");
            setPartCode("");
            setPartRawMaterial("");
            setPartRawMaterialQuantity("");
        }

        fetcher()

    }, [user_id, productData, open]); // Also reset fields when dialog opens

    const nextStep = () => {
        if (step < steps.length - 1) setStep(step + 1)
    }

    const prevStep = () => {
        if (step > 0) setStep(step - 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        const payload = {
            productName,
            productCode,
            productDescription,
            partName,
            partCode,
            partRawMaterial,
            partRawMaterialQuantity,
        }

        if (isEdit) {
            const body = {
                ...payload,
                identifier: productId
            }
            const res = await fetch("/api/patcher/updateProductByIdentifier", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success(t("successUpdateProduct"))
                onOpenChange(false)
                setIsSubmitted(false)
            } else {
                toast.error(t("failUpdateProduct"))
                setIsSubmitted(false)
            }

        } else {
            const res = await fetch("/api/insert/addProduct", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success(t("successProduct"))
                onOpenChange(false)
                setIsSubmitted(false)
            } else {
                toast.error(t("failProduct"))
                setIsSubmitted(false)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form>
                <DialogContent className="min-w-full min-h-screen max-h-[100vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {
                                isEdit ? t("editProduct") : t("addProduct")
                            }
                        </DialogTitle>
                        <DialogDescription>
                            {
                                isEdit ? t("editProductDesc") : t("addProductDesc")
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="w-full mx-auto px-2 py-8">
                        {/* Step headers */}
                        <div className="flex justify-between mb-8">
                            {steps.map((s, index) => (
                                <div key={index} className="text-center flex-1">
                                    <div
                                        className={`font-normal ${index === step ? "text-orange-500" : "text-gray-400"
                                            }`}
                                    >
                                        {index + 1} {t(s.title)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Step content */}
                        {step === 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">{t("productInformation")}</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("product_name"))}
                                        </label>
                                        <Input
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                            placeholder={t("productNamePlaceholder")}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("product_code"))}
                                        </label>
                                        <Input
                                            value={productCode}
                                            onChange={(e) => setProductCode(e.target.value)}
                                            placeholder={t("productCodePlaceholder")}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("product_desc"))}
                                        </label>
                                        <Textarea
                                            value={productDescription}
                                            onChange={(e) => setProductDescription(e.target.value)}
                                            placeholder={t("productDescriptionPlaceholder")}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">{t("partAndProcess")}</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("part_name"))}
                                        </label>
                                        <Input
                                            value={partName}
                                            onChange={(e) => setPartName(e.target.value)}
                                            placeholder={t("partNamePlaceholder")}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("part_code"))}
                                        </label>
                                        <Input
                                            value={partCode}
                                            onChange={(e) => setPartCode(e.target.value)}
                                            placeholder={t("partCodePlaceholder")}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            {snakeCaseFormat(t("raw_material"))}
                                        </Label>
                                        <Select
                                            value={partRawMaterial}
                                            onValueChange={setPartRawMaterial}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={t("rawMaterialPlaceholder")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    listInventory.length === 0 ?
                                                        <p className="p-2 text-sm text-gray-500">t{("noData")}</p>
                                                        :
                                                        listInventory.map((inventory) => (
                                                            <SelectItem
                                                                value={inventory.name}
                                                                key={inventory.identifier}
                                                            >
                                                                {inventory.name}
                                                            </SelectItem>
                                                        ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("raw_material_quantity"))}
                                        </label>
                                        <Input
                                            value={partRawMaterialQuantity}
                                            onChange={(e) => setPartRawMaterialQuantity(e.target.value)}
                                            type="number"
                                            min={0}
                                            placeholder={t("rawQuantityPlaceholder")}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 className="text-2xl font-semibold text-center mb-4">{t("productSummary")}</h2>
                                <h2 className="text-lg font-semibold mb-4">1. {t("productInformation")}</h2>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("product_name"))}
                                        </label>
                                        <Input
                                            disabled
                                            value={productName ? productName : "-"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("product_code"))}
                                        </label>
                                        <Input
                                            disabled
                                            value={productCode ? productCode : "-"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("product_desc"))}
                                        </label>
                                        <Textarea
                                            disabled
                                            value={productDescription ? productDescription : "-"}
                                        />
                                    </div>
                                </div>

                                <h2 className="text-lg font-semibold mb-4">2. {t("partAndProcess")}</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("part_name"))}
                                        </label>
                                        <Input
                                            disabled
                                            value={partName ? partName : "-"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("part_code"))}
                                        </label>
                                        <Input
                                            disabled
                                            value={partCode ? partCode : "-"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("raw_material"))}
                                        </label>
                                        <Input
                                            disabled
                                            value={partRawMaterial ? partRawMaterial : "-"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">
                                            {snakeCaseFormat(t("raw_material_quantity"))}
                                        </label>
                                        <Input
                                            disabled
                                            value={partRawMaterialQuantity ? partRawMaterialQuantity : "-"}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            <Button
                                className="cursor-pointer"
                                onClick={prevStep}
                                disabled={step === 0}
                                variant="outline"
                            >
                                {t("back")}
                            </Button>
                            <Button
                                className="cursor-pointer"
                                onClick={nextStep}
                                disabled={step === steps.length - 1}
                            >
                                {t("next")}
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="cursor-pointer" variant="outline">
                                {t("cancel").toUpperCase()}
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={!productName || !productCode || !partName || !partCode || !partRawMaterial || !partRawMaterialQuantity}
                            className="cursor-pointer"
                            type="submit"
                            onClick={handleSubmit}
                        >
                            {isSubmitted ? (
                                <>
                                    <Spinner />
                                    <span className="ml-0">{t("submitting")}</span>
                                </>
                            ) :
                                t("submit").toUpperCase()
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
