"use client"

import Sidebar from "@/components/common/sidebar";
import React from 'react';


const threadsLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <Sidebar>
      {children}
    </Sidebar>
  )
}

export default threadsLayout