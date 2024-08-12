import React, { useState } from 'react'
import dayjs from 'dayjs'
import classes from "@/styles/customerAppointmentDetailPopup.module.css"
import { IoMdCloseCircle } from "react-icons/io";
import useAxiosPrivate from '@/hooks/useAxiosPrivate';

function CustomerAppointmentDetailPopup({ show, setShow, appointmentDetail }) {

    const [formData,setFormData] = useState({title:"",description:""})

    const axiosPrivate = useAxiosPrivate()
    

    const handleChange=(e)=>{
        setFormData((prev=>{
            return {...prev,[e.target.id]:e.target.value}
        }))
    }

    const handleFormSubmit= async (e)=>{
        e.preventDefault();
        if(!formData.description || !formData.title){
            return
        }else{
            try{
                const data = {...formData,doctor:appointmentDetail.doctor_id,startTime:appointmentDetail.startTime,date:appointmentDetail.date}
                const res = await axiosPrivate.post("appointment/",data)
                if(res.status===201){
                    console.log(res.data)
                    
                }
            }catch(error){
                console.log(error)
            }
        }
       
       
    }

    return (
        <main className={classes.main}>

            <div className={classes.formDiv}>
            <form className={classes.form} onSubmit={handleFormSubmit}>
                <h1>Please provide additional information</h1>
                <div>
                <label htmlFor='title'>Title for your appointment</label>
                <input type='text' id="title" value={formData.title} onChange={handleChange} placeholder='Routine Check-up, Consultation, etc.'></input>
                </div>
               
               <div>
                <label htmlFor='description'>Reason for the appointment or any other relevant details</label>
                <textarea type="text" id='description' value={formData.description} onChange={handleChange} placeholder='Discuss test results, Follow-up on treatment, etc.'></textarea>
               </div>
              
                {/* <input type=''></input> */}
                <p>Booking the appointment on <span>{appointmentDetail?.date}</span> at <span>{dayjs(appointmentDetail?.startTime).format("hh:mm:a")}</span> with <span>Dr. {appointmentDetail?.doctor_name}</span></p>
                <button className={classes.DoneButton} >Done</button>



            </form>
            </div>
            
            <div className={classes.closeButtonDiv}>
             <button className={classes.closeButton} type='button' onClick={() => setShow(false)}><IoMdCloseCircle color='red' size={30}></IoMdCloseCircle></button>
            </div>
            
        </main>

    )
}

export default CustomerAppointmentDetailPopup