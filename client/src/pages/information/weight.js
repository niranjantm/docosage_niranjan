import React from 'react'
import { useState } from 'react'
import classes from "@/styles/height-Weight-age.module.css"
import { useRouter } from 'next/router'
function weight() {
    const [weight,setWeight] = useState(50)
    const router = useRouter()
    // const [displayHeight,setDisplayHeight] = useState("5'0")
   const handleWeightDisplay = (e)=>{
  
    // setDisplayHeight(`${feet}'${inches}`)
    setWeight(e.target.value)
    
   }
return(
    <main className={classes.main}>
        <h1>Tell us your weight</h1>
        <p>{"(kg)"}</p>
        <div className={classes.inputContainer}>
            <h3>{weight}</h3>
            <input className={classes.inputSlider} type="range" min={10} onChange={handleWeightDisplay} max={150} step={1} value={weight} ></input>
        </div>
        <div className={classes.buttonContainer}>
            <button type='button' className={classes.nextButton} onClick={()=>router.push('age')}>Next</button>
            <button type='button' className={classes.skipButton}>Skip</button>
        </div>
    </main>
)
}

export default weight