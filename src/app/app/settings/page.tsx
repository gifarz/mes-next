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
import { useI18n } from '@/components/i18n/provider'

export default function SettingsPage() {
    const [account, setAccount] = React.useState<Account | null>(null)
    const [isUpdated, setIsUpdated] = React.useState(false)
    const [isEditing, setIsEditing] = React.useState(false)
    const [isChanging, setIsChanging] = React.useState(false)
    const [updatePassword, setUpdatePassword] = React.useState<ChangePassword>({
        newPassword: "",
        newPasswordConfirmation: "",
    })

    const user_id = useUserStore((state) => state.user_id)
    const { t } = useI18n();

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
                toast.success(t("profileUpdated"))
                setIsEditing(false);
            } else {
                toast.error(res.message || t("passwordUpdateError"))
            }
        } catch (err) {
            console.error("An Error Occurred", err)
            toast.error(t("passwordUpdateError"))
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
                    toast.success(t("passwordUpdated"))
                    setIsChanging(false);
                } else {
                    toast.error(res.message || t("passwordUpdateError"))
                }
            } catch (err) {
                console.error("An Error Occurred", err)
                toast.error(t("passwordUpdateError"))
            }

            setIsUpdated(false)
        } else {
            toast.error(t("passwordNotMatch"))
        }

    };

    return (
        <div className="flex justify-center mt-5">
            <Toaster position="bottom-right" />
            <Card className="min-w-full min-h-[calc(100vh-90px)]">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t("accountSetting")}</CardTitle>

                    <div className="flex gap-2 ml-auto">
                        <Button
                            variant={`${isEditing ? 'destructive' : 'default'}`}
                            onClick={() => setIsEditing(!isEditing)}
                            disabled={isChanging}
                        >
                            {isEditing ? t("cancelUpdate") : t("updateProfile")}
                        </Button>
                        <Button
                            variant={`${isChanging ? 'destructive' : 'default'}`}
                            onClick={() => setIsChanging(!isChanging)}
                            disabled={isEditing}
                        >
                            {isChanging ? t("cancelUpdate") : t("changePassword")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {/* NAME */}
                        <div>
                            <label className="text-sm">{t("name")}</label>
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
                            <label className="text-sm">{t("userId")}</label>
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
                                    <label className="text-sm">{t("newPassword")}</label>
                                    <Input
                                        name="newPassword"
                                        value={updatePassword.newPassword}
                                        onChange={handleChangePassword}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm">{t("newConfirmationPassword")}</label>
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
                                    <span className="ml-0">{t("submitting")}</span>
                                </>
                            ) : (
                                t("updateProfile")
                            )}
                        </Button>
                    )}
                    {isChanging && (
                        <Button className="mt-5 w-full" onClick={handleUpdatePassword}>
                            {isUpdated ? (
                                <>
                                    <Spinner />
                                    <span className="ml-0">{t("submitting")}</span>
                                </>
                            ) : (
                                t("updatePassword")
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div >
    )
}
