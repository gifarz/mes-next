"use client"

import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUserStore } from '../../../../store/userStore'
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from '@/components/ui/spinner'

interface Account {
    name: string
    email: string
    phone: string
    company: string
}

interface ChangePassword {
    newPassword: string
    newPasswordConfirmation: string
}

export default function Settings() {
    const [account, setAccount] = React.useState<Account | null>(null)
    const [isUpdated, setIsUpdated] = React.useState(false)
    const [isEditing, setIsEditing] = React.useState(false)
    const [isChanging, setIsChanging] = React.useState(false)
    const [updatePassword, setUpdatePassword] = React.useState<ChangePassword>({
        newPassword: "",
        newPasswordConfirmation: "",
    })

    const email = useUserStore((state) => state.email)

    React.useEffect(() => {
        const getAccountByEmail = async () => {
            const result = await fetch("/api/getter/getAccountByEmail", {
                method: "POST",
                body: JSON.stringify(email),
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const res = await result.json()
            setAccount(res.data)
        }

        if (email) getAccountByEmail()
    }, [email])

    const handleChangeAccount = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setAccount((prev) => prev ? { ...prev, [name]: value } : prev)
    }

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUpdatePassword((prev) => prev ? { ...prev, [name]: value } : prev)
    }

    const handleUpdateAccount = async () => {
        if (!account) return;

        try {
            setIsUpdated(true)
            const result = await fetch("/api/patcher/updateAccountByEmail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(account),
            });

            const res = await result.json();
            if (result.ok) {
                toast.success("Profile Updated Successfully!")
                setIsEditing(false);
            } else {
                toast.error(res.message || "Failed to Update Profile")
            }
        } catch (err) {
            console.error("An Error Occurred", err)
            toast.error("An Error Occurred While Updating Profile.")
        }
    };

    const handleUpdatePassword = async () => {
        if (!updatePassword) return;

        if (updatePassword.newPassword === updatePassword.newPasswordConfirmation) {
            try {
                setIsUpdated(true)
                const result = await fetch("/api/patcher/updatePasswordByEmail", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: account?.email,
                        newPassword: updatePassword.newPasswordConfirmation
                    }),
                });

                const res = await result.json();
                if (result.ok) {
                    toast.success("Password Updated Successfully!")
                    setIsChanging(false);
                } else {
                    toast.error(res.message || "Failed to Update Password")
                }
            } catch (err) {
                console.error("An Error Occurred", err)
                toast.error("An Error Occurred While Updating Password.")
            }
        } else {
            toast.error("Password Confirmation Does Not Match!")
        }

    };

    return (
        <div className="flex justify-center mt-5">
            <Toaster position="bottom-right" />
            <Card className="min-w-full min-h-[calc(100vh-90px)]">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>ACCOUNT SETTING</CardTitle>

                    <div className="flex gap-2 ml-auto">
                        <Button
                            variant={`${isEditing ? 'destructive' : 'default'}`}
                            onClick={() => setIsEditing(!isEditing)}
                            disabled={isChanging}
                        >
                            {isEditing ? "Cancel Update" : "Update Profile"}
                        </Button>
                        <Button
                            variant={`${isChanging ? 'destructive' : 'default'}`}
                            onClick={() => setIsChanging(!isChanging)}
                            disabled={isEditing}
                        >
                            {isChanging ? "Cancel Update" : "Change Password"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {/* NAME */}
                        <div>
                            <label className="text-sm">Name</label>
                            {account ? (
                                <Input
                                    name="name"
                                    value={account.name}
                                    onChange={handleChangeAccount}
                                    disabled={!isEditing}
                                />
                            ) : (
                                <Skeleton className="h-10 w-full rounded-md" />
                            )}
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="text-sm">Email</label>
                            {account ? (
                                <Input
                                    name="email"
                                    value={account.email}
                                    disabled
                                />
                            ) : (
                                <Skeleton className="h-10 w-full rounded-md" />
                            )}
                        </div>

                        {/* PHONE */}
                        <div>
                            <label className="text-sm">Phone</label>
                            {account ? (
                                <Input
                                    name="phone"
                                    value={account.phone}
                                    onChange={handleChangeAccount}
                                    disabled={!isEditing}
                                />
                            ) : (
                                <Skeleton className="h-10 w-full rounded-md" />
                            )}
                        </div>

                        {/* COMPANY */}
                        <div>
                            <label className="text-sm">Company</label>
                            {account ? (
                                <Input
                                    name="company"
                                    value={account.company}
                                    onChange={handleChangeAccount}
                                    disabled={!isEditing}
                                />
                            ) : (
                                <Skeleton className="h-10 w-full rounded-md" />
                            )}
                        </div>
                        {
                            isChanging &&
                            <>
                                <div>
                                    <label className="text-sm">New Password</label>
                                    <Input
                                        name="newPassword"
                                        value={updatePassword.newPassword}
                                        onChange={handleChangePassword}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm">New Confirmation Password</label>
                                    <Input
                                        name="newPasswordConfirmation"
                                        value={updatePassword.newPasswordConfirmation}
                                        onChange={handleChangePassword}
                                    />
                                </div>
                            </>
                        }
                    </div>
                    {isEditing && (
                        <Button className="mt-5 w-full" onClick={handleUpdateAccount}>
                            {isUpdated ? (
                                <>
                                    <Spinner />
                                    <span className="ml-0">Submitting</span>
                                </>
                            ) : (
                                "Update Profile"
                            )}
                        </Button>
                    )}
                    {isChanging && (
                        <Button className="mt-5 w-full" onClick={handleUpdatePassword}>
                            {isUpdated ? (
                                <>
                                    <Spinner />
                                    <span className="ml-0">Submitting</span>
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div >
    )
}
