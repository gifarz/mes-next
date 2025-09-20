'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useI18n } from '@/components/i18n/provider'
import { Alarm, DataAlarmProps } from '../../../../types/alarm'
import AddEditAlarm from '../add-edit'
import CloseAlarm from '../close-alarm'

type SortKey = keyof Alarm
type SortRule = {
    key: SortKey
    order: 'asc' | 'desc'
}

const columns = [
    { key: 'open_date', label: 'OPEN DATE' },
    { key: 'alarm', label: 'ALARM' },
    { key: 'open_by', label: 'OPEN BY' },
    { key: 'status', label: 'STATUS' },
    { key: 'closed_by', label: 'CLOSED BY' },
    { key: 'closed_date', label: 'CLOSED DATE' },
    { key: 'note', label: 'NOTE' },
    { key: 'action', label: 'ACTION' },
] as const

export default function AlarmDataTable({ data, onAlarmUpdated }: DataAlarmProps) {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [closeAlarm, setCloseAlarm] = useState<boolean>(false);
    const [AlarmData, setAlarmData] = useState<Alarm>();
    const { t } = useI18n();

    const [sortRules, setSortRules] = useState<SortRule[]>([
        { key: 'open_date', order: 'asc' },
        { key: 'open_by', order: 'asc' },
    ])

    const sortedData = [...data].sort((a, b) => {
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

    const handleDelete = async (alarm: Alarm) => {
        const payload = {
            identifier: alarm.id
        }
        await fetch("/api/remover/deleteAlarmById", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            },
        });
        onAlarmUpdated?.()
    }

    return (
        <div>
            <AddEditAlarm
                isEdit={true}
                alarmData={AlarmData}
                open={openDialog}
                onOpenChange={(open) => {
                    setOpenDialog(open)
                    if (!open) {
                        onAlarmUpdated?.() // 👈 Trigger refresh on close
                    }
                }}
            />
            <CloseAlarm
                alarmData={AlarmData}
                open={closeAlarm}
                onOpenChange={(open) => {
                    setCloseAlarm(open)
                    if (!open) {
                        onAlarmUpdated?.() // 👈 Trigger refresh on close
                    }
                }}
            />
            <Table className='mt-10'>
                <TableHeader>
                    <TableRow>
                        {columns.map(({ key }) => (
                            <TableHead key={key} className="text-center">
                                {key === 'action' ? (
                                    <span className="font-semibold">{t(key)}</span>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort(key as SortKey)}
                                        className="font-semibold"
                                    >
                                        {t(key).toUpperCase()}
                                        <SortIcon column={key as SortKey} />
                                    </Button>
                                )}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        sortedData.length === 0 ?
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                                    {t("noData")}
                                </TableCell>
                            </TableRow>
                            :
                            sortedData.map((alarm) => (
                                <TableRow key={alarm.id} className="text-center">
                                    {columns.map(({ key }) => (
                                        <TableCell key={key}>
                                            {key === 'action' ? (
                                                <div className="flex justify-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <span className="sr-only">Open menu</span>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M6 12h.01M12 12h.01M18 12h.01"
                                                                    />
                                                                </svg>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                className='cursor-pointer'
                                                                onClick={() => {
                                                                    setOpenDialog(true)
                                                                    setAlarmData(alarm)
                                                                }}
                                                            >
                                                                {t("edit").toUpperCase()}
                                                            </DropdownMenuItem>
                                                            {alarm.status === "Open" && (
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer"
                                                                    onClick={() => {
                                                                        setCloseAlarm(true);
                                                                        setAlarmData(alarm);
                                                                    }}
                                                                >
                                                                    {t("closeAlarm").toUpperCase()}
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(alarm)}
                                                                className="cursor-pointer text-red-500 focus:text-red-600"
                                                            >
                                                                {t("delete").toUpperCase()}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            ) : (
                                                alarm[key] ?? "NULL"
                                            )}
                                        </TableCell>

                                    ))}
                                </TableRow>
                            ))}
                </TableBody>
            </Table>
        </div>
    )
}
