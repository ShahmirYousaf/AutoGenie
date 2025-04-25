import React from 'react'

const CarPage = async ({params}) => {
    const {id} = await params;
  return (
    <div>Car</div>
  )
}

export default CarPage;