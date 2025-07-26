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
            <Tabs defaultValue="production">
                <TabsList className="w-full flex">
                    <TabsTrigger value="production" className="flex-1">Production</TabsTrigger>
                    <TabsTrigger value="warehouse" className="flex-1">Warehouse</TabsTrigger>
                </TabsList>
                <TabsContent value="production">
                    <Card>
                        <CardContent>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="warehouse">
                    <Card>
                        <CardContent>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}