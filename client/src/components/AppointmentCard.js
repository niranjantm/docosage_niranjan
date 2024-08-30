import React from 'react'
import classes from "@/styles/appointmentCard.module.css"
import dayjs from 'dayjs'
import Link from 'next/link'
import useAxiosPrivate from '@/hooks/useAxiosPrivate';

function AppointmentCard({appointmentData,handleAppointmentDelete}) {

  const axiosPrivate = useAxiosPrivate()

  const handleCancelAppointment= async(e)=>{
    e.preventDefault();
    try{
      const res = await axiosPrivate.delete(`appointment/${appointmentData.id}`)
      if(res.status===200){
        console.log(res.data)
        handleAppointmentDelete(appointmentData.doctor_availability)
      }
      else{
        console.log(res?.message)
      }
    }catch(error){
      console.error(error)
    }
  }
  return (
    <section className={classes.mainSection}>
        <div className={classes.appointmentInfoContainer}>
        <h3>{appointmentData.doctorName}</h3>
        <p>Date: {appointmentData.date} </p>
        <p>Time: {dayjs(appointmentData.startTime).format("hh:mm:a")} </p>
        <p>Title: {appointmentData.title} </p>
        <p>Description: {appointmentData.description}</p>
        </div>
        <div className={classes.buttonContainer}>
          <button className={classes.cancelButton} type='button' onClick={handleCancelAppointment}>Cancel appointment</button>
          <Link className={classes.rescheduleButton} href={`customer/bookAppointment/${appointmentData.doctor}?doctor=${appointmentData.doctorName}&reschedule=${true}&appointment_id=${appointmentData.id}`}>Reschedule appointment</Link>
        </div>
    </section>
  )
}

export default AppointmentCard