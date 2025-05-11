"use server"
import { serializeCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getCarById(carId){

    try{
    const {userId} = await auth()
    let dbUser=null;

    if (userId){
        dbUser= await db.user.findUnique({
            where : {clerkUserId:userId},

        });
    }

    const car=await db.car.findUnique({
        where : {id: carId}
    })

    if (!car){
        return{
            succes:false,
            error:"Car not found"
        }; 
    }
    let isWishlisted=false;
    if (dbUser){
        const savedCar=await db.userSavedCar.findUnique({
            where:{
                userId_carId:{
                    userId:dbUser.id,
                    carId
                },
            },
        });

        isWishlisted=!!savedCar

        const existingTestDrive =await db.testDriveBooking.findFirst({
            where:{
                carId,
                userId:dbUser.id,
                status :{in:["PENDING", "CONFIRMED","COMPLETED"]},

            },
            orderBy:{
                createdAt:"desc",

            },
        });

        let usertestdrive=null;

        if (existingTestDrive){
            userTestDrive={
                id:existingTestDrive.id,
                status:existingTestDrive.status,
                bookingDate:existingTestDrive.bookingDate.toISOString(),
            };
        }

        const dealership=await db.dealershipInfo.findFirst({
            include:{
                workingHours:true,
            },
        });

        return{
            success: true,
            data:{
                ...serializeCarData(car, isWishlisted),

                testDriveInfor:{
                    usertestdrive,
                    dealership:dealership?{
                        ...dealership,
                        createdAt:dealership.createdAt.toISOString(),
                        updatedAt:dealership.updatedAt.toISOString(),
                        workinghours:dealership.workingHours.map((hour)=>({
                            ...hour,

                            createdAt:hour.createdAt.toISOString(),
                            updatedAt:dealership.updatedAt.toISOString(),
                        })),
                        
                    }
                    :null,

                },
            },
        }
    };




} catch(error) {
    throw new Error("error fetching car details"+error.message);

}
}