import classes from "@/styles/form.module.css"
import React, { useState } from 'react'
import Link from "next/link"

function signup() {

    const [formData,setFormData] = useState({email:"",password:""})
    
    
    const handleChange = (e)=>{
        setFormData({...formData,[e.target.name]:e.target.value});
    }

    const handleSubmit = (e)=>{
        e.preventDefault()
        console.log(formData)
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
                    <input type='email' name='email' onChange={handleChange} ></input>
                </div>
                <div>
                    <label>Enter Password</label>
                    <input type='password'name='password' onChange={handleChange}></input>
                </div>
                <button className={classes.button} type="submit">
                    Register
                </button>

                <Link className={classes.link} href={"./resetpassword"}>Forgot password</Link>

                <p>New user ?<Link className={classes.link} href={"./signup"}>SignUp</Link></p>

            </form>
            </div>
            
        </main>

    )
}

export default signup