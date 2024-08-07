import React, { useEffect, useState } from 'react'
import protectedRoutesDoctor from '@/components/doctorProtectedRoutes'
import Layout from '@/components/Navbar/Layout'
import DatePicker from 'react-multi-date-picker'
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import classes from "@/styles/manageAvailability.module.css"
import { IoMdCloseCircle } from "react-icons/io";
// import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
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



  const handleDateChange = (e) => {

    let dateExist = selectedDates.some(item => item.date === e.target.value)

    if (!dateExist) {
      const startTime = dayjs(new Date());
      let myDate = {
        "date": e.target.value,
        "timeSlots": [{
          startTime: startTime, endTime: startTime.add(1,'hour'),"booked":false
        }]
      }
      setSelectedDates([...selectedDates, myDate])
    }


  }


  console.log(selectedDates)


  const checkOverlap = (timeSlots, newStartTime, newEndTime, index = -1) => {
    const newStart = dayjs(newStartTime);
    const newEnd = dayjs(newEndTime);
    
  
    for (let i = 0; i < timeSlots.length; i++) {
      if (i === index) continue; 
  
      const slot = timeSlots[i];
      const startTime = dayjs(slot.startTime);
      const endTime = dayjs(slot.endTime);
  
     
      if ((newStart.isBefore(endTime) && newStart.isAfter(startTime)) ||
      (newEnd.isAfter(startTime) && newEnd.isBefore(endTime)) ||
      (newStart.isBefore(startTime) && newEnd.isAfter(endTime))){
        return true;
      }
    }
    return false;
  };



  const handleDeleteDate=(date,index)=>{
    let newDates = selectedDates.filter((_,i)=>i!=index)
    setSelectedDates(newDates)
  }

  // const handleTimeChange = (date, timeIndex, type, value) => {
  //   setSelectedDates((prevDates) =>
  //     prevDates.map((item) => {
  //       if (item.date === date) {
  //         const newTimeSlots = item.timeSlots.map((slot, index) =>
  //           index === timeIndex ? { ...slot, [type]: value } : slot
  //         );

  //         const newStartTime = type === 'startTime' ? value : item.timeSlots[timeIndex].startTime;
  //         const newEndTime = type === 'endTime' ? value : item.timeSlots[timeIndex].endTime;

  //         if (checkOverlap(newTimeSlots, newStartTime, newEndTime, timeIndex)) {
  //           alert('Time slots cannot overlap');
  //           return item;
  //         }

  //         return { ...item, timeSlots: newTimeSlots };
  //       }
  //       return item;
  //     })
  //   );
  // };

  const handleTimeChange = (date, timeIndex, type, value) => {
    const newTime = value ? dayjs(value) : null;
  
    setSelectedDates((prevDates) =>
      prevDates.map((item) => {
        if (item.date === date) {

          const newTimeSlots = item.timeSlots.map((slot, index) =>
            index === timeIndex ? { ...slot, [type]: newTime} : slot
          );
  
          // Determine the new start and end times
          const newStartTime = type === 'startTime' ? newTime : item.timeSlots[timeIndex].startTime;
          const newEndTime = type === 'endTime' ? newTime : item.timeSlots[timeIndex].endTime;
  
          // Check for overlap with the updated time slots
          if (checkOverlap(newTimeSlots, newStartTime, newEndTime, timeIndex)) {
            console.log('Time slots overlap detected');
            alert('Time slots cannot overlap');
            return { ...item, timeSlots: item.timeSlots }; // Revert to original time slots
          }
  
          // Update the state only if no overlap is detected
          return { ...item, timeSlots: newTimeSlots };
        }
        return item;
      })
    );
  };

  // const handleAddTimeSlot = (date) => {
  //   setSelectedDates((prevDates) =>
  //     prevDates.map((item) =>
  //       item?.date === date
  //         ? {
  //           ...item,
  //           timeSlots: [...item.timeSlots, { startTime: '08:00', endTime: '14:00' }]
  //         }
  //         : item
  //     )
  //   );
  // };

  const handleAddTimeSlot = (date) => {
    setSelectedDates((prevDates) =>
      prevDates.map((item) => {
        if (item.date === date) {
          const newStartTime = item.timeSlots[item.timeSlots.length - 1].endTime;
          const newStartDateTime = dayjs().set('hour', dayjs(newStartTime).hour()).set('minute', dayjs(newStartTime).minute());
          // const newEndDateTime = new Date(newStartDateTime.getTime() + 60 * 60 * 1000);


          const newEndTime = newStartDateTime.add(1, 'hour');



          if (checkOverlap(item.timeSlots, newStartTime, newEndTime)) {
            alert('Time slots cannot overlap');
            return item;
          }


          return {
            ...item,
            timeSlots: [...item.timeSlots, { startTime: newStartTime, endTime: newEndTime,"booked":false }]
          };

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
      if(selectedDates.length===0 && scheduleExist){
        const deleteSchedule = await axiosPrivate.delete("doctoravailability/deleteschedule/")
        if(deleteSchedule.status===200){
          console.log(deleteSchedule.data)
          setScheduleExist(false)
        }
      }
      else if(scheduleExist  && selectedDates.length!==0){
        const updatedSchedule = await axiosPrivate.put("doctoravailability/updateschedule/",JSON.stringify({"availability":selectedDates}))
        if(updatedSchedule.status===200){
          console.log(updatedSchedule.data) //------------->ADD MESSAGE HERE LIKE UPDATED SCHEDULE
        }
      }
      else if(!scheduleExist  && selectedDates.length!==0){
        const newSchedule = await axiosPrivate.post("doctoravailability/",JSON.stringify({"availability":selectedDates}))
        if(newSchedule.status===201){
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


  // console.log("Selected Dates: ", selectedDates)
  // console.log(JSON.stringify({"availability":selectedDates}))

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


                      <label htmlFor='endTime'>End time</label>
                      {/* <input type='time' id='endTime' value={t.endTime} onChange={(e) => handleTimeChange(item.date, j, 'endTime', e.target.value)}></input> */}
                      <TimePicker value={dayjs(t.endTime)} sx={{
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
                      }} onAccept={(time) => handleTimeChange(item.date, j, 'endTime', time)} name='startTime'></TimePicker>
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