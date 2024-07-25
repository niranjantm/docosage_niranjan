import React from 'react'
import { useState } from 'react'
import classes from "@/styles/height-Weight-age.module.css"
import { useRouter } from 'next/router'
import axios from 'axios'
function weight() {
    const [age,setAge] = useState(30)
    const router = useRouter()


    const handleWeightDisplay = (e)=>{
    setAge(e.target.value)
   }

   const handleSubmit= async(e)=>{
    try{
        const response = await axios.patch('http://127.0.0.1:8000/')
    }catch(error){
        console.log(error)
    }
   }

return(
    <main className={classes.main}>
        <h1>How old are you ?</h1>
        <div className={classes.ageinputContainer}>
            <h3>{age}</h3>
            <input className={classes.inputSlider} type="range" min={1} onChange={handleWeightDisplay} max={120} step={1} value={age} ></input>
        </div>
        <div className={classes.buttonContainer}>
            <button type='button' className={classes.nextButton} onClick={()=>router.push('sleepingHours')}>Next</button>
            <button type='button' className={classes.skipButton}>Skip</button>
        </div>
    </main>
)
}

export default weight