import classes from "@/styles/form.module.css"
import React, { useState } from 'react'
import Link from "next/link"

function signup() {

    const [formData,setFormData] = useState({email:""})
    
    
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
                Reset Password
            </h1>

            <form className={classes.form} onSubmit={handleSubmit}>
                <div>
                    <label>Enter Registered Email</label>
                    <input type='email' name='email' onChange={handleChange} ></input>
                </div>
                
                <button className={classes.button} type="submit">
                    Submit
                </button>

                

                <p>New user ?<Link className={classes.link} href={"./signup"}>SignUp</Link></p>

            </form>
            </div>
            
        </main>

    )
}

export default signup