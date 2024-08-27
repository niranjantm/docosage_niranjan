import React, { useEffect, useState } from 'react'
import protectedRoutesCustomer from '@/components/protectedRoute'
import Layout from '@/components/Navbar/Layout'
import { useRouter } from 'next/router'
import classes from "@/styles/appointmentBooking.module.css"
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import dayjs from 'dayjs'
import CustomerAppointmentDetailPopup from '@/components/customerAppointmentDetailPopup'

function bookAppointment() {

  const router = useRouter()
  const axiosPrivate = useAxiosPrivate()
  const doctorId = router.query?.id

  const [doctorInfo, setDoctorInfo] = useState('')
  const [doctorAvailability, setDoctorAvailability] = useState([])
  const [getDates, setGetDates] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAdditionDetails, setShowAdditionDetails] = useState(false)
  const [appointment,setAppointment] = useState({"date":"","startTime":"","doctor_id":doctorId,"doctor_name":router.query?.doctor})


  const handleSelectDate = async (e) => {
    e.preventDefault()
    
    try{
      const res = await axiosPrivate.get(`gettimeslot/${doctorId}/?date=${e.target.value}`)

      if(res.status===200){
        setAppointment((pre)=>{
          return {...pre,"date":e.target.value}})
        setGetDates(res.data)
      }
    }
    catch(error){
      console.log(error)
    }

  }

  const handleSelectTime = (e, time) => {
    e.preventDefault();
    setAppointment((pre)=>{
      return {...pre,"startTime":time}
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
        else {
          setLoading(false)
        }
      } catch (error) {
        console.log(error)
        setLoading(false)
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
                <button type='button' onClick={handleSelectDate} value={item} className={classes.dateButton}>{day}</button>
              )
            })
          }

        </div>
        <div className={classes.timeContainer}>
          {(doctorInfo?.availability === null) ? "" :
            getDates.map((slot, i) => {
              let time = dayjs(slot).format("hh:mm:a")
              let startTime = slot

              return (
                <button type='button' disabled={slot.booked} onClick={(e) => handleSelectTime(e, startTime)} className={slot?.booked ? classes.timeButtonBooked : classes.timeButtonAvailable}>{time}</button>
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