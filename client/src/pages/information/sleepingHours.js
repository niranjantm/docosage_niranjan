import React from 'react'
import { useState } from 'react'
import classes from "@/styles/sleepingHours.module.css"
import { useRouter } from 'next/router'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import protectedRoutes from '@/components/protectedRoute'
function sleepingHours() {
    const [sleepTime,setSleepTime] = useState({getInBed:"10:00",wakeUp:"06:00"})
    const router = useRouter()
    const axiosPrivate  = useAxiosPrivate()


    const handleTimeChange = (e)=>{
        setSleepTime({...sleepTime,[e.target.name]:e.target.value})
   }

   const handleNext = async()=>{
    try{
        const response = await axiosPrivate.post('updateuserinfo/',{"getInBed":sleepTime.getInBed,"wakeUp":sleepTime.wakeUp})
        if(response.status===200){
            router.push('steps')
        }
    }catch(error){
        console.log(error)
    }
   }

return(
    <main className={classes.main}>
        <h1 className={classes.headingH1}>Tell us your sleeping hours</h1>
        <div className={classes.sleepingHoursMainContainer}>
            <div className={classes.sleepingContainer}>
            <label>Get in Bed</label>
            <input className={classes.sleepingHourInput} type="time" name='getInBed' value={sleepTime.getInBed} onChange={handleTimeChange} ></input>
            </div>
            
            <div className={classes.sleepingContainer}>
            <label>Wake up</label>
            <input className={classes.sleepingHourInput} type="time" name='wakeUp' value={sleepTime.wakeUp} onChange={handleTimeChange} ></input>
            </div>
            
        </div>
        <div className={classes.buttonContainer}>
            <button type='button' className={classes.nextButton} onClick={handleNext}>Next</button>
            <button type='button' className={classes.skipButton}>Skip</button>
        </div>
    </main>
)
}

export default protectedRoutes(sleepingHours)