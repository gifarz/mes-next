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
import ListOrdersCard from '@/components/track/list-orders'
import WarehouseCard from '@/components/track/production-process'
import { useI18n } from '@/components/i18n/provider'

export default function TrackPage() {

    const { t } = useI18n();

    return (
        <div className="flex w-full flex-col gap-6 mt-5">
            <Tabs defaultValue="list_order">
                <TabsList className="w-full flex">
                    <TabsTrigger value="list_order" className="flex-1">{t("listOrder")}</TabsTrigger>
                    <TabsTrigger value="production_process" className="flex-1">{t("productionProcess")}</TabsTrigger>
                </TabsList>
                <TabsContent value="list_order">
                    <Card>
                        <CardContent>
                            <ListOrdersCard />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="production_process">
                    <Card>
                        <CardContent>
                            <WarehouseCard />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}