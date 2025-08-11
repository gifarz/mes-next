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
import FactoryCard from '@/components/setup/factory'
import MachineCard from '@/components/setup/machine'
import StationCard from '@/components/setup/station'
import ProductCard from '@/components/setup/product/main'
import CustomerCard from '@/components/setup/customer/main'
import InventoryCard from '@/components/setup/inventory/main'

export default function page() {
    return (
        <div className="w-full flex flex-col gap-6 mt-5">
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
                            <FactoryCard />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="machine">
                    <Card>
                        <CardContent>
                            <MachineCard />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="station">
                    <Card>
                        <CardContent>
                            <StationCard />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="product">
                    <Card>
                        <CardContent>
                            <ProductCard />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="customer">
                    <Card>
                        <CardContent>
                            <CustomerCard />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="inventory">
                    <Card>
                        <CardContent>
                            <InventoryCard />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
