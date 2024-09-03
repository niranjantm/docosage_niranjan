import React from 'react'
import classes from "@/styles/appointmentCard.module.css"
import dayjs from 'dayjs'
import Link from 'next/link'
import useAxiosPrivate from '@/hooks/useAxiosPrivate';
import Swal from 'sweetalert2';

function AppointmentCard({appointmentData,handleAppointmentDelete}) {

  const axiosPrivate = useAxiosPrivate()

  const handleCancelAppointment= async(e)=>{
    e.preventDefault();
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want cancel your appointment.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!"
    })

    if (result.isConfirmed) {
        try{
          const res = await axiosPrivate.delete(`appointment/${appointmentData.id}`)
          if(res?.status===200){
            handleAppointmentDelete(appointmentData.doctor_availability)

            await Swal.fire({
              title: "Appointment Cancelled!",
              text: "Your appointment has been cancelled.",
              icon: "success"
            });
          }
        }catch(error){
          if(error?.response?.data ==="UserAccountTypes matching query does not exist."){
            await Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Appointment not found!",
            });
            
          }
          else{
            await Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong!",
            });
          }
        }
        
      }
    ;
    
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