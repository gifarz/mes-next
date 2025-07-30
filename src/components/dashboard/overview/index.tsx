import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

// Menu items.
const items = [
    {
        title: "Waiting Order",
        value: "100"
    },
    {
        title: "Work In Progress",
        value: "100"
    },
    {
        title: "Completed Order",
        value: "100"
    },
    {
        title: "Average OEE",
        value: "100"
    },
    {
        title: "Working Machines",
        value: "100"
    },
    {
        title: "Working Stations",
        value: "100"
    },
    {
        title: "Next Reschedule",
        value: "100"
    },
    {
        title: "Reschedule Interval",
        value: "100"
    },
    {
        title: "Operation Time Left",
        value: "100"
    }
]

export default function OverviewCard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {
                items.map((item) => (
                    <Card className="w-full max-w-full" key={item.title}>
                        <CardHeader>
                            <CardTitle className="text-center">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center">
                                {item.value}
                            </div>
                        </CardContent>
                    </Card>
                ))
            }
        </div>
    )
}
