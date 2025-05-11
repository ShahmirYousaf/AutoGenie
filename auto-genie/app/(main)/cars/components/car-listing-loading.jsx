import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CarListingLoading = () => {
    return (
        <>
            <Skeleton className="h-6 w-1/4 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i} className="bg-white shadow-md rounded-lg p-4">
                            <Skeleton className="h-48 w-full mb-4" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-5 w-2/3 mb-2" />
                                <Skeleton className="h-4 w-1/2 mb-2" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-4/5 mb-2" />
                                    <Skeleton className="h-4 w-3/5 mb-2" />
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <Skeleton className="h-9 flex-1" />
                                    <Skeleton className="h-9 flex-1" />
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </>
    );
};

export default CarListingLoading;