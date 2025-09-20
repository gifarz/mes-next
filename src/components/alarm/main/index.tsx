"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import AlarmDataTable from "../table"
import { formattedDate } from "@/lib/dateUtils"
import AddEditAlarm from "../add-edit"
import { useI18n } from "@/components/i18n/provider"
import { useUserStore } from "../../../../store/userStore"
import { Alarm } from "../../../../types/alarm"

export default function AlarmCard() {
    const [listAlarm, setListAlarm] = useState<Alarm[]>([])
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const [isFetched, setIsFetched] = useState<boolean>(false)

    const user_id = useUserStore((state) => state.user_id)
    const { t } = useI18n();

    useEffect(() => {

        const fetcher = async () => {
            const res = await fetch("/api/getter/getAllAlarms", {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const dataAlarm = await res.json()

            const fixedResponse = Array.isArray(dataAlarm?.data)
                ? dataAlarm.data
                : []

            setListAlarm(fixedResponse)
            setIsFetched(true)
        }

        fetcher()

    }, [user_id, openDialog, refreshKey])

    return (
        <>
            <Toaster position="top-right" />
            <AddEditAlarm
                isEdit={false}
                open={openDialog}
                onOpenChange={setOpenDialog}
            />

            <div className="flex flex-col min-h-screen min-w-full gap-4">
                <div className="w-full max-h-full rounded">
                    <div className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold">
                            {t("alarmManagement")}
                        </h2>
                        <div className="flex gap-2 ml-auto">
                            <Input
                                type="text"
                                placeholder={t("searchAlarm")}
                            />
                            <Button
                                className="cursor-pointer"
                                onClick={() => setOpenDialog(true)}
                            >
                                {t("addAlarm")}
                            </Button>
                        </div>
                    </div>
                </div>

                <AlarmDataTable
                    data={listAlarm}
                    onAlarmUpdated={() => setRefreshKey((prev) => prev + 1)} // 👈 Refetch trigger
                />
            </div>
        </>
    )
}
