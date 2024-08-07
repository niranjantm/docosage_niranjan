import React, { useState ,useContext} from 'react'
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import classes from "@/styles/signup.module.css"
import {axiosPrivate} from "@/pages/api/axios"
import { useRouter } from 'next/router';
import AuthContext from '@/context/AuthContext';

function Signup() {
    const [user, setUser] = useState('customer');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setformData] = useState({ name: "", email: "", phone_number: "", password_hash: ""});
    const [disable,setDisable] = useState(false)
    const [error,setError] = useState("");
    const router = useRouter()
    const {userAuth,setUserAuth} = useContext(AuthContext)

    const handleUserType=(e)=>{
        setUser(e.target.name);
        setformData({ name: "", email: "", phone_number: "", password_hash: ""})
    }

    const handleChange = (e) => {
        setError("")
        if(e.target.name==="phone_number" && e.target.value.length>10){
            setError("Enter a valid phone number")
        }else{
            setformData({ ...formData, [e.target.name]: e.target.value });
        }
        
    }

    const handleTermsAndContions = (e)=>{
        setDisable(e.target.checked);
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!formData.name || !formData.email || !formData.password_hash || !formData.phone_number){
            setError("Invalid informations!")
        }
        
        else{
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
            let passwordText = passwordRegex.test(formData.password_hash)
            if(!passwordText){
                setError("Password must contain at least one lowercase letter, one uppercase letter, one digit, and must have a length of more than or equal to 8 characters")
            }

            else{

           
            try{
                const res = await axiosPrivate.post("register/",{account_type:user,...formData})
                console.log(res.data);
                if(res.status===201){

                    setUserAuth(res.data)
                    console.log(res.data)
                    router.push('congratulations')
                }
            }catch(error){
                if(error?.response?.data?.email){
                    setError("User with this email already exists.")
                }
                else if(error?.response?.data?.phone_number){
                    setError("User with this phone number already exists.")
                }
                else{
                    setError(error.message)
                }
            }
        }
        }
    }

    

    return (
        <main className={classes.main}>

            <h1>Sign up</h1>

            <div className={classes.customerOrDoctorButtonContainer}>
                <button type='button' name='customer' onClick={handleUserType} className={user === 'customer' ? classes.active : classes.inactive}>Customer</button>
                <button type='button' name='doctor' onClick={handleUserType} className={user === 'doctor' ? classes.active : classes.inactive}>Doctor</button>
            </div>

            <form className={classes.form} onSubmit={handleSubmit}>
                <div className={classes.formDiv}>
                    <label>
                        Your Name
                    </label>
                    <input type='text' name='name'required onChange={handleChange} value={formData.name}></input>
                </div>
                <div className={classes.formDiv}>
                    <label>
                        Email
                    </label>
                    <input type='email' name='email' required onChange={handleChange} value={formData.email}></input>
                </div>
                <div className={classes.formDiv}>
                    <label>
                        Phone Number
                    </label>
                    <input type='number' name='phone_number' required value={formData.phone_number} onChange={handleChange} className={classes.numberInput}></input>
                </div>
                <div>
                    <label>
                        Password
                    </label>

                    <div className={classes.passwordContainer}>

                        <input type={showPassword ? 'text' : 'password'}  value={formData.password_hash} onChange={handleChange} name='password_hash'></input>
                        <button type='button' onClick={() => setShowPassword(!showPassword)}><>{showPassword===true?<IoEyeOutline size={20} />:<IoEyeOffOutline size={20}/>}</></button>

                    </div>

                </div>
                {error && <p className={classes.error}>{error}</p>}

                <div>
                    <div className={classes.checkboxContainer}>
                        <input type='checkbox' onChange={handleTermsAndContions}></input>
                        <p>I agree with Privacy Policy and Terms and Conditions</p>
                    </div>
                </div>


                <div className={classes.signupButtonContainer}>
                    <button type='submit' className={classes.signupButton} disabled={!disable}>
                        Sign up
                    </button>

                </div>
            </form>

            <div className={classes.googleFacebookMainContainer}>
                <p> - or Signup with -</p>
                <div className={classes.googleFacebookContainer}>
                    <button className={classes.signupGoogleButton}>Google</button>
                    <button className={classes.signupFacebookButton}>Facebook</button>
                </div>
            </div>

            <div className={classes.signinContainer}>
                <p>Already have an account?</p>
                <button type='button' onClick={()=>router.push("login")}>Log in</button>
            </div>

        </main>
    )
}

export default Signup