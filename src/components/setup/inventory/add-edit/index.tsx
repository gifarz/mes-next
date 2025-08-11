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
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { DialogInventoryProps } from "../../../../../types/setup/inventory"

export default function AddEditInventory({ isEdit, inventoryData, open, onOpenChange }: DialogInventoryProps) {
    const [name, setName] = useState<string>("")
    const [code, setCode] = useState<string>("")
    const [cost, setCost] = useState<string>("")
    const [quantity, setQuantity] = useState<string>("")

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

    useEffect(() => {
        if (inventoryData) {
            setName(inventoryData.name);
            setCode(inventoryData.code);
            setCost(inventoryData.cost);
            setQuantity(inventoryData.quantity);
        } else {
            setName("");
            setCode("");
            setCost("");
            setQuantity("");
        }
    }, [inventoryData, open]); // Also reset fields when dialog opens

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        const payload = {
            name,
            code,
            cost,
            quantity,
        }

        if (isEdit) {
            const body = {
                ...payload,
                identifier: inventoryData?.identifier
            }
            const res = await fetch("/api/patcher/updateInventoryByIdentifier", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success("The Inventory Updated Successfully!")
                onOpenChange(false)
                setIsSubmitted(false)
            } else {
                toast.error("Failed to Update Inventory!")
                setIsSubmitted(false)
            }

        } else {
            const res = await fetch("/api/insert/addInventory", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success("The Inventory Added Successfully!")
                onOpenChange(false)
                setIsSubmitted(false)
            } else {
                toast.error("Failed to Add Inventory!")
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
                                isEdit ? "Edit Inventory" : "Add Inventory"
                            }
                        </DialogTitle>
                        <DialogDescription>
                            {
                                isEdit ? "Please complete this form to edit the inventory" : "Please complete this form to add the inventory"
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Inventory Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Name</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter Inventory Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Code</label>
                                <Input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Enter Code"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Cost</label>
                                <Input
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    type="number"
                                    min={0}
                                    placeholder="Enter Cost"
                                />
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
                                    <Spinner className="border-white dark:border-black" />
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
