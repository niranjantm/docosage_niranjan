import React, { useEffect, useState } from 'react'
import protectedRoutesCustomer from '@/components/protectedRoute'
import Layout from '@/components/Navbar/Layout'
import { useRouter } from 'next/router'
import classes from "@/styles/appointmentBooking.module.css"
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import dayjs from 'dayjs'
import CustomerAppointmentDetailPopup from '@/components/customerAppointmentDetailPopup'
import Swal from 'sweetalert2'

function bookAppointment() {

  const router = useRouter()
  const axiosPrivate = useAxiosPrivate()
  const doctorId = router.query?.id
  const reschedule = Boolean(router.query?.reschedule) || false
  const oldAppointmentId = router.query?.appointment_id || null

  const [doctorInfo, setDoctorInfo] = useState('')
  const [doctorAvailability, setDoctorAvailability] = useState([])
  const [time, setTime] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAdditionDetails, setShowAdditionDetails] = useState(false)
  const [appointment,setAppointment] = useState({"date":"","startTime":"","doctor_id":Number(doctorId),"doctor_name":router.query?.doctor,"availability_id":""})


  const handleSelectDate = async (e) => {
    e.preventDefault()
    
    try{
      const res = await axiosPrivate.get(`gettimeslot/${doctorId}/?date=${e.target.value}`)

      if(res.status===200){
        setAppointment((pre)=>{
          return {...pre,"date":e.target.value}})
        setTime(res.data)
      }
    }
    catch(error){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    }

  }

  const handleSelectTime = (e, time,availability_id) => {
    e.preventDefault();
    setAppointment((pre)=>{
      return {...pre,"startTime":time,"availability_id":availability_id,"reschedule":reschedule,"oldAppointmentId":oldAppointmentId}
    })
      setShowAdditionDetails(true)
    }
   
  



  useEffect(() => {
    const getDoctorSchedule = async () => {
      try {
        setLoading(true)
        const res = await axiosPrivate.get(`makeappointment/${doctorId}/`)
        if (res.status === 200) {
          console.log(res.data)
          setDoctorInfo(res.data)
          setDoctorAvailability(res.data?.availability)
          setLoading(false)
        }
      } catch (error) {
        setLoading(false)
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      }

    }
    getDoctorSchedule()
  }, [showAdditionDetails])

  if (loading) {
    return <div>Loading...</div>
  }


  return (
    <main className={classes.main}>
      {showAdditionDetails && <div className={classes.popupDiv}><CustomerAppointmentDetailPopup show={showAdditionDetails} setShow={setShowAdditionDetails} appointmentDetail = {appointment}></CustomerAppointmentDetailPopup></div>}

      <div className={classes.doctorMainContainer}>

        <div className={classes.imageContainer}>
          <img className={classes.imageTag} src='https://images.pexels.com/photos/48604/pexels-photo-48604.jpeg?auto=compress&cs=tinysrgb&w=600'></img>
        </div>

        <div className={classes.doctorInformationContainer}>
          <h3>Dr. {router.query?.doctor}</h3>
          <p>{doctorInfo?.practiceType}</p>
          <p>{doctorInfo?.yearsOfExperience} years of experience</p>
          <p>clinic address: {doctorInfo?.clinicAddress} </p>
          <p>pin code: {doctorInfo?.clinicZipCode}</p>
        </div>

      </div>

      <div className={classes.appointmentDatesAndTimeMainContainer}>
        <h3>Book appointment</h3>
        

        <div className={classes.dateContainer}>
          {doctorInfo?.availability === null ? <p>No appointments available</p> :
            doctorAvailability.map((item, index) => {
              let day = new Date(item).toDateString()
              return (
                <button key={index} type='button' onClick={handleSelectDate} value={item} className={classes.dateButton}>{day}</button>
              )
            })
          }

        </div>
        <div className={classes.timeContainer}>
          {(doctorInfo?.availability === null) ? "" :
            time.map((slot, i) => {
              let time = dayjs(slot?.startTime).format("hh:mm:a")
              let startTime = slot?.startTime

              return (
                <button key={i} type='button' disabled={slot.booked} onClick={(e) => handleSelectTime(e, startTime,slot.availability_id)} className={slot?.booked ? classes.timeButtonBooked : classes.timeButtonAvailable}>{time}</button>
              )
            })}

        </div>


      </div>

      <form>
        {/* Customer Input */}

        <div>
          {/* Submit Button */}
        </div>

      </form>

    </main>
  )
}


bookAppointment.NavLayout = Layout
export default protectedRoutesCustomer(bookAppointment)