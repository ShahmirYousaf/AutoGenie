import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

const CarFilterControl = ({
    filters,
    currentFilters,
    onFilterChange,
    onClearFilter,
}) => {
    const { make, bodyType, fuelType, transmission, priceRange = [filters.priceRange.min, filters.priceRange.max] } = currentFilters;

    const filterSections = [
        {
            id: "make",
            title: "Make",
            options: (filters.makes || []).map((item) => ({
                value: item,
                label: item,
            })),
            currentValue: make,
            onchange: (value) => onFilterChange("make", value),
        },
        {
            id: "bodyType",
            title: "Body Type",
            options: (filters.bodyTypes || []).map((item) => ({
                value: item,
                label: item,
            })),
            currentValue: bodyType,
            onchange: (value) => onFilterChange("bodyType", value),
        },
        {
            id: "fuelType",
            title: "Fuel Type",
            options: (filters.fuelTypes || []).map((item) => ({
                value: item,
                label: item,
            })),
            currentValue: fuelType,
            onchange: (value) => onFilterChange("fuelType", value),
        },
        {
            id: "transmission",
            title: "Transmission",
            options: (filters.transmissionTypes || []).map((item) => ({
                value: item,
                label: item,
            })),
            currentValue: transmission,
            onchange: (value) => onFilterChange("transmission", value),
        },
    ];

    return (
        <div>
            <div className="space-y-4">
                <h3 className="font-medium">Price Range</h3>
                <div className="px-2">
                    <Slider
                        min={filters.priceRange.min}
                        max={filters.priceRange.max}
                        step={100}
                        value={[priceRange.min, priceRange.max]} // Convert priceRange object to array
                        onValueChange={(value) => onFilterChange("priceRange", { min: value[0], max: value[1] })} // Update priceRange as an object
                        className="w-full"
                    />
                </div>
                <div className="flex items-center justify-between mb-5">
                    <div className="font-medium text-sm ">${priceRange.min}</div>
                    <div className="font-medium text-sm">${priceRange.max}</div>
                </div>
            </div>

            {filterSections.map((section) => (
                <div key={section.id} className="space-y-4">
                    <h3 className="font-medium flex justify-between">
                        {section.title}
                        {section.currentValue && (
                            <button
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center cursor-pointer"
                                onClick={() => onClearFilter(section.id)}
                            >
                                <X className="mr-1 h-3 w-3" /> Clear
                            </button>
                        )}
                    </h3>

                    <div className="flex flex-wrap gap-2 max-h-60 mb-5 overflow-y-auto">
                        {section.options.map((options) => (
                            <Badge
                                key={options.value}
                                variant={section.currentValue === options.value ? "default" : "outline"}
                                className={`cursor-pointer px-3 py-1 ${section.currentValue === options.value
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-700"
                                    }`}
                                onClick={() =>
                                    section.onchange(
                                        section.currentValue === options.value ? null : options.value
                                    )
                                }
                            >
                                {options.label}
                                {section.currentValue === options.value && (
                                    <Check className="ml-1 h-3 w-3 inline" />
                                )}
                            </Badge>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CarFilterControl;