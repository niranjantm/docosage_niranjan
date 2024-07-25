import React from 'react'
import { useState } from 'react'
import classes from "@/styles/steps-calories.module.css"
import { RiRunLine } from "react-icons/ri";
import { useRouter } from 'next/router';
import useAxiosPrivate from '@/hooks/useAxiosPrivate';
function Steps() {
    const [steps,setSteps] = useState(5000)
    const router = useRouter()
    const axiosPrivate  = useAxiosPrivate()
    // const [displayHeight,setDisplayHeight] = useState("5'0")
   const handleWeightDisplay = (e)=>{
  
    // setDisplayHeight(`${feet}'${inches}`)
    setSteps(e.target.value)
    
   }

   const handleNext = async()=>{
    try{
        const response = await axiosPrivate.post('updateuserinfo/',{"steps":steps})
        if(response.status===200){
            router.push('calories')
        }
    }catch(error){
        console.log(error)
    }
   }
return(
    <main className={classes.main}>
        <h1>Set your steps goal </h1>
        <div className={classes.circularDivContainer}>
            <div className={classes.outerCircleContainer}>
                <div className={classes.innerCircleContainer}>
                    <div className={classes.mainCircleContainer}>
                        <RiRunLine size={40} color='rgb(92, 62, 229)'></RiRunLine>
                        <h3>{steps}</h3>
                        <p>Steps</p>
                    </div>
                </div>
            </div>
        </div>
        <div className={classes.inputContainer}>
            <input className={classes.inputSlider} type="range" min={500} onChange={handleWeightDisplay} max={10000} step={500} value={steps} ></input>
        </div>
        <div className={classes.buttonContainer}>
            <button type='button' className={classes.nextButton} onClick={handleNext} >Next</button>
            <button type='button' className={classes.skipButton}>Skip</button>
        </div>
    </main>
)
}

export default Steps