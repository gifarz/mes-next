"use client"

import NotificationCard from "@/components/dashboard/notification"
import OverviewCard from "@/components/dashboard/overview"
import StatisticCard from "@/components/dashboard/statistic"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Alert,
    AlertTitle,
} from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useUserStore } from "../../../../store/userStore"

export default function Dashboard() {
    const router = useRouter()

    const factory = useUserStore((state) => state.factory)

    const handleCreateFactory = async () => {
        router.push("/app/setup")
    }

    return (
        <div className="flex w-full flex-col gap-6 mt-5">
            <Tabs defaultValue="overview">
                <TabsList className="w-full flex">
                    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                    <TabsTrigger value="notification" className="flex-1">Notification</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    {factory.length === 0 && (
                        <Alert variant="destructive" className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircleIcon className="h-5 w-5" />
                                <AlertTitle>
                                    You have not create the factory yet. Please click the button to create one.
                                </AlertTitle>
                            </div>
                            <Button
                                className="cursor-pointer"
                                variant="destructive"
                                onClick={handleCreateFactory}
                            >
                                Create Factory
                            </Button>
                        </Alert>
                    )}

                    <Card className="mt-2">
                        <CardContent>
                            <OverviewCard />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="notification">
                    <Card>
                        <CardContent>
                            <NotificationCard />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
