import React from 'react'
import { useState } from 'react'
import classes from "@/styles/height-Weight-age.module.css"
import { useRouter } from 'next/router'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import protectedRoutes from '@/components/protectedRoute'
function age() {
    const [age,setAge] = useState(30)
    const router = useRouter()
    const axiosPrivate = useAxiosPrivate()


    const handleWeightDisplay = (e)=>{
    setAge(e.target.value)
   }

   const handleSubmit= async(e)=>{
    try{
        const response = await axiosPrivate.post('updateuserinfo/',{"age":age})
        if(response.status===200){
            router.push('sleepingHours')
        }
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
            <button type='button' className={classes.nextButton} onClick={handleSubmit}>Next</button>
            <button type='button' className={classes.skipButton}>Skip</button>
        </div>
    </main>
)
}

export default protectedRoutes(age)