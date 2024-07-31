import React, { useState } from 'react'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import classes from "@/styles/doctorInformation.module.css"


function DoctorInformation() {

    const practiceData = ["General Practitioner (GP)", "Family Medicine", "Internal Medicine", "Pediatrics", "Obstetrics and Gynecology (OB/GYN)", "Cardiology", "Dermatology",
        "Neurology", "Orthopedics", "Psychiatry", "Surgery", "Radiology", "Anesthesiology", "Oncology", "Endocrinology", "Gastroenterology", "Nephrology", "Pulmonology", "Rheumatology", "Emergency Medicine"]
   
        const [formData,setFormData] = useState({age:"",gender:"female",qualification:"MBBS",yearsOfExperience:"",registrationYear:"",registrationNumber:"",registeredCouncil:"Medical Council of India",practiceType:"Family Medicine",clinicAddress:"",clinicZipCode:""})

        const [error,setError] = useState("")

        const axiosPrivate = useAxiosPrivate()

        const handleChange=(e)=>{
            setError("")
            if(e.target.id==="age" ){
            const selectedDate = new Date(e.target.value);
            const currentDate = new Date();
            let age = currentDate.getFullYear() - selectedDate.getFullYear();
            const monthDifference = currentDate.getMonth() - selectedDate.getMonth();
            if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < selectedDate.getDate())) {
                age--;
            }
            if (age < 18) {
                setError("The doctor must be at least 18 years old.");
            }
        }
            setFormData(pre=>({...pre,[e.target.id]:e.target.value}))
        }

        const handleSubmit=async(e)=>{
            e.preventDefault()
            if(!formData.age || !formData.yearsOfExperience || !formData.registrationYear || !formData.registrationNumber || !formData.clinicAddress || !formData.clinicZipCode){
                setError("Please fill out all fields.")
            }
            else if(error){
                return
            }
            else{
                try{
                    const res = await axiosPrivate.post("doctorinfo/",formData)
                    if(res.status === 200){
                        console.log(res.data)
                    }
                }catch(error){
                    console.log(error)
                }
            }
        }

        console.log(formData)
    
        return (
        <main className={classes.main}>
            <section className={classes.errorSection}>
                <h2>Please provide additional Information</h2>
                {error && <p style={{color:"red"}}>{error}</p>}
            </section>
            <section >
                <form onSubmit={handleSubmit} >
                    <section className={classes.formSection}>
                    <div>
                        <label htmlFor='age'>
                            Select your date of birth
                        </label>
                        <input type='date' id='age' value={formData.age} onChange={handleChange}></input>
                    </div>
                    <div>
                        <label htmlFor='gender'>
                            Select your gender
                        </label>
                        <select defaultValue={"female"} id='gender' onChange={handleChange}>
                            <option value={"male"}>Male</option>
                            <option value={"female"}>Female</option>
                            <option value={"others"}>Others</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor='qualification' >
                            Select your qualification
                        </label>
                        <select defaultValue={"MBBS"} id='qualification' onChange={handleChange}>
                            <option value={"MBBS"}>MBBS</option>
                            <option value={"MD"}>MD</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor='yearsOfExperience'>
                            Enter your years of experience
                        </label>
                        <input type='number' value={formData.yearsOfExperience} onChange={handleChange} id='yearsOfExperience' />
                    </div>

                    <div>
                        <label htmlFor='registrationYear'>
                            Enter your year of registration
                        </label>
                        <input type='date' value={formData.registrationYear} id='registrationYear'onChange={handleChange} />
                    </div>

                    <div>
                        <label htmlFor='registrationNumber'>
                            Enter your registration number
                        </label>
                        <input type='text' value={formData.registrationNumber} id='registrationNumber' onChange={handleChange} />
                    </div>

                    <div>
                        <label htmlFor='registeredCouncil'>
                            Select your Registered council
                        </label>
                        <select id='registeredCouncil' defaultValue={"Medical Council of India"} onChange={handleChange}>
                            <option value={"Medical Council of India"}>Medical Council of India</option>
                            <option value={"State Medical Council"}>State Medical Council</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor='practiceType'>
                            Select your practice type
                        </label>
                        <select type='date' id='practiceType' defaultValue={practiceData[1]} onChange={handleChange}>
                            {practiceData.map((item,index)=>{
                                return(
                                    <option key={item}>{item}</option>
                                )
                            }) }
                        </select>
                    </div>

                    <div>
                        <label htmlFor='clinicAddress' >Enter your clinic's address</label>
                        
                        <textarea id='clinicAddress' value={formData.clinicAddress} onChange={handleChange}></textarea>
                        </div>
                        <div>
                        <label htmlFor='clinicZipCode'>Enter zip code</label>
                        <input type='number' id='clinicZipCode' value={formData.clinicZipCode} onChange={handleChange}></input>
                        
                    </div>
                   
                </section> 
                <div className={classes.buttonDiv}>
                <button  className={classes.button} type='submit'>Submit</button>
                </div>    
                </form>
               
                
            </section>
        </main>
    )
}

export default DoctorInformation