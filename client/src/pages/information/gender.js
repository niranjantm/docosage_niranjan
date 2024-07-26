import React, { useRef, useState } from 'react'
import { IoIosMale,IoIosFemale } from "react-icons/io";
import classes from "@/styles/gender.module.css"
import { useRouter } from 'next/router';
import useAxiosPrivate from '@/hooks/useAxiosPrivate';
import protectedRoutes from '@/components/protectedRoute';


function Gender() {

    const [gender,setGender]= useState({gender:""});
    const [error,setError] = useState("");
    const router = useRouter()
    const axiosPrivate = useAxiosPrivate()


    const handleClick=(e)=>{
        setError("")
        setGender({gender:e.target.value});

    }

    const handleNext= async(e)=>{
        if(!gender.gender){
            setError("Please select your gender!");
        }
        else{
            try{
                const response = await axiosPrivate.post('updateuserinfo/',{"gender":gender.gender})
                if(response.status===200){
                    router.push('height')
                }
            }catch(error){
                console.log(error)
            }
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

export default protectedRoutes(Gender)