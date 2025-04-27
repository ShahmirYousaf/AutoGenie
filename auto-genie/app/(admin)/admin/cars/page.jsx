import { Description } from '@radix-ui/react-dialog';
import React from 'react'
import CarsList from './_components/car-list';

export const metadata = {
    title:"Cars | AutoGenie Admin",
    description: "Manage Cars in Your Marketplace",
};

const CarsPage = () => {
  return (
    <div className='p-6'>
        <h1 className='text-2xl font-bold mb-6'>
            Cars Management
        </h1>
        <CarsList />
    </div>
  )
}

export default CarsPage;