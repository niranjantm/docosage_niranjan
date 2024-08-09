import Image from 'next/image'
import React from 'react'
import classes from "@/styles/doctorCard.module.css"


function DoctorCard({doctor_name,yearsOfExperience,practiceType,user_id}) {


    const handleAppointmentBooking=(e)=>{
        console.log(user_id)
    }
  return (
    <section className={classes.mainSection}>
        <div className={classes.mainInfoContainer}>
            <div className={classes.imageContainer}>
                <img src={"https://images.pexels.com/photos/48604/pexels-photo-48604.jpeg?auto=compress&cs=tinysrgb&w=600"} className={classes.doctorImage}  alt="Sample Image"></img>
                
            </div>
            <div className={classes.infoContainer}>
                <h3>{doctor_name}</h3>
                <p>{practiceType}</p>
                <p>{`${yearsOfExperience} years experience `}</p>
                <p>Consultation fees Here</p>
                <div className={classes.ratingAndStoriesContainer}>
                    <span>Rating</span>
                    <span>patient stories</span>
                </div>
            </div>
        </div>
        <div className={classes.bookAppointmentButtonContainer}>
            <button onClick={handleAppointmentBooking} className={classes.bookAppointmentButton} type='button'>Book appointment</button>
        </div>
    </section>
  )
}

export default DoctorCard