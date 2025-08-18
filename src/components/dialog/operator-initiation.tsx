"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { Station } from "../../../types/setup/station"
import { Account } from "../../../types/settings/account"
import { useUserStore } from "../../../store/userStore"

export default function OperatorInitiation() {
    const [open, setOpen] = useState<boolean>(true) // start open
    const [operator, setOperator] = useState<string>("")
    const [listStations, setListStations] = useState<Station[]>([])
    const [listAccounts, setListAccounts] = useState<Account[]>([])
    const [foreman, setForeman] = useState<string>("")
    const [selectedShift, setSelectedShift] = useState<string>("")
    const [selectedLine, setSelectedLine] = useState<string>("")
    const [selectedStationId, setSelectedStationId] = useState<string>("")
    const [selectedLeader, setSelectedLeader] = useState<string>("")

    const name = useUserStore((state) => state.name)
    const operatorStore = useUserStore((state) => state.setOperator)

    useEffect(() => {
        if (!name) return

        setOperator(name)
        const fetcher = async () => {
            const resultStation = await fetch("/api/getter/getAllStations", {
                method: "GET"
            });

            const dataStations = await resultStation.json()
            const fixedStations = Array.isArray(dataStations?.data)
                ? dataStations.data : []

            setListStations(fixedStations)

            const resultAccounts = await fetch("/api/getter/getAllAccounts", {
                method: "GET"
            });

            const dataAccounts = await resultAccounts.json()
            const fixedAccounts = Array.isArray(dataAccounts?.data)
                ? dataAccounts.data : []

            const allowedRoles = ["Supervisor"];
            const leaderAccount = fixedAccounts.filter((acc: Account) =>
                allowedRoles.includes(acc.role)
            );

            setListAccounts(leaderAccount)
        }

        fetcher()
    }, [name])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        operatorStore({
            shift: selectedShift,
            line: selectedLine,
            station_id: selectedStationId,
            leader: selectedLeader,
            foreman: foreman
        })
        setOpen(false)
    }

    return (
        <Dialog
            open={open}
            // Prevent closing unless form submitted
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setOpen(false)
                } else {
                    setOpen(true)
                }
            }}
        >
            <DialogContent
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()} // block click outside
                onEscapeKeyDown={(e) => e.preventDefault()} // block Esc key
            >
                <DialogHeader>
                    <DialogTitle className="text-center">Fill in your information</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="operator">Operator</Label>
                        <Input
                            disabled
                            id="operator"
                            placeholder="Enter your operator"
                            value={operator}
                        />
                    </div>

                    <div>
                        <Label htmlFor="shift">Choose Shift</Label>
                        <Select
                            value={selectedShift}
                            onValueChange={setSelectedShift}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select the shift" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='1'>1</SelectItem>
                                <SelectItem value='2'>2</SelectItem>
                                <SelectItem value='3'>3</SelectItem>
                                <SelectItem value='4'>4</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="line">Choose Line</Label>
                        <Select
                            value={selectedStationId}
                            onValueChange={(id) => {
                                const dataStation = listStations.find((station) => station.identifier === id)
                                if (dataStation) {
                                    setSelectedLine(dataStation.line)
                                    setSelectedStationId(dataStation.identifier)
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select the Line" />
                            </SelectTrigger>

                            <SelectContent>
                                {listStations.length === 0 ? (
                                    <p className="p-2 text-sm text-gray-500">No line available</p>
                                ) : (
                                    listStations.map((station) => (
                                        <SelectItem value={station.identifier} key={station.identifier}>
                                            {station.line}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="line">Choose Leader</Label>
                        <Select
                            value={selectedLeader}
                            onValueChange={setSelectedLeader}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select the Leader or Supervisor" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    listAccounts.length === 0 ?
                                        <p className="p-2 text-sm text-gray-500">No leader available</p>
                                        :
                                        listAccounts.map((account) => (
                                            <SelectItem
                                                value={account.name}
                                                key={account.identifier}
                                            >
                                                {account.name}
                                            </SelectItem>
                                        ))
                                }
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="foreman">Foreman</Label>
                        <Input
                            id="foreman"
                            placeholder="Enter your foreman"
                            value={foreman}
                            onChange={(e) => setForeman(e.target.value)}
                        />
                    </div>

                    <Button
                        disabled={!selectedShift || !selectedLine || !selectedLeader || !foreman}
                        type="submit"
                        className="w-full"
                    >
                        SUBMIT
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
