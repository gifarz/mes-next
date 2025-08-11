// components/TypingText.tsx
"use client"

import { useEffect, useState } from "react"

interface TypingTextProps {
    text: string
    speed?: number // ms per character
    className?: string
}

export const TypingText: React.FC<TypingTextProps> = ({
    text,
    speed = 100,
    className = "",
}) => {
    const [displayedText, setDisplayedText] = useState("")

    useEffect(() => {
        let index = 0
        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(index))
            index++
            if (index === text.length) clearInterval(interval)
        }, speed)

        return () => clearInterval(interval)
    }, [text, speed])

    return (
        <span className={`font-mono whitespace-pre ${className}`}>
            {displayedText}
            <span className="animate-pulse">|</span>
        </span>
    )
}
