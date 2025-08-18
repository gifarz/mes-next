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

const steps = [
    { title: "Product Information" },
    { title: "Parts & Process" },
    { title: "Summary" },
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
                toast.success("The Product Updated Successfully!")
                onOpenChange(false)
                setIsSubmitted(false)
            } else {
                toast.error("Failed to Update Product!")
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
                toast.success("The Product Added Successfully!")
                onOpenChange(false)
                setIsSubmitted(false)
            } else {
                toast.error("Failed to Add Product!")
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
                                isEdit ? "Edit Product" : "Add Product"
                            }
                        </DialogTitle>
                        <DialogDescription>
                            {
                                isEdit ? "Please complete this form to edit the product" : "Please complete this form to add the product"
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
                                        {index + 1} {s.title}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Step content */}
                        {step === 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Product Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">Product Name*</label>
                                        <Input
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                            placeholder="Enter Product Name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Product Code *</label>
                                        <Input
                                            value={productCode}
                                            onChange={(e) => setProductCode(e.target.value)}
                                            placeholder="Enter Product Code"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Description</label>
                                        <Textarea
                                            value={productDescription}
                                            onChange={(e) => setProductDescription(e.target.value)}
                                            placeholder="Enter Description"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Part Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">Part Name</label>
                                        <Input
                                            value={partName}
                                            onChange={(e) => setPartName(e.target.value)}
                                            placeholder="Enter Part Name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Part Code</label>
                                        <Input
                                            value={partCode}
                                            onChange={(e) => setPartCode(e.target.value)}
                                            placeholder="Enter Part Code"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="machineType">Raw Material</Label>
                                        <Select
                                            value={partRawMaterial}
                                            onValueChange={setPartRawMaterial}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Raw Material" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    listInventory.length === 0 ?
                                                        <p className="p-2 text-sm text-gray-500">No inventory available</p>
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
                                        <label className="block text-sm font-medium">Raw Material Quantity</label>
                                        <Input
                                            value={partRawMaterialQuantity}
                                            onChange={(e) => setPartRawMaterialQuantity(e.target.value)}
                                            type="number"
                                            min={0}
                                            placeholder="Enter Quantity"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 className="text-2xl font-semibold text-center mb-4">Product Summary</h2>
                                <h2 className="text-lg font-semibold mb-4">1. Product Information</h2>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium">Name</label>
                                        <Input
                                            disabled
                                            value={productName ? productName : "-"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Product Code</label>
                                        <Input
                                            disabled
                                            value={productCode ? productCode : "-"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Description</label>
                                        <Textarea
                                            disabled
                                            value={productDescription ? productDescription : "-"}
                                        />
                                    </div>
                                </div>

                                <h2 className="text-lg font-semibold mb-4">2. Part and Process</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Name</label>
                                        <Input
                                            disabled
                                            value={partName ? partName : "-"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Part Code</label>
                                        <Input
                                            disabled
                                            value={partCode ? partCode : "-"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Raw Material</label>
                                        <Input
                                            disabled
                                            value={partRawMaterial ? partRawMaterial : "-"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Raw Material Quantity</label>
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
                                Back
                            </Button>
                            <Button
                                className="cursor-pointer"
                                onClick={nextStep}
                                disabled={step === steps.length - 1}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="cursor-pointer" variant="outline">Cancel</Button>
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
