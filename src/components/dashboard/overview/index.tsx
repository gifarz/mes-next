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
        value: "4"
    },
    {
        title: "Work In Progress",
        value: "4"
    },
    {
        title: "Completed Order",
        value: "4"
    },
    {
        title: "Average OEE",
        value: "4"
    },
    {
        title: "Working Machines",
        value: "4"
    },
    {
        title: "Working Stations",
        value: "4"
    },
    {
        title: "Next Reschedule",
        value: "4"
    },
    {
        title: "Reschedule Interval",
        value: "4"
    },
    {
        title: "Operation Time Left",
        value: "4"
    }
]

export default function OverviewCard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {
                items.map((item) => (
                    <Card className="w-full max-w-full" key={item.title}>
                        <CardHeader>
                            <CardTitle>{item.title}</CardTitle>
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
