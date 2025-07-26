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
                <TabsList className="w-full flex">
                    <TabsTrigger value="factory" className="flex-1">Factory</TabsTrigger>
                    <TabsTrigger value="machine" className="flex-1">Machine</TabsTrigger>
                    <TabsTrigger value="station" className="flex-1">Station</TabsTrigger>
                    <TabsTrigger value="product" className="flex-1">Product</TabsTrigger>
                    <TabsTrigger value="customer" className="flex-1">Customer</TabsTrigger>
                    <TabsTrigger value="inventory" className="flex-1">Inventory</TabsTrigger>
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
