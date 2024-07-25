import React, { useEffect, useState } from 'react'
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import classes from "@/styles/signup.module.css"
import axios from '../api/axios';
import { useRouter } from 'next/router';


function ForgotPassword() {
    const [formData, setformData] = useState({email: ""});
    const [disable,setDisable] = useState(false)
    const [error,setError] = useState("");
    const router = useRouter()
   
    
    

    const handleChange = (e) => {
        setError("")
        setformData({ ...formData, [e.target.name]: e.target.value });
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        if( !formData.email){
            setError("Invalid informations!")
        }
        else{
            try{
                const res = await axios.post("passwordreset/",formData)
                if(res.status===200){
                    router.push(res.data.url)
                } 
            }catch(error){
                if(error.response.data.error){
                    setError(error.response.data.error)
                }else{
                    setError(error)
                }
            }

        }
    }

    return (
        <main className={classes.main}>

            <h1>Forgot password?</h1>
            <p className={classes.forgotPasswordPara}>No worries, we'll send a recovery link to your mail</p>

            

            <form className={classes.form} onSubmit={handleSubmit}>
                
                <div className={classes.formDiv}>
                    <label>
                        Email
                    </label>
                    <input type='email' name='email' required onChange={handleChange} value={formData.email}></input>
                </div>
                
                {error && <p className={classes.error}>{error}</p>}


                <div className={classes.signupButtonContainer}>
                    <button type='submit' className={classes.signupButton} disabled = {!formData.email}>
                        Send recovery link
                    </button>

                </div>
            </form>

           

            <div className={classes.signinContainer}>
                <p>Back to</p>
                <button type='button' onClick={()=>router.push('login')}>Log in</button>
            </div>

        </main>
    )
}

export default ForgotPassword