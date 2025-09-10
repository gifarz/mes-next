"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStore } from '../../../../store/userStore'
import { formattedDate } from "@/lib/dateUtils"
import { Station } from "../../../../types/setup/station"
import { Machine } from "../../../../types/setup/machine"
import { useI18n } from "@/components/i18n/provider";

export default function StationCard() {
    const [search, setSearch] = useState("")
    const [stationId, setStationId] = useState("")
    const [stationNumber, setStationNumber] = useState("")
    const [stationName, setStationName] = useState("")
    const [stationLine, setStationLine] = useState("")
    const [stationAddress, setStationAddress] = useState("")
    const [listStations, setListStations] = useState<Station[]>([])
    const [listMachines, setListMachines] = useState<Machine[]>([])

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const [isFetched, setIsFetched] = useState<boolean>(false)
    const [isAddStation, setIsAddStation] = useState(false)
    const [isEditStation, setIsEditStation] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const user_id = useUserStore((state) => state.user_id)
    const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const [contentWidth, setContentWidth] = useState<number>(0);
    const { t } = useI18n();

    const toggleMachine = (machineName: string) => {
        setSelectedMachines((prev) =>
            prev.includes(machineName)
                ? prev.filter((m) => m !== machineName)
                : [...prev, machineName]
        );
    };

    useLayoutEffect(() => {
        if (triggerRef.current) {
            setContentWidth(triggerRef.current.offsetWidth);
        }
    }, [triggerRef.current, selectedMachines]); // Optional: include state if it might resize

    useEffect(() => {
        const payload = {
            user_id: user_id,
        }

        const fetcher = async () => {
            const stations = await fetch("/api/getter/getStationsByUserId", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const dataStations = await stations.json()

            const fixedResponse = Array.isArray(dataStations?.data)
                ? dataStations.data.map((res: Station) => ({
                    ...res,
                    // machine_name: res.machine_name.split(","),
                    created_on: formattedDate(res.created_on),
                }))
                : []

            const machines = await fetch("/api/getter/getMachinesByUserId", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const res = await machines.json()
            const dataMachines = Array.isArray(res?.data)
                ? res.data.map((res: Machine) => ({
                    ...res,
                    created_on: formattedDate(res.created_on),
                }))
                : []

            setListStations(fixedResponse)
            setListMachines(dataMachines)
            setIsFetched(true)
        }

        fetcher()

    }, [user_id, search, isAddStation, isEditStation, refreshKey])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        const payload = {
            number: stationNumber,
            name: stationName,
            line: stationLine,
            address: stationAddress,
            machine_name: selectedMachines.join(",")
        }

        if (isEditStation) {
            const body = {
                ...payload,
                identifier: stationId
            }
            const res = await fetch("/api/patcher/updateStationByIdentifier", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success(t("successUpdateStation"))
                setIsSubmitted(false)
                setIsAddStation(false)
                setIsEditStation(false)
            } else {
                toast.error(t("failUpdateStation"))
                setIsSubmitted(false)

            }

        } else if (isAddStation) {
            const res = await fetch("/api/insert/addStation", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success(t("successStation"))
                setIsSubmitted(false)
                setIsAddStation(false)
                setIsEditStation(false)
            } else {
                toast.error(t("failStation"))
                setIsSubmitted(false)

            }
        }
    }

    const filteredStations = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (listStations?.length > 0) {
            return listStations.filter(station =>
                station.name.toLowerCase().includes(keyword)
            );
        }

        return []
    }, [listStations, search]);

    const handleEdit = async (station: Station) => {
        setIsAddStation(true) // To activate the red cancel button
        setIsEditStation(true)

        // Mapping the parameters of each station to the state
        setStationId(station.identifier)
        setStationNumber(station.number)
        setStationName(station.name)
        setStationLine(station.line)
        setStationAddress(station.address)
        setSelectedMachines(
            Array.isArray(station.machine_name) ?
                station.machine_name : station.machine_name.split(",")
        )
    }

    const handleDelete = async (station: Station) => {
        const payload = {
            identifier: station.identifier
        }
        await fetch("/api/remover/deleteStationByIdentifier", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            },
        });
        setRefreshKey((prev) => prev + 1)
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="flex flex-col min-h-screen gap-4">
                <div className="w-full max-h-full rounded">
                    <div className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold">
                            {t("stationManagement")}
                        </h2>
                        <div className="flex gap-2 ml-auto">
                            <Input
                                type="text"
                                placeholder={t("searchStations")}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setIsAddStation(false)
                                }}
                                className="w-[200px]"
                            />
                            <Button
                                className="cursor-pointer"
                                variant={`${isAddStation ? 'destructive' : 'default'}`}
                                onClick={() => {
                                    setSearch("");
                                    setIsAddStation(!isAddStation);
                                    if (isAddStation) {
                                        setIsEditStation(false); // Only reset when toggling off
                                        setStationName("")
                                        setStationNumber("")
                                        setSelectedMachines([])
                                    }
                                }}
                            >
                                {
                                    isAddStation ? t("cancel") : t("addStation")
                                }
                            </Button>
                        </div>
                    </div>

                    {
                        isAddStation &&
                        <>
                            <h2 className="text-2xl font-semibold text-center my-8">
                                {
                                    isEditStation ? t("editStation") : t("addStation")
                                }
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="stationNumber">{t("stationNumber")}</Label>
                                    <Input
                                        id="stationNumber"
                                        placeholder={t("stationNumberPlaceholder")}
                                        type="text"
                                        value={stationNumber}
                                        onChange={(e) => setStationNumber(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="stationName">{t("stationName")}</Label>
                                    <Input
                                        id="stationName"
                                        placeholder={t("stationNamePlaceholder")}
                                        type="text"
                                        value={stationName}
                                        onChange={(e) => setStationName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="stationLine">{t("stationLine")}</Label>
                                    <Input
                                        id="stationLine"
                                        placeholder={t("stationLinePlaceholder")}
                                        type="text"
                                        value={stationLine}
                                        onChange={(e) => setStationLine(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="stationAddress">{t("stationAddress")}</Label>
                                    <Input
                                        id="stationAddress"
                                        placeholder={t("stationAddressPlaceholder")}
                                        type="text"
                                        value={stationAddress}
                                        onChange={(e) => setStationAddress(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="machine">{t("machineName")}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button ref={triggerRef} variant="outline" className="w-full justify-start">
                                                {selectedMachines.length > 0
                                                    ? selectedMachines.join(", ")
                                                    : t("selectMachine")}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent style={{ width: contentWidth }} className="p-2" align="start">
                                            {listMachines.length === 0 ? (
                                                <p className="w-full text-gray-500">{t("noData")}</p>
                                            ) : (
                                                <div className="flex gap-4">
                                                    {
                                                        listMachines.map((machine) => (
                                                            <div
                                                                key={machine.identifier}
                                                                className="flex items-center space-x-2 py-1"
                                                            >
                                                                <Checkbox
                                                                    id={machine.identifier}
                                                                    checked={selectedMachines.includes(machine.name)}
                                                                    onCheckedChange={() => toggleMachine(machine.name)}
                                                                />
                                                                <label
                                                                    htmlFor={machine.identifier}
                                                                    className="leading-none peer-disabled:cursor-not-allowed"
                                                                >
                                                                    {machine.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="flex justify-center gap-4 mt-6">
                                    <Button
                                        className="w-full cursor-pointer"
                                        type="submit"
                                        disabled={!stationNumber || !stationName || selectedMachines.length == 0}
                                    >
                                        {isSubmitted ? (
                                            <>
                                                <Spinner />
                                                <span className="ml-0">{t("submitting")}</span>
                                            </>
                                        ) :

                                            isEditStation ? t("updateStation").toUpperCase() : t("addStation").toUpperCase()
                                        }
                                    </Button>
                                </div>
                            </form>
                        </>
                    }
                </div>

                <div className="grid lg:grid-cols-3 gap-2 mt-10">
                    {
                        isFetched ? (
                            filteredStations.length === 0 ? (
                                <div className="col-span-full text-center mt-10 text-muted-foreground">
                                    {t("noStation")}
                                </div>
                            ) : (
                                filteredStations.map((station) => (
                                    <Card className="w-full max-h-[350px] overflow-y-auto" key={station.identifier}>
                                        <CardHeader>
                                            <CardTitle className="text-center text-lg">{station.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1 text-sm">
                                            <div><strong>{t("stationNumber")}:</strong> {station.number}</div>
                                            <Accordion
                                                type="single"
                                                collapsible
                                                className="w-full"
                                            >
                                                <AccordionItem value="item-1">
                                                    <AccordionTrigger>{t("listMachines")}</AccordionTrigger>
                                                    <AccordionContent className="flex flex-col gap-4 text-balance">
                                                        {station.machine_name.split(',').map((machine, index) => (
                                                            <li key={index}>{machine}</li>
                                                        ))}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                            <div>
                                                <strong>{t("installation")}:</strong> {station.created_on}
                                            </div>
                                            <div className="flex flex-col gap-2 mt-4">
                                                <Button
                                                    className="cursor-pointer"
                                                    variant="secondary"
                                                    onClick={() => handleEdit(station)}
                                                >
                                                    {t("edit").toUpperCase()}
                                                </Button>
                                                <Button
                                                    className="cursor-pointer"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(station)}
                                                >
                                                    {t("delete").toUpperCase()}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )
                        ) : (
                            [...Array(3)].map((_, index) => (
                                <Card className="w-full" key={index}>
                                    <CardHeader>
                                        <CardTitle className="text-center text-lg">
                                            <Skeleton className="h-6 w-32 mx-auto" />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex flex-col gap-1">
                                            <div><strong>{t("stationNumber")}:</strong> <Skeleton className="inline-block h-4 w-20 ml-2" /></div>
                                            <div><strong>{t("listMachines")}:</strong> <Skeleton className="inline-block h-4 w-28 ml-2" /></div>
                                            <div><strong>{t("installation")}:</strong> <Skeleton className="inline-block h-4 w-32 ml-2" /></div>
                                        </div>
                                        <div className="flex flex-col gap-2 mt-4">
                                            <Skeleton className="h-9 w-full rounded" />
                                            <Skeleton className="h-9 w-full rounded" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )
                    }
                </div>
            </div>
        </>
    )
}
