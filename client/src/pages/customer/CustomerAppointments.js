import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import protectedRoutesCustomer from '@/components/protectedRoute'
import Layout from '@/components/Navbar/Layout'

function CustomerAppointments() {

    const axiosPrivate = useAxiosPrivate()
    const [appointments,setAppointments] = useState([])

    useEffect(()=>{
        const getAppointments = async()=>{
            const res = await axiosPrivate.get("appointment/cus");
            if(res.status===200){
                setAppointments(res.data)
            }
        }
        getAppointments()
    },[])
  return (
    <main>
        <h1>My Appointments</h1>

        
    </main>
  )
}
CustomerAppointments.NavLayout = Layout;
export default protectedRoutesCustomer(CustomerAppointments);