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

export default function AddInventory() {
    const [name, setName] = useState<string>("")
    const [code, setCode] = useState<string>("")
    const [cost, setCost] = useState<string>("")
    const [quantity, setQuantity] = useState<string>("")

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button className="cursor-pointer" variant="default">Add Inventory</Button>
                </DialogTrigger>
                <DialogContent className="min-w-full min-h-screen max-h-[100vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Inventory</DialogTitle>
                        <DialogDescription>
                            Please complete this form to add the inventory
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
                                    placeholder="Enter Cost"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Quantity</label>
                                <Input
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    type="number"
                                    placeholder="Enter Quantity"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
