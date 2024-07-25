import React from 'react'
import { useState } from 'react'
import classes from "@/styles/steps-calories.module.css"
import { ImFire } from "react-icons/im";
function Calories() {
    const [calories,setCalories] = useState(5000)
    // const [displayHeight,setDisplayHeight] = useState("5'0")
   const handleCalorieDisplay = (e)=>{
  
    // setDisplayHeight(`${feet}'${inches}`)
    setCalories(e.target.value)
    
   }
return(
    <main className={classes.main}>
        <h1>Set your calories goal </h1>
        <div className={classes.circularDivContainer}>
            <div className={classes.outerCircleContainer}>
                <div className={classes.innerCircleContainer}>
                    <div className={classes.mainCircleContainer}>
                        <ImFire size={30} color='rgb(92, 62, 229)'></ImFire>
                        <h3>{calories}</h3>
                        <p>Calories</p>
                    </div>
                </div>
            </div>
        </div>
        <div className={classes.inputContainer}>
            <input className={classes.inputSlider} type="range" min={500} onChange={handleCalorieDisplay} max={10000} step={100} value={calories} ></input>
        </div>
        <div className={classes.buttonContainer}>
            <button type='button' className={classes.nextButton}>Next</button>
            <button type='button' className={classes.skipButton}>Skip</button>
        </div>
    </main>
)
}

export default Calories