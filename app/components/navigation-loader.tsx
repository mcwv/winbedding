"use client"

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function NavigationLoader() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [loadingProgress, setLoadingProgress] = useState(0)

    useEffect(() => {
        // Reset loading when navigation completes
        setIsLoading(false)
        setLoadingProgress(100)

        // Reset progress after animation
        const timeout = setTimeout(() => setLoadingProgress(0), 300)
        return () => clearTimeout(timeout)
    }, [pathname, searchParams])

    // Listen for navigation start (custom event dispatched before navigation)
    useEffect(() => {
        const handleStart = () => {
            setIsLoading(true)
            setLoadingProgress(0)

            // Animate progress
            let progress = 0
            const interval = setInterval(() => {
                progress += Math.random() * 20
                if (progress >= 90) {
                    clearInterval(interval)
                    setLoadingProgress(90) // Hold at 90% until complete
                } else {
                    setLoadingProgress(progress)
                }
            }, 150)

            return () => clearInterval(interval)
        }

        window.addEventListener('navigationStart', handleStart)
        return () => window.removeEventListener('navigationStart', handleStart)
    }, [])

    if (!isLoading && loadingProgress === 0) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1">
            <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-300 ease-out"
                style={{
                    width: `${loadingProgress}%`,
                    opacity: loadingProgress === 100 ? 0 : 1
                }}
            />
        </div>
    )
}
