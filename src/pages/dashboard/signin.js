import classes from "@/styles/form.module.css"
import React, { useState } from 'react'
import Link from "next/link"

function signup() {

    const [formData,setFormData] = useState({email:"",password:""})
    const [error,setError] = useState("")
    
    
    const handleChange = (e)=>{
        setError("")
        setFormData({...formData,[e.target.name]:e.target.value});
    }

    const handleSubmit = (e)=>{
        e.preventDefault()
        if(!formData.email || !formData.password){
            setError("Invalid credentials")
        }
        console.log(formData)
        setFormData({email:"",password:""})
    }
    return (
        <main className={classes.main}>
            <div className={classes.mainDiv}>
            <h1>
                Sign In
            </h1>

            <form className={classes.form} onSubmit={handleSubmit}>
                <div>
                    <label>Enter Email</label>
                    <input type='email' name='email' value={formData.email} onChange={handleChange} ></input>
                </div>
                <div>
                    <label>Enter Password</label>
                    <input type='password'name='password' value={formData.password} onChange={handleChange}></input>
                </div>
                <button className={classes.button} type="submit">
                    Signin
                </button>
                {error && <p className={classes.link}>{error}</p>}

                <Link className={classes.link} href={"./resetpassword"}>Forgot password</Link>

                <p>New user ?<Link className={classes.link} href={"./signup"}>SignUp</Link></p>

            </form>
            </div>
            
        </main>

    )
}

export default signup