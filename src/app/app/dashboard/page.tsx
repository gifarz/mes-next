"use client"

import NotificationCard from "@/components/dashboard/notification"
import OverviewCard from "@/components/dashboard/overview"
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
import { useI18n } from "@/components/i18n/provider"

export default function Dashboard() {
    const router = useRouter()
    const { t } = useI18n();

    const factory = useUserStore((state) => state.factory)

    const handleCreateFactory = async () => {
        router.push("/app/setup")
    }

    return (
        <div className="flex w-full flex-col gap-6 mt-5">
            <Tabs defaultValue="overview">
                <TabsList className="w-full flex">
                    <TabsTrigger value="overview" className="flex-1">{t("overview")}</TabsTrigger>
                    <TabsTrigger value="notification" className="flex-1">{t("notification")}</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    {factory.length === 0 && (
                        <Alert variant="destructive" className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircleIcon className="h-5 w-5" />
                                <AlertTitle>
                                    {t("alertFactory")}
                                </AlertTitle>
                            </div>
                            <Button
                                className="cursor-pointer"
                                variant="destructive"
                                onClick={handleCreateFactory}
                            >
                                {t("createFactory")}
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
