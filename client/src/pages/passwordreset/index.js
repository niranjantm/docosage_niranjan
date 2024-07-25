import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import classes from "@/styles/signup.module.css"
import { FaCheckCircle } from "react-icons/fa";

function index() {
    const router = useRouter()
    const {user,email} = router.query

    const [formData,setFormData] = useState({newPassword:"",confirmNewPassword:""})
    const [showPassword, setShowPassword] = useState({newPassword:false,confirmNewPassword:false});
    const [error,setError] = useState("")
    const [passwordValidation,setPasswordValidations] = useState({length:false,lowercase:false,uppercase:false,number:false})
    const [disable,setDisable] = useState(true);
    const [status,setStatus] = useState('');


    const validatePassword = (password) => {
        const length = password.length >= 8;
        const lowercase = /[a-z]/.test(password);
        const uppercase = /[A-Z]/.test(password);
        const number = /\d/.test(password);

        setPasswordValidations({
            length,
            lowercase,
            uppercase,
            number,
        });
        
    };

    const handleChange=(e)=>{
        setFormData({...formData,[e.target.name]:e.target.value})
        if(e.target.name==="newPassword"){
            validatePassword(e.target.value)
        }
        if(passwordValidation.length && passwordValidation.lowercase && passwordValidation.number && passwordValidation.uppercase){
            setDisable(false);
        }else{
            setDisable(true)
        }
        
    }
    const handleSubmit = async(e)=>{
        e.preventDefault()
        try{
            if(!formData.newPassword || !formData.confirmNewPassword || formData.newPassword!==formData.confirmNewPassword){
                setError("Invalid password")
            }
            else{
                const res = await axios.patch("http://127.0.0.1:8000/passwordconfirm/",{"user":user,"newPassword":formData.newPassword})
                setError("")    
                setStatus("Password reset successfull")
            }
        }
        catch(error){
                setError("Some thing went wrong!")
            }
        
            
        
    }
    useEffect(()=>{
    },[])

  return (
    <main className={classes.main}>

            <h1>New Password</h1>
            <p className={classes.forgotPasswordPara}>Enter new password for {email}</p>

            

            <form className={classes.form} onSubmit={handleSubmit} >
                
            <div>
                    <label>
                       New Password
                    </label>

                    <div className={classes.passwordContainer}>

                        <input type={showPassword.newPassword ? 'text' : 'password'}  value={formData.newPassword} onChange={handleChange} name='newPassword'></input>
                        <button type='button' onClick={() => setShowPassword({...showPassword,["newPassword"]:!showPassword.newPassword})}><>{showPassword.newPassword===true?<IoEyeOutline size={20} />:<IoEyeOffOutline size={20}/>}</></button>

                    </div>

                </div>
            <div>
                    <label>
                       Confirm New Password
                    </label>

                    <div className={classes.passwordContainer}>

                        <input type={showPassword.confirmNewPassword ? 'text' : 'password'}  value={formData.confirmNewPassword} onChange={handleChange} name='confirmNewPassword'></input>
                        <button type='button' onClick={() => setShowPassword({...showPassword,["confirmNewPassword"]:!showPassword.confirmNewPassword})}><>{showPassword.confirmNewPassword===true?<IoEyeOutline size={20} />:<IoEyeOffOutline size={20}/>}</></button>

                    </div>

                </div>
                
                
                {error && <p className={classes.error}>{error}</p>}
                {!error && status &&<p className={classes.success}>{status}</p>}
                

                <div className={classes.passwordValidations}>
                    <h3>Your password must contain</h3>
                    <div>
                    <p><FaCheckCircle color={passwordValidation.uppercase?"green":'red'}/> At least one capital letter</p>
                    <p><FaCheckCircle color={passwordValidation.lowercase?"green":'red'}/> At least one lowercase letter</p>
                    <p><FaCheckCircle color={passwordValidation.number?"green":'red'}/> At least one number</p>
                    <p><FaCheckCircle color={passwordValidation.length?"green":'red'}/> Minimum character length is 8 character</p>
                    </div>
                </div>

                <div className={classes.signupButtonContainer}>
                    <button type='submit' className={classes.signupButton} disabled = {disable}>
                        Set New Password
                    </button>

                </div>
            </form>

           

            <div className={classes.signinContainer}>
                <p>Back to</p>
                <button type='button' onClick={()=>router.push('/dashboard/login')}>Log in</button>
            </div>

        </main>
  )
}

export default index