import React, { Children } from 'react'

const MainLayout = ({children}) => {
  return (
    <div className='conatiner mx-auto my-32'> {children}</div>
  )
}

export default MainLayout;