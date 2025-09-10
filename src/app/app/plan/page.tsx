"use client"

import React from 'react'
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
import OrderCard from '@/components/plan/order'
import SchedulingCard from '@/components/plan/scheduling'
import { useI18n } from '@/components/i18n/provider'

export default function PlanPage() {

    const { t } = useI18n();

    return (
        <div className="flex w-full flex-col gap-6 mt-5">
            <Tabs defaultValue="order">
                <TabsList className="w-full flex">
                    <TabsTrigger value="order" className="flex-1">{t("order")}</TabsTrigger>
                    <TabsTrigger value="scheduling" className="flex-1">{t("scheduling")}</TabsTrigger>
                </TabsList>
                <TabsContent value="order">
                    <Card>
                        <CardContent>
                            <OrderCard />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="scheduling">
                    <Card>
                        <CardContent>
                            <SchedulingCard />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}