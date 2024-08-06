import React, { useState } from 'react'
import protectedRoutesDoctor from '@/components/doctorProtectedRoutes'
import Layout from '@/components/Navbar/Layout'
import DatePicker from 'react-multi-date-picker'
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import { hours, minutes, aa } from '@/data/timeData';
import classes from "@/styles/manageAvailability.module.css"
import { IoMdCloseCircle } from "react-icons/io";

function ManageAvailability() {
  const [selectedDates, setSelectedDates] = useState([])
  // const [startTime,setStartTime] = useState([])


  let minDate = new Date()
  minDate.setDate(minDate.getDate())

  let maxDate = new Date()
  maxDate.setDate(minDate.getDate() + 30)



  const handleDateChange = (e) => {

    let dateExist = selectedDates.some(item => item.date === e.target.value)

    if (!dateExist) {
      let myDate = {
        "date": e.target.value,
        "timeSlots": [{
          startTime: "08:00", endTime: "09:00"
        }]
      }
      setSelectedDates([...selectedDates, myDate])
    }


  }


  console.log(selectedDates)


  const checkOverlap = (timeSlots, newStartTime, newEndTime, index = -1) => {
    for (let i = 0; i < timeSlots.length; i++) {
      if (i === index) continue;
      const slot = timeSlots[i];
      const startTime = new Date(`1970-01-01T${slot.startTime}:00`);
      const endTime = new Date(`1970-01-01T${slot.endTime}:00`);
      const newStart = new Date(`1970-01-01T${newStartTime}:00`);
      const newEnd = new Date(`1970-01-01T${newEndTime}:00`);
      
      if ((newStart < endTime && newStart >= startTime) || (newEnd > startTime && newEnd <= endTime) || (newStart <= startTime && newEnd >= endTime)) {
        return true;
      }
    }
    return false;
  };

  // const handleTimeChange = (date, timeIndex, type, value) => {
  //   setSelectedDates((prevDates) =>
  //     prevDates.map((item) =>
  //       item.date === date
  //         ? {
  //           ...item,
  //           timeSlots: item.timeSlots.map((slot, index) =>
  //             index === timeIndex
  //               ? { ...slot, [type]: value }
  //               : slot
  //           )
  //         }
  //         : item
  //     )
  //   );
  // };


  const handleTimeChange = (date, timeIndex, type, value) => {
    setSelectedDates((prevDates) =>
      prevDates.map((item) => {
        if (item.date === date) {
          const newTimeSlots = item.timeSlots.map((slot, index) =>
            index === timeIndex ? { ...slot, [type]: value } : slot
          );

          const newStartTime = type === 'startTime' ? value : item.timeSlots[timeIndex].startTime;
          const newEndTime = type === 'endTime' ? value : item.timeSlots[timeIndex].endTime;

          if (checkOverlap(newTimeSlots, newStartTime, newEndTime, timeIndex)) {
            alert('Time slots cannot overlap');
            return item;
          }
          
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
          const newStartTime = item.timeSlots[item.timeSlots.length-1].endTime;
          const newStartDateTime = new Date(`1970-01-01T${newStartTime}:00`);
          const newEndDateTime = new Date(newStartDateTime.getTime() + 60 * 60 * 1000);


          const newEndTime = newEndDateTime.toTimeString().slice(0, 5);
          
         
          if (checkOverlap(item.timeSlots, newStartTime, newEndTime)) {
            alert('Time slots cannot overlap');
            return item;
          }
          
          
          return {
            ...item,
            timeSlots: [...item.timeSlots, { startTime: newStartTime, endTime: newEndTime }]
          };
          
        }
        return item;
      })
    );
  };

  //  const handleSlotDelete = (date,index,j)=>{
  //   console.log(index)

  //   let newSlots = selectedDates[index].timeSlots;

  //   newSlots = newSlots.filter((item,i)=>i!=j)
  //   console.log(newSlots)
  //   setSelectedDates((prevDates)=>prevDates.map((item)=>{
  //     item.date === date?{
  //       ...item,timeSlots:newSlots
  //     }:item
  //   }))
  //  }

  const handleSlotDelete = (date, index) => {
    setSelectedDates((prevDates) =>
      prevDates.map((item) =>
        item.date === date
          ? {
            ...item,
            timeSlots: item.timeSlots.filter((_, i) => i !== index)
          }
          : item
      ).filter(item => item.timeSlots.length > 0) // Filter out items with no time slots
    )
  }

  
  console.log("Selected Dates: ", selectedDates)
  console.log(JSON.stringify(selectedDates))
  return (
    // ---------------DEMO-------------------------------------------------------------------------
    <main className={classes.main}>
      <h1>
        Manage your availability
      </h1>
      <div>
        {/* <DatePicker
        multiple ={false}
          onChange={handleDateChange}
          value={dates}
          format='DD/MM/YYYY'
          minDate={minDate}
          maxDate={maxDate}
        ></DatePicker> */}
        <input type='date' min={new Date().toISOString().split("T")[0]} onChange={handleDateChange}></input>


      </div>

      <h1>Your dates</h1>
        {selectedDates.length === 0 ? <h3>No Dates Selected</h3> :
          selectedDates.map((item, index) => {
            return (
              <div key={index} className={classes.startAndEndTimeMain} >
                <h3>{new Date(item?.date).toDateString() || ""}</h3>
                <div className={classes.startAndEndTimeContainer}>
                  {item?.timeSlots.map((t, j) => {
                    return (
                      <div key={j} className={classes.singleStartAndEndTime} >
                        <button onClick={() => handleSlotDelete(item.date, j)} className={classes.singleStartAndEndTime__closeButton}><IoMdCloseCircle size={20} color='red' /></button>
                        <label htmlFor='startTime'>Start time</label>
                        <input type='time' id='startTime' value={t.startTime} onChange={(e) => handleTimeChange(item.date, j, 'startTime', e.target.value)}></input>

                        <label htmlFor='endTime'>End time</label>
                        <input  type='time' id='endTime' value={t.endTime} onChange={(e) => handleTimeChange(item.date, j, 'endTime', e.target.value)}></input>
                      </div>

                    )
                  })}
                </div>

                <button onClick={() => handleAddTimeSlot(item?.date)}>Add</button>
              </div>
            )
          })}
      


    </main>
  )
}

ManageAvailability.NavLayout = Layout
export default protectedRoutesDoctor(ManageAvailability)