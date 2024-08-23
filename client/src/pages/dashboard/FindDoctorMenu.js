import DoctorCard from '@/components/DoctorCard'
import React, { useEffect, useState } from 'react'
import classes from "@/styles/find-doctor-menu.module.css"
import Layout from '@/components/Navbar/Layout'
import axios from '../api/axios'
import debounce from "lodash.debounce"


function FindDoctorMenu() {
    
    const [doctors,setDoctors] = useState([])
    const [searchTerm,setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)

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
    const getDoctors = async () => {
           
        try {
            const res = await axios.get(`searchdoctor/?q=${searchTerm}`, {
            })
            if (res.status === 200) {
                setDoctors(res.data)
                console.log(res.data)
            }
        } catch (error) {
            console.log(error);
        }
        
    }

    useEffect(() => {
        

        const debouncedGetDoctors = debounce(getDoctors, 800) 

        if (searchTerm && searchTerm.length>2) {
            debouncedGetDoctors()
        }

        return () => {
            debouncedGetDoctors.cancel()
        }
    }, [searchTerm])

    const handleSubmit=(e)=>{
        e.preventDefault()
        if(searchTerm){
            getDoctors()
        }
    }

    const handleSearchTerm=(e)=>{
        setSearchTerm(e.target.value)
        
    }
    if(loading){
        return <div>Loading...</div>
    }
  return (
    <main className={classes.main}>
        <form className={classes.searchForm} onSubmit={handleSubmit}>
            <input className={classes.searchInput} onChange={handleSearchTerm}  placeholder='Search doctors, clinics, etc.'></input>
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