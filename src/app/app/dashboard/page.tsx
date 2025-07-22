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

export default function page() {
    return (
        <div className="flex w-full flex-col gap-6 mt-5">
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="notification">Notification</TabsTrigger>
                    <TabsTrigger value="statistic">Statistic</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <Card>
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
                <TabsContent value="statistic">
                    <Card>
                        <CardContent>
                            <StatisticCard />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
