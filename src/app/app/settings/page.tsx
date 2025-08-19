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
import { Account, ChangePassword } from '../../../../types/settings/account'

export default function Settings() {
    const [account, setAccount] = React.useState<Account | null>(null)
    const [isUpdated, setIsUpdated] = React.useState(false)
    const [isEditing, setIsEditing] = React.useState(false)
    const [isChanging, setIsChanging] = React.useState(false)
    const [updatePassword, setUpdatePassword] = React.useState<ChangePassword>({
        newPassword: "",
        newPasswordConfirmation: "",
    })

    const user_id = useUserStore((state) => state.user_id)

    React.useEffect(() => {
        const fetcher = async () => {
            const result = await fetch("/api/getter/getAccountByUserId", {
                method: "POST",
                body: JSON.stringify(user_id),
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const res = await result.json()
            setAccount(res.data)
        }

        if (user_id) fetcher()
    }, [user_id])

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

        setIsUpdated(true)
        try {
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
        setIsUpdated(false)
    };

    const handleUpdatePassword = async () => {
        if (!updatePassword) return;

        if (updatePassword.newPassword === updatePassword.newPasswordConfirmation) {
            setIsUpdated(true)
            try {
                const result = await fetch("/api/patcher/updatePasswordByEmail", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: account?.user_id,
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

            setIsUpdated(false)
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
                            <label className="text-sm">User ID</label>
                            {account ? (
                                <Input
                                    name="user_id"
                                    value={account.user_id}
                                    disabled
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
