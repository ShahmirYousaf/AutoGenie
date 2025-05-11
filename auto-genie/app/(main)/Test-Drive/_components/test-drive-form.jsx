"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import {useRouter} from "next/navigation"
import React from "react"
import { useForm } from "react-hook-form"
import {z} from "zod"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CalenderIcon
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Caramel } from "next/font/google"
import { Calendar1Icon, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Controller } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"



const TestDriveSchema= z.object({

    data: z.date({
        required_error:"Please select a data for your test drive",
    }),
    timeSlot:z.string({
        required_error:"Please slect a time slot"
    }),
    notes:z.string().optional()

})

const TestDriveForm=({car,testDriveInfo})=>{

    const router =useRouter()

    const [avail_time_slots, setTimeSlots]=useState([])
    const [show_confirmation, setConfirmation]=useState(false)
    const [bookingDetails, setBookingDetails]=useState(null)

   const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState:{errors, isValid},

   } =useForm({
        resolver:zodResolver(TestDriveSchema),
        defaultValues:{
            data:undefined,
            timeSlot:undefined,
            notes:""
        },


   })
        const dealership=testDriveInfo?.dealership;
        const existingBookings=testDriveInfo?.existingBookings|| [];


        const SelectedDate=watch("date")

        const onSubmit=async()=>{


        }

        const isDayDisabled=(day)=>{
            if(day< new Date()){
                return true
            }
            
            const dayofWeek=format(day,"EEEE").toUpperCase();
            const daySchedule=dealership?.workingHours?.find(
                (schedule)=>schedule.dayofWeek===dayofWeek
            );

            return !daySchedule ||!daySchedule.isOpen;

        };

    return(

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Card>
                    <CardContent className='p-6'>
                        <h2 className="text-xl font-bold mb-4">Car Details</h2>
                        <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
                            {car.images && car.images.length>0?(
                                <img
                                    src={car.images[0]}
                                    alt={`${car.year} ${car.make} ${car.model}`}

                                    className="objext-cover w-full h-full"
                                />
                            ):(
                                <div className="w-full bg-gray-200 flex items-center justify-center">

                                    <Car className="h-12 w-12 text-gray-400"/>
                                </div>
                            )

                            }
                        </div>
                        <h3 className="text-lg font-bold">
                            {car.year} {car.make} {car.model} 
                        </h3>

                        <div className="mt-2 text-xl font-bold text-blue-600">
                           ${car.price.toLocaleString()}
                         </div>


                        
                    </CardContent>
                    
                    </Card>

            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardContent>
                        <h2 className="text-xl font-bold mb-6">Schedule Your Test Drive</h2>
                        <form onSubmit={handleSubmit(onSubmit)}
                            className='space-y-6'>
                                <label className="block text-sm font-medium">
                                    Select a Date

                                </label>
                            <Controller name="date" control={control} render={({field}) =>{

                                return(
                                    <div>
                                         <Popover>
                                            <PopoverTrigger asChild>
                                            <Button
                                            variant="outline"
                                            
                                            ><Calendar1Icon className="mr-2 h-4 w-4"/>
                                                {
                                                    field.value ?format(field.value, "ppp"):
                                                    "pick a date"
                                                }
                                            </Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.OnChange}
                                                    initialFocus
                                                    diables={isDayDisabled}
                                                />
                                            </PopoverContent>
                                            </Popover>
                      


                                    </div>



                                )
                            
                            
                            
                            }}


                            />
                            
                           
                            
                            
                            </form>
                    </CardContent>


                    
                </Card>

            </div>


        </div>



    )



}

export default TestDriveForm