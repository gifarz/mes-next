"use client"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { useUserStore } from "../../../../store/userStore"
import { Notification } from "../../../../types/dashboard/notification"
import { formattedDate } from "@/lib/dateUtils"

type SortKey = keyof Notification
type SortRule = {
    key: SortKey
    order: 'asc' | 'desc'
}

const columns = [
    { key: 'created_on', label: 'CREATED_ON' },
    { key: 'type', label: 'TYPE' },
    { key: 'detail', label: 'DETAIL' },
] as const

export default function NotificationCard() {
    const [open, setOpen] = useState<boolean>(false)
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [listNotifications, setListNotifications] = useState<Notification[]>([])
    const [sortRules, setSortRules] = useState<SortRule[]>([
        { key: 'created_on', order: 'asc' },
    ])

    const user_id = useUserStore((state) => state.user_id)

    useEffect(() => {
        const payload = { user_id }
        const fetcher = async () => {
            const response = await fetch("/api/getter/getNotificationByUserId", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const dataNotification = await response.json()
            const fixedNotification = Array.isArray(dataNotification?.data) ?
                dataNotification.data.map((data: Notification) => {
                    return {
                        ...data,
                        created_on: formattedDate(data.created_on)
                    }
                })
                : []

            setListNotifications(fixedNotification)
        }

        if (user_id) fetcher()
    }, [user_id])

    const sortedData = [...listNotifications].sort((a, b) => {
        for (const rule of sortRules) {
            const valueA = a[rule.key]
            const valueB = b[rule.key]

            if (valueA === valueB) continue

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return rule.order === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA)
            }

            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return rule.order === 'asc' ? valueA - valueB : valueB - valueA
            }
        }
        return 0
    })

    const handleSort = (key: SortKey) => {
        setSortRules((prev) => {
            const existing = prev.find((rule) => rule.key === key)

            if (existing) {
                // Toggle the order
                return [
                    { key, order: existing.order === 'asc' ? 'desc' : 'asc' },
                    ...prev.filter((r) => r.key !== key),
                ]
            } else {
                // Add new rule to front
                return [{ key, order: 'asc' }, ...prev]
            }
        })
    }

    const SortIcon = ({ column }: { column: SortKey }) => {
        const rule = sortRules.find((r) => r.key === column)
        if (!rule) return null

        return rule.order === 'asc' ? (
            <ArrowUpIcon className="inline" />
        ) : (
            <ArrowDownIcon className="inline" />
        )
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold text-center">
                Notification Center
            </h2>
            <div className="flex justify-center gap-2 my-5">
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Notification Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Notification Type</SelectLabel>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date"
                            className="w-48 justify-between font-normal"
                        >
                            {date ? date.toLocaleDateString() : "Notification Date"}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                                setDate(date)
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Table className='mt-2'>
                <TableHeader>
                    <TableRow>
                        {columns.map(({ key, label }) => (
                            <TableHead key={key} className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort(key as SortKey)}
                                    className="font-semibold"
                                >
                                    {label}
                                    <SortIcon column={key as SortKey} />
                                </Button>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        sortedData.length === 0 ?
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                                    No data of notification available for now
                                </TableCell>
                            </TableRow>
                            :
                            sortedData.map((notification) => (
                                <TableRow key={notification.ai} className="text-center">
                                    {columns.map(({ key }) => (
                                        <TableCell key={key}>

                                            {notification[key]}
                                        </TableCell>

                                    ))}
                                </TableRow>
                            ))}
                </TableBody>
            </Table>
        </div>
    )
}
