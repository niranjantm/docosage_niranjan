import DoctorCard from '@/components/DoctorCard'
import React, { useEffect, useState } from 'react'
import classes from "@/styles/find-doctor-menu.module.css"
import Layout from '@/components/Navbar/Layout'
import axios from '../api/axios'

function FindDoctorMenu() {
    
    const [doctors,setDoctors] = useState([])

    useEffect(()=>{
        const getDoctors = async ()=>{
            try{
                const res = await axios.get("doctors/")
                if(res.status===200){
                    setDoctors(res.data)
                    console.log(res.data)
                }
            }
            catch(error){
                console.log(error);
            }
        }
        getDoctors()
    },[])

    const handleSubmit=(e)=>{
        e.preventDefault()
    }

  return (
    <main className={classes.main}>
        <form className={classes.searchForm} onSubmit={handleSubmit}>
            <input className={classes.searchInput} placeholder='Search doctors, clinics, etc.'></input>
            <button className={classes.searchButton}>Search</button>
        </form>
        <div className={classes.doctorCardMain}>
            {doctors.map((doctor,index)=>{
                return <DoctorCard key={index} doctor_name={doctor?.doctor_name} user_id={doctor?.user} yearsOfExperience = {doctor?.yearsOfExperience} practiceType = {doctor?.practiceType}></DoctorCard>
            })}
        
        </div>
        
    </main>
  )
}


FindDoctorMenu.NavLayout = Layout
export default FindDoctorMenu