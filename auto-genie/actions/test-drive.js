
"use server"

import { serializeCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/dist/types/server"
import { revalidatePath } from "next/cache";

export async function bookTestDrive({
    carId,
    bookingDate,
    startTime, 
    endTime,
    notes
}){ try{

    const {userId}=await auth();

    if (!userId) throw new Error("You must be logged in to book test drive");
    const user =await db.user.findUnique({
        where :{clerkUserId: userId},

    });

    if (!user ) throw new Error("User not found");


    const car = await db.car.findUnique({
        where: {id:carId, status:"AVAILABLE"}
    })

    if (!car) throw Error("Carnot available for test drive");

    const existingBooking=await db.testDriveBooking.findFirst({
        where:{

    carId,
    bookingDate: new Date(bookingDate),
    startTime, 
    status: {in :["PENDING", "CONFIRMED"]},
    

        },
    });

    if (existingBooking) throw Error("This time slot is already booked"); 
    const booking=await db.testDriveBooking.create({
    data:{

    carId:user.id,
    bookingDate: new Date(bookingDate),
    startTime, 
    endTime,
    notes: notes || null,
    status: "PENDING"
        },
    });

    revalidatePath(`/Test-Drive/${carId}`);
    revalidatePath(`/cars/${carId}`);

    return{
        succes:true,
        data:booking,
    };

}
catch(error){
    console.error("Error in test drive booking:", error);

    return{
        success:false,
        error: error.message|| "Failed to book test drive",
    };





}
}


export async function getUserTestDrives(){

    const {userId}=await db.testDriveBooking.findMany({
        where :{userId: user.id},
        include: {
            car:true,
        },
        orderBy:{bookingDate:"desc"},

    });

    const formatBookings=bookings.map((booking)=>({
        id:booking.id,
        carId: booking.carId,
        car: serializeCarData(booking.car),
        bookingDate: booking.bookingDate.toISOString(),
        startTime:booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),


    }));
    return{
        success: true,
        data: formattedBookings,
    };

}

export async function CancelTestDrive(bookingId){
    try{

        const {userId}=await auth();

        if (!userId) throw new Error("You must be logged in to book test drive");
        const user =await db.user.findUnique({
            where :{id: bookingId},

    });

    if (!booking ){
        return{
            success:false,
            error: "booking not found"
        }
    }
if (booking.userId !==user.id|| user.role!=="ADMIN"){
    return{
        success:false,
        error:"Unauthorised to cancel this booking",
    };
}

    if (booking.status==="CANCELLED"){
        return{
            success:false,
            error:"booking is already cancelled"
        }
    }

    if(booking.status==="COMPLETED"){
        return{
            success:false,
            error:"Cannot cancel a completed booking"

        };
    }

        await db.testDriveBooking.update({
            where: {id:bookingId},
            data:{status: "CANCELLED"},
        });

        revalidatePath(`/reservations`);
        revalidatePath(`/admin/test-drives`);
        return{
                success:true,
                error:"Cancelled test drive successfully"

            };

    } catch(error){
        console.error("error in cancellation");
        return{
            success:false
        }

    }



}