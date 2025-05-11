"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCars } from "@/actions/cars-listing";
import useFetch from "@/hooks/useFetch";
import CarListingLoading from "./car-listing-loading";
import { Car, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CarCard from "@/components/car-card";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const CarListing = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 6;

    const getPaginationUrl = (pageNumber) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber);
        return `?${params.toString()}`;
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        router.push(getPaginationUrl(pageNumber));
    };

    const search = searchParams.get("search") || "";
    const make = searchParams.get("make") || "";
    const bodyType = searchParams.get("bodyType") || "";
    const fuelType = searchParams.get("fuelType") || "";
    const transmission = searchParams.get("transmission") || "";
    const minPrice = parseFloat(searchParams.get("minPrice")) || 0;
    const maxPrice = parseFloat(searchParams.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1");

    const { loading, fn: fetchCars, data: result, error } = useFetch(getCars);

    useEffect(() => {
        fetchCars({
            search,
            make,
            bodyType,
            fuelType,
            transmission,
            minPrice,
            maxPrice,
            sortBy,
            page: currentPage,
            limit,
        });
    }, [
        search,
        make,
        bodyType,
        fuelType,
        transmission,
        minPrice,
        maxPrice,
        sortBy,
        currentPage,
        limit,
    ]);

    if (loading && !result) {
        return <CarListingLoading />;
    }

    if (error || (!result && !result?.success)) {
        return (
            <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load cars. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    if (!result || !result?.data) {
        return null;
    }

    const { data: cars, pagination } = result;

    if (!Array.isArray(cars) || cars.length === 0) {
        return (
            <div className="min-h-[300px] flex flex-col items-center justify-center bg-gray-50 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center bg-red-100 rounded-full p-4 mb-4">
                    <Info className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No cars found
                </h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                    We couldn't find any cars matching your filters. Try adjusting your search criteria or clearing the filters.
                </p>
                <Button variant="outline" className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-500 hover:bg-blue-50">
                    <Link href="/cars">Clear all filters</Link>
                </Button>
            </div>
        );
    }

    // Generate pagination items
    const paginationItems = [];
    const visiblePageNumbers = [];
    visiblePageNumbers.push(1);

    for (
        let i = Math.max(2, page - 1);
        i <= Math.min(pagination.pages - 1, page + 1);
        i++
    ) {
        visiblePageNumbers.push(i);
    }

    if (pagination.pages > 1) {
        visiblePageNumbers.push(pagination.pages);
    }

    const uniquePageNumbers = [...new Set(visiblePageNumbers)].sort(
        (a, b) => a - b
    );

    let lastPageNumber = 0;
    uniquePageNumbers.forEach((pageNumber) => {
        if (pageNumber - lastPageNumber > 1) {
            paginationItems.push(
                <PaginationItem key={`ellipsis-${pageNumber}`}>
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        paginationItems.push(
            <PaginationItem key={pageNumber}>
                <PaginationLink
                    href={getPaginationUrl(pageNumber)}
                    isActive={pageNumber === page}
                    onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNumber);
                    }}
                >
                    {pageNumber}
                </PaginationLink>
            </PaginationItem>
        );

        lastPageNumber = pageNumber;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                    Showing{" "}
                    <span>
                        {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, pagination.total)}
                    </span>{" "}
                    of <span className="font-semibold">{pagination.total}</span> cars
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                    <CarCard key={car.id} car={car} />
                ))}
            </div>

            {pagination.pages > 1 && (
                <Pagination className="mt-10">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href={getPaginationUrl(page - 1)}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 1) {
                                        handlePageChange(page - 1);
                                    }
                                }}
                                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>

                        {paginationItems}

                        <PaginationItem>
                            <PaginationNext
                                href={getPaginationUrl(page + 1)}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page < pagination.pages) {
                                        handlePageChange(page + 1);
                                    }
                                }}
                                className={
                                    page >= pagination.pages
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default CarListing;