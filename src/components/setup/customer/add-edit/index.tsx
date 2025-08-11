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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { DialogCustomerProps } from "../../../../../types/setup/customer"
import { Spinner } from "@/components/ui/spinner"

export default function AddEditCustomer({ isEdit, customerData, open, onOpenChange }: DialogCustomerProps) {
    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [phoneNumber, setPhoneNumber] = useState<string>("")
    const [address, setAddress] = useState<string>("")

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

    useEffect(() => {
        if (customerData) {
            setFirstName(customerData.first_name.toString());
            setLastName(customerData.last_name.toString());
            setEmail(customerData.email.toString());
            setPhoneNumber(customerData.phone_number);
            setAddress(customerData.address);
        } else {
            setFirstName("");
            setLastName("");
            setEmail("");
            setPhoneNumber("");
            setAddress("");
        }
    }, [customerData, open]); // Also reset fields when dialog opens

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        const payload = {
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
        }

        if (isEdit) {
            const body = {
                ...payload,
                identifier: customerData?.identifier
            }

            const res = await fetch("/api/patcher/updateCustomerByIdentifier", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success("The Customer Updated Successfully!")
                onOpenChange(false)
                setIsSubmitted(false)
            } else {
                toast.error("Failed to Update Customer!")
                setIsSubmitted(false)
            }

        } else {
            const res = await fetch("/api/insert/addCustomer", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success("The Customer Added Successfully!")
                setIsSubmitted(false)
                onOpenChange(false)
            } else {
                toast.error("Failed to Add Customer!")
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
                                isEdit ? "Edit Customer" : "Add Customer"
                            }
                        </DialogTitle>
                        <DialogDescription>
                            {
                                isEdit ? "Please complete this form to edit the customer" : "Please complete this form to add the customer"
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Customer Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">First Name</label>
                                <Input
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter First Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Last Name</label>
                                <Input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter Last Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter Email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Phone Number</label>
                                <Input
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    type="number"
                                    min={0}
                                    placeholder="Enter Phone Number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Address</label>
                                <Textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter Address"
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
