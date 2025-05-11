"use server";
import { db } from "@/lib/prisma";
import { serializeCarData } from "@/lib/helper";
import { auth } from "@clerk/nextjs/server";
import { Description } from "@radix-ui/react-dialog";
import { revalidatePath } from "next/cache";

export async function getCarFilters() {
    try {
        const makes = await db.car.findMany({
            where: { status: "AVAILABLE" },
            select: { make: true },
            distinct: ["make"],
            orderBy: { make: "asc" },
        });
        //Get fuel types
        const fuelTypes = await db.car.findMany({
            distinct: ['fuelType'],
            orderBy: { fuelType: "asc" },
        });

        //Get unique transmission types
        const transmissionTypes = await db.car.findMany({
            where: { status: "AVAILABLE" },
            select: { transmission: true },
            distinct: ["transmission"],
            orderBy: { transmission: "asc" },
        });

        //get min and max price using Prisma aggregation
        const priceAggregation = await db.car.aggregate({
            where: { status: "AVAILABLE" },
            _min: { price: true },
            _max: { price: true },
        });

        //get unique body types
        const bodyTypes = await db.car.findMany({
            where: { status: "AVAILABLE" },
            select: { bodyType: true },
            distinct: ["bodyType"],
            orderBy: { bodyType: "asc" },
        });

        return {
            sucess: true,
            data: {
                makes: makes.map(item => item.make),
                bodyTypes: bodyTypes.map(item => item.bodyType),
                fuelTypes: fuelTypes.map(item => item.fuelType),
                transmissionTypes: transmissionTypes.map(item => item.transmission),
                priceRange: {
                    min: priceAggregation._min.price
                        ? parseFloat(priceAggregation._min.price.toString())
                        : 0,
                    max: priceAggregation._max.price
                        ? parseFloat(priceAggregation._max.price.toString())
                        : 100000,
                },
            },
        };
    }
    catch (error) {
        throw new Error("Failed to fetch car filters: " + error.message);
    }
}

export async function getCars({
    userId = null, // Allow passing a mock userId
    search = "",
    make = "",
    bodyType = "",
    fuelType = "",
    transmission = "",
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
    sortBy = "newest",
    page = 1,
    limit = 6,
}) {
    try {
        // Use the provided userId or fetch it using auth()
        if (!userId) {
            const authResult = await auth();
            userId = authResult.userId;
        }

        let dbUser = null;

        // If userId exists, fetch the user
        if (userId) {
            dbUser = await db.user.findUnique({
                where: { clerkUserId: userId },
            });
        }

        let where = {
            status: "AVAILABLE",
        };

        // Apply search filters
        if (search) {
            where.OR = [
                { make: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (make) where.make = { equals: make, mode: "insensitive" };
        if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
        if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" };
        if (transmission) where.transmission = { equals: transmission, mode: "insensitive" };

        where.price = {
            gte: parseFloat(minPrice) || 0,
        };

        if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
            where.price.lte = parseFloat(maxPrice);
        }

        const skip = (page - 1) * limit;

        // Determine sorting order
        let orderBy = {};
        switch (sortBy) {
            case "newest":
                orderBy = { createdAt: "desc" };
                break;
            case "priceASC":
                orderBy = { price: "asc" };
                break;
            case "priceDESC":
                orderBy = { price: "desc" };
                break;
            default:
                orderBy = { createdAt: "desc" };
        }

        const totalCars = await db.car.count({ where });

        // Execute the main query
        const cars = await db.car.findMany({
            where,
            orderBy,
            skip,
            take: limit,
        });
        

        let wishlisted = new Set();
        
        if (dbUser) {
            const savedCars = await db.UserSavedCar.findMany({
                where: { userId: dbUser.id },
                select: { carId: true },
            });
            
            wishlisted = new Set(savedCars.map((saved) => saved.carId));
        }

        // Serialize the car data and check wishlist status
        const serializedCars = cars.map((car) =>
            serializeCarData(car, wishlisted.has(car.id))
        );


        return {
            success: true,
            data: serializedCars,
            pagination: {
                total: totalCars,
                page,
                limit,
                pages: Math.ceil(totalCars / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching cars:", error.message);
        
    }
}

export async function toggleSavedCar(carId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });


    if (!user) throw new Error("User not found");

    // Check if car exists
    const car = await db.car.findUnique({
      where: { id: carId },
    });
    

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // Check if car is already saved
    const existingSave = await db.userSavedCar.findUnique({
      where: {
        userId_carId: {
          userId: user.id,
          carId,
        },
      },
    });

    // If car is already saved, remove it
    if (existingSave) {
      await db.userSavedCar.delete({
        where: {
          userId_carId: {
            userId: user.id,
            carId,
          },
        },
      });

      revalidatePath(`/saved-cars`);
      return {
        success: true,
        saved: false,
        message: "Car removed from favorites",
      };
    }

    // If car is not saved, add it
    await db.userSavedCar.create({
      data: {
        userId: user.id,
        carId,
      },
    });

    revalidatePath(`/saved-cars`);
    return {
      success: true,
      saved: true,
      message: "Car added to favorites",
    };
  } catch (error) {
    throw new Error("Error toggling saved car:" + error.message);
  }
}


export async function getSavedCars() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the user from our database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Get saved cars with their details
    const savedCars = await db.userSavedCar.findMany({
      where: { userId: user.id },
      include: {
        car: true,
      },
      orderBy: { savedAt: "desc" },
    });

    // Extract and format car data
    const cars = savedCars.map((saved) => serializeCarData(saved.car));

    return {
      success: true,
      data: cars,
    };
  } catch (error) {
    console.error("Error fetching saved cars:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}


export async function getCarById(carId) {
  try {
    // Get current user if authenticated
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    // Get car details
    const car = await db.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // Check if car is wishlisted by user
    let isWishlisted = false;
    if (dbUser) {
      const savedCar = await db.userSavedCar.findUnique({
        where: {
          userId_carId: {
            userId: dbUser.id,
            carId,
          },
        },
      });

      isWishlisted = !!savedCar;
    }

    // Check if user has already booked a test drive for this car
    const existingTestDrive = await db.testDriveBooking.findFirst({
      where: {
        carId,
        userId: dbUser.id,
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let userTestDrive = null;

    if (existingTestDrive) {
      userTestDrive = {
        id: existingTestDrive.id,
        status: existingTestDrive.status,
        bookingDate: existingTestDrive.bookingDate.toISOString(),
      };
    }

    // Get dealership info for test drive availability
    const dealership = await db.dealershipInfo.findFirst({
      include: {
        workingHours: true,
      },
    });

    return {
      success: true,
      data: {
        ...serializeCarData(car, isWishlisted),
        testDriveInfo: {
          userTestDrive,
          dealership: dealership
            ? {
                ...dealership,
                createdAt: dealership.createdAt.toISOString(),
                updatedAt: dealership.updatedAt.toISOString(),
                workingHours: dealership.workingHours.map((hour) => ({
                  ...hour,
                  createdAt: hour.createdAt.toISOString(),
                  updatedAt: hour.updatedAt.toISOString(),
                })),
              }
            : null,
        },
      },
    };
  } catch (error) {
    throw new Error("Error fetching car details:" + error.message);
  }
}