import React, { useEffect, useState } from 'react'
import protectedRoutesDoctor from '@/components/doctorProtectedRoutes'
import Layout from '@/components/Navbar/Layout'
import DatePicker from 'react-multi-date-picker'
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import classes from "@/styles/manageAvailability.module.css"
import { IoMdCloseCircle } from "react-icons/io";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import useAuth from '@/hooks/useAuth';

function ManageAvailability() {
  const [selectedDates, setSelectedDates] = useState([])
  const [loading,setLoading] = useState(true)
  const [scheduleExist,setScheduleExist] = useState(false)
  
  const {userAuth} = useAuth()
  const axiosPrivate = useAxiosPrivate()




  let minDate = new Date()
  minDate.setDate(minDate.getDate())

  let maxDate = new Date()
  maxDate.setDate(minDate.getDate() + 30)

  useEffect(()=>{
    const getDoctorSchedule = async()=>{
      try{
        const res = await axiosPrivate.get("doctoravailability/getschedule");
        if(res.status===200){
          setSelectedDates(res.data?.availability?res.data?.availability:[])
          setScheduleExist(true)
        }
        setLoading(false)
      }catch(error){
        setLoading(false)
        console.log(error)
      }
     
    } 
    getDoctorSchedule()
  },[])

console.log(selectedDates)


const checkOverlap = (timeSlots, newStartTime) => {
  const newStart = dayjs(newStartTime);
  const now = dayjs(); 
  
console.log(newStart)
  
  if (newStart.isBefore(now)) {
    return { isOverlap: true, isPastTime: true }; 
  }

  
  for (let i = 0; i < timeSlots.length; i++) {
    const slot = timeSlots[i];
    const startTime = dayjs(slot.startTime);
    console.log(startTime)

    if (newStart.isSame(startTime) ) {
      return { isOverlap: true, isPastTime: false }; 
    }
  }
  return { isOverlap: false, isPastTime: false };
};



  const handleDateChange = (e) => {

    let dateExist = selectedDates.some(item => item.date === e.target.value)

    if (!dateExist) {
      const suppliedDate = e.target.value
      const currentTime = dayjs()
      
      const startTime = dayjs(suppliedDate).hour(currentTime.hour()).minute(currentTime.minute()).second(currentTime.second()).format('YYYY-MM-DD HH:mm:ss')
      
      let myDate = {
        "date": e.target.value,
        "timeSlots": [{
          startTime: startTime,"booked":false
        }]
      }
  
      
      setSelectedDates([...selectedDates, myDate])
    }


  }


  console.log(selectedDates)



  const handleDeleteDate=(date,index)=>{
    let newDates = selectedDates.filter((_,i)=>i!=index)
    setSelectedDates(newDates)
  }

  

  const handleTimeChange = (date, timeIndex, type, value) => {
    const newTime = value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : null;
  
    setSelectedDates((prevDates) =>
      prevDates.map((item) => {
        if (item.date === date) {
          const newTimeSlots = item.timeSlots.map((slot, index) => {
            if (index === timeIndex) {
              
              const updatedSlot = { ...slot, [type]: newTime };
  
              
              const overlapCheck = checkOverlap(item.timeSlots, updatedSlot.startTime);
  
              if (overlapCheck.isOverlap) {
                if (overlapCheck.isPastTime) {
                  alert("Cannot update time slot: The selected time is in the past.");
                } else {
                  alert("Cannot update time slot: The selected time overlaps with an existing slot.");
                }
                return slot; 
              }
  
              return updatedSlot;
            }
            return slot;
          });
  
          return { ...item, timeSlots: newTimeSlots };
        }
        return item;
      })
    );
  };



  const handleAddTimeSlot = (date) => {
    setSelectedDates((prevDates) =>
      prevDates.map((item) => {
        if (item.date === date) {
          let previousStartTime = item.timeSlots[item.timeSlots.length - 1]?.startTime;
          
          if (previousStartTime) {
            previousStartTime = dayjs(previousStartTime);
            const newStartTime = previousStartTime.add(30, "minute").format('YYYY-MM-DD HH:mm:ss'); 
            console.log(newStartTime)
  
            // const overlapCheck = checkOverlap(item.timeSlots, newStartTime);
  
            // if (overlapCheck.isOverlap) {
            //   if (overlapCheck.isPastTime) {
            //     alert("Cannot add time slot: The selected time is in the past.");
            //   } else {
            //     alert("Cannot add time slot: The selected time overlaps with an existing slot.");
            //   }
            //   return item; 
            // }
  
            return {
              ...item,
              timeSlots: [...item.timeSlots, { startTime: newStartTime, booked: false }]
            };
          }
        }
        return item;
      })
    );
  };

  const handleSlotDelete = (date, index) => {
    setSelectedDates((prevDates) =>
      prevDates.map((item) =>
        item.date === date
          ? {
            ...item,
            timeSlots: item.timeSlots.filter((_, i) => i !== index)
          }
          : item
      ).filter(item => item.timeSlots.length > 0) 
    )
  }

  const handleCreateAppointmentSlots= async()=>{

    
    try{
      // if(selectedDates.length===0 && scheduleExist){
      //   const deleteSchedule = await axiosPrivate.delete("doctoravailability/deleteschedule/")
      //   if(deleteSchedule.status===200){
      //     console.log(deleteSchedule.data)
      //     setScheduleExist(false)
      //   }
      // }
      if(scheduleExist){
        const updatedSchedule = await axiosPrivate.put("doctoravailability/updateschedule/",JSON.stringify({"availability":selectedDates}))
        if(updatedSchedule.status===200){
          console.log(updatedSchedule.data) //------------->ADD MESSAGE HERE LIKE UPDATED SCHEDULE
        }
      }
      else if(!scheduleExist  && selectedDates.length!==0){
        const newSchedule = await axiosPrivate.post("doctoravailability/",JSON.stringify({"availability":selectedDates}))
        if(newSchedule.status===201){
          setScheduleExist(true)
          console.log(newSchedule.data) //------------->ADD MESSAGE HERE LIKE CREATED SCHEDULE
        }
      }
      
    }
    catch(error){
      console.log(error)
    }
    

  }

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate.toISOString().split('T')[0];
  };

console.log(JSON.stringify(selectedDates))
 

  if(loading){
    return<main>Loading...</main>
}
  return (
    // ---------------DEMO-------------------------------------------------------------------------
    <main className={classes.main}>
      <div className={classes.dateAndHeadingDiv}>
      <h1 className={classes.h1Heading}>
        Manage your availability
      </h1>
      <div className={classes.dateInputDiv}> 
        <input className={classes.dateInput} type='date' min={new Date().toISOString().split("T")[0]} max={getMaxDate()} onChange={handleDateChange}></input>


      </div>
      </div>
      

      <h1>Your dates</h1>
      {selectedDates.length === 0 ? <h3>No Dates Selected</h3> :
        selectedDates.map((item, index) => {
          return (
            <div key={index} className={classes.startAndEndTimeMain} >
              <button onClick={() => handleDeleteDate(item.date, index)} className={classes.startAndEndTimeMain__closeButton}><IoMdCloseCircle size={30} color='red' /></button>
              <h3>{new Date(item?.date).toDateString() || ""}</h3>
              <p>Number of slots : {item?.timeSlots?.length}</p>
              <div className={classes.startAndEndTimeContainer}>
              
                {item?.timeSlots.map((t, j) => {
                  return (
                   
                    <div key={j} className={classes.StartAndEndTimeWithCloseButton} >
                       
                      <button onClick={() => handleSlotDelete(item.date, j)} className={classes.singleStartAndEndTime__closeButton}><IoMdCloseCircle size={20} color='red' /></button>
                      <div className={classes.singleStartAndEndTime}>
                      <label htmlFor='startTime'>Start time</label>
                      {/* <input type='time' id='startTime' value={t.startTime} onChange={(e) => handleTimeChange(item.date, j, 'startTime', e.target.value)}></input> */}

                      <TimePicker value={dayjs(t.startTime)} sx={{
                        '.MuiInputBase-root': {
                          height: '30px',
                          width: '120px',
                          fontSize: '10px',
                        },
                        '.MuiInputBase-input': {
                          fontSize: '12px',
                        },
                        '.MuiSvgIcon-root': {
                          width: '14px',
                          height: '14px',
                        }
                      }}  onAccept={(time) => handleTimeChange(item.date, j, 'startTime', time)} name='startTime'></TimePicker>


                      {/* <label htmlFor='endTime'>End time</label> */}
                      {/* <input type='time' id='endTime' value={t.endTime} onChange={(e) => handleTimeChange(item.date, j, 'endTime', e.target.value)}></input> */}
                      {/* <TimePicker value={dayjs(t.endTime)} sx={{
                        '.MuiInputBase-root': {
                          height: '30px',
                          width: '120px',
                          fontSize: '10px',
                        },
                        '.MuiInputBase-input': {
                          fontSize: '12px',
                        },
                        '.MuiSvgIcon-root': {
                          width: '14px',
                          height: '14px',
                        }
                      }} onAccept={(time) => handleTimeChange(item.date, j, 'endTime', time)} name='startTime'></TimePicker> */}
                        </div>

                      
                    </div>

                  )
                })}
              </div>
              <div className={classes.addNewSlotButtonContainer} >
                <button className={classes.addNewSlotButton} onClick={() => handleAddTimeSlot(item?.date)}>Add new slot</button>
              </div>

            </div>
          )
        })}
        <div className={classes.finalSubmitButtonContainer}>
        {!scheduleExist && <button type='button' className={classes.finalSubmitButton} onClick={handleCreateAppointmentSlots}>Create appointment slots</button>}
        {scheduleExist  &&  <button type='button' className={classes.finalSubmitButton} onClick={handleCreateAppointmentSlots}>Update appointment slots</button>}
        </div>


    </main>
  )
}

ManageAvailability.NavLayout = Layout
export default protectedRoutesDoctor(ManageAvailability)