"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const steps = [
    { title: "Product Information" },
    { title: "Parts & Process" },
    { title: "Summary" },
]

export default function AddProduct() {
    const [step, setStep] = useState(0)
    const [productName, setProductName] = useState<string>("")
    const [productSkuCode, setProductSkuCode] = useState<string>("")
    const [productCost, setProductCost] = useState<string>("")
    const [productDescription, setProductDescription] = useState<string>("")
    const [partName, setPartName] = useState<string>("")
    const [partSkuCode, setPartSkuCode] = useState<string>("")
    const [partDependency, setPartDependency] = useState<string>("")
    const [partRawMaterial, setPartRawMaterial] = useState<string>("")
    const [partRawMaterialQuantity, setPartRawMaterialQuantity] = useState<string>("")
    const [processNumber, setProcessNumber] = useState<string>("")
    const [processCycleTime, setProcessCycleTime] = useState<string>("")
    const [processSetupTime, setprocessSetupTime] = useState<string>("")

    const nextStep = () => {
        if (step < steps.length - 1) setStep(step + 1)
        console.log('productName', productName)
        console.log('productSkuCode', productSkuCode)
        console.log('productCost', productCost)
        console.log('productDescription', productDescription)
        console.log('partName', partName)
        console.log('partSkuCode', partSkuCode)
        console.log('partDependency', partDependency)
        console.log('partRawMaterial', partRawMaterial)
        console.log('partRawMaterialQuantity', partRawMaterialQuantity)
        console.log('processNumber', processNumber)
        console.log('processCycleTime', processCycleTime)
        console.log('processSetupTime', processSetupTime)
    }

    const prevStep = () => {
        if (step > 0) setStep(step - 1)
    }

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button className="cursor-pointer" variant="default">Add Product</Button>
                </DialogTrigger>
                <DialogContent className="min-w-full min-h-screen max-h-[100vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Product</DialogTitle>
                        <DialogDescription>
                            Please complete this form to add the product
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
                                        <label className="block text-sm font-medium">SKU code*</label>
                                        <Input
                                            value={productSkuCode}
                                            onChange={(e) => setProductSkuCode(e.target.value)}
                                            placeholder="Enter SKU"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Cost</label>
                                        <Input
                                            value={productCost}
                                            onChange={(e) => setProductCost(e.target.value)}
                                            type="number"
                                            placeholder="Enter Cost"
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
                                        <label className="block text-sm font-medium">Name</label>
                                        <Input
                                            value={partName}
                                            onChange={(e) => setPartName(e.target.value)}
                                            placeholder="Enter Part Name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">SKU Code</label>
                                        <Input
                                            value={partSkuCode}
                                            onChange={(e) => setPartSkuCode(e.target.value)}
                                            placeholder="Enter SKU"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Part Dependency</label>
                                        <Input
                                            value={partDependency}
                                            onChange={(e) => setPartDependency(e.target.value)}
                                            type="number"
                                            placeholder="Enter Cost"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="machineType">Raw Material</Label>
                                        <Select value={partRawMaterial} onValueChange={setPartRawMaterial}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Raw Material" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Type A">Type A</SelectItem>
                                                <SelectItem value="Type B">Type B</SelectItem>
                                                <SelectItem value="Type C">Type C</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Raw Material Quantity</label>
                                        <Input
                                            value={partRawMaterialQuantity}
                                            onChange={(e) => setPartRawMaterialQuantity(e.target.value)}
                                            type="number"
                                            placeholder="Enter Quantity"
                                        />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-semibold mb-4 mt-10">Part Process</h2>
                                <div className="space-y-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium">Process Number</label>
                                        <Input
                                            value={processNumber}
                                            onChange={(e) => setProcessNumber(e.target.value)}
                                            placeholder="Enter Process Number"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Process Cycle Time (second)</label>
                                        <Input
                                            value={processCycleTime}
                                            onChange={(e) => setProcessCycleTime(e.target.value)}
                                            placeholder="Enter Cycle Time"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Process Setup Time (second)</label>
                                        <Input
                                            value={processSetupTime}
                                            onChange={(e) => setprocessSetupTime(e.target.value)}
                                            type="number"
                                            placeholder="Enter Setup Time"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Product Summary</h2>
                                <div className="grid md:grid-cols-2">

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
                            disabled={!productName || !productSkuCode || !productCost || !productDescription || !partName || !partSkuCode || !partDependency || !partRawMaterial || !partRawMaterialQuantity || !processNumber || !processCycleTime || !processSetupTime}
                            className="cursor-pointer"
                            type="submit"
                        >
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
