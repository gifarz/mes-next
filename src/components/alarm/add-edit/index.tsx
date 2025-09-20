"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { useI18n } from "@/components/i18n/provider"
import { DialogAlarmProps } from "../../../../types/alarm"
import { Textarea } from "@/components/ui/textarea"
import { formattedDate } from "@/lib/dateUtils"

export default function AddEditAlarm({ isEdit, alarmData, open, onOpenChange }: DialogAlarmProps) {
    const [alarm, setAlarm] = useState<string>("")
    const [note, setNote] = useState<string>("")

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

    const { t } = useI18n();

    useEffect(() => {
        if (alarmData) {
            setAlarm(alarmData.alarm);
            setNote(alarmData.note);
        }
    }, [alarmData, open]); // Also reset fields when dialog opens

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        const payload = {
            alarm: alarm,
            open_date: formattedDate(new Date().toISOString()),
            status: "Open",
            note: note,
        }

        if (isEdit) {
            const body = {
                ...payload,
                identifier: alarmData?.id,
                closed_date: formattedDate(new Date().toISOString()),
                note: note
            }
            const res = await fetch("/api/patcher/updateAlarmById", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success(t("successUpdateAlarm"))
                onOpenChange(false)
                setIsSubmitted(false)
            } else {
                toast.error(t("failUpdateAlarm"))
                setIsSubmitted(false)
            }

        } else {
            const res = await fetch("/api/insert/addAlarm", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success(t("successAlarm"))
                onOpenChange(false)
                setIsSubmitted(false)
            } else {
                toast.error(t("failAlarm"))
                setIsSubmitted(false)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form>
                <DialogContent className="w-[50%] h-[70vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {
                                isEdit ? t("editAlarm") : t("addAlarm")
                            }
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">{t("alarmName")}</label>
                            <Input
                                value={alarm}
                                onChange={(e) => setAlarm(e.target.value)}
                                placeholder={t("alarmNamePlaceholder")}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t("note")}</label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={t("notePlaceholder")}
                            />
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
        </Dialog >
    )
}
