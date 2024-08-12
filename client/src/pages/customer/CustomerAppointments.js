import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import protectedRoutesCustomer from '@/components/protectedRoute'
import Layout from '@/components/Navbar/Layout'
import AppointmentCard from '@/components/AppointmentCard'
import classes from "@/styles/customerAppointments.module.css"
import dayjs from 'dayjs'


function CustomerAppointments() {

    const axiosPrivate = useAxiosPrivate()
    const [appointments,setAppointments] = useState([])

    useEffect(()=>{
        const getAppointments = async()=>{
            const res = await axiosPrivate.get("appointment/cus");
            if(res.status===200){
                console.log(res.data)
                setAppointments(res.data)
            }
        }
        getAppointments()
    },[])
  return (
    <main className={classes.main}>
        {appointments.map((item,index)=>{
            return(
            <AppointmentCard key={index}><div>
                <h2>Dr. {item.doctorName}</h2>
                <p>Date: {item.date} </p>
                <p>Time: {dayjs(item.startTime).format("hh:mm:a")} </p>
                <p>Title: {item.title} </p>
                <p>Description: {item.description}</p>
                </div></AppointmentCard>
            )
        })}
    </main>
  )
}
CustomerAppointments.NavLayout = Layout;
export default protectedRoutesCustomer(CustomerAppointments);