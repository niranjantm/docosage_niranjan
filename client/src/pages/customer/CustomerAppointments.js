import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import protectedRoutesCustomer from '@/components/protectedRoute'
import Layout from '@/components/Navbar/Layout'
import AppointmentCard from '@/components/AppointmentCard'
import classes from "@/styles/customerAppointments.module.css"



function CustomerAppointments() {

    const axiosPrivate = useAxiosPrivate()
    const [appointments,setAppointments] = useState([])
    const [error,setError] = useState('')
   

    useEffect(()=>{
        const getAppointments = async()=>{
            try{
                const res = await axiosPrivate.get("appointment/cus");
                if(res.status===200){
                    setAppointments(res?.data)
                    setError('')
                }else{
                    setError(res?.message)
                }
            }catch(error){
                setError(error?.message)
            }
           
        }
        getAppointments()
    },[])

    const handleAppointmentDelete =(id)=>{
       const newAppointments = appointments.filter((item)=>{
        return item.doctor_availability!=id
       })
       setAppointments(newAppointments)
    }

  return (
    <main className={classes.main}>
         <h2>Your appointments</h2>
         <section className={classes.appointmentCardContainer}>
         {appointments.map((item,index)=>{
            return(
              
              
    <AppointmentCard key={index} appointmentData = {item} handleAppointmentDelete={handleAppointmentDelete} >
                {/* <h2>Dr. {item.doctorName}</h2>
                <p>Date: {item.date} </p>
                <p>Time: {dayjs(item.startTime).format("hh:mm:a")} </p>
                <p>Title: {item.title} </p>
                <p>Description: {item.description}</p> */}
                </AppointmentCard>
            
            )
        })}
         </section>
        
    </main>
  )
}
// CustomerAppointments.NavLayout = Layout;
export default protectedRoutesCustomer(CustomerAppointments);