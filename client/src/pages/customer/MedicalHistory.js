import React from 'react'
import { useState } from 'react'
import Layout from '@/components/Navbar/Layout'
import classes from "@/styles/medicalHistory.module.css"
import useAxiosPrivate from '@/hooks/useAxiosPrivate'


function MedicalHistory() {

    const [formData, setFormData] = useState({ name: "", description: "", dosage: "", start_date: "", end_date: "" })
    const axiosPrivate = useAxiosPrivate()

    const handleChange = (e) => {
        if (e.target.id == "name" || e.target.id == "description" || e.target.id == "dosage" || e.target.id == "start_date" || e.target.id == "end_date") {
            setFormData(pre=>{
                return(
                    {...pre,[e.target.id]:e.target.value}
                )
            })
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!formData.name || !formData.description || !formData.dosage || !formData.start_date){
            return
        }else{
            try{
                const res = await axiosPrivate.post("usermedication/",formData)
                if(res.status===200){
                    console.log("ok")
                }
            }catch(error){
                console.log(error)
            }
        }

    }

    const handleUpdate = (e)=>{

    }
    return (
        <main className={classes.main}>
            <form onSubmit={handleSubmit} className={classes.form}>
                <div className={classes.formDiv}> 
                    <label htmlFor='name'>Medication name:</label>
                    <input value={formData.name} type='text' id='name' onChange={handleChange}></input>
                </div>

                <div className={classes.formDiv}>
                    <label htmlFor='description'>Medication description:</label>
                    <textarea value={formData.description} type='text' id='description' onChange={handleChange}></textarea>
                </div>

                <div className={classes.formDiv}>
                    <label htmlFor='dosage'>Medication dosage:</label>
                    <input value={formData.dosage} type='text' id='dosage' onChange={handleChange}></input>
                </div>

                <div className={classes.formStartDateDiv}>
                    <label htmlFor='start_date'>Start Date:</label>
                    <input value={formData.start_date} type='date' id='start_date' onChange={handleChange}></input>
                </div>
                <div className={classes.formEndDateDiv}>
                    <label htmlFor='end_date'>End Date:</label>
                    <input value={formData.end_date} type='date' id='end_date' onChange={handleChange}></input>
                </div>

                <div className={classes.submitBtnDiv}>
                <button className={classes.submitBtn} >Submit</button>
                </div>
               
            </form>
            <h3>Medical History </h3>

            <section className={classes.oldMedicalHistoryContainer}>


                <div className={classes.historyDiv}> 
                    <label htmlFor='name'>Medication name:</label>
                    <input   type='text' id='name' onChange={handleUpdate}></input>
                </div>

                <div className={classes.historyDiv}>
                    <label htmlFor='description'>Medication description:</label>
                    <textarea  type='text' id='description' onChange={handleUpdate}></textarea>
                </div>

                <div className={classes.historyDiv}>
                    <label htmlFor='dosage'>Medication dosage:</label>
                    <input  type='text' id='dosage' onChange={handleUpdate}></input>
                </div>

                <div className={classes.historyDiv}>
                    <label htmlFor='start_date'>Start Date:</label>
                    <input  type='date' id='start_date' onChange={handleUpdate}></input>
                </div>
                <div className={classes.historyDiv}>
                    <label htmlFor='end_date'>End Date:</label>
                    <input type='date' id='end_date' onChange={handleUpdate}></input>
                </div>

                <div className={classes.updateAndDeleteBtn}>
                <button className={classes.updateBtn} >Update</button>
                <button className={classes.deleteBtn} >Delete</button>
                </div>
                

            </section>
        </main>
    )
}

MedicalHistory.NavLayout = Layout
export default MedicalHistory