"use client"

import React from 'react'
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import AlarmCard from '@/components/alarm/main'

export default function AlarmPage() {

    return (
        <div className="flex justify-center mt-5">
            <Card className="mt-2">
                <CardContent>
                    <AlarmCard />
                </CardContent>
            </Card>
        </div >
    )
}
