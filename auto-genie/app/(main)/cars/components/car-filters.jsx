"use client";
import React, { use } from "react";
import { useRouter, usePathname } from "next/navigation";
import { parse } from "date-fns";
import { useState } from "react";
import { useEffect } from "react";
import { Select, SelectItem } from "@radix-ui/react-select";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge, Filter, Sliders, X } from "lucide-react";
import CarFilterControl from "./filter-controls";
import { SelectContent, SelectTrigger, SelectValue } from "@radix-ui/react-select";


const CarFilters = ({ filters }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = new URLSearchParams();

    //Get current filters calues from SearchParams

    const currentMake = searchParams.get("make") || "";
    const currentBodyType = searchParams.get("bodyType") || "";
    const currentFuelType = searchParams.get("fuelType") || "";
    const currentTransmission = searchParams.get("transmission") || "";
    const currentMinPrice = searchParams.get("minPrice") || ""
        ? parseInt(searchParams.get("minPrice"))
        : filters.priceRange.min;
    const currentMaxPrice = searchParams.get("maxPrice") || ""
        ? parseInt(searchParams.get("maxPrice"))
        : filters.priceRange.max;
    const currentSortBy = searchParams.get("sortBy") || "newest";
   

    const [make, setMake] = useState(currentMake);
    const [bodyType, setBodyType] = useState(currentBodyType);
    const [fuelType, setFuelType] = useState(currentFuelType);
    const [transmission, setTransmission] = useState(currentTransmission);
    const [priceRange, setPriceRange] = useState({
        min: currentMinPrice,
        max: currentMaxPrice,
    });
    const [sortBy, setSortBy] = useState(currentSortBy);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    useEffect(() => {
        setMake(currentMake);
        setBodyType(currentBodyType);
        setFuelType(currentFuelType);
        setTransmission(currentTransmission);
        setPriceRange({
            min: currentMinPrice,
            max: currentMaxPrice,
        });
        setSortBy(currentSortBy);
    }, [
        currentMake,
        currentBodyType,
        currentFuelType,
        currentTransmission,
        currentMinPrice,
        currentMaxPrice,
        currentSortBy
    ]);

    const activeFilters = [
        make,
        bodyType,
        fuelType,
        transmission,
        currentMinPrice > filters.priceRange.min ||
        currentMaxPrice < filters.priceRange.max,

    ].filter(Boolean).length;

    const currentFilters = {
        make,
        bodyType,
        fuelType,
        transmission,
        priceRange,
        priceRangeMin: filters.priceRange.min,
        priceRangeMax: filters.priceRange.max,
    };

    const handleFilterChange = (filterName, value) => {
        switch (filterName) {
            case "make":
                setMake(value);
                break;
            case "bodyType":
                setBodyType(value);
                break;
            case "fuelType":
                setFuelType(value);
                break;
            case "transmission":
                setTransmission(value);
                break;
            case "priceRange":
                setPriceRange(value);
                break;
            default:
                break;
        }
    }

    const handleClearFilter = (filterName) => {
        handleFilterChange(filterName, "");
    }

    const clearFilters = () => {
        setMake("");
        setBodyType("");
        setFuelType("");
        setTransmission("");
        setPriceRange({
            min: filters.priceRange.min,
            max: filters.priceRange.max,
        });
        setSortBy("newest");

        const params = new URLSearchParams();
        const search = searchParams.get("search");
        if (search) params.set("search", search);

        const query = params.toString();
        const url = query ? `${pathname}?${query}` : pathname;

        router.push(url);
        setIsSheetOpen(false);


    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (make) params.set("make", make);
        if (bodyType) params.set("bodyType", bodyType);
        if (fuelType) params.set("fuelType", fuelType);
        if (transmission) params.set("transmission", transmission);
        if (priceRange[0] > filters.priceRange.min)
            params.set("minPrice", priceRange[0].toString());
        if (priceRange[1] < filters.priceRange.max)
            params.set("maxPrice", priceRange[1].toString());
        if (sortBy !== "newest") params.set("sortBy", sortBy);

        const search = searchParams.get("search");
        const page = searchParams.get("page");
        if (search) params.set("search", search);
        if (page && page !== "1") params.set("page", page);

        const query = params.toString();
        const url = query ? `${pathname}?${query}` : pathname;

        router.push(url);
        setIsSheetOpen(false);
    }


    return (
        <div className="flex lg:flex-col gap-6 justify-between">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-6">
                <div className="flex items-center">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100">
                                <Filter className="h-4 w-4" />
                                Filters{" "}
                                {activeFilters > 0 && (
                                    <Badge className="ml-1 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                                        {activeFilters}
                                    </Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-full max-w-md overflow-y-auto bg-white shadow-lg rounded-lg">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle className="text-lg font-semibold text-gray-800">Filters</SheetTitle>
                            </SheetHeader>

                            <div className="py-6 px-4">
                                <CarFilterControl
                                    filters={filters}
                                    currentFilters={currentFilters}
                                    onFilterChange={handleFilterChange}
                                    onClearFilter={handleClearFilter}
                                />
                            </div>
                            <SheetFooter className="flex justify-between gap-4 p-4 border-t">
                                <Button type="button" variant="outline" onClick={clearFilters} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                                    Reset
                                </Button>
                                <Button type="button" onClick={applyFilters} className="flex-1 bg-blue-500 text-white hover:bg-blue-600">
                                    Show Results
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Sort Dropdown */}
            <Select
                value={sortBy}
                onValueChange={(value) => {
                    setSortBy(value); // Update the state with the selected value
                    setTimeout(() => applyFilters(), 0);
                }}
                className="flex items-center gap-2"
            >
                <SelectTrigger className="w-[260px] px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100">
                    <SelectValue>
                        {sortBy === "newest" && "Newest First"}
                        {sortBy === "priceASC" && "Price: Low to High"}
                        {sortBy === "priceDESC" && "Price: High to Low"}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white shadow-lg rounded-lg z-50">
                    {[
                        { value: "newest", label: "Newest First" },
                        { value: "priceASC", label: "Price: Low to High" },
                        { value: "priceDESC", label: "Price: High to Low" },
                    ].map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Desktop Filters */}
            <div className="hidden lg:block sticky top-24">
                <div className="border rounded-lg overflow-hidden bg-white shadow-md">
                    <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                        <h3 className="font-medium text-gray-800 flex items-center">
                            <Sliders className="mr-2 h-4 w-4 text-gray-600" />
                            Filter
                        </h3>
                        {activeFilters > 0 && (
                            <Button variant="ghost" size="sm" className="h-8 text-sm text-gray-600 hover:text-gray-800" onClick={clearFilters}>
                                <X className="mr-1 h-3 w-3" />
                                Clear All
                            </Button>
                        )}
                    </div>

                    <div className="py-6 px-4">
                        <CarFilterControl
                            filters={filters}
                            currentFilters={currentFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilter={handleClearFilter}
                        />
                    </div>
                    <div className="px-4 py-4 border-t bg-gray-50">
                        <Button onClick={applyFilters} className="w-full bg-blue-500 text-white hover:bg-blue-600">
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

};


export default CarFilters;
