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
            <Tabs defaultValue="factory">
                <TabsList>
                    <TabsTrigger value="factory">Factory</TabsTrigger>
                    <TabsTrigger value="machine">Machine</TabsTrigger>
                    <TabsTrigger value="station">Station</TabsTrigger>
                    <TabsTrigger value="product">Product</TabsTrigger>
                    <TabsTrigger value="customer">Customer</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                </TabsList>
                <TabsContent value="factory">
                    <Card>
                        <CardContent>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="machine">
                    <Card>
                        <CardContent>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="station">
                    <Card>
                        <CardContent>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="product">
                    <Card>
                        <CardContent>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="customer">
                    <Card>
                        <CardContent>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="inventory">
                    <Card>
                        <CardContent>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
