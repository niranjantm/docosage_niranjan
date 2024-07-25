import React, { useEffect, useState } from 'react'
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import classes from "@/styles/signup.module.css"
import axios from 'axios';
import { useRouter } from 'next/router';
import useAuth from '@/hooks/useAuth';

function Login() {
    const [user, setUser] = useState('customer');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setformData] = useState({email: "", password: ""});
    const [disable,setDisable] = useState(false)
    const [error,setError] = useState("");
    const router = useRouter();
    const {userAuth,setUserAuth} = useAuth()


    const handleUserType=(e)=>{
        setUser(e.target.name);
        
    }
    
    

    const handleChange = (e) => {
        setError("")
        setformData({ ...formData, [e.target.name]: e.target.value });
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        if( !formData.email || !formData.password){
            setError("Invalid informations!")
        }
        else{
            try{
                const res = await axios.post("http://127.0.0.1:8000/login/",{userType:user,...formData})
                console.log(res.data);
                if(res.status===200){
                    setUserAuth(res.data)
                    router.push("/")
                }

            }catch(error){
                if(error?.response?.status===406){
                    setError("Invalid credentials")
                }else{
                    setError("Something went wrong!")
                }
                
            }

        }
        
    }

    return (
        <main className={classes.main}>

            <h1>Sign in</h1>

            <div className={classes.customerOrDoctorButtonContainer}>
                <button type='button' name='customer' onClick={handleUserType} className={user === 'customer' ? classes.active : classes.inactive}>Customer</button>
                <button type='button' name='doctor' onClick={handleUserType} className={user === 'doctor' ? classes.active : classes.inactive}>Doctor</button>
            </div>

            <form className={classes.form} onSubmit={handleSubmit}>
                {/* <div className={classes.formDiv}>
                    <label>
                        Your Name
                    </label>
                    <input type='text' name='name'required onChange={handleChange} value={formData.name}></input>
                </div> */}
                <div className={classes.formDiv}>
                    <label>
                        Email
                    </label>
                    <input type='email' name='email' required onChange={handleChange} value={formData.email}></input>
                </div>
                {/* <div className={classes.formDiv}>
                    <label>
                        Phone Number
                    </label>
                    <input type='number' name='phone_number' required value={formData.phone_number} onChange={handleChange} className={classes.numberInput}></input>
                </div> */}
                <div>
                    <label>
                        Password
                    </label>

                    <div className={classes.passwordContainer}>

                        <input type={showPassword ? 'text' : 'password'}  value={formData.password} onChange={handleChange} name='password'></input>
                        <button type='button' onClick={() => setShowPassword(!showPassword)}><>{showPassword===true?<IoEyeOutline size={20} />:<IoEyeOffOutline size={20}/>}</></button>

                    </div>

                </div>
                {error && <p className={classes.error}>{error}</p>}

                <div className={classes.rememberMeAndForgotPassword}>
                    <div>
                        <input type='checkbox'></input>
                        <p>Remember me</p>
                    </div>
                    <div>
                        <button className={classes.forgotPasswordButton} type='button' onClick={()=>router.push('forgotpassword')}>Forgot password?</button>
                    </div>
                </div>


                <div className={classes.signupButtonContainer}>
                    <button type='submit' className={classes.signupButton} disabled = {!formData.email && !formData.password}>
                        Sign in
                    </button>

                </div>
            </form>

            <div className={classes.googleFacebookMainContainer}>
                <p> - or Sign in with -</p>
                <div className={classes.googleFacebookContainer}>
                    <button className={classes.signupGoogleButton}>Google</button>
                    <button className={classes.signupFacebookButton}>Facebook</button>
                </div>
            </div>

            <div className={classes.signinContainer}>
                <p>Don't have an account?</p>
                <button type='button' onClick={()=>router.push('signup')}>Sign up</button>
            </div>

        </main>
    )
}

export default Login