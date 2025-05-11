import { getCarFilters } from '@/actions/cars-listing';
import React from 'react';
import CarFilters from './components/car-filters';
import CarListing from './components/car-listing';

export const metadata = {
    title: 'Cars | Vehicle',
    description: 'Browse and search for your dream car',
};

const CarPage = async () => {
    const filtersData = await getCarFilters();


    return (
        <div className="container mx-auto px-6 py-12">
            {/* Page Title */}
            <h1 className="text-2l lg:text-5xl font-bold mb-6 text-center lg:text-left text-blue-800">
                Browse Cars
            </h1>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Filters Section */}
                <div className="w-full lg:w-1/4 bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Filters</h2>
                    <CarFilters filters={filtersData.data} />
                </div>

                {/* Cars Listing Section */}
                <div className="flex-1 bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Available Cars</h2>
                    <CarListing />
                </div>
            </div>
        </div>
    );
};

export default CarPage;