import { useI18n } from "@/components/i18n/provider";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react"

// Define card meta (no static values here, values come from state)
const items = [
    { title: "Waiting Order", key: "waitingOrder" },
    { title: "Work In Progress", key: "workInProgress" },
    { title: "Completed Order", key: "completedOrder" },
    { title: "Working Machines", key: "workingMachines" },
    { title: "Working Stations", key: "workingStations" },
]

export default function OverviewCard() {
    const { t } = useI18n();
    const [counts, setCounts] = useState<Record<string, string>>({
        waitingOrder: "-",
        workInProgress: "-",
        completedOrder: "-",
        workingMachines: "-",
        workingStations: "-",
    })

    useEffect(() => {
        const fetcher = async () => {
            const resWaiting = await fetch("/api/getter/getCountOrders", {
                method: "POST",
                body: JSON.stringify({ status: "Waiting" }), // fixed typo
                headers: { "Content-Type": "application/json" },
            })
            const waiting = await resWaiting.json()

            const resProgress = await fetch("/api/getter/getCountOrders", {
                method: "POST",
                body: JSON.stringify({ status: "Work In Progress" }),
                headers: { "Content-Type": "application/json" },
            })
            const progress = await resProgress.json()

            const resCompleted = await fetch("/api/getter/getCountOrders", {
                method: "POST",
                body: JSON.stringify({ status: "Done" }),
                headers: { "Content-Type": "application/json" },
            })
            const completed = await resCompleted.json()

            const resStations = await fetch("/api/getter/getCountStations")
            const stations = await resStations.json()

            const resMachines = await fetch("/api/getter/getCountMachines")
            const machines = await resMachines.json()

            setCounts({
                waitingOrder: waiting.data || 0,
                workInProgress: progress.data || 0,
                completedOrder: completed.data || 0,
                workingMachines: stations.data || 0,
                workingStations: machines.data || 0,
            })
        }

        fetcher()
    }, [])

    return (
        <div className="grid grid-cols-3 gap-4">
            {/* First 3 cards */}
            {items.slice(0, 3).map((item) => (
                <Card className="w-full" key={item.key}>
                    <CardHeader>
                        <CardTitle className="text-center">{t(item.key)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center text-2xl font-bold">
                            {counts[item.key]}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Last 2 cards centered */}
            <div className="col-span-3 flex justify-center gap-4">
                {items.slice(3).map((item) => (
                    <Card className="w-1/3" key={item.key}>
                        <CardHeader>
                            <CardTitle className="text-center">{t(item.key)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center text-2xl font-bold">
                                {counts[item.key]}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
