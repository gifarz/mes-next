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
import { useI18n } from "@/components/i18n/provider"

export default function AddEditCustomer({ isEdit, customerData, open, onOpenChange }: DialogCustomerProps) {
    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [phoneNumber, setPhoneNumber] = useState<string>("")
    const [address, setAddress] = useState<string>("")

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const { t } = useI18n();

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
                toast.success(t("successUpdateCustomer"))
                onOpenChange(false)
                setIsSubmitted(false)
            } else {
                toast.error(t("failUpdateCustomer"))
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
                toast.success(t("successCustomer"))
                setIsSubmitted(false)
                onOpenChange(false)
            } else {
                toast.error(t("failCustomer"))
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
                                isEdit ? t("editCustomer") : t("addCustomer")
                            }
                        </DialogTitle>
                        <DialogDescription>
                            {
                                isEdit ? t("editCustomerDesc") : t("addCustomerDesc")
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">{t("customerInformation")}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">{t("firstName")}</label>
                                <Input
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder={t("firstNamePlaceholder")}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t("lastName")}</label>
                                <Input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder={t("lastNamePlaceholder")}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t("email")}</label>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("emailPlaceholder")}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t("phoneNumber")}</label>
                                <Input
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    type="number"
                                    min={0}
                                    placeholder={t("phoneNumberPlaceholder")}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t("address")}</label>
                                <Textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder={t("addressPlaceholder")}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t("cancel").toUpperCase()}</Button>
                        </DialogClose>
                        <Button
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
