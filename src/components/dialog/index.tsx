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

interface DialogComponentProps {
    title: string
    description: string
    onClickYes: () => void
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function DialogComponent({ title, description, open, onOpenChange, onClickYes }: DialogComponentProps) {
    console.log('dialog called')
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
                        <Button className="cursor-pointer" variant="outline">No</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={onClickYes}
                    >
                        Yes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
