import React from 'react'
import classes from "@/styles/congratulations.module.css"
import { useRouter } from 'next/router'
import { useContext } from 'react'
import AuthContext from '@/context/AuthContext'

function congratulations() {
    const router = useRouter()
    const {userAuth} = useContext(AuthContext)
    console.log(userAuth)

    const handleNext=()=>{
        if(userAuth?.account_type==='doctor'){
            router.push('/doctorInformation')
        }
        else{
            router.push('/information/gender')
        }
    }
  return (
   <main className={classes.main}>
    <div>
        image
    </div>
    <div className={classes.introContainer}>
        <h1>
           {userAuth?.account_type==="doctor"?"Hey Doctor !":"Congratulations"}
        </h1>
        <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
    </div>
    <div className={classes.buttonContainer}>
        <button type='button' className={classes.setgoalButton} onClick={handleNext}>{userAuth?.account_type==="doctor"?"Provide additional information to activate your account":"Setup Goal and other information"}</button>  
        <button type='button' className={classes.homeButton } onClick={()=>router.push('/')}>Go to home</button>  
    </div>
   </main>
  )
}

export default congratulations