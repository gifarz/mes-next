import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react"

// Define card meta (no static values here, values come from state)
const items = [
    { title: "Waiting Order", key: "waiting" },
    { title: "Work In Progress", key: "progress" },
    { title: "Completed Order", key: "completed" },
    { title: "Working Machines", key: "machines" },
    { title: "Working Stations", key: "stations" },
]

export default function OverviewCard() {
    const [counts, setCounts] = useState<Record<string, string>>({
        waiting: "-",
        progress: "-",
        completed: "-",
        machines: "-",
        stations: "-",
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
                waiting: waiting.data || 0,
                progress: progress.data || 0,
                completed: completed.data || 0,
                stations: stations.data || 0,
                machines: machines.data || 0,
            })
        }

        fetcher()
    }, [])

    return (
        <div className="grid grid-cols-3 gap-4">
            {/* First 3 cards */}
            {items.slice(0, 3).map((item) => (
                <Card className="w-full" key={item.title}>
                    <CardHeader>
                        <CardTitle className="text-center">{item.title}</CardTitle>
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
                    <Card className="w-1/3" key={item.title}>
                        <CardHeader>
                            <CardTitle className="text-center">{item.title}</CardTitle>
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
