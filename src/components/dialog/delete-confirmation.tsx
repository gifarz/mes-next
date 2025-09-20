import React from 'react'
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
import {
    Button
} from "@/components/ui/button"
import { useI18n } from '../i18n/provider'

interface DeleteConfirmationProps {
    title: string
    description: string
    onClickYes: () => void
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function DeleteConfirmation({ title, description, open, onOpenChange, onClickYes }: DeleteConfirmationProps) {

    const { t } = useI18n();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button className="cursor-pointer" variant="outline">
                            {t("no").toUpperCase()}
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={onClickYes}
                    >
                        {t("yes").toUpperCase()}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
