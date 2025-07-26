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

export default function page() {
    return (
        <div className="flex w-full flex-col gap-6 mt-5">
            <Tabs defaultValue="order">
                <TabsList className="w-full flex">
                    <TabsTrigger value="order" className="flex-1">Order</TabsTrigger>
                    <TabsTrigger value="scheduling" className="flex-1">Scheduling</TabsTrigger>
                </TabsList>
                <TabsContent value="order">
                    <Card>
                        <CardContent>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="scheduling">
                    <Card>
                        <CardContent>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}