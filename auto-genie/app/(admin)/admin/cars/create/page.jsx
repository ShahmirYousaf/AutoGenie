import React from 'react'
import AddNewCar from '../_components/add-new-car';

export const metadata = {
    title:"Add New Car | AutoGenie Admin",
    description: "Add a New Car to the Marketplace",
};

const AddCarPage = () => {
  return (
    <div className='p-10'>
        <h1 className='text-2xl font-bold mb-6 text-blue-700'>
            Add New Car
        </h1>

        <AddNewCar />
    </div>
  )
}

export default AddCarPage;