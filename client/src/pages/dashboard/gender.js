import React, { useState } from 'react'
import { IoIosMale,IoIosFemale } from "react-icons/io";
import classes from "@/styles/gender.module.css"



function Gender() {

    const [gender,setGender]= useState({gender:""});
    const [error,setError] = useState("");

    const handleClick=(e)=>{
        setError("")
        setGender({gender:e.target.value});
    }

    const handleNext=(e)=>{
        if(!gender.gender){
            setError("Please select your gender!");
        }
        else{
            console.log(gender);
        }
    }
    return (
        <main className={classes.main}>

            <div className={classes.introContainer}>
                <h1>Tell us your gender</h1>
            </div>

            <div className={classes.genderContainer}>

                <button name='male' value="male" onClick={handleClick}>
                    <div ><IoIosMale size={30}></IoIosMale></div>
                    <h2>Male</h2>
                </button>

                <button name='female' value="female" onClick={handleClick}>
                    <div><IoIosFemale size={30}></IoIosFemale></div>
                    <h2>Female</h2>
                </button>

            </div>

            <div className={classes.buttonContainer}>
                <button className={classes.nextButton} disabled={!gender.gender}  onClick={handleNext}>Next</button>
                <button className={classes.skipButton}>Skip</button>
            </div>
            {error && <p className={classes.error}>{error}</p>}

        </main>
    )
}

export default Gender