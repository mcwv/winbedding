export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Skeleton */}
            <header className="w-full pt-6 pb-6 border-b border-border">
                <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
                    <div className="w-32 h-12 bg-neutral-200/50 rounded-2xl animate-pulse" />
                    <div className="flex-1 max-w-xl h-12 bg-neutral-200/50 rounded-2xl mx-8 animate-pulse hidden lg:block" />
                    <div className="w-32 h-12 bg-neutral-200/50 rounded-2xl animate-pulse" />
                </div>
            </header>

            {/* Hero Skeleton */}
            <main className="container mx-auto px-4 max-w-7xl pt-12">
                <div className="max-w-2xl space-y-4 mb-12">
                    <div className="w-48 h-6 bg-neutral-200/50 rounded-full animate-pulse" />
                    <div className="w-full h-16 bg-neutral-200/50 rounded-3xl animate-pulse" />
                    <div className="w-3/4 h-8 bg-neutral-200/50 rounded-2xl animate-pulse" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-full h-24 bg-neutral-200/50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                    <div className="lg:col-span-3 h-[600px] bg-neutral-200/50 rounded-3xl animate-pulse" />
                </div>
            </main>
        </div>
    )
}
