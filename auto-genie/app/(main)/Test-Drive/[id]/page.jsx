
import { db } from "@/lib/prisma";
import TestDriveForm from "../_components/test-drive-form";
import { getCarById } from "@/actions/cars-listing";
import { notFound } from "next/navigation";
export async function getMetaData(){
    return{
    title:'Book a test drive',
    description: 'Schedule a test drive in few seconds',
    }
};




const TestDrivePage = async ({ params }) => {
  const { id } = params;

  if (!id) {
    notFound();
  }

  const car = await getCarById(id);

  if (!car) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 ">
      <h1 className="text-6xl mb-6 gradient-title">Book a Test Drive</h1>
      
      <TestDriveForm car={car.data} testDriveInfo={car.data.testDriveInfo}/>
    </div>
  )
};

export default TestDrivePage;